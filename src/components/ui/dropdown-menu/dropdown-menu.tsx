import { cc, type SinwanNode } from "sinwan/component";
import { Show } from "sinwan/control-flow";
import { Check, ChevronRight } from "lucide";

import { Icon } from "../../../lib/icons";
import { Slot } from "sinwan-ui-core/slot";
import { cn } from "../../../lib/utils";
import { Presence, UiPortal } from "sinwan-ui-core/core";
import type { Align } from "sinwan-ui-core/floating";
import { MenuSubContentLayer } from "sinwan-ui-core/menu-sub";
import {
  useDropdownMenuCheckboxItem,
  useDropdownMenuContent,
  useDropdownMenuItem,
  useDropdownMenuRadioGroupRoot,
  useDropdownMenuRadioItem,
  useDropdownMenuRoot,
  useDropdownMenuSub,
  useDropdownMenuSubRoot,
  useDropdownMenuSubTrigger,
  useDropdownMenuTrigger,
  type DropdownMenuProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuSubProps,
} from "./useDropdownMenu";

const DropdownMenu = cc<DropdownMenuProps>((props) => {
  useDropdownMenuRoot(props);
  return <>{props.children}</>;
});

type DropdownMenuPortalProps = {
  children?: SinwanNode;
};

function DropdownMenuPortal({ children }: DropdownMenuPortalProps) {
  return <UiPortal>{children}</UiPortal>;
}

type DropdownMenuTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function DropdownMenuTrigger({
  children,
  class: className,
  asChild,
}: DropdownMenuTriggerProps) {
  const trigger = useDropdownMenuTrigger();
  if (asChild) {
    return (
      <Slot class={className} onclick={trigger.toggle} ref={trigger.setTrigger}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      type="button"
      data-slot="dropdown-menu-trigger"
      class={className}
      aria-expanded={trigger.open.value}
      onclick={trigger.toggle}
      ref={trigger.setTrigger}
    >
      {children}
    </button>
  );
}

type DropdownMenuContentProps = {
  children?: SinwanNode;
  class?: string;
  align?: Align;
  sideOffset?: number;
};

function DropdownMenuContent(props: DropdownMenuContentProps) {
  const content = useDropdownMenuContent(props);
  return (
    <Presence
      present={content.open.value}
    >
      <UiPortal>
        <div
          data-slot="dropdown-menu-content"
          data-state={content.state.value}
          data-side={content.side.value}
          role="menu"
          class={cn(
            "z-50 max-h-96 min-w-32 overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
            props.class,
          )}
          style={content.style.value}
          ref={content.setContent}
        >
          {props.children}
        </div>
      </UiPortal>
    </Presence>
  );
}

type DropdownMenuGroupProps = {
  children?: SinwanNode;
  class?: string;
};

function DropdownMenuGroup({ children, class: className }: DropdownMenuGroupProps) {
  return (
    <div data-slot="dropdown-menu-group" role="group" class={className}>
      {children}
    </div>
  );
}

type DropdownMenuItemProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onclick?: (e: MouseEvent) => void;
};

function DropdownMenuItem(props: DropdownMenuItemProps) {
  const onClick = useDropdownMenuItem(props);
  return (
    <button
      type="button"
      role="menuitem"
      data-slot="dropdown-menu-item"
      data-inset={props.inset ? "" : undefined}
      data-variant={props.variant ?? "default"}
      data-disabled={props.disabled ? "" : undefined}
      disabled={props.disabled}
      class={cn(
        "group/dropdown-menu-item relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        props.class,
      )}
      onclick={onClick}
    >
      {props.children}
    </button>
  );
}

type DropdownMenuCheckboxItemProps = {
  children?: SinwanNode;
  class?: string;
  checked?: boolean;
  inset?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const DropdownMenuCheckboxItem = cc<DropdownMenuCheckboxItemProps>((props) => {
  const checkbox = useDropdownMenuCheckboxItem(props);
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checkbox.checked.value ? "true" : "false"}
      data-slot="dropdown-menu-checkbox-item"
      data-inset={props.inset ? "" : undefined}
      disabled={props.disabled}
      class={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      onclick={checkbox.toggle}
    >
      <span
        class="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <Show when={checkbox.checked.value} fallback={null}>
          <Icon icon={Check} />
        </Show>
      </span>
      {props.children}
    </button>
  );
});

const DropdownMenuRadioGroup = cc<DropdownMenuRadioGroupProps>((props) => {
  useDropdownMenuRadioGroupRoot(props);
  return (
    <div data-slot="dropdown-menu-radio-group" role="group">
      {props.children}
    </div>
  );
});

type DropdownMenuRadioItemProps = {
  children?: SinwanNode;
  class?: string;
  value: string;
  inset?: boolean;
  disabled?: boolean;
};

const DropdownMenuRadioItem = cc<DropdownMenuRadioItemProps>((props) => {
  const radio = useDropdownMenuRadioItem(props);
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={radio.selected.value ? "true" : "false"}
      data-slot="dropdown-menu-radio-item"
      data-inset={props.inset ? "" : undefined}
      disabled={props.disabled}
      class={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      onclick={radio.select}
    >
      <span
        class="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <Show when={radio.selected.value} fallback={null}>
          <Icon icon={Check} />
        </Show>
      </span>
      {props.children}
    </button>
  );
});

type DropdownMenuLabelProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
};

function DropdownMenuLabel({
  class: className,
  inset,
  children,
}: DropdownMenuLabelProps) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset ? "" : undefined}
      class={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:ps-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

type DropdownMenuSeparatorProps = {
  class?: string;
};

function DropdownMenuSeparator({ class: className }: DropdownMenuSeparatorProps) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      class={cn("-mx-1 my-1 h-px bg-border", className)}
    />
  );
}

type DropdownMenuShortcutProps = {
  children?: SinwanNode;
  class?: string;
};

function DropdownMenuShortcut({
  class: className,
  children,
}: DropdownMenuShortcutProps) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      class={cn(
        "ms-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

const DropdownMenuSub = cc<DropdownMenuSubProps>((props) => {
  useDropdownMenuSubRoot(props);
  return <div data-slot="dropdown-menu-sub">{props.children}</div>;
});

type DropdownMenuSubTriggerProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
};

function DropdownMenuSubTrigger({
  class: className,
  inset,
  children,
}: DropdownMenuSubTriggerProps) {
  const trigger = useDropdownMenuSubTrigger();
  return (
    <button
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={trigger.open.value}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset ? "" : undefined}
      data-open={trigger.open.value ? "" : undefined}
      class={cn(
        "flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onmouseenter={trigger.onMouseEnter}
      onmouseleave={trigger.onMouseLeave}
      onclick={trigger.onClick}
      onkeydown={trigger.onKeyDown}
      ref={trigger.setTrigger}
    >
      {children}
      <Icon icon={ChevronRight} class="ms-auto rtl:rotate-180" />
    </button>
  );
}

type DropdownMenuSubContentProps = {
  children?: SinwanNode;
  class?: string;
};

function DropdownMenuSubContent({
  class: className,
  children,
}: DropdownMenuSubContentProps) {
  const sub = useDropdownMenuSub("DropdownMenuSubContent");
  return (
    <MenuSubContentLayer
      api={sub}
      slot="dropdown-menu-sub-content"
      class={cn(
        "z-50 min-w-[96px] overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
        className,
      )}
    >
      {children}
    </MenuSubContentLayer>
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
