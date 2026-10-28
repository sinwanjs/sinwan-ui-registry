import { cc, type SinwanNode } from "sinwan/component";
import { X } from "lucide";

import { Icon } from "../../lib/icons";
import { cn } from "../../lib/utils";
import {
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogOverlay as DialogOverlayPrimitive,
  DialogRoot,
  DialogTrigger as DialogTriggerPrimitive,
} from "sinwan-ui-core/overlay";
import { Button } from "./button";

type SheetProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function Sheet(props: SheetProps) {
  return <DialogRoot {...props} />;
}

type SheetTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function SheetTrigger(props: SheetTriggerProps) {
  return <DialogTriggerPrimitive {...props} />;
}

type SheetCloseProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function SheetClose(props: SheetCloseProps) {
  return <DialogClosePrimitive {...props} />;
}

type SheetOverlayProps = {
  class?: string;
};

const SheetOverlay = cc<SheetOverlayProps>(({ class: className }) => {
  return (
    <DialogOverlayPrimitive
      class={cn(
        "fixed inset-0 z-50 bg-black/10 duration-200 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:!fill-mode-forwards",
        className,
      )}
    />
  );
});

type SheetContentProps = {
  children?: SinwanNode;
  class?: string;
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  overlayClass?: string;
  style?: string | Record<string, string>;
  dir?: string;
  [key: `data-${string}`]: string | undefined;
};

const SheetContent = cc<SheetContentProps>(({
  class: className,
  children,
  side = "right",
  showCloseButton = true,
  overlayClass,
  style,
  dir,
  ...rest
}) => {
  return (
    <>
      <SheetOverlay class={cn("fixed", overlayClass)} />
      <DialogContentPrimitive
        data-slot="sheet-content"
        data-side={side}
        class={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg duration-200 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-closed:!fill-mode-forwards data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
          className,
        )}
        {...rest}
      >
        <div dir={dir} style={style} class="contents">
          {children}
        </div>
        {showCloseButton ? (
          <DialogClosePrimitive asChild>
            <Button
              variant="ghost"
              class="absolute top-3 right-3"
              size="icon-sm"
            >
              <Icon icon={X} />
              <span class="sr-only">Close</span>
            </Button>
          </DialogClosePrimitive>
        ) : null}
      </DialogContentPrimitive>
    </>
  );
});

type DivProps = {
  children?: SinwanNode;
  class?: string;
};

function SheetHeader({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="sheet-header"
      class={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="sheet-footer"
      class={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({ class: className, children, ...props }: DivProps) {
  return (
    <h2
      data-slot="sheet-title"
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

function SheetDescription({ class: className, children, ...props }: DivProps) {
  return (
    <p
      data-slot="sheet-description"
      class={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
