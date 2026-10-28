import type { SinwanNode } from "sinwan/component";
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
import { UiPortal } from "sinwan-ui-core/core";
import { Button } from "./button";

type DialogProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function Dialog(props: DialogProps) {
  return <DialogRoot {...props} />;
}

type DialogTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogTriggerPrimitive {...props} />;
}

type DialogPortalProps = {
  children?: SinwanNode;
};

function DialogPortal({ children }: DialogPortalProps) {
  return <UiPortal>{children}</UiPortal>;
}

type DialogCloseProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function DialogClose(props: DialogCloseProps) {
  return <DialogClosePrimitive {...props} />;
}

type DialogOverlayProps = {
  class?: string;
};

function DialogOverlay({ class: className }: DialogOverlayProps) {
  return (
    <DialogOverlayPrimitive
      class={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-200 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:!fill-mode-forwards",
        className,
      )}
    />
  );
}

type DialogContentProps = {
  children?: SinwanNode;
  class?: string;
  showCloseButton?: boolean;
};

function DialogContent({
  class: className,
  children,
  showCloseButton = true,
}: DialogContentProps) {
  return (
    <>
      <DialogOverlay />
      <DialogContentPrimitive
        class={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 bg-background rounded-xl p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-200 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
          className,
        )}
      >
        {children}
        {showCloseButton ? (
          <DialogClosePrimitive asChild>
            <Button variant="ghost" class="absolute top-2 right-2" size="icon-sm">
              <Icon icon={X} />
              <span class="sr-only">Close</span>
            </Button>
          </DialogClosePrimitive>
        ) : null}
      </DialogContentPrimitive>
    </>
  );
}

type DivProps = {
  children?: SinwanNode;
  class?: string;
};

function DialogHeader({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="dialog-header"
      class={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

type DialogFooterProps = DivProps & {
  showCloseButton?: boolean;
};

function DialogFooter({
  class: className,
  showCloseButton = false,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      class={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogClosePrimitive asChild>
          <Button variant="outline">Close</Button>
        </DialogClosePrimitive>
      ) : null}
    </div>
  );
}

function DialogTitle({ class: className, children, ...props }: DivProps) {
  return (
    <h2
      data-slot="dialog-title"
      class={cn(
        "font-heading text-base leading-none font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function DialogDescription({ class: className, children, ...props }: DivProps) {
  return (
    <p
      data-slot="dialog-description"
      class={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
