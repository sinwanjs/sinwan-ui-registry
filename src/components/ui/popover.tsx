import type { SinwanNode } from "sinwan/component";

import { cn } from "../../lib/utils";
import {
  PopoverContent as PopoverContentPrimitive,
  PopoverRoot,
  PopoverTrigger as PopoverTriggerPrimitive,
} from "sinwan-ui-core/overlay";
import type { Align, Placement } from "sinwan-ui-core/floating";

type PopoverProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  align?: Align;
};

function Popover(props: PopoverProps) {
  return <PopoverRoot {...props} />;
}

type PopoverTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverTriggerPrimitive {...props} />;
}

type PopoverContentProps = {
  children?: SinwanNode;
  class?: string;
  align?: Align;
  side?: Placement;
  sideOffset?: number;
};

function PopoverContent({
  class: className,
  align = "center",
  sideOffset = 4,
  side,
  children,
}: PopoverContentProps) {
  return (
    <PopoverContentPrimitive
      align={align}
      side={side}
      sideOffset={sideOffset}
      class={cn(
        "z-50 flex w-72 flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
        className,
      )}
    >
      {children}
    </PopoverContentPrimitive>
  );
}

type PopoverAnchorProps = {
  children?: SinwanNode;
  class?: string;
};

function PopoverAnchor({ children, class: className }: PopoverAnchorProps) {
  return (
    <div data-slot="popover-anchor" class={className}>
      {children}
    </div>
  );
}

type DivProps = {
  children?: SinwanNode;
  class?: string;
};

function PopoverHeader({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="popover-header"
      class={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ class: className, ...props }: DivProps) {
  return (
    <div data-slot="popover-title" class={cn("font-medium", className)} {...props} />
  );
}

function PopoverDescription({ class: className, children, ...props }: DivProps) {
  return (
    <p
      data-slot="popover-description"
      class={cn("text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
