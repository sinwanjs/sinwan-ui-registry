import { describe, expect, test } from "bun:test";
import * as charts from "echarts/charts";
import * as components from "echarts/components";
import * as features from "echarts/features";
import type { EChartsOption } from "echarts";
import { install as Bar3DChart } from "echarts-gl/lib/chart/bar3D/install.js";
import { install as Line3DChart } from "echarts-gl/lib/chart/line3D/install.js";
import { install as Scatter3DChart } from "echarts-gl/lib/chart/scatter3D/install.js";
import { install as Lines3DChart } from "echarts-gl/lib/chart/lines3D/install.js";
import { install as Polygons3DChart } from "echarts-gl/lib/chart/polygons3D/install.js";
import { install as SurfaceChart } from "echarts-gl/lib/chart/surface/install.js";
import { install as Map3DChart } from "echarts-gl/lib/chart/map3D/install.js";
import { install as ScatterGLChart } from "echarts-gl/lib/chart/scatterGL/install.js";
import { install as GraphGLChart } from "echarts-gl/lib/chart/graphGL/install.js";
import { install as FlowGLChart } from "echarts-gl/lib/chart/flowGL/install.js";
import { install as LinesGLChart } from "echarts-gl/lib/chart/linesGL/install.js";
import { install as Grid3DComponent } from "echarts-gl/lib/component/grid3D/install.js";
import { install as Geo3DComponent } from "echarts-gl/lib/component/geo3D/install.js";
import { install as GlobeComponent } from "echarts-gl/lib/component/globe/install.js";
import { install as Mapbox3DComponent } from "echarts-gl/lib/component/mapbox3D/install.js";
import { install as Maptalks3DComponent } from "echarts-gl/lib/component/maptalks3D/install.js";
import {
  chartModuleLoaders,
  chartModulesNewerThan,
  chartModulesVersion,
  echarts,
  installChartModules,
  type ChartModuleInstaller,
  type ChartModuleLoader,
} from "../src/components/ui/chart/modules";
import { setupDom, teardownDom } from "./helpers";

async function installersFor(option: EChartsOption): Promise<ChartModuleInstaller[]> {
  return Promise.all(chartModuleLoaders(option).map((load) => load()));
}

const seriesTypes = [
  "line", "bar", "pie", "scatter", "radar", "map", "tree", "treemap", "graph",
  "chord", "gauge", "funnel", "parallel", "sankey", "boxplot", "candlestick",
  "effectScatter", "lines", "heatmap", "pictorialBar", "themeRiver", "sunburst",
  "custom", "bar3D", "line3D", "scatter3D", "lines3D", "polygons3D", "surface",
  "map3D", "scatterGL", "graphGL", "flowGL", "linesGL",
];

const componentKeys = [
  "grid", "xAxis", "yAxis", "polar", "angleAxis", "radiusAxis", "radar", "geo",
  "singleAxis", "parallel", "parallelAxis", "calendar", "matrix", "graphic",
  "toolbox", "tooltip", "axisPointer", "brush", "title", "timeline", "legend",
  "dataZoom", "visualMap", "thumbnail", "aria", "dataset", "grid3D", "xAxis3D",
  "yAxis3D", "zAxis3D", "geo3D", "globe", "mapbox3D", "maptalks3D",
];

describe("chart modules", () => {
  test("maps every series type and component to its echarts installer", async () => {
    const option: Record<string, unknown> = {
      series: seriesTypes.map((type) => ({ type })),
    };
    for (const key of componentKeys) option[key] = {};

    const installers = await installersFor(option);

    expect(installers).toEqual(
      expect.arrayContaining([
        charts.LineChart, charts.BarChart, charts.PieChart, charts.ScatterChart,
        charts.RadarChart, charts.MapChart, charts.TreeChart, charts.TreemapChart,
        charts.GraphChart, charts.ChordChart, charts.GaugeChart, charts.FunnelChart,
        charts.ParallelChart, charts.SankeyChart, charts.BoxplotChart,
        charts.CandlestickChart, charts.EffectScatterChart, charts.LinesChart,
        charts.HeatmapChart, charts.PictorialBarChart, charts.ThemeRiverChart,
        charts.SunburstChart, charts.CustomChart,
        Bar3DChart, Line3DChart, Scatter3DChart, Lines3DChart, Polygons3DChart,
        SurfaceChart, Map3DChart, ScatterGLChart, GraphGLChart, FlowGLChart,
        LinesGLChart,
        components.GridComponent, components.PolarComponent,
        components.RadarComponent, components.GeoComponent,
        components.SingleAxisComponent, components.ParallelComponent,
        components.CalendarComponent, components.MatrixComponent,
        components.GraphicComponent, components.ToolboxComponent,
        components.TooltipComponent, components.AxisPointerComponent,
        components.BrushComponent, components.TitleComponent,
        components.TimelineComponent, components.LegendComponent,
        components.DataZoomComponent, components.VisualMapComponent,
        components.ThumbnailComponent, components.AriaComponent,
        components.DatasetComponent,
        Grid3DComponent, Geo3DComponent, GlobeComponent, Mapbox3DComponent,
        Maptalks3DComponent,
      ]),
    );
    // xAxis/yAxis, angleAxis/radiusAxis, parallelAxis and the three 3D axes
    // share one loader with their coordinate system.
    expect(installers).toHaveLength(seriesTypes.length + componentKeys.length - 8);
  });

  test("adds markers, features and transforms from series, axes, grid and dataset", async () => {
    const installers = await installersFor({
      grid: [{ containLabel: true }],
      xAxis: [{ breaks: [{ start: 1, end: 2 }] }],
      yAxis: { jitter: 2 },
      singleAxis: { breaks: [] },
      dataset: [{ source: [] }, { transform: { type: "filter" } }],
      series: [
        { type: "line", markPoint: {}, markLine: {}, markArea: {} },
        { type: "bar", universalTransition: true },
      ],
    });

    expect(installers).toEqual(
      expect.arrayContaining([
        components.MarkPointComponent,
        components.MarkLineComponent,
        components.MarkAreaComponent,
        components.TransformComponent,
        features.UniversalTransition,
        features.AxisBreak,
        features.ScatterJitter,
        features.LegacyGridContainLabel,
      ]),
    );
  });

  test("collects timeline, baseOption and media options", async () => {
    // A media entry without `option` is malformed input the scan must skip.
    const option: Record<string, unknown> = {
      baseOption: { timeline: {}, series: [{ type: "bar" }] },
      options: [{ series: [{ type: "pie" }] }],
      media: [{ query: { maxWidth: 500 }, option: { legend: {} } }, {}],
    };
    const installers = await installersFor(option);

    expect(installers).toEqual(
      expect.arrayContaining([
        components.TimelineComponent,
        charts.BarChart,
        charts.PieChart,
        components.LegendComponent,
      ]),
    );
  });

  test("ignores null keys, plain settings and unregistered series types", () => {
    // Extension series types (registered by the app) are outside EChartsOption.
    const option: Record<string, unknown> = {
      title: undefined,
      color: ["#000"],
      animation: false,
      series: [{ type: "wordCloud" }, { type: "toString" }, { name: "untyped" }],
    };
    expect(chartModuleLoaders(option)).toEqual([]);
  });

  test("reports modules installed after a given version", async () => {
    const loader: ChartModuleLoader = async () => () => {};
    const before = chartModulesVersion();
    expect(chartModulesNewerThan([loader], before)).toBe(true);
    await installChartModules([loader]);
    expect(chartModulesNewerThan([loader], before)).toBe(true);
    expect(chartModulesNewerThan([loader], chartModulesVersion())).toBe(false);
  });

  test("installs once, shares in-flight loads and retries after a failure", async () => {
    let calls = 0;
    let fail = true;
    const installer: ChartModuleInstaller = () => {};
    const loader: ChartModuleLoader = async () => {
      calls += 1;
      if (fail) throw new Error("chunk failed");
      return installer;
    };

    const errors = await Promise.all(
      [installChartModules([loader]), installChartModules([loader])].map(
        (pending) => pending?.then(() => null, (error: unknown) => error),
      ),
    );
    expect(errors.map(String)).toEqual([
      "Error: chunk failed",
      "Error: chunk failed",
    ]);
    expect(calls).toBe(1);

    fail = false;
    await installChartModules([loader]);
    expect(calls).toBe(2);
    expect(installChartModules([loader])).toBeNull();
    expect(installChartModules([])).toBeNull();
  });

  test("registers both renderers so init works before any chart module loads", () => {
    setupDom();
    try {
      const host = document.createElement("div");
      const svg = echarts.init(host, null, { renderer: "svg", width: 10, height: 10 });
      expect(svg.getZr().painter.type).toBe("svg");
      svg.dispose();
    } finally {
      teardownDom();
    }
  });
});
