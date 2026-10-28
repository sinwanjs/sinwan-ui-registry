import { cc, getRawProps, type SinwanNode } from "sinwan/component";
import { Show } from "sinwan/control-flow";
import type { Signal } from "sinwan/reactivity";
import { Check, ChevronDown, ChevronUp, type IconNode } from "lucide";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import { Presence, UiPortal } from "sinwan-ui-core/core";
import {
  useSelectContent,
  useSelectItem,
  useSelectRoot,
  useSelectScrollButton,
  useSelectTrigger,
  useSelectValue,
  type SelectItemProps,
  type SelectProps,
} from "./useSelect";

const Select = cc<SelectProps>((props) => {
  useSelectRoot(props);

  return <>{props.children}</>;
});

type SelectGroupProps = {
  children?: SinwanNode;
  class?: string;
};

function SelectGroup({ class: className, children }: SelectGroupProps) {
  return (
    <div data-slot="select-group" class={cn("scroll-my-1 p-1", className)}>
      {children}
    </div>
  );
}

type SelectValueProps = {
  placeholder?: string;
  class?: string;
};

function SelectValue({ placeholder, class: className }: SelectValueProps) {
  const value = useSelectValue(placeholder);
  return (
    <span
      data-slot="select-value"
      data-placeholder={(value.empty.value ? "" : undefined)}
      class={className}
    >
      {value.text.value}
    </span>
  );
}

type SelectTriggerProps = Omit<JSX.IntrinsicElements["button"], "type"> & {
  children?: SinwanNode;
  size?: "sm" | "default";
};

type SelectTriggerRef = SelectTriggerProps["ref"];

function assignTriggerRef(
  ref: SelectTriggerRef,
  element: HTMLButtonElement | null,
): void {
  if (typeof ref === "function") ref(element);
  else if (ref) ref.current = element;
}

const SelectTrigger = cc(function SelectTrigger(props: SelectTriggerProps) {
  const {
    children: _children,
    class: _className,
    size: _size,
    onclick: _onclick,
    ref: _ref,
    ...rest
  } = getRawProps(props);
  const trigger = useSelectTrigger();
  const handleClick: NonNullable<
    JSX.IntrinsicElements["button"]["onclick"]
  > = (event) => {
    props.onclick?.(event);
    if (!event.defaultPrevented) trigger.toggle();
  };
  const setTrigger = (element: HTMLButtonElement | null) => {
    trigger.setTrigger(element);
    assignTriggerRef(props.ref, element);
  };
  return (
    <button
      {...rest}
      type="button"
      data-slot="select-trigger"
      data-size={props.size ?? "default"}
      aria-expanded={trigger.open.value}
      class={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      onclick={handleClick}
      ref={setTrigger}
    >
      {props.children}
      <Icon
        icon={ChevronDown}
        class="pointer-events-none size-4 text-muted-foreground"
      />
    </button>
  );
});

type SelectContentProps = {
  children?: SinwanNode;
  class?: string;
  position?: "item-aligned" | "popper";
  align?: "start" | "center" | "end";
};

const SelectContent = cc<SelectContentProps>((props) => {
  const content = useSelectContent({ align: props.align ?? "center" });

  return (
    <>
      <Show when={!content.open.value} fallback={null}>
        <UiPortal container={content.closedItemsHost}>
          {props.children}
        </UiPortal>
      </Show>
      <Presence
        present={content.open.value}
      >
        <UiPortal>
          <div
            data-slot="select-content"
            data-state={content.state.value}
            data-side={content.side.value}
            data-align-trigger={
              props.position === "item-aligned" ? "" : undefined
            }
            role="listbox"
            class={cn(
              "relative z-50 isolate flex max-h-72 min-w-36 flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
              props.class,
            )}
            style={content.style.value}
            onpointerdown={content.onPointerDown}
            ref={content.setContent}
          >
            <SelectScrollUpButton />
            <div
              data-slot="select-viewport"
              data-position={props.position ?? "popper"}
              class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-1"
              ref={content.bindViewport}
            >
              <div>{props.children}</div>
            </div>
            <SelectScrollDownButton />
          </div>
        </UiPortal>
      </Presence>
    </>
  );
});

type SelectLabelProps = {
  children?: SinwanNode;
  class?: string;
};

function SelectLabel({ class: className, children }: SelectLabelProps) {
  return (
    <div
      data-slot="select-label"
      class={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
    >
      {children}
    </div>
  );
}

const SelectItem = cc(function SelectItem(props: SelectItemProps) {
  const item = useSelectItem(props);
  return (
    <button
      type="button"
      role="option"
      data-slot="select-item"
      data-disabled={(props.disabled ? "true" : undefined)}
      aria-selected={item.selected.value}
      disabled={Boolean(props.disabled)}
      class={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      onclick={item.select}
      ref={item.setItem}
    >
      <span class="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <Show when={item.selected.value} fallback={null}>
          <Icon icon={Check} class="pointer-events-none" />
        </Show>
      </span>
      {props.children}
    </button>
  );
});

type SelectSeparatorProps = {
  class?: string;
};

function SelectSeparator({ class: className }: SelectSeparatorProps) {
  return (
    <div
      data-slot="select-separator"
      class={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
    />
  );
}

type SelectScrollButtonProps = {
  class?: string;
};

const SelectScrollButton = cc(function SelectScrollButton(props: {
  class?: string;
  slot: "select-scroll-up-button" | "select-scroll-down-button";
  icon: IconNode;
  visible: Signal<boolean>;
}) {
  return (
    <div
      data-slot={props.slot}
      data-state={props.visible.value ? "visible" : "hidden"}
      aria-hidden="true"
      class={cn(
        "absolute inset-x-0 z-10 flex cursor-default items-center justify-center py-1.5 opacity-0 pointer-events-none transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] data-[slot=select-scroll-up-button]:top-0 data-[slot=select-scroll-up-button]:bg-gradient-to-b data-[slot=select-scroll-up-button]:from-popover data-[slot=select-scroll-up-button]:to-transparent data-[slot=select-scroll-down-button]:bottom-0 data-[slot=select-scroll-down-button]:bg-gradient-to-t data-[slot=select-scroll-down-button]:from-popover data-[slot=select-scroll-down-button]:to-transparent data-[state=visible]:pointer-events-auto data-[state=visible]:opacity-100 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
    >
      <Icon icon={props.icon} />
    </div>
  );
});

function SelectScrollUpButton({ class: className }: SelectScrollButtonProps) {
  const visible = useSelectScrollButton("up");
  return (
    <SelectScrollButton
      class={className}
      slot="select-scroll-up-button"
      icon={ChevronUp}
      visible={visible}
    />
  );
}

function SelectScrollDownButton({
  class: className,
}: SelectScrollButtonProps) {
  const visible = useSelectScrollButton("down");
  return (
    <SelectScrollButton
      class={className}
      slot="select-scroll-down-button"
      icon={ChevronDown}
      visible={visible}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
