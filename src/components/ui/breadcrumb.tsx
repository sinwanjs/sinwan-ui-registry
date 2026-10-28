import { ChevronRight, MoreHorizontal } from "lucide";
import type { SinwanNode } from "sinwan/component";

import { Icon } from "../../lib/icons";
import { Slot } from "sinwan-ui-core/slot";
import { cn } from "../../lib/utils";

function Breadcrumb({
  class: className,
  ...props
}: JSX.IntrinsicElements["nav"]) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      class={cn(className)}
      {...props}
    />
  );
}

function BreadcrumbList({
  class: className,
  ...props
}: JSX.IntrinsicElements["ol"]) {
  return (
    <ol
      data-slot="breadcrumb-list"
      class={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({
  class: className,
  ...props
}: JSX.IntrinsicElements["li"]) {
  return (
    <li
      data-slot="breadcrumb-item"
      class={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild = false,
  class: className,
  ...props
}: JSX.IntrinsicElements["a"] & {
  asChild?: boolean;
}) {
  const shared = {
    "data-slot": "breadcrumb-link",
    class: cn("transition-colors hover:text-foreground", className),
    ...props,
  };

  if (asChild) {
    return <Slot {...shared} />;
  }

  return <a {...shared} />;
}

function BreadcrumbPage({
  class: className,
  ...props
}: JSX.IntrinsicElements["span"]) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      class={cn("font-normal text-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  class: className,
  ...props
}: JSX.IntrinsicElements["li"] & { children?: SinwanNode }) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      class={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <Icon icon={ChevronRight} />}
    </li>
  );
}

function BreadcrumbEllipsis({
  class: className,
  ...props
}: JSX.IntrinsicElements["span"]) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      class={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      <Icon icon={MoreHorizontal} />
      <span class="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
