import { cva, type VariantProps } from "class-variance-authority";
import { cc, getRawProps, type SinwanNode } from "sinwan/component";

import { Slot } from "sinwan-ui-core/slot";
import { cn } from "../../lib/utils";

import { Spinner } from "./spinner";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 enabled-only:active:not-aria-[haspopup]:translate-y-px disabled:disabled aria-disabled:disabled aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground enabled-only:hover:bg-primary/80",
        outline:
          "border-border bg-background enabled-only:hover:bg-muted enabled-only:hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:enabled-only:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground enabled-only:hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "enabled-only:hover:bg-muted enabled-only:hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:enabled-only:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive enabled-only:hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:enabled-only:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 enabled-only:hover:underline",
        gradient:
          "bg-gradient-brand text-white enabled-only:hover:brightness-95",
        // Solid page surface for buttons on coloured or brand panels, in both themes.
        inverse:
          "bg-background text-foreground shadow-sm enabled-only:hover:bg-background/90 aria-expanded:bg-background/90",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

type ButtonProps = Omit<JSX.IntrinsicElements["button"], "disabled"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  children?: SinwanNode;
};

// `pointer-events: none` blocks the mouse, but a focused anchor still activates
// on Enter, so a disabled `asChild` button needs the handler stopped too.
const preventClick = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};

const Button = cc(function Button(props: ButtonProps) {
  const {
    asChild: _asChild,
    children: _children,
    class: _className,
    variant: _variant,
    size: _size,
    isLoading: _isLoading,
    disabled: _disabled,
    onclick: _onclick,
    ...rest
  } = getRawProps(props);
  const asChild = Boolean(props.asChild);
  const handleClick: NonNullable<
    JSX.IntrinsicElements["button"]["onclick"]
  > = (event) => {
    if (props.disabled || props.isLoading) {
      preventClick(event);
      return;
    }
    props.onclick?.(event);
  };

  // `disabled` only exists on form controls: with `asChild` the child is
  // usually an anchor, where it does nothing and `:disabled` never matches.
  // `aria-disabled` carries both the styling and the semantics either way.
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        data-variant={props.variant}
        data-size={props.size}
        class={cn(
          buttonVariants({
            variant: props.variant ?? "default",
            size: props.size ?? "default",
            className: props.class,
          }),
        )}
        aria-disabled={
          props.disabled || props.isLoading ? true : undefined
        }
        aria-busy={props.isLoading ? true : undefined}
        onclick={handleClick}
        {...rest}
      >
        {props.children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={props.variant}
      data-size={props.size}
      class={cn(
        buttonVariants({
          variant: props.variant ?? "default",
          size: props.size ?? "default",
          className: props.class,
        }),
      )}
      aria-disabled={props.disabled || props.isLoading ? true : undefined}
      aria-busy={props.isLoading ? true : undefined}
      onclick={handleClick}
      {...rest}
      disabled={Boolean(props.disabled || props.isLoading)}
    >
      {props.isLoading ? (
        <>
          <Spinner />
          {props.children}
        </>
      ) : (
        props.children
      )}
    </button>
  );
});

export { Button, buttonVariants };
export type { ButtonProps };
