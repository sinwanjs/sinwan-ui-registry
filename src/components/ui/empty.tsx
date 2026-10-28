import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

function Empty({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="empty"
      class={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance",
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="empty-header"
      class={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function EmptyMedia({
  class: className,
  variant = "default",
  ...props
}: JSX.IntrinsicElements["div"] & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      class={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="empty-title"
      class={cn(
        "font-heading text-sm font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function EmptyDescription({
  class: className,
  ...props
}: JSX.IntrinsicElements["p"]) {
  return (
    <div
      data-slot="empty-description"
      class={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="empty-content"
      class={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance",
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
};
