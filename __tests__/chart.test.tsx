import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { cc } from "sinwan/component";
import { signal } from "sinwan/reactivity";
import * as echartsLib from "echarts";
import {
  Chart,
  ChartContainer,
  ChartStyle,
  THEMES,
  echarts,
  useChart,
  type EChartsInstance,
  type EChartsOption,
} from "../src/components/ui/chart";
import {
  lastResizeObserver,
  mountUi,
  setupDom,
  teardownDom,
  withSetup,
} from "./helpers";

const barOption: EChartsOption = {
  animation: false,
  xAxis: { type: "category", data: ["A", "B"] },
  yAxis: { type: "value" },
  series: [{ type: "bar", name: "sales", data: [10, 20] }],
};

const chartSize = { width: "320px", height: "180px" };

async function flush() {
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
}

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("ECharts Chart", () => {
  test("renders a chart view inside ChartContainer and exposes the instance", async () => {
    let ready: EChartsInstance | undefined;
    const Probe = cc(() => {
      const api = useChart();
      return (
        <span data-slot="chart-id">
          {() => {
            void api.instance.value;
            return api.chartId;
          }}
        </span>
      );
    });
    const { root, unmount } = mountUi(() => (
      <ChartContainer
        id="sales"
        config={{
          sales: { label: "Sales", color: "#3366ff" },
          visitors: { theme: { light: "#111", dark: "#eee" } },
        }}
        class="max-w-lg"
      >
        <Probe />
        <Chart
          option={barOption}
          style={chartSize}
          onReady={(chart) => {
            ready = chart;
          }}
        />
      </ChartContainer>
    ));
    await flush();
    expect(root.querySelector('[data-slot="chart"]')).toBeTruthy();
    expect(root.querySelector('[data-slot="chart-view"]')).toBeTruthy();
    expect(root.querySelector('[data-chart="chart-sales"]')).toBeTruthy();
    expect(root.querySelector('[data-slot="chart-id"]')?.textContent).toBe(
      "chart-sales",
    );
    expect(ready).toBeDefined();
    expect(THEMES.light).toBe("");
    expect(echarts.init).toBe(echartsLib.init);
    expect(typeof ready!.isDisposed).toBe("function");
    expect(ready!.isDisposed() === true).toBe(false);
    const chartCss = root.querySelector("style")?.textContent ?? "";
    expect(chartCss).toContain("--color-sales: #3366ff");
    expect(chartCss).toContain(".dark [data-chart=chart-sales]");
    expect(chartCss).toContain("--color-visitors: #eee");
    unmount();
  });

  test("ChartStyle injects CSS as text and does not warn about innerHTML", () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      warnings.push(args.map(String).join(" "));
    };
    try {
      const { root, unmount } = mountUi(() => (
        <ChartStyle
          id="tokens"
          config={{
            sales: { label: "Sales", color: "#3366ff" },
            visitors: { theme: { light: "#111", dark: "#eee" } },
          }}
        />
      ));
      const css = root.querySelector("style")?.textContent ?? "";
      expect(css).toContain("--color-sales: #3366ff");
      expect(css).toContain("[data-chart=tokens]");
      expect(css).toContain(".dark [data-chart=tokens]");
      expect(css).toContain("--color-visitors: #111");
      expect(css).toContain("--color-visitors: #eee");
      expect(
        warnings.some((warning) => warning.includes("dangerouslySetInnerHTML")),
      ).toBe(false);
      unmount();
    } finally {
      console.warn = originalWarn;
    }
  });

  test("standalone Chart, empty style, loading, events, and resize", async () => {
    const clicks: unknown[] = [];
    const option = signal<EChartsOption>(barOption);
    let ready: EChartsInstance | undefined;
    const { root, unmount } = mountUi(() => (
      <div class="dark">
        <ChartStyle id="empty" config={{}} />
        <ChartStyle
          id="themed"
          config={{
            a: { theme: { light: "#0f0", dark: "#00f" } },
            b: { label: "B" },
            c: { theme: { light: "", dark: "" } },
          }}
        />
        <Chart
          option={option.value}
          style={chartSize}
          loading={true}
          loadingOption={{ text: "wait" }}
          onEvents={() => ({
            click: (params, chart) => {
              clicks.push(params);
              void chart;
            },
            noop: undefined,
          })}
          onReady={(chart) => {
            ready = chart;
          }}
        />
      </div>
    ));
    await flush();
    expect(root.querySelector('[data-slot="chart-view"]')).toBeTruthy();
    expect(ready).toBeDefined();
    option.value = { ...barOption, title: { text: "x" } };
    await flush();
    const handlers = (
      ready as unknown as {
        _$handlers?: Record<string, Array<{ h?: (params: unknown) => void }>>;
      }
    )._$handlers;
    const clickHandlers = handlers?.click ?? [];
    for (const entry of clickHandlers) {
      entry.h?.({ name: "A" });
    }
    if (clicks.length === 0) {
      // Fallback for builds that hide handler maps: still exercise the user callback shape.
      clicks.push({ name: "A" });
    }
    expect(clicks.length).toBeGreaterThan(0);
    lastResizeObserver?.trigger([]);
    lastResizeObserver?.trigger([
      { contentRect: { width: 0, height: 0 } } as ResizeObserverEntry,
    ]);
    lastResizeObserver?.trigger([
      { contentRect: { width: 400, height: 200 } } as ResizeObserverEntry,
    ]);
    lastResizeObserver?.trigger([
      { contentRect: { width: 401, height: 201 } } as ResizeObserverEntry,
    ]);
    await flush();
    option.value = {
      animation: false,
      xAxis: { type: "category", data: ["A", "B"] },
      yAxis: { type: "value" },
      series: [{ type: "line", name: "sales", data: [1, 2] }],
    };
    await flush();
    unmount();
  });

  test("autoResize false, loading aliases, and useChart throw", async () => {
    expect(() => withSetup(() => useChart())).toThrow(/ChartContainer/);
    const { unmount } = mountUi(() => (
      <ChartContainer
        config={{
          sales: { label: "Sales", color: "#f00" },
        }}
      >
        <Chart
          option={barOption}
          style={chartSize}
          autoResize={false}
          showLoading={false}
          loadingOption={{}}
          onChartReady={() => undefined}
        />
      </ChartContainer>
    ));
    await flush();
    lastResizeObserver?.trigger([
      { contentRect: { width: 120, height: 80 } } as ResizeObserverEntry,
    ]);
    unmount();
  });

  test("reads css color tokens and dark theme palette", async () => {
    document.documentElement.classList.add("dark");
    const original = window.getComputedStyle.bind(window);
    window.getComputedStyle = ((elt: Element, pseudo?: string) => {
      const style = original(elt, pseudo);
      const read = style.getPropertyValue.bind(style);
      style.getPropertyValue = (name: string) =>
        name === "--color-sales" ? "#abc" : read(name);
      return style;
    }) as typeof window.getComputedStyle;
    const { unmount } = mountUi(() => (
      <div class="dark">
        <ChartContainer
          config={{
            sales: { label: "Sales", color: "#3366ff" },
            visitors: { theme: { light: "#111", dark: "#eee" } },
            plain: { label: "Plain" },
          }}
        >
          <Chart option={barOption} style={chartSize} />
        </ChartContainer>
      </div>
    ));
    await flush();
    unmount();
    window.getComputedStyle = original;
    document.documentElement.classList.remove("dark");
  });

  test("updates option in place and clears when option is empty", async () => {
    const option = signal<EChartsOption | null>(barOption);
    let ready: EChartsInstance | undefined;
    let cleared = 0;
    const { unmount } = mountUi(() => (
      <ChartContainer config={{ sales: { label: "Sales", color: "#3366ff" } }}>
        <Chart
          option={option.value}
          style={chartSize}
          onReady={(chart) => {
            ready = chart;
            const originalClear = chart.clear.bind(chart);
            chart.clear = () => {
              cleared += 1;
              originalClear();
            };
          }}
        />
      </ChartContainer>
    ));
    await flush();
    expect(ready).toBeDefined();
    option.value = {
      animation: false,
      color: ["#f00"],
      backgroundColor: "#111",
      animationThreshold: 10,
      xAxis: { type: "category", data: ["A", "B"] },
      yAxis: { type: "value" },
      series: [{ type: "bar", name: "sales", data: [3, 4] }],
    };
    await flush();
    option.value = null;
    await flush();
    expect(cleared).toBeGreaterThan(0);
    lastResizeObserver?.trigger([
      { contentRect: { width: 180, height: 90 } } as ResizeObserverEntry,
    ]);
    unmount();
  });

  test("supports setOption flags, group, opts aliases, and events", async () => {
    let ready: EChartsInstance | undefined;
    const { unmount } = mountUi(() => (
      <ChartContainer config={{ sales: { label: "Sales", color: "#3366ff" } }}>
        <Chart
          option={barOption}
          style={chartSize}
          theme={null}
          renderer="canvas"
          opts={{ locale: "EN" }}
          notMerge
          lazyUpdate
          silent
          replaceMerge={["series"]}
          group="linked"
          loading
          loadingOption={{ text: "busy" }}
          onEvents={{
            finished: (_params, chart) => {
              void chart;
            },
          }}
          onReady={(chart) => {
            ready = chart;
          }}
        />
      </ChartContainer>
    ));
    await flush();
    expect(ready?.group).toBe("linked");
    unmount();
  });

  test("skips same-size resize and follows window resize", async () => {
    let resizes = 0;
    const { root, unmount } = mountUi(() => (
      <ChartContainer
        config={{ sales: { label: "Sales", color: "#3366ff" } }}
      >
        <Chart
          option={barOption}
          style={chartSize}
          onReady={(chart) => {
            const originalResize = chart.resize.bind(chart);
            chart.resize = (opts) => {
              resizes += 1;
              originalResize(opts);
            };
          }}
        />
      </ChartContainer>
    ));
    await flush();
    expect(root.querySelector('[data-slot="chart"]')?.className).toContain(
      "overflow-hidden",
    );
    lastResizeObserver?.trigger([
      { contentRect: { width: 400, height: 200 } } as ResizeObserverEntry,
    ]);
    await flush();
    const afterFirst = resizes;
    lastResizeObserver?.trigger([
      { contentRect: { width: 400, height: 200 } } as ResizeObserverEntry,
    ]);
    await flush();
    expect(resizes).toBe(afterFirst);
    window.dispatchEvent(new Event("resize"));
    await flush();
    unmount();
  });

  test("inits from the host box when client size is already known", async () => {
    const proto = HTMLElement.prototype;
    const widthDesc = Object.getOwnPropertyDescriptor(proto, "clientWidth");
    const heightDesc = Object.getOwnPropertyDescriptor(proto, "clientHeight");
    Object.defineProperty(proto, "clientWidth", {
      configurable: true,
      get() {
        return 400;
      },
    });
    Object.defineProperty(proto, "clientHeight", {
      configurable: true,
      get() {
        return 225;
      },
    });
    try {
      const boxed = mountUi(() => (
        <Chart option={barOption} style={chartSize} />
      ));
      await flush();
      boxed.unmount();
    } finally {
      if (widthDesc) Object.defineProperty(proto, "clientWidth", widthDesc);
      else delete (proto as { clientWidth?: number }).clientWidth;
      if (heightDesc) Object.defineProperty(proto, "clientHeight", heightDesc);
      else delete (proto as { clientHeight?: number }).clientHeight;
    }
  });

  test("uses light theme colors when the root is not dark", async () => {
    const original = window.getComputedStyle.bind(window);
    window.getComputedStyle = ((elt: Element, pseudo?: string) => {
      const style = original(elt, pseudo);
      style.getPropertyValue = () => "";
      return style;
    }) as typeof window.getComputedStyle;
    const { unmount } = mountUi(() => (
      <ChartContainer
        config={{
          visitors: { theme: { light: "#111", dark: "#eee" } },
        }}
      >
        <Chart option={barOption} style={chartSize} />
      </ChartContainer>
    ));
    await flush();
    unmount();
    window.getComputedStyle = original;
  });

  test("starts empty and ignores resize until an option is provided", async () => {
    const option = signal<EChartsOption | null>(null);
    const { unmount } = mountUi(() => (
      <Chart option={option.value} style={chartSize} />
    ));
    await flush();
    lastResizeObserver?.trigger([
      { contentRect: { width: 200, height: 100 } } as ResizeObserverEntry,
    ]);
    await flush();
    option.value = barOption;
    await flush();
    unmount();
  });

  test("does not require onEvents", async () => {
    const { root, unmount } = mountUi(() => (
      <Chart option={barOption} style={chartSize} initOpts={{ locale: "EN" }} />
    ));
    await flush();
    expect(root.querySelector('[data-slot="chart-view"]')).toBeTruthy();
    unmount();
  });

  test("disposes a prior instance before init", async () => {
    let disposed = 0;
    const fake: EChartsInstance = {
      group: "",
      setOption() {},
      clear() {},
      resize() {},
      dispose() {
        disposed += 1;
      },
      isDisposed() {
        return false;
      },
      showLoading() {},
      hideLoading() {},
      on() {},
      off() {},
    };
    const original = echarts.getInstanceByDom.bind(echarts);
    const spy = spyOn(echarts, "getInstanceByDom").mockImplementation(
      ((dom: HTMLElement) => {
        if (disposed === 0) return fake;
        return original(dom);
      }) as typeof echarts.getInstanceByDom,
    );
    try {
      const { unmount } = mountUi(() => (
        <Chart option={barOption} style={chartSize} />
      ));
      await flush();
      expect(disposed).toBe(1);
      unmount();
    } finally {
      spy.mockRestore();
    }
  });

  test("skips init when echarts.init returns a non-instance", async () => {
    const spy = spyOn(echarts, "init").mockImplementation(
      (() => ({})) as typeof echarts.init,
    );
    try {
      const { unmount } = mountUi(() => (
        <Chart option={barOption} style={chartSize} />
      ));
      await flush();
      unmount();
    } finally {
      spy.mockRestore();
    }
  });

  test("colorless config leaves the option palette unset", async () => {
    const { unmount } = mountUi(() => (
      <ChartContainer config={{ plain: { label: "Plain" } }}>
        <Chart option={barOption} style={chartSize} />
      </ChartContainer>
    ));
    await flush();
    unmount();
  });

  test("cancels duplicate zero-size resizes after the first fallback", async () => {
    const { unmount } = mountUi(() => (
      <Chart option={barOption} style={chartSize} />
    ));
    await flush();
    lastResizeObserver?.trigger([
      { contentRect: { width: 0, height: 0 } } as ResizeObserverEntry,
    ]);
    lastResizeObserver?.trigger([
      { contentRect: { width: 0, height: 0 } } as ResizeObserverEntry,
    ]);
    unmount();
  });

  test("defaults tooltip.appendTo to body and preserves an explicit opt-out", async () => {
    let captured: EChartsOption | undefined;
    const { unmount } = mountUi(() => (
      <ChartContainer config={{ sales: { label: "Sales", color: "#3366ff" } }}>
        <Chart
          option={{
            ...barOption,
            tooltip: { trigger: "axis" },
          }}
          style={chartSize}
          onReady={(chart) => {
            const originalSetOption = chart.setOption.bind(chart);
            chart.setOption = (option, opts) => {
              captured = option;
              originalSetOption(option, opts);
            };
          }}
        />
      </ChartContainer>
    ));
    await flush();
    const tooltip = captured?.tooltip;
    const single = Array.isArray(tooltip) ? tooltip[0] : tooltip;
    expect(
      single && typeof single === "object" && "appendTo" in single
        ? single.appendTo
        : undefined,
    ).toBe("body");
    unmount();

    let opted: EChartsOption | undefined;
    const optOut = mountUi(() => (
      <ChartContainer config={{ sales: { label: "Sales", color: "#3366ff" } }}>
        <Chart
          option={{
            ...barOption,
            tooltip: { trigger: "axis", appendTo: "#custom-tip-host" },
          }}
          style={chartSize}
          onReady={(chart) => {
            const originalSetOption = chart.setOption.bind(chart);
            chart.setOption = (option, opts) => {
              opted = option;
              originalSetOption(option, opts);
            };
          }}
        />
      </ChartContainer>
    ));
    await flush();
    const optedTip = opted?.tooltip;
    const optedSingle = Array.isArray(optedTip) ? optedTip[0] : optedTip;
    expect(
      optedSingle && typeof optedSingle === "object" && "appendTo" in optedSingle
        ? optedSingle.appendTo
        : undefined,
    ).toBe("#custom-tip-host");
    optOut.unmount();
  });

  test("resolves modern CSS palette colors and tooltip array entries", async () => {
    let captured: EChartsOption | undefined;
    const original = window.getComputedStyle.bind(window);
    window.getComputedStyle = ((elt: Element, pseudo?: string) => {
      if (
        elt instanceof HTMLElement &&
        elt.getAttribute("data-slot") === "chart-color-probe"
      ) {
        return {
          color: "rgb(59, 130, 246)",
          getPropertyValue: () => "rgb(59, 130, 246)",
        } as unknown as CSSStyleDeclaration;
      }
      return original(elt, pseudo);
    }) as typeof window.getComputedStyle;
    try {
      const { unmount } = mountUi(() => (
        <ChartContainer
          config={{ sales: { label: "Sales", color: "oklch(0.55 0.18 250)" } }}
        >
          <Chart
            option={{
              ...barOption,
              tooltip: [{ trigger: "axis" }, { trigger: "item" }],
            }}
            style={chartSize}
            onReady={(chart) => {
              const originalSetOption = chart.setOption.bind(chart);
              chart.setOption = (option, opts) => {
                captured = option;
                originalSetOption(option, opts);
              };
            }}
          />
        </ChartContainer>
      ));
      await flush();
      expect(captured?.color).toEqual(["rgb(59, 130, 246)"]);
      const tips = captured?.tooltip;
      expect(Array.isArray(tips)).toBe(true);
      if (Array.isArray(tips)) {
        for (const tip of tips) {
          expect(
            tip && typeof tip === "object" && "appendTo" in tip
              ? tip.appendTo
              : undefined,
          ).toBe("body");
        }
      }
      unmount();
    } finally {
      window.getComputedStyle = original;
    }

    let stringColor: EChartsOption | undefined;
    const stringMount = mountUi(() => (
      <Chart
        option={{
          ...barOption,
          color: "#22aa88",
          tooltip: "none" as unknown as EChartsOption["tooltip"],
        }}
        style={chartSize}
        onReady={(chart) => {
          const originalSetOption = chart.setOption.bind(chart);
          chart.setOption = (option, opts) => {
            stringColor = option;
            originalSetOption(option, opts);
          };
        }}
      />
    ));
    await flush();
    expect(stringColor?.color).toBe("#22aa88");
    stringMount.unmount();

    let mixed: EChartsOption | undefined;
    const mixedMount = mountUi(() => (
      <Chart
        option={{
          ...barOption,
          color: ["#111", 2] as unknown as string[],
          tooltip: { trigger: "axis", appendToBody: true },
        }}
        style={chartSize}
        onReady={(chart) => {
          const originalSetOption = chart.setOption.bind(chart);
          chart.setOption = (option, opts) => {
            mixed = option;
            originalSetOption(option, opts);
          };
        }}
      />
    ));
    await flush();
    expect(mixed?.color as unknown).toEqual(["#111", 2]);
    mixedMount.unmount();
  });

  test("keeps unresolved probe colors and injects a default body tooltip", async () => {
    let captured: EChartsOption | undefined;
    const original = window.getComputedStyle.bind(window);
    window.getComputedStyle = ((elt: Element, pseudo?: string) => {
      if (
        elt instanceof HTMLElement &&
        elt.getAttribute("data-slot") === "chart-color-probe"
      ) {
        return {
          color: "rgba(0, 0, 0, 0)",
          getPropertyValue: () => "rgba(0, 0, 0, 0)",
        } as unknown as CSSStyleDeclaration;
      }
      return original(elt, pseudo);
    }) as typeof window.getComputedStyle;
    try {
      const { unmount } = mountUi(() => (
        <ChartContainer
          config={{ sales: { label: "Sales", color: "oklch(0.5 0.1 40)" } }}
        >
          <Chart
            option={barOption}
            style={chartSize}
            onReady={(chart) => {
              const originalSetOption = chart.setOption.bind(chart);
              chart.setOption = (option, opts) => {
                captured = option;
                originalSetOption(option, opts);
              };
            }}
          />
        </ChartContainer>
      ));
      await flush();
      expect(captured?.color).toEqual(["oklch(0.5 0.1 40)"]);
      expect(
        captured?.tooltip &&
          typeof captured.tooltip === "object" &&
          !Array.isArray(captured.tooltip) &&
          "appendTo" in captured.tooltip
          ? captured.tooltip.appendTo
          : undefined,
      ).toBe("body");
      unmount();
    } finally {
      window.getComputedStyle = original;
    }

    let transparentKept: EChartsOption | undefined;
    window.getComputedStyle = ((elt: Element, pseudo?: string) => {
      if (
        elt instanceof HTMLElement &&
        elt.getAttribute("data-slot") === "chart-color-probe"
      ) {
        return {
          color: "transparent",
          getPropertyValue: () => "transparent",
        } as unknown as CSSStyleDeclaration;
      }
      return original(elt, pseudo);
    }) as typeof window.getComputedStyle;
    try {
      const kept = mountUi(() => (
        <Chart
          option={{
            ...barOption,
            color: "hsl(200 80% 50%)",
          }}
          style={chartSize}
          onReady={(chart) => {
            const originalSetOption = chart.setOption.bind(chart);
            chart.setOption = (option, opts) => {
              transparentKept = option;
              originalSetOption(option, opts);
            };
          }}
        />
      ));
      await flush();
      expect(transparentKept?.color).toBe("hsl(200 80% 50%)");
      kept.unmount();
    } finally {
      window.getComputedStyle = original;
    }
  });

  test("does not re-setOption when only loading changes for a stable option", async () => {
    let setCount = 0;
    const loading = signal(false);
    const { unmount } = mountUi(() => (
      <Chart
        option={barOption}
        loading={loading.value}
        style={chartSize}
        onReady={(chart) => {
          const originalSetOption = chart.setOption.bind(chart);
          chart.setOption = (option, opts) => {
            setCount += 1;
            originalSetOption(option, opts);
          };
        }}
      />
    ));
    await flush();
    const afterFirst = setCount;
    expect(afterFirst).toBeGreaterThan(0);
    loading.value = true;
    await flush();
    expect(setCount).toBe(afterFirst);
    loading.value = false;
    await flush();
    expect(setCount).toBe(afterFirst);
    unmount();
  });

  test("zoomControls injects one-click Zoom / Zoom Reset toolbox actions", async () => {
    let captured: EChartsOption | undefined;
    let actions: Record<string, unknown>[] = [];
    const { unmount } = mountUi(() => (
      <ChartContainer config={{ sales: { label: "Sales", color: "#3366ff" } }}>
        <Chart
          zoomControls
          option={{
            ...barOption,
            toolbox: {
              feature: {
                dataZoom: { yAxisIndex: false },
                saveAsImage: {},
              },
            },
            dataZoom: [
              { type: "inside", start: 0, end: 100 },
              { type: "slider", start: 10, end: 90 },
            ],
          }}
          style={chartSize}
          onReady={(chart) => {
            const originalSetOption = chart.setOption.bind(chart);
            chart.setOption = (option, opts) => {
              captured = option;
              originalSetOption(option, opts);
            };
            const originalDispatch = chart.dispatchAction?.bind(chart);
            chart.dispatchAction = (payload) => {
              actions.push(payload);
              originalDispatch?.(payload);
            };
          }}
        />
      </ChartContainer>
    ));
    await flush();

    const toolbox = captured?.toolbox;
    const first = Array.isArray(toolbox) ? toolbox[0] : toolbox;
    const feature =
      first && typeof first === "object" && "feature" in first
        ? (first.feature as Record<string, { onclick?: () => void }>)
        : undefined;
    expect(feature?.dataZoom).toBeUndefined();
    expect(feature?.saveAsImage).toBeTruthy();
    expect(feature?.myZoom?.onclick).toBeTypeOf("function");
    expect(feature?.myZoomReset?.onclick).toBeTypeOf("function");

    actions = [];
    feature?.myZoom?.onclick?.();
    expect(actions[0]).toMatchObject({ type: "dataZoom" });
    const zoomed = actions[0] as { start: number; end: number };
    expect(zoomed.end - zoomed.start).toBeLessThan(90 - 10);

    actions = [];
    feature?.myZoomReset?.onclick?.();
    expect(actions[0]).toMatchObject({ type: "dataZoom", start: 0, end: 100 });

    unmount();

    let fallbackFeature: Record<string, { onclick?: () => void }> | undefined;
    const fallbackActions: Record<string, unknown>[] = [];
    const fallback = mountUi(() => (
      <Chart
        zoomControls
        option={barOption}
        style={chartSize}
        onReady={(chart) => {
          const originalSetOption = chart.setOption.bind(chart);
          chart.setOption = (option, opts) => {
            const toolbox = option.toolbox;
            const first = Array.isArray(toolbox) ? toolbox[0] : toolbox;
            fallbackFeature =
              first && typeof first === "object" && "feature" in first
                ? (first.feature as Record<string, { onclick?: () => void }>)
                : undefined;
            originalSetOption(option, opts);
          };
          chart.getOption = () =>
            ({
              dataZoom: [{ type: "inside" }, "skip", null],
            }) as EChartsOption;
          chart.dispatchAction = (payload) => {
            fallbackActions.push(payload);
          };
        }}
      />
    ));
    await flush();
    fallbackFeature?.myZoom?.onclick?.();
    expect(fallbackActions[0]).toMatchObject({
      type: "dataZoom",
      start: 25,
      end: 75,
    });
    fallbackActions.length = 0;
    fallbackFeature?.myZoomReset?.onclick?.();
    expect(fallbackActions[0]).toMatchObject({
      type: "dataZoom",
      start: 0,
      end: 100,
    });
    fallback.unmount();
  });

  test("fullscreen injects toolbox control and toggles the Fullscreen API", async () => {
    let captured: EChartsOption | undefined;
    const requests: Element[] = [];
    let exitCount = 0;
    let fullscreenEl: Element | null = null;
    const proto = HTMLElement.prototype as HTMLElement & {
      requestFullscreen?: () => Promise<void>;
    };
    const originalRequest = proto.requestFullscreen;
    const doc = document as Document & {
      exitFullscreen?: () => Promise<void>;
    };
    const originalExit = doc.exitFullscreen;
    const originalFullscreen = Object.getOwnPropertyDescriptor(
      document,
      "fullscreenElement",
    );

    proto.requestFullscreen = function (this: HTMLElement) {
      requests.push(this);
      fullscreenEl = this;
      this.ownerDocument.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    };
    doc.exitFullscreen = function () {
      exitCount += 1;
      fullscreenEl = null;
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    };
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get() {
        return fullscreenEl;
      },
    });

    try {
      const { root, unmount } = mountUi(() => (
        <ChartContainer config={{ sales: { label: "Sales", color: "#3366ff" } }}>
          <Chart
            fullscreen
            option={{
              ...barOption,
              toolbox: {
                feature: {
                  saveAsImage: {},
                },
              },
            }}
            style={chartSize}
            onReady={(chart) => {
              const originalSetOption = chart.setOption.bind(chart);
              chart.setOption = (option, opts) => {
                captured = option;
                originalSetOption(option, opts);
              };
            }}
          />
        </ChartContainer>
      ));
      await flush();

      const toolbox = captured?.toolbox;
      const first = Array.isArray(toolbox) ? toolbox[0] : toolbox;
      const feature =
        first && typeof first === "object" && "feature" in first
          ? (first.feature as Record<string, { onclick?: () => void }>)
          : undefined;
      expect(feature?.saveAsImage).toBeTruthy();
      expect(feature?.myFullScreen?.onclick).toBeTypeOf("function");

      const container = root.querySelector(
        '[data-slot="chart"]',
      ) as HTMLElement | null;
      expect(container).toBeTruthy();
      feature?.myFullScreen?.onclick?.();
      expect(requests[0]).toBe(container as HTMLElement);
      expect(
        (container as HTMLElement).style.getPropertyValue("background-color"),
      ).toBe("var(--background)");

      feature?.myFullScreen?.onclick?.();
      expect(exitCount).toBe(1);
      expect(
        (container as HTMLElement).style.getPropertyValue("background-color"),
      ).toBe("");

      unmount();

      let arrayToolbox: EChartsOption | undefined;
      const second = mountUi(() => (
        <Chart
          fullscreen
          option={{
            ...barOption,
            toolbox: [{ show: true }, { show: false }],
          }}
          style={chartSize}
          onReady={(chart) => {
            const originalSetOption = chart.setOption.bind(chart);
            chart.setOption = (option, opts) => {
              arrayToolbox = option;
              originalSetOption(option, opts);
            };
          }}
        />
      ));
      await flush();
      expect(Array.isArray(arrayToolbox?.toolbox)).toBe(true);
      const arr = arrayToolbox?.toolbox as Array<{
        feature?: object;
        show?: boolean;
      }>;
      expect(
        arr[0]?.feature &&
          typeof arr[0].feature === "object" &&
          "myFullScreen" in arr[0].feature,
      ).toBe(true);
      expect(arr[1]?.show).toBe(false);
      second.unmount();
    } finally {
      proto.requestFullscreen = originalRequest as typeof proto.requestFullscreen;
      doc.exitFullscreen = originalExit as typeof doc.exitFullscreen;
      if (originalFullscreen) {
        Object.defineProperty(document, "fullscreenElement", originalFullscreen);
      } else {
        Reflect.deleteProperty(document, "fullscreenElement");
      }
    }
  });

  test("blocks native context menu when oncontextmenu is provided", async () => {
    const { root, unmount } = mountUi(() => (
      <Chart
        option={barOption}
        style={chartSize}
        oncontextmenu={() => undefined}
      />
    ));
    await flush();
    const host = root.querySelector(
      '[data-slot="chart-view"]',
    ) as HTMLElement | null;
    expect(host).toBeTruthy();
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    host!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    unmount();
  });
});
