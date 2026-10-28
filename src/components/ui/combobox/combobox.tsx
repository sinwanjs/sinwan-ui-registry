import { cc, type SinwanNode } from "sinwan/component";
import { Show } from "sinwan/control-flow";
import { Check, ChevronDown, X } from "lucide";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import {
  PopoverContent as PopoverContentPrimitive,
  PopoverRoot,
} from "sinwan-ui-core/overlay";
import type { Align, Placement } from "sinwan-ui-core/floating";
import { Button } from "../button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../input-group";
import {
  useCombobox,
  useComboboxChip,
  useComboboxChipsInput,
  useComboboxInput,
  useComboboxItem,
  useComboboxPopoverAnchor,
  useComboboxRoot,
  useComboboxTrigger,
  type ComboboxItemProps,
  type ComboboxProps,
} from "./useCombobox";

const Combobox = cc<ComboboxProps>((props) => {
  const { combobox, onPopoverOpenChange } = useComboboxRoot(props);

  return (
    <PopoverRoot
      open={combobox.open.value}
      onOpenChange={onPopoverOpenChange}
    >
      {props.children}
    </PopoverRoot>
  );
});

type ComboboxValueProps = {
  placeholder?: string;
  class?: string;
};

function ComboboxValue({ placeholder, class: className }: ComboboxValueProps) {
  const combobox = useCombobox("ComboboxValue");
  return (
    <span data-slot="combobox-value" class={className}>
      {combobox.label.value || combobox.value.value || placeholder || ""}
    </span>
  );
}

type ComboboxTriggerProps = {
  children?: SinwanNode;
  class?: string;
};

function ComboboxTrigger({ class: className, children }: ComboboxTriggerProps) {
  const trigger = useComboboxTrigger();
  return (
    <button
      type="button"
      data-slot="combobox-trigger"
      class={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      ref={trigger.setAnchor}
      onclick={trigger.toggle}
    >
      {children}
      <Icon
        icon={ChevronDown}
        class="pointer-events-none size-4 text-muted-foreground"
      />
    </button>
  );
}

type ComboboxInputProps = {
  class?: string;
  placeholder?: string;
  disabled?: boolean;
  showTrigger?: boolean;
  showClear?: boolean;
  children?: SinwanNode;
  oninput?: (e: Event) => void;
};

function ComboboxInput({
  class: className,
  placeholder,
  disabled = false,
  showTrigger = true,
  showClear = false,
  children,
  oninput,
}: ComboboxInputProps) {
  const input = useComboboxInput(oninput);
  return (
    <InputGroup class={cn("w-auto", className)} ref={input.setAnchor}>
      <InputGroupInput
        disabled={disabled}
        placeholder={placeholder}
        value={input.display.value}
        oninput={input.onInput}
        onfocus={input.onFocus}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger ? (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            data-slot="input-group-button"
            class="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
            onclick={input.toggle}
          >
            <Icon
              icon={ChevronDown}
              class="pointer-events-none size-4 text-muted-foreground"
            />
          </InputGroupButton>
        ) : null}
        {showClear ? <ComboboxClear disabled={disabled} /> : null}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

type ComboboxClearProps = {
  class?: string;
  disabled?: boolean;
};

function ComboboxClear({ class: className, disabled }: ComboboxClearProps) {
  const combobox = useCombobox("ComboboxClear");
  return (
    <InputGroupButton
      data-slot="combobox-clear"
      variant="ghost"
      size="icon-xs"
      class={cn(className)}
      disabled={disabled}
      onclick={() => {
        combobox.clearValue(true);
      }}
    >
      <Icon icon={X} class="pointer-events-none" />
    </InputGroupButton>
  );
}

type ComboboxContentProps = {
  children?: SinwanNode;
  class?: string;
  side?: Placement;
  sideOffset?: number;
  align?: Align;
};

function ComboboxContent({
  class: className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  children,
}: ComboboxContentProps) {
  return (
    <PopoverContentPrimitive
      side={side}
      sideOffset={sideOffset}
      align={align}
      class={cn(
        "group/combobox-content relative max-h-72 min-w-[12rem] overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
        className,
      )}
    >
      {children}
    </PopoverContentPrimitive>
  );
}

type ComboboxListProps = {
  children?: SinwanNode;
  class?: string;
};

function ComboboxList({ class: className, children }: ComboboxListProps) {
  const combobox = useCombobox("ComboboxList");
  return (
    <div
      data-slot="combobox-list"
      role="listbox"
      data-empty={(combobox.matchCount.value === 0 ? "" : undefined)}
      class={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

const ComboboxItem = cc(function ComboboxItem(props: ComboboxItemProps) {
  const item = useComboboxItem(props);
  return (
    <Show when={item.matches.value} fallback={null}>
      <button
        type="button"
        role="option"
        data-slot="combobox-item"
        data-highlighted={undefined}
        aria-selected={item.selected.value}
        disabled={Boolean(props.disabled)}
        class={cn(
          "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          props.class,
        )}
        onclick={item.select}
      >
        {props.children}
        <span class="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
          <Show when={item.selected.value} fallback={null}>
            <Icon icon={Check} class="pointer-events-none" />
          </Show>
        </span>
      </button>
    </Show>
  );
});

type ComboboxGroupProps = {
  children?: SinwanNode;
  class?: string;
};

function ComboboxGroup({ class: className, children }: ComboboxGroupProps) {
  return (
    <div data-slot="combobox-group" class={cn(className)} role="group">
      {children}
    </div>
  );
}

type ComboboxLabelProps = {
  children?: SinwanNode;
  class?: string;
};

function ComboboxLabel({ class: className, children }: ComboboxLabelProps) {
  return (
    <div
      data-slot="combobox-label"
      class={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
    >
      {children}
    </div>
  );
}

type ComboboxCollectionProps = {
  children?: SinwanNode;
};

function ComboboxCollection({ children }: ComboboxCollectionProps) {
  return <div data-slot="combobox-collection">{children}</div>;
}

type ComboboxEmptyProps = {
  children?: SinwanNode;
  class?: string;
};

function ComboboxEmpty({ class: className, children }: ComboboxEmptyProps) {
  const combobox = useCombobox("ComboboxEmpty");
  return (
    <Show when={combobox.matchCount.value === 0} fallback={null}>
      <div
        data-slot="combobox-empty"
        class={cn(
          "w-full justify-center py-2 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {children ?? "No results."}
      </div>
    </Show>
  );
}

type ComboboxSeparatorProps = {
  class?: string;
};

function ComboboxSeparator({ class: className }: ComboboxSeparatorProps) {
  return (
    <div
      data-slot="combobox-separator"
      class={cn("-mx-1 my-1 h-px bg-border", className)}
    />
  );
}

type ComboboxChipsProps = {
  children?: SinwanNode;
  class?: string;
};

function ComboboxChips({ class: className, children }: ComboboxChipsProps) {
  const setAnchor = useComboboxPopoverAnchor();
  return (
    <div
      data-slot="combobox-chips"
      class={cn(
        "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className,
      )}
      ref={setAnchor}
    >
      {children}
    </div>
  );
}

type ComboboxChipProps = {
  children?: SinwanNode;
  class?: string;
  value?: string;
  showRemove?: boolean;
};

function ComboboxChip({
  class: className,
  children,
  value,
  showRemove = true,
}: ComboboxChipProps) {
  const remove = useComboboxChip(value);
  return (
    <span
      data-slot="combobox-chip"
      class={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className,
      )}
    >
      {children}
      {showRemove ? (
        <Button
          variant="ghost"
          size="icon-xs"
          data-slot="combobox-chip-remove"
          class="-ml-1 opacity-50 hover:opacity-100"
          onclick={remove}
        >
          <Icon icon={X} class="pointer-events-none" />
        </Button>
      ) : null}
    </span>
  );
}

type ComboboxChipsInputProps = {
  class?: string;
  placeholder?: string;
  oninput?: (e: Event) => void;
};

function ComboboxChipsInput({
  class: className,
  placeholder,
  oninput,
}: ComboboxChipsInputProps) {
  const onInput = useComboboxChipsInput(oninput);
  return (
    <input
      data-slot="combobox-chip-input"
      class={cn("min-w-16 flex-1 bg-transparent outline-none", className)}
      placeholder={placeholder}
      oninput={onInput}
    />
  );
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
};
