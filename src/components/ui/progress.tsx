import { cc, getRawProps } from "sinwan/component";

import { cn } from "../../lib/utils";

type ProgressProps = Omit<JSX.IntrinsicElements["div"], "value"> & {
  value?: number | null;
};

function progressPercent(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

const Progress = cc<ProgressProps>((props) => {
  const { class: _className, value: _value, ...rest } = getRawProps(props);
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progressPercent(props.value)}
      class={cn(
          "relative h-1 w-full overflow-hidden rounded-full bg-muted",
          props.class,
        )
      }
      {...rest}
    >
      <div
        data-slot="progress-indicator"
        class="h-full bg-primary transition-all"
        style={`width: ${progressPercent(props.value)}%`}
      />
    </div>
  );
});

export { Progress };
export type { ProgressProps };
