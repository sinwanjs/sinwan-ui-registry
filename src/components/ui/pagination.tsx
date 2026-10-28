import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide";
import type { SinwanNode } from "sinwan/component";

import { Icon } from "../../lib/icons";
import { cn } from "../../lib/utils";

import { Button, type ButtonProps } from "./button";

function Pagination({
  class: className,
  ...props
}: JSX.IntrinsicElements["nav"]) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      class={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  class: className,
  ...props
}: JSX.IntrinsicElements["ul"]) {
  return (
    <ul
      data-slot="pagination-content"
      class={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: JSX.IntrinsicElements["li"]) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  children?: SinwanNode;
} & Pick<ButtonProps, "size"> &
  JSX.IntrinsicElements["a"];

function PaginationLink({
  class: className,
  isActive,
  size = "icon",
  children,
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      class={className}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      >
        {children}
      </a>
    </Button>
  );
}

function PaginationPrevious({
  class: className,
  text = "Previous",
  children,
  ...props
}: PaginationLinkProps & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      class={cn("pl-1.5!", className)}
      {...props}
    >
      {children ?? (
        <>
          <Icon icon={ChevronLeft} data-icon="inline-start" />
          <span class="hidden sm:block">{text}</span>
        </>
      )}
    </PaginationLink>
  );
}

function PaginationNext({
  class: className,
  text = "Next",
  children,
  ...props
}: PaginationLinkProps & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      class={cn("pr-1.5!", className)}
      {...props}
    >
      {children ?? (
        <>
          <span class="hidden sm:block">{text}</span>
          <Icon icon={ChevronRight} data-icon="inline-end" />
        </>
      )}
    </PaginationLink>
  );
}

function PaginationEllipsis({
  class: className,
  ...props
}: JSX.IntrinsicElements["span"]) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      class={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <Icon icon={MoreHorizontal} />
      <span class="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
