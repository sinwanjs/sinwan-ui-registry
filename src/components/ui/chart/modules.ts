import * as echarts from "echarts/core";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

// Renderers stay static so `echarts.init` works synchronously; charts,
// components and echarts-gl load on demand for the options that need them.
echarts.use([CanvasRenderer, SVGRenderer]);

export type ChartModuleInstaller = Parameters<typeof echarts.use>[0];
export type ChartModuleLoader = () => Promise<ChartModuleInstaller>;

type InstallModule = { install: ChartModuleInstaller };

function fromInstall(load: () => Promise<InstallModule>): ChartModuleLoader {
  return () => load().then((mod) => mod.install);
}

// One deep import per module, so bundlers emit a chunk per chart type.
const grid = fromInstall(() => import("echarts/lib/component/grid/install.js"));
const polar = fromInstall(() => import("echarts/lib/component/polar/install.js"));
const parallel = fromInstall(
  () => import("echarts/lib/component/parallel/install.js"),
);
const grid3D = fromInstall(
  () => import("echarts-gl/lib/component/grid3D/install.js"),
);
const markPoint = fromInstall(
  () => import("echarts/lib/component/marker/installMarkPoint.js"),
);
const markLine = fromInstall(
  () => import("echarts/lib/component/marker/installMarkLine.js"),
);
const markArea = fromInstall(
  () => import("echarts/lib/component/marker/installMarkArea.js"),
);
const transform = fromInstall(
  () => import("echarts/lib/component/transform/install.js"),
);
const universalTransition: ChartModuleLoader = () =>
  import("echarts/features").then((mod) => mod.UniversalTransition);
const axisBreak: ChartModuleLoader = () =>
  import("echarts/features").then((mod) => mod.AxisBreak);
const scatterJitter: ChartModuleLoader = () =>
  import("echarts/features").then((mod) => mod.ScatterJitter);
const legacyGridContainLabel: ChartModuleLoader = () =>
  import("echarts/features").then((mod) => mod.LegacyGridContainLabel);

const seriesLoaders: Readonly<Record<string, ChartModuleLoader>> = {
  line: fromInstall(() => import("echarts/lib/chart/line/install.js")),
  bar: fromInstall(() => import("echarts/lib/chart/bar/install.js")),
  pie: fromInstall(() => import("echarts/lib/chart/pie/install.js")),
  scatter: fromInstall(() => import("echarts/lib/chart/scatter/install.js")),
  radar: fromInstall(() => import("echarts/lib/chart/radar/install.js")),
  map: fromInstall(() => import("echarts/lib/chart/map/install.js")),
  tree: fromInstall(() => import("echarts/lib/chart/tree/install.js")),
  treemap: fromInstall(() => import("echarts/lib/chart/treemap/install.js")),
  graph: fromInstall(() => import("echarts/lib/chart/graph/install.js")),
  chord: fromInstall(() => import("echarts/lib/chart/chord/install.js")),
  gauge: fromInstall(() => import("echarts/lib/chart/gauge/install.js")),
  funnel: fromInstall(() => import("echarts/lib/chart/funnel/install.js")),
  parallel: fromInstall(() => import("echarts/lib/chart/parallel/install.js")),
  sankey: fromInstall(() => import("echarts/lib/chart/sankey/install.js")),
  boxplot: fromInstall(() => import("echarts/lib/chart/boxplot/install.js")),
  candlestick: fromInstall(
    () => import("echarts/lib/chart/candlestick/install.js"),
  ),
  effectScatter: fromInstall(
    () => import("echarts/lib/chart/effectScatter/install.js"),
  ),
  lines: fromInstall(() => import("echarts/lib/chart/lines/install.js")),
  heatmap: fromInstall(() => import("echarts/lib/chart/heatmap/install.js")),
  pictorialBar: fromInstall(
    () => import("echarts/lib/chart/bar/installPictorialBar.js"),
  ),
  themeRiver: fromInstall(
    () => import("echarts/lib/chart/themeRiver/install.js"),
  ),
  sunburst: fromInstall(() => import("echarts/lib/chart/sunburst/install.js")),
  custom: fromInstall(() => import("echarts/lib/chart/custom/install.js")),
  bar3D: fromInstall(() => import("echarts-gl/lib/chart/bar3D/install.js")),
  line3D: fromInstall(() => import("echarts-gl/lib/chart/line3D/install.js")),
  scatter3D: fromInstall(
    () => import("echarts-gl/lib/chart/scatter3D/install.js"),
  ),
  lines3D: fromInstall(() => import("echarts-gl/lib/chart/lines3D/install.js")),
  polygons3D: fromInstall(
    () => import("echarts-gl/lib/chart/polygons3D/install.js"),
  ),
  surface: fromInstall(() => import("echarts-gl/lib/chart/surface/install.js")),
  map3D: fromInstall(() => import("echarts-gl/lib/chart/map3D/install.js")),
  scatterGL: fromInstall(
    () => import("echarts-gl/lib/chart/scatterGL/install.js"),
  ),
  graphGL: fromInstall(() => import("echarts-gl/lib/chart/graphGL/install.js")),
  flowGL: fromInstall(() => import("echarts-gl/lib/chart/flowGL/install.js")),
  linesGL: fromInstall(() => import("echarts-gl/lib/chart/linesGL/install.js")),
};

const componentLoaders: Readonly<Record<string, ChartModuleLoader>> = {
  grid,
  xAxis: grid,
  yAxis: grid,
  polar,
  angleAxis: polar,
  radiusAxis: polar,
  radar: fromInstall(() => import("echarts/lib/component/radar/install.js")),
  geo: fromInstall(() => import("echarts/lib/component/geo/install.js")),
  singleAxis: fromInstall(
    () => import("echarts/lib/component/singleAxis/install.js"),
  ),
  parallel,
  parallelAxis: parallel,
  calendar: fromInstall(
    () => import("echarts/lib/component/calendar/install.js"),
  ),
  matrix: fromInstall(() => import("echarts/lib/component/matrix/install.js")),
  graphic: fromInstall(
    () => import("echarts/lib/component/graphic/install.js"),
  ),
  toolbox: fromInstall(
    () => import("echarts/lib/component/toolbox/install.js"),
  ),
  tooltip: fromInstall(
    () => import("echarts/lib/component/tooltip/install.js"),
  ),
  axisPointer: fromInstall(
    () => import("echarts/lib/component/axisPointer/install.js"),
  ),
  brush: fromInstall(() => import("echarts/lib/component/brush/install.js")),
  title: fromInstall(() => import("echarts/lib/component/title/install.js")),
  timeline: fromInstall(
    () => import("echarts/lib/component/timeline/install.js"),
  ),
  legend: fromInstall(() => import("echarts/lib/component/legend/install.js")),
  dataZoom: fromInstall(
    () => import("echarts/lib/component/dataZoom/install.js"),
  ),
  visualMap: fromInstall(
    () => import("echarts/lib/component/visualMap/install.js"),
  ),
  thumbnail: fromInstall(
    () => import("echarts/lib/component/thumbnail/install.js"),
  ),
  aria: fromInstall(() => import("echarts/lib/component/aria/install.js")),
  dataset: fromInstall(
    () => import("echarts/lib/component/dataset/install.js"),
  ),
  grid3D,
  xAxis3D: grid3D,
  yAxis3D: grid3D,
  zAxis3D: grid3D,
  geo3D: fromInstall(() => import("echarts-gl/lib/component/geo3D/install.js")),
  globe: fromInstall(() => import("echarts-gl/lib/component/globe/install.js")),
  mapbox3D: fromInstall(
    () => import("echarts-gl/lib/component/mapbox3D/install.js"),
  ),
  maptalks3D: fromInstall(
    () => import("echarts-gl/lib/component/maptalks3D/install.js"),
  ),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function entries(value: unknown): Record<string, unknown>[] {
  const list = Array.isArray(value) ? value : [value];
  return list.filter(isRecord);
}

function lookup(
  table: Readonly<Record<string, ChartModuleLoader>>,
  key: unknown,
): ChartModuleLoader | undefined {
  return typeof key === "string" && Object.hasOwn(table, key)
    ? table[key]
    : undefined;
}

function collectSeries(
  series: Record<string, unknown>,
  add: (loader: ChartModuleLoader | undefined) => void,
): void {
  add(lookup(seriesLoaders, series.type));
  if (series.markPoint != null) add(markPoint);
  if (series.markLine != null) add(markLine);
  if (series.markArea != null) add(markArea);
  if (series.universalTransition != null) add(universalTransition);
}

function collectOption(
  option: Record<string, unknown>,
  add: (loader: ChartModuleLoader | undefined) => void,
): void {
  for (const [key, value] of Object.entries(option)) {
    if (value == null) continue;
    add(lookup(componentLoaders, key));
  }
  for (const series of entries(option.series)) collectSeries(series, add);
  for (const axis of [
    ...entries(option.xAxis),
    ...entries(option.yAxis),
    ...entries(option.singleAxis),
  ]) {
    if (axis.breaks != null) add(axisBreak);
    if (axis.jitter != null) add(scatterJitter);
  }
  if (entries(option.grid).some((grid) => grid.containLabel != null)) {
    add(legacyGridContainLabel);
  }
  if (entries(option.dataset).some((dataset) => dataset.transform != null)) {
    add(transform);
  }
  for (const nested of [
    option.baseOption,
    ...entries(option.options),
    ...entries(option.media).map((media) => media.option),
  ]) {
    if (isRecord(nested)) collectOption(nested, add);
  }
}

/**
 * ECharts modules an option needs: series types (including echarts-gl),
 * top-level components, series markers, and option-driven features.
 * Unknown series types are left to extensions the app registers itself.
 */
export function chartModuleLoaders(option: EChartsOption): ChartModuleLoader[] {
  const found = new Set<ChartModuleLoader>();
  collectOption(option, (loader) => {
    if (loader) found.add(loader);
  });
  return [...found];
}

let installVersion = 0;
const installed = new Map<ChartModuleLoader, number>();
const inflight = new Map<ChartModuleLoader, Promise<void>>();

/** Increases with every install; read it right before `echarts.init`. */
export function chartModulesVersion(): number {
  return installVersion;
}

/**
 * ECharts copies registered layouts and visuals into an instance at init,
 * so an instance created at `version` cannot use modules installed later.
 */
export function chartModulesNewerThan(
  loaders: readonly ChartModuleLoader[],
  version: number,
): boolean {
  return loaders.some(
    (loader) => (installed.get(loader) ?? Number.POSITIVE_INFINITY) > version,
  );
}

function install(loader: ChartModuleLoader): Promise<void> {
  const current = inflight.get(loader);
  if (current) return current;
  const next = loader().then(
    (installer) => {
      echarts.use(installer);
      installVersion += 1;
      installed.set(loader, installVersion);
      inflight.delete(loader);
    },
    (error: unknown) => {
      inflight.delete(loader);
      throw error;
    },
  );
  inflight.set(loader, next);
  return next;
}

/**
 * Registers the given modules once. Returns `null` when all are already
 * installed (callers apply the option synchronously), else a promise that
 * settles when the missing ones are registered. A failed load can be retried.
 */
export function installChartModules(
  loaders: readonly ChartModuleLoader[],
): Promise<void> | null {
  const missing = loaders.filter((loader) => !installed.has(loader));
  if (missing.length === 0) return null;
  return Promise.all(missing.map(install)).then(() => undefined);
}

export { echarts };
