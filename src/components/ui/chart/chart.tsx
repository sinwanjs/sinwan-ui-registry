import { cc, type SinwanNode } from "sinwan/component";

import { cn } from "../../../lib/utils";
import {
  buildChartStyleCss,
  useChartRoot,
  useChartView,
  type ChartConfig,
  type ChartContainerProps,
  type ChartProps,
} from "./useChart";

export const ChartContainer = cc<ChartContainerProps>((props) => {
  const root = useChartRoot(props);

  return (
    <div
      data-slot="chart"
      data-chart={root.chartId}
      class={cn(
        "relative w-full min-h-[16rem] min-w-0 aspect-video overflow-hidden text-xs",
        root.class,
      )}
      style={root.style}
      oncontextmenu={root.oncontextmenu}
    >
      <ChartStyle id={root.chartId} config={root.config} />
      {root.children}
    </div>
  );
});

export function ChartStyle({
  id,
  config,
}: {
  id: string;
  config: ChartConfig;
}): SinwanNode {
  const css = buildChartStyleCss(id, config);
  if (!css) return null;
  return <style>{css}</style>;
}

export const Chart = cc<ChartProps>((props) => {
  const view = useChartView(props);

  return (
    <div
      data-slot="chart-view"
      class={cn(
        view.nested
          ? "absolute inset-0 size-full min-h-0 min-w-0 overflow-hidden"
          : "relative h-full min-h-[16rem] w-full min-w-0 overflow-hidden",
        view.class,
      )}
      style={view.style}
      oncontextmenu={view.oncontextmenu}
      ref={(el: HTMLElement | null) => {
        view.hostEl.value = el;
      }}
    />
  );
});
