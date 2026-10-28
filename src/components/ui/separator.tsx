import { cn } from "../../lib/utils";

type SeparatorProps = JSX.IntrinsicElements["div"] & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

export function Separator({
  class: className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      data-horizontal={orientation === "horizontal" ? "" : undefined}
      data-vertical={orientation === "vertical" ? "" : undefined}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      class={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export type { SeparatorProps };
