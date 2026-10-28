import type { SinwanNode } from "sinwan/component";

import { cn } from "../../lib/utils";
import {
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogOverlay as DialogOverlayPrimitive,
  DialogRoot,
  DialogTrigger as DialogTriggerPrimitive,
} from "sinwan-ui-core/overlay";
import { UiPortal } from "sinwan-ui-core/core";
import { Button, type ButtonProps } from "./button";

type AlertDialogProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function AlertDialog(props: AlertDialogProps) {
  return <DialogRoot {...props} />;
}

type AlertDialogTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <DialogTriggerPrimitive {...props} />;
}

type AlertDialogPortalProps = {
  children?: SinwanNode;
};

function AlertDialogPortal({ children }: AlertDialogPortalProps) {
  return <UiPortal>{children}</UiPortal>;
}

type AlertDialogOverlayProps = {
  class?: string;
};

function AlertDialogOverlay({ class: className }: AlertDialogOverlayProps) {
  return (
    <DialogOverlayPrimitive
      class={cn(
        "fixed inset-0 z-50 bg-black/10 duration-200 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:!fill-mode-forwards",
        className,
      )}
    />
  );
}

type AlertDialogContentProps = {
  children?: SinwanNode;
  class?: string;
  size?: "default" | "sm";
};

function AlertDialogContent({
  class: className,
  size = "default",
  children,
}: AlertDialogContentProps) {
  return (
    <>
      <AlertDialogOverlay />
      <DialogContentPrimitive
        data-slot="alert-dialog-content"
        data-size={size}
        class={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 duration-200 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
          className,
        )}
      >
        {children}
      </DialogContentPrimitive>
    </>
  );
}

type DivProps = {
  children?: SinwanNode;
  class?: string;
};

function AlertDialogHeader({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="alert-dialog-header"
      class={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      class={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogMedia({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="alert-dialog-media"
      class={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({ class: className, children, ...props }: DivProps) {
  return (
    <h2
      data-slot="alert-dialog-title"
      class={cn(
        "font-heading text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function AlertDialogDescription({
  class: className,
  children,
  ...props
}: DivProps) {
  return (
    <p
      data-slot="alert-dialog-description"
      class={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

type AlertDialogActionProps = Omit<ButtonProps, "variant" | "size"> & {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

function AlertDialogAction({
  class: className,
  variant = "default",
  size = "default",
  ...props
}: AlertDialogActionProps) {
  return (
    <DialogClosePrimitive asChild>
      <Button
        data-slot="alert-dialog-action"
        variant={variant}
        size={size}
        class={cn(className)}
        {...props}
      />
    </DialogClosePrimitive>
  );
}

type AlertDialogCancelProps = AlertDialogActionProps;

function AlertDialogCancel({
  class: className,
  variant = "outline",
  size = "default",
  ...props
}: AlertDialogCancelProps) {
  return (
    <DialogClosePrimitive asChild>
      <Button
        data-slot="alert-dialog-cancel"
        variant={variant}
        size={size}
        class={cn(className)}
        {...props}
      />
    </DialogClosePrimitive>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
