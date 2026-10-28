import { cc } from "sinwan/component";
import { Show } from "sinwan/control-flow";
import { GripVertical } from "lucide";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import {
  useResizableHandle,
  useResizablePanel,
  useResizablePanelGroupRoot,
  type ResizableHandleProps,
  type ResizablePanelGroupProps,
  type ResizablePanelProps,
} from "./useResizable";

export const ResizablePanelGroup = cc<ResizablePanelGroupProps>((props) => {
  const group = useResizablePanelGroupRoot(props);

  return (
    <div
      data-slot="resizable-panel-group"
      data-orientation={group.orientation}
      id={props.id}
      class={cn(
        "flex h-full w-full",
        group.orientation === "vertical" && "flex-col",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
});

export const ResizablePanel = cc<ResizablePanelProps>((props) => {
  const panel = useResizablePanel(props);

  return (
    <div
      data-slot="resizable-panel"
      data-panel-id={panel.panelId}
      data-size={panel.dataSize.value}
      data-collapsed={panel.dataCollapsed.value}
      aria-hidden={panel.ariaHidden.value}
      class={cn("min-h-0 min-w-0 overflow-hidden", props.class)}
      style={panel.style.value}
    >
      <Show when={panel.open} fallback={null}>
        {props.children}
      </Show>
    </div>
  );
});

export const ResizableHandle = cc<ResizableHandleProps>((props) => {
  const handle = useResizableHandle(props);
  const gripClass =
    handle.orientation === "vertical" ? "size-3.5 rotate-90" : "size-3.5";

  return (
    <div
      data-slot="resizable-handle"
      data-collapsed-seam={handle.collapsedSeam.value}
      data-resize-cursor={handle.resizeCursor.value}
      role="separator"
      aria-orientation={handle.ariaOrientation}
      aria-disabled={handle.ariaDisabled.value}
      tabIndex={handle.tabIndex.value}
      class={cn(
        "relative flex w-px touch-none items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        handle.inactive.value && "pointer-events-none opacity-50",
        handle.seamInactive.value &&
          "w-0 overflow-hidden border-0 p-0 after:hidden",
        props.class,
      )}
      style={handle.style.value}
      onpointerdown={handle.onPointerDown}
    >
      <Show when={handle.showStartExpand} fallback={null}>
        <button
          type="button"
          data-slot="resizable-panel-expand"
          data-side="start"
          aria-label="Expand panel"
          class="absolute z-20 flex size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground top-1/2 left-1/2"
          onclick={handle.expandStart}
        >
          <Icon icon={GripVertical} class={gripClass} />
        </button>
      </Show>
      <Show when={handle.showEndExpand} fallback={null}>
        <button
          type="button"
          data-slot="resizable-panel-expand"
          data-side="end"
          aria-label="Expand panel"
          class="absolute z-20 flex size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground top-1/2 left-1/2"
          onclick={handle.expandEnd}
        >
          <Icon icon={GripVertical} class={gripClass} />
        </button>
      </Show>
      {props.withHandle ? (
        <Show when={handle.canResizeAcrossSeam} fallback={null}>
          <div
            data-slot="resizable-handle-fill"
            class="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border"
          />
        </Show>
      ) : null}
    </div>
  );
});
