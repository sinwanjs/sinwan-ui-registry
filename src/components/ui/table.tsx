import { cn } from "../../lib/utils";

function Table({
  class: className,
  ...props
}: JSX.IntrinsicElements["table"]) {
  return (
    <div
      data-slot="table-container"
      class="relative w-full min-w-0 overflow-x-auto"
    >
      <table
        data-slot="table"
        class={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({
  class: className,
  ...props
}: JSX.IntrinsicElements["thead"]) {
  return (
    <thead
      data-slot="table-header"
      class={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({
  class: className,
  ...props
}: JSX.IntrinsicElements["tbody"]) {
  return (
    <tbody
      data-slot="table-body"
      class={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({
  class: className,
  ...props
}: JSX.IntrinsicElements["tfoot"]) {
  return (
    <tfoot
      data-slot="table-footer"
      class={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({
  class: className,
  ...props
}: JSX.IntrinsicElements["tr"]) {
  return (
    <tr
      data-slot="table-row"
      class={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({
  class: className,
  ...props
}: JSX.IntrinsicElements["th"]) {
  return (
    <th
      data-slot="table-head"
      class={cn(
        "h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({
  class: className,
  ...props
}: JSX.IntrinsicElements["td"]) {
  return (
    <td
      data-slot="table-cell"
      class={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  class: className,
  ...props
}: JSX.IntrinsicElements["caption"]) {
  return (
    <caption
      data-slot="table-caption"
      class={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
