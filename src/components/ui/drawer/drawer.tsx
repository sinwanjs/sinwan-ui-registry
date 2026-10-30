import { cc, getRawProps, type SinwanNode } from "sinwan/component";

import { cn } from "../../../lib/utils";
import {
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogOverlay as DialogOverlayPrimitive,
  DialogRoot,
  DialogTrigger as DialogTriggerPrimitive,
} from "sinwan-ui-core/overlay";
import { UiPortal } from "sinwan-ui-core/core";
import { useDrawerDrag, type DrawerDirection } from "./useDrawer";

type DrawerProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: DrawerDirection;
};

function Drawer(props: DrawerProps) {
  const { children, direction = "bottom", ...rest } = getRawProps(props);
  return (
    <DialogRoot {...rest}>
      <div data-drawer-direction={direction} class="contents">
        {children}
      </div>
    </DialogRoot>
  );
}

type DrawerTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function DrawerTrigger(props: DrawerTriggerProps) {
  return <DialogTriggerPrimitive {...props} />;
}

type DrawerPortalProps = {
  children?: SinwanNode;
};

function DrawerPortal({ children }: DrawerPortalProps) {
  return <UiPortal>{children}</UiPortal>;
}

type DrawerCloseProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function DrawerClose(props: DrawerCloseProps) {
  return <DialogClosePrimitive {...props} />;
}

type DrawerOverlayProps = {
  class?: string;
};

function DrawerOverlay({ class: className }: DrawerOverlayProps) {
  return (
    <DialogOverlayPrimitive
      class={cn(
        "fixed inset-0 z-50 bg-black/10 duration-200 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:!fill-mode-forwards",
        className,
      )}
    />
  );
}

const DRAWER_HANDLE_CLASSES: Record<DrawerDirection, string> = {
  bottom: "order-first w-full pt-4 pb-2",
  top: "order-last w-full pt-2 pb-4",
  left: "absolute inset-y-0 right-0 w-4",
  right: "absolute inset-y-0 left-0 w-4",
};

const DRAWER_HANDLE_BAR_CLASSES: Record<DrawerDirection, string> = {
  bottom: "h-1 w-[100px]",
  top: "h-1 w-[100px]",
  left: "h-[100px] w-1",
  right: "h-[100px] w-1",
};

type DrawerHandleProps = {
  direction: DrawerDirection;
};

const DrawerHandle = cc<DrawerHandleProps>((props) => {
  const direction = props.direction;
  const { isDragging, onPointerDown } = useDrawerDrag(direction);
  return (
    <div
      data-slot="drawer-handle"
      data-dragging={() => (isDragging.value ? "true" : "false")}
      aria-hidden="true"
      class={cn(
        "group/drawer-handle flex shrink-0 cursor-grab touch-none items-center justify-center select-none data-[dragging=true]:cursor-grabbing",
        DRAWER_HANDLE_CLASSES[direction],
      )}
      onpointerdown={onPointerDown}
    >
      <div
        class={cn(
          "rounded-full bg-foreground/20 transition-colors group-hover/drawer-handle:bg-foreground/30 group-data-[dragging=true]/drawer-handle:bg-foreground/40",
          DRAWER_HANDLE_BAR_CLASSES[direction],
        )}
      />
    </div>
  );
});

type DrawerContentProps = {
  children?: SinwanNode;
  class?: string;
  direction?: DrawerDirection;
  showHandle?: boolean;
};

function DrawerContent({
  class: className,
  children,
  direction = "bottom",
  showHandle = true,
}: DrawerContentProps) {
  return (
    <>
      <DrawerOverlay />
      <DialogContentPrimitive
        data-slot="drawer-content"
        data-vaul-drawer-direction={direction}
        class={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-200 data-[vaul-drawer-direction=bottom]:inset-x-4 data-[vaul-drawer-direction=bottom]:bottom-4 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=left]:inset-y-4 data-[vaul-drawer-direction=left]:left-4 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=right]:inset-y-4 data-[vaul-drawer-direction=right]:right-4 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=top]:inset-x-4 data-[vaul-drawer-direction=top]:top-4 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[vaul-drawer-direction=bottom]:data-open:slide-in-from-bottom-10 data-[vaul-drawer-direction=left]:data-open:slide-in-from-left-10 data-[vaul-drawer-direction=right]:data-open:slide-in-from-right-10 data-[vaul-drawer-direction=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-closed:!fill-mode-forwards data-[vaul-drawer-direction=bottom]:data-closed:slide-out-to-bottom-10 data-[vaul-drawer-direction=left]:data-closed:slide-out-to-left-10 data-[vaul-drawer-direction=right]:data-closed:slide-out-to-right-10 data-[vaul-drawer-direction=top]:data-closed:slide-out-to-top-10",
          className,
        )}
      >
        {showHandle ? <DrawerHandle direction={direction} /> : null}
        {children}
      </DialogContentPrimitive>
    </>
  );
}

type DivProps = {
  children?: SinwanNode;
  class?: string;
};

function DrawerHeader({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="drawer-header"
      class={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="drawer-footer"
      class={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({ class: className, children, ...props }: DivProps) {
  return (
    <h2
      data-slot="drawer-title"
      class={cn(
        "font-heading text-base font-medium text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function DrawerDescription({
  class: className,
  children,
  ...props
}: DivProps) {
  return (
    <p
      data-slot="drawer-description"
      class={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
