import { cc } from "sinwan/component";

import { Slot } from "sinwan-ui-core/slot";
import { cn } from "../../../lib/utils";
import { PopoverContent as PopoverContentPrimitive, PopoverRoot } from "sinwan-ui-core/overlay";
import {
  useHoverCardContent,
  useHoverCardTrigger,
  type HoverCardContentProps,
  type HoverCardProps,
  type HoverCardTriggerProps,
} from "./useHoverCard";

function HoverCard(props: HoverCardProps) {
  return <PopoverRoot {...props} />;
}

const HoverCardTrigger = cc(function HoverCardTrigger({
  children,
  class: className,
  asChild,
}: HoverCardTriggerProps) {
  const trigger = useHoverCardTrigger();
  if (asChild) {
    return (
      <Slot class={className} {...trigger.handlers}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      type="button"
      data-slot="hover-card-trigger"
      class={className}
      aria-expanded={trigger.open.value}
      {...trigger.handlers}
    >
      {children}
    </button>
  );
});

function HoverCardContent({
  class: className,
  align = "center",
  sideOffset = 4,
  side,
  children,
}: HoverCardContentProps) {
  const content = useHoverCardContent();
  return (
    <PopoverContentPrimitive
      align={align}
      side={side}
      sideOffset={sideOffset}
      onmouseenter={content.onmouseenter}
      onmouseleave={content.onmouseleave}
      class={cn(
        "z-50 w-64 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
        className,
      )}
    >
      {children}
    </PopoverContentPrimitive>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
