import { cc } from "sinwan/component";

import { toggleVariants } from "../toggle";
import { cn } from "../../../lib/utils";
import { ToggleGroupItem as ToggleGroupItemPrimitive, ToggleGroupRoot } from "sinwan-ui-core/controls";

import {
  useToggleGroupItem,
  useToggleGroupRoot,
  type ToggleGroupItemProps,
  type ToggleGroupProps,
} from "./useToggleGroup";

const ToggleGroup = cc<ToggleGroupProps>((props) => {
  const root = useToggleGroupRoot(props);
  return (
    <ToggleGroupRoot
      data-variant={root.variant.value ?? undefined}
      data-size={root.size.value ?? undefined}
      data-spacing={root.spacing.value}
      data-orientation={root.orientation.value}
      style={{ "--gap": String(root.spacing.value) }}
      class={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch",
        root.orientation.value === "vertical" && "flex-col items-stretch",
        root.size.value === "sm" && "rounded-[min(var(--radius-md),10px)]",
        root.class,
      )}
      {...root.rest}
    >
      {root.children}
    </ToggleGroupRoot>
  );
});

const ToggleGroupItem = cc<ToggleGroupItemProps>((props) => {
  const item = useToggleGroupItem(props);
  return (
    <ToggleGroupItemPrimitive
      data-variant={item.variant ?? undefined}
      data-size={item.size ?? undefined}
      data-spacing={item.spacing}
      class={cn(
        "shrink-0 focus:z-10 focus-visible:z-10",
        item.spacing === 0 &&
          "rounded-none px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 first:rounded-l-lg last:rounded-r-lg data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        item.orientation === "vertical" &&
          item.spacing === 0 &&
          "first:rounded-t-lg first:rounded-l-none last:rounded-b-lg last:rounded-r-none data-[variant=outline]:border-t-0 data-[variant=outline]:border-l data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: item.variant,
          size: item.size,
        }),
        item.class,
      )}
      {...item.rest}
    >
      {item.children}
    </ToggleGroupItemPrimitive>
  );
});

export { ToggleGroup, ToggleGroupItem };
