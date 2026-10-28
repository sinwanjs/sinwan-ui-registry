import { getRawProps, type SinwanNode } from "sinwan/component";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import {
  TabsContent as TabsContentPrimitive,
  TabsList as TabsListPrimitive,
  TabsRoot,
  TabsTrigger as TabsTriggerPrimitive,
} from "sinwan-ui-core/controls";

type TabsProps = {
  children?: SinwanNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  class?: string;
  orientation?: "horizontal" | "vertical";
};

function Tabs(props: TabsProps) {
  const {
    class: className,
    orientation = "horizontal",
    ...rest
  } = getRawProps(props);
  return (
    <TabsRoot
      orientation={orientation}
      class={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col data-vertical:flex-row",
        orientation === "horizontal" && "flex-col",
        orientation === "vertical" && "flex-row",
        className,
      )}
      {...rest}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TabsListProps = {
  children?: SinwanNode;
  class?: string;
  variant?: VariantProps<typeof tabsListVariants>["variant"];
};

function TabsList({
  class: className,
  variant = "default",
  ...props
}: TabsListProps) {
  return (
    <TabsListPrimitive
      data-variant={variant ?? undefined}
      class={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

type TabsTriggerProps = {
  children?: SinwanNode;
  class?: string;
  value: string;
  disabled?: boolean;
};

function TabsTrigger({ class: className, ...props }: TabsTriggerProps) {
  return (
    <TabsTriggerPrimitive
      class={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-card dark:data-active:text-foreground",
        "after:pointer-events-none after:absolute after:bg-foreground after:opacity-0 after:transition-opacity after:content-[''] group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

type TabsContentProps = {
  children?: SinwanNode;
  class?: string;
  value: string;
};

function TabsContent({ class: className, ...props }: TabsContentProps) {
  return (
    <TabsContentPrimitive
      class={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants };
