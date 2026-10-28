import { cva, type VariantProps } from "class-variance-authority";
import type { SinwanNode } from "sinwan/component";

import { cn } from "../../lib/utils";

import { Label } from "./label";
import { Separator } from "./separator";

function FieldSet({
  class: className,
  ...props
}: JSX.IntrinsicElements["fieldset"]) {
  return (
    <fieldset
      data-slot="field-set"
      class={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  class: className,
  variant = "legend",
  ...props
}: JSX.IntrinsicElements["legend"] & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      class={cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="field-group"
      class={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

function Field({
  class: className,
  orientation = "vertical",
  ...props
}: JSX.IntrinsicElements["div"] & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      class={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="field-content"
      class={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  class: className,
  ...props
}: JSX.IntrinsicElements["label"]) {
  return (
    <Label
      data-slot="field-label"
      class={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="field-label"
      class={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({
  class: className,
  ...props
}: JSX.IntrinsicElements["p"]) {
  return (
    <p
      data-slot="field-description"
      class={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  class: className,
  ...props
}: JSX.IntrinsicElements["div"] & {
  children?: SinwanNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      class={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator class="absolute inset-0 top-1/2" />
      {children ? (
        <span
          class="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      ) : null}
    </div>
  );
}

function FieldError({
  class: className,
  children,
  errors,
  ...props
}: JSX.IntrinsicElements["div"] & {
  children?: SinwanNode;
  errors?: Array<{ message?: string } | undefined>;
}) {
  let content: SinwanNode = null;

  if (children) {
    content = children;
  } else if (errors?.length) {
    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors.length == 1) {
      content = uniqueErrors[0]?.message ?? null;
    } else {
      content = (
        <ul class="ml-4 flex list-disc flex-col gap-1">
          {uniqueErrors.map(
            (error, index) =>
              error?.message ? <li key={index}>{error.message}</li> : null,
          )}
        </ul>
      );
    }
  }

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      class={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
