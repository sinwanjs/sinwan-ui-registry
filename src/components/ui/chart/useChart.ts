import {
  inject,
  onMounted,
  onUnmounted,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import { effect, resolve, signal, type Signal } from "sinwan/reactivity";
import type {
  EChartsInitOpts,
  EChartsOption,
  SetOptionOpts,
} from "echarts";
import {
  chartModuleLoaders,
  chartModulesNewerThan,
  chartModulesVersion,
  echarts,
  installChartModules,
} from "./modules";

export type EChartsInstance = {
  group: string;
  setOption: (option: EChartsOption, opts?: boolean | SetOptionOpts) => void;
  clear: () => void;
  resize: (opts?: {
    width?: number | "auto";
    height?: number | "auto";
    silent?: boolean;
  }) => void;
  dispose: () => void;
  isDisposed: () => boolean;
  showLoading: (name?: string, opts?: object) => void;
  hideLoading: () => void;
  on: (eventName: string, handler: (params: unknown) => void) => void;
  off: (eventName: string, handler?: (params: unknown) => void) => void;
  getOption?: () => EChartsOption;
  dispatchAction?: (payload: Record<string, unknown>) => void;
};

function isChartInstance(value: unknown): value is EChartsInstance {
  if (typeof value !== "object" || value === null) return false;
  const chart = value as Record<string, unknown>;
  return (
    typeof chart.setOption === "function" &&
    typeof chart.clear === "function" &&
    typeof chart.resize === "function" &&
    typeof chart.dispose === "function" &&
    typeof chart.isDisposed === "function" &&
    typeof chart.showLoading === "function" &&
    typeof chart.hideLoading === "function" &&
    typeof chart.on === "function" &&
    typeof chart.off === "function"
  );
}

export const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = Record<
  string,
  {
    label?: SinwanNode | string;
    icon?: (props?: { class?: string }) => SinwanNode;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

export type ChartContextProps = {
  config: ChartConfig;
  chartId: string;
  instance: Signal<EChartsInstance | null>;
  setInstance: (chart: EChartsInstance | null) => void;
};

const ChartKey: InjectionKey<ChartContextProps> = Symbol("sinwan-ui.chart");

type Live<T> = T | (() => T);

function readOption(
  value: Live<EChartsOption | null | undefined> | undefined,
): EChartsOption | null {
  const option = resolve(value);
  return option ?? null;
}

let chartIdSeq = 0;

export type ChartContainerProps = JSX.IntrinsicElements["div"] & {
  config: ChartConfig;
  id?: string;
  children?: SinwanNode;
};

export type ChartRootReturn = {
  chartId: string;
  config: ChartConfig;
  class: ChartContainerProps["class"];
  style: ChartContainerProps["style"];
  oncontextmenu: ChartContainerProps["oncontextmenu"];
  children: SinwanNode | undefined;
};

/**
 * Chart container context without default styles.
 * Call from a root chart shell; children use `useChart()` / `useChartView`.
 */
export function useChartRoot(props: ChartContainerProps): ChartRootReturn {
  chartIdSeq += 1;
  const chartId = `chart-${props.id ?? chartIdSeq}`;
  const instance = signal<EChartsInstance | null>(null);

  provide(ChartKey, {
    config: props.config,
    chartId,
    instance,
    setInstance: (chart: EChartsInstance | null) => {
      instance.value = chart;
    },
  });

  return {
    chartId,
    config: props.config,
    class: props.class,
    style: props.style,
    oncontextmenu: props.oncontextmenu,
    children: props.children,
  };
}

/**
 * Inject chart context. Must be used under a root that called
 * `useChartRoot` (or the default `<ChartContainer />`).
 */
export function useChart(): ChartContextProps {
  const context = inject(ChartKey);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

export function buildChartStyleCss(id: string, config: ChartConfig): string | null {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.theme ?? item.color,
  );

  if (!colorConfig.length) return null;

  return Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
    )
    .join("\n");
}

function isDarkRoot(el: HTMLElement): boolean {
  return (
    Boolean(el.closest(".dark")) ||
    document.documentElement.classList.contains("dark")
  );
}

function paletteFromConfig(config: ChartConfig, el: HTMLElement): string[] {
  const colors: string[] = [];
  for (const [key, item] of Object.entries(config)) {
    let color: string | undefined;
    const css =
      el.ownerDocument.defaultView
        ?.getComputedStyle(el)
        .getPropertyValue(`--color-${key}`)
        .trim() ?? "";
    if (css.length > 0) color = css;
    if (!color && "color" in item && typeof item.color === "string") {
      color = item.color;
    }
    if (!color && item.theme) {
      color = isDarkRoot(el) ? item.theme.dark : item.theme.light;
    }
    if (color) colors.push(color);
  }
  return colors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Keep HTML tooltips off the overflow/resize host so hover does not flash
 * (and pie slices do not stick in a blurred/empty state). Callers can opt out
 * by setting tooltip.appendTo or tooltip.appendToBody themselves.
 */
function withStableTooltip(tooltip: unknown): unknown {
  if (tooltip == null) return tooltip;
  if (Array.isArray(tooltip)) {
    return tooltip.map((entry) => withStableTooltip(entry));
  }
  if (!isRecord(tooltip)) return tooltip;
  if (tooltip.appendTo != null || tooltip.appendToBody != null) {
    return tooltip;
  }
  return { ...tooltip, appendTo: "body" };
}

/**
 * ECharts canvas does not reliably paint modern CSS colors (oklch/oklab/color()).
 * Hover then blanks or flashes the series. Resolve through the DOM to rgb()/rgba().
 */
function resolveCssColor(el: HTMLElement, color: string): string {
  const trimmed = color.trim();
  if (trimmed.length === 0) return trimmed;
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb(") ||
    trimmed.startsWith("rgba(")
  ) {
    return trimmed;
  }
  const doc = el.ownerDocument;
  const view = doc.defaultView;
  if (!view) return trimmed;
  const probe = doc.createElement("span");
  probe.setAttribute("data-slot", "chart-color-probe");
  probe.style.color = trimmed;
  el.appendChild(probe);
  const resolved = view.getComputedStyle(probe).color.trim();
  probe.remove();
  if (
    resolved.length === 0 ||
    resolved === "rgba(0, 0, 0, 0)" ||
    resolved === "transparent"
  ) {
    return trimmed;
  }
  return resolved;
}

function resolveColorList(el: HTMLElement, colors: string[]): string[] {
  return colors.map((color) => resolveCssColor(el, color));
}

function withChartDefaults(
  option: EChartsOption,
  palette: string[],
  host: HTMLElement,
): EChartsOption {
  const next: EChartsOption = { ...option };
  if (next.color == null && palette.length > 0) {
    next.color = resolveColorList(host, palette);
  } else if (Array.isArray(next.color)) {
    const colors = next.color.filter(
      (entry): entry is string => typeof entry === "string",
    );
    if (colors.length === next.color.length) {
      next.color = resolveColorList(host, colors);
    }
  } else if (typeof next.color === "string") {
    next.color = resolveCssColor(host, next.color);
  }
  if (next.backgroundColor == null) {
    next.backgroundColor = "transparent";
  }
  if (next.animationThreshold == null) {
    next.animationThreshold = 2000;
  }
  if (next.tooltip !== undefined) {
    next.tooltip = withStableTooltip(next.tooltip) as EChartsOption["tooltip"];
  } else {
    next.tooltip = { appendTo: "body" };
  }
  return next;
}

/** Toolbox path icon — filled expand corners (visible as filled toolbox glyphs). */
const FULLSCREEN_ICON =
  "path://M2,2 L8,2 L8,4 L4,4 L4,8 L2,8 L2,2 Z M16,2 L22,2 L22,8 L20,8 L20,4 L16,4 L16,2 Z M2,16 L4,16 L4,20 L8,20 L8,22 L2,22 L2,16 Z M20,16 L22,16 L22,22 L16,22 L16,20 L20,20 L20,16 Z";

/** ECharts only treats toolbox features whose names start with `my` as user-defined. */
const FULLSCREEN_FEATURE = "myFullScreen";

function toggleElementFullscreen(root: HTMLElement): void {
  const doc = root.ownerDocument;
  if (doc.fullscreenElement === root) {
    const exit = doc.exitFullscreen;
    if (typeof exit === "function") void exit.call(doc);
    return;
  }
  const enter = root.requestFullscreen;
  if (typeof enter === "function") void enter.call(root);
}

/** Keep the fullscreen surface on theme tokens (Tailwind `fullscreen:` is not emitted). */
function syncFullscreenSurface(root: HTMLElement): void {
  const active = root.ownerDocument.fullscreenElement === root;
  if (active) {
    root.style.setProperty("background-color", "var(--background)");
    root.style.setProperty("color", "var(--foreground)");
    return;
  }
  root.style.removeProperty("background-color");
  root.style.removeProperty("color");
}

function withFullscreenToolbox(
  option: EChartsOption,
  onToggle: () => void,
): EChartsOption {
  const toolbox = option.toolbox;
  const first = Array.isArray(toolbox) ? toolbox[0] : toolbox;
  const base = isRecord(first) ? { ...first } : {};
  const prevFeature = isRecord(base.feature) ? base.feature : {};
  const feature = {
    ...prevFeature,
    [FULLSCREEN_FEATURE]: {
      show: true,
      title: "Fullscreen",
      icon: FULLSCREEN_ICON,
      onclick: onToggle,
    },
  };
  const nextToolbox = { ...base, feature };
  return {
    ...option,
    toolbox: Array.isArray(toolbox)
      ? [nextToolbox, ...toolbox.slice(1)]
      : nextToolbox,
  };
}

/** Same glyphs as ECharts toolbox dataZoom (Zoom / Zoom Reset). */
const ZOOM_IN_ICON =
  "path://M0,13.5h26.9 M13.5,26.9V0 M32.1,13.5H58V58H13.5 V32.1";
const ZOOM_RESET_ICON =
  "path://M22,1.4L9.9,13.5l12.3,12.3 M10.3,13.5H54.9v44.6 H10.3v-26";

const ZOOM_IN_FEATURE = "myZoom";
const ZOOM_RESET_FEATURE = "myZoomReset";

function readZoomWindow(chart: EChartsInstance): { start: number; end: number } {
  const option = chart.getOption?.();
  if (!option) return { start: 0, end: 100 };
  const list = option.dataZoom;
  const entries = Array.isArray(list) ? list : list != null ? [list] : [];
  for (const entry of entries) {
    if (!isRecord(entry)) continue;
    if (typeof entry.start === "number" && typeof entry.end === "number") {
      return { start: entry.start, end: entry.end };
    }
  }
  return { start: 0, end: 100 };
}

function dispatchZoomWindow(
  chart: EChartsInstance,
  start: number,
  end: number,
): void {
  chart.dispatchAction?.({ type: "dataZoom", start, end });
}

function stepZoomIn(chart: EChartsInstance): void {
  const { start, end } = readZoomWindow(chart);
  const span = Math.max(5, (end - start) / 2);
  const mid = (start + end) / 2;
  dispatchZoomWindow(
    chart,
    Math.max(0, mid - span / 2),
    Math.min(100, mid + span / 2),
  );
}

function resetZoomWindow(chart: EChartsInstance): void {
  dispatchZoomWindow(chart, 0, 100);
}

/**
 * One-click Zoom / Zoom Reset. Replaces ECharts brush `feature.dataZoom`,
 * which only zooms after a drag and leaves Zoom Reset inert until then.
 */
function withZoomControlsToolbox(
  option: EChartsOption,
  chart: EChartsInstance,
): EChartsOption {
  const toolbox = option.toolbox;
  const first = Array.isArray(toolbox) ? toolbox[0] : toolbox;
  const base = isRecord(first) ? { ...first } : {};
  const prevFeature = isRecord(base.feature) ? { ...base.feature } : {};
  delete prevFeature.dataZoom;
  const feature = {
    ...prevFeature,
    [ZOOM_IN_FEATURE]: {
      show: true,
      title: "Zoom",
      icon: ZOOM_IN_ICON,
      onclick: () => {
        if (!chart.isDisposed()) stepZoomIn(chart);
      },
    },
    [ZOOM_RESET_FEATURE]: {
      show: true,
      title: "Zoom Reset",
      icon: ZOOM_RESET_ICON,
      onclick: () => {
        if (!chart.isDisposed()) resetZoomWindow(chart);
      },
    },
  };
  const nextToolbox = { ...base, feature };
  return {
    ...option,
    toolbox: Array.isArray(toolbox)
      ? [nextToolbox, ...toolbox.slice(1)]
      : nextToolbox,
  };
}

/** Adds the components `useChartView` injects, so their modules load before init. */
function withModuleKeys(option: EChartsOption, props: ChartProps): EChartsOption {
  const toolbox =
    Boolean(resolve(props.zoomControls)) || Boolean(resolve(props.fullscreen));
  return {
    ...option,
    tooltip: option.tooltip ?? {},
    toolbox: toolbox ? (option.toolbox ?? {}) : option.toolbox,
  };
}

function roundedBox(width: number, height: number): string {
  return `${Math.round(width)}x${Math.round(height)}`;
}

function disposeExisting(el: HTMLElement): void {
  const existing = echarts.getInstanceByDom(el);
  if (isChartInstance(existing) && !existing.isDisposed()) {
    existing.dispose();
  }
}

export type ChartEventHandler = (
  params: unknown,
  chart: EChartsInstance,
) => void;

export type ChartProps = Omit<JSX.IntrinsicElements["div"], "on"> & {
  option: Live<EChartsOption | null | undefined>;
  theme?: Live<string | object | null>;
  renderer?: Live<"canvas" | "svg">;
  /** Passed to `echarts.init` (echarts-for-react `opts` alias). */
  initOpts?: Live<Omit<EChartsInitOpts, "renderer">>;
  opts?: Live<Omit<EChartsInitOpts, "renderer">>;
  notMerge?: Live<boolean>;
  replaceMerge?: Live<SetOptionOpts["replaceMerge"]>;
  lazyUpdate?: Live<boolean>;
  silent?: Live<boolean>;
  autoResize?: Live<boolean>;
  loading?: Live<boolean>;
  /** Alias for `loading` (echarts-for-react). */
  showLoading?: Live<boolean>;
  loadingOption?: Live<object>;
  group?: Live<string>;
  /** Injects a toolbox Fullscreen control (Fullscreen API + resize). */
  fullscreen?: Live<boolean>;
  /**
   * Injects one-click Zoom / Zoom Reset toolbox controls (and removes brush
   * `feature.dataZoom`, which needs a drag and keeps Reset disabled until then).
   */
  zoomControls?: Live<boolean>;
  onEvents?: Live<Record<string, ChartEventHandler | undefined>>;
  onReady?: (chart: EChartsInstance) => void;
  /** Alias for `onReady` (echarts-for-react). */
  onChartReady?: (chart: EChartsInstance) => void;
};

export type ChartViewReturn = {
  nested: boolean;
  hostEl: Signal<HTMLElement | null>;
  class: ChartProps["class"];
  style: ChartProps["style"];
  oncontextmenu: ChartProps["oncontextmenu"];
};

/**
 * ECharts init, option sync, resize, fullscreen, and zoom behavior.
 * Style the host yourself; bind `hostEl` via ref.
 */
export function useChartView(props: ChartProps): ChartViewReturn {
  const ctx = inject<ChartContextProps | undefined>(ChartKey, undefined);
  const hostEl = signal<HTMLElement | null>(null);

  onMounted(() => {
    const el = hostEl.value;
    if (!el) return;

    let mounted = true;
    let teardown: (() => void) | undefined;
    const start = () => {
      if (!mounted) return;
      teardown?.();
      teardown = mountChart(el, restart);
    };
    const restart = () => {
      void Promise.resolve().then(start);
    };
    onUnmounted(() => {
      mounted = false;
      teardown?.();
      teardown = undefined;
    });

    // Modules must be installed before `echarts.init` to take effect.
    const initial = readOption(props.option);
    const pending = initial
      ? installChartModules(chartModuleLoaders(withModuleKeys(initial, props)))
      : null;
    if (pending) {
      void pending.then(start);
    } else {
      start();
    }
  });

  function mountChart(
    el: HTMLElement,
    restart: () => void,
  ): (() => void) | undefined {
    disposeExisting(el);

    const renderer = resolve(props.renderer) ?? "canvas";
    const theme = resolve(props.theme) ?? null;
    const initOpts = resolve(props.initOpts) ?? resolve(props.opts);
    const view = el.ownerDocument.defaultView;
    const hasBox = el.clientWidth > 0 && el.clientHeight > 0;
    const initVersion = chartModulesVersion();
    const created: unknown = echarts.init(el, theme, {
      devicePixelRatio: view?.devicePixelRatio || 1,
      ...(hasBox ? {} : { width: 320, height: 180 }),
      ...(initOpts ?? {}),
      renderer,
    });
    if (!isChartInstance(created)) return;
    const chart = created;
    const group = resolve(props.group);
    if (group) chart.group = group;

    ctx?.setInstance(chart);
    props.onReady?.(chart);
    props.onChartReady?.(chart);

    const blockContextMenu =
      typeof props.oncontextmenu === "function"
        ? (event: Event) => {
            event.preventDefault();
          }
        : null;
    if (blockContextMenu) {
      el.addEventListener("contextmenu", blockContextMenu, true);
    }

    let alive = true;
    const bound = new Map<string, (params: unknown) => void>();
    let lastOptionInput: EChartsOption | null | undefined;
    let lastNotMerge = false;
    let lastLazyUpdate = false;
    let lastSilent = false;
    let lastReplaceMerge: SetOptionOpts["replaceMerge"];
    let lastFullscreen = false;
    let lastZoomControls = false;
    let applySeq = 0;

    let sizeEl: HTMLElement = el;
    let node: HTMLElement | null = el.parentElement;
    while (node) {
      if (node.getAttribute("data-slot") === "chart") {
        sizeEl = node;
        break;
      }
      node = node.parentElement;
    }

    const sync = () => {
      if (!alive || chart.isDisposed()) return;
      const option = readOption(props.option);
      if (option == null) {
        lastOptionInput = null;
        chart.clear();
        chart.hideLoading();
        return;
      }
      const notMerge = Boolean(resolve(props.notMerge));
      const lazyUpdate = Boolean(resolve(props.lazyUpdate));
      const silent = Boolean(resolve(props.silent));
      const replaceMerge = resolve(props.replaceMerge);
      const fullscreen = Boolean(resolve(props.fullscreen));
      const zoomControls = Boolean(resolve(props.zoomControls));
      // Re-applying the same option resets toolbox / dataZoom interaction state.
      const optionChanged = option !== lastOptionInput;
      const flagsChanged =
        notMerge !== lastNotMerge ||
        lazyUpdate !== lastLazyUpdate ||
        silent !== lastSilent ||
        replaceMerge !== lastReplaceMerge ||
        fullscreen !== lastFullscreen ||
        zoomControls !== lastZoomControls;
      if (optionChanged || flagsChanged) {
        lastOptionInput = option;
        lastNotMerge = notMerge;
        lastLazyUpdate = lazyUpdate;
        lastSilent = silent;
        lastReplaceMerge = replaceMerge;
        lastFullscreen = fullscreen;
        lastZoomControls = zoomControls;
        const palette = ctx ? paletteFromConfig(ctx.config, el) : [];
        let next = withChartDefaults(option, palette, el);
        if (zoomControls) {
          next = withZoomControlsToolbox(next, chart);
        }
        if (fullscreen) {
          next = withFullscreenToolbox(next, () => {
            if (!alive || chart.isDisposed()) return;
            toggleElementFullscreen(sizeEl);
          });
        }
        const seq = ++applySeq;
        const loaders = chartModuleLoaders(next);
        const apply = () => {
          if (!alive || chart.isDisposed() || seq !== applySeq) return;
          if (chartModulesNewerThan(loaders, initVersion)) {
            restart();
            return;
          }
          chart.setOption(next, {
            notMerge,
            lazyUpdate,
            silent,
            replaceMerge,
          });
        };
        const pending = installChartModules(loaders);
        if (pending) {
          void pending.then(apply);
        } else {
          apply();
        }
      }
      const loading =
        resolve(props.loading) ?? resolve(props.showLoading) ?? false;
      if (loading) {
        chart.showLoading("default", resolve(props.loadingOption));
      } else {
        chart.hideLoading();
      }

      for (const [name, fn] of bound) {
        chart.off(name, fn);
      }
      bound.clear();
      const events = resolve(props.onEvents);
      if (!events) return;
      for (const name of Object.keys(events)) {
        const handler = events[name];
        if (!handler) continue;
        const wrapped = (params: unknown) => {
          handler(params, chart);
        };
        bound.set(name, wrapped);
        chart.on(name, wrapped);
      }
    };

    const stop = effect(sync);

    let lastBox = "";
    const resizeTo = (width: number, height: number) => {
      if (!alive || chart.isDisposed()) return;
      let nextWidth = width;
      let nextHeight = height;
      if (nextWidth <= 0 && nextHeight <= 0) {
        if (lastBox !== "") return;
        nextWidth = 320;
        nextHeight = 180;
      }
      const nextBox = roundedBox(nextWidth, nextHeight);
      if (nextBox === lastBox) return;
      lastBox = nextBox;
      chart.resize({
        width: Math.round(nextWidth),
        height: Math.round(nextHeight),
      });
    };

    const onFullscreenChange = () => {
      if (!alive || chart.isDisposed()) return;
      syncFullscreenSurface(sizeEl);
      lastBox = "";
      resizeTo(sizeEl.clientWidth, sizeEl.clientHeight);
    };
    el.ownerDocument.addEventListener("fullscreenchange", onFullscreenChange);

    let observer: ResizeObserver | undefined;
    const onWindowResize = () => {
      resizeTo(sizeEl.clientWidth, sizeEl.clientHeight);
    };
    if (resolve(props.autoResize) !== false) {
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          resizeTo(entry.contentRect.width, entry.contentRect.height);
        });
        observer.observe(sizeEl);
      }
      view?.addEventListener("resize", onWindowResize);
      resizeTo(sizeEl.clientWidth, sizeEl.clientHeight);
      view?.requestAnimationFrame(() => {
        resizeTo(sizeEl.clientWidth, sizeEl.clientHeight);
      });
    }

    return () => {
      alive = false;
      stop();
      observer?.disconnect();
      view?.removeEventListener("resize", onWindowResize);
      if (blockContextMenu) {
        el.removeEventListener("contextmenu", blockContextMenu, true);
      }
      el.ownerDocument.removeEventListener(
        "fullscreenchange",
        onFullscreenChange,
      );
      for (const [name, fn] of bound) {
        if (!chart.isDisposed()) chart.off(name, fn);
      }
      bound.clear();
      if (!chart.isDisposed()) chart.dispose();
      ctx?.setInstance(null);
    };
  }

  return {
    nested: Boolean(ctx),
    hostEl,
    class: props.class,
    style: props.style,
    oncontextmenu: props.oncontextmenu,
  };
}

export { echarts };
export type { EChartsOption, EChartsInitOpts, SetOptionOpts };
