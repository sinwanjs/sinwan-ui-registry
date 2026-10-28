import { cc } from "sinwan/component";

import { cn } from "../../../lib/utils";
import {
  useScrollAreaRoot,
  useScrollBar,
  type ScrollAreaProps,
  type ScrollBarProps,
} from "./useScrollArea";

export const ScrollArea = cc<ScrollAreaProps>((props) => {
  const root = useScrollAreaRoot(props);

  return (
    <div
      data-slot="scroll-area"
      class={cn("group/scroll-area relative overflow-hidden", root.class.value)}
    >
      <div
        data-slot="scroll-area-viewport"
        tabIndex={0}
        class={cn(
          "size-full overflow-auto rounded-[inherit] outline-none scrollbar-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          root.viewportClass.value,
        )}
        ref={root.viewportRef}
      >
        {root.children.value}
      </div>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
    </div>
  );
});

export const ScrollBar = cc<ScrollBarProps>((props) => {
  const bar = useScrollBar(props);

  return (
    <div
      data-slot="scroll-area-scrollbar"
      data-orientation={bar.orientation.value}
      data-horizontal={bar.vertical.value ? undefined : ""}
      data-vertical={bar.vertical.value ? "" : undefined}
      data-overflow={bar.overflow.value ? "true" : "false"}
      data-scrolling={bar.scrolling.value ? "true" : "false"}
      class={cn(
        "pointer-events-none absolute z-10 flex touch-none p-0.5 transition-opacity duration-200 select-none",
        bar.overflow.value &&
          "pointer-events-auto opacity-0 group-hover/scroll-area:opacity-100",
        bar.overflow.value && bar.scrolling.value && "opacity-100",
        !bar.overflow.value && "opacity-0",
        bar.vertical.value
          ? "inset-y-0 end-0 w-2.5"
          : "inset-x-0 bottom-0 h-2.5 flex-col",
        bar.class.value,
      )}
      aria-hidden="true"
    >
      <div
        data-slot="scroll-area-thumb"
        class={
          bar.vertical.value
            ? "relative w-full rounded-full bg-foreground/30 hover:bg-foreground/50"
            : "relative h-full rounded-full bg-foreground/30 hover:bg-foreground/50"
        }
        style={
          bar.vertical.value
            ? `height: ${bar.size.value}px; transform: translateY(${bar.offset.value}px)`
            : `width: ${bar.size.value}px; transform: translateX(${bar.offset.value}px)`
        }
        onpointerdown={bar.onPointerDown}
        onpointermove={bar.onPointerMove}
        onpointerup={bar.endDrag}
        onpointercancel={bar.endDrag}
      />
    </div>
  );
});
