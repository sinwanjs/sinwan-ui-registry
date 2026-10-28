import { cc, type SinwanNode } from "sinwan/component";
import { Show } from "sinwan/control-flow";
import { Check, ChevronRight } from "lucide";

import { Icon } from "../../../lib/icons";
import { Slot } from "sinwan-ui-core/slot";
import { cn } from "../../../lib/utils";
import { Presence, UiPortal } from "sinwan-ui-core/core";
import { MenuSubContentLayer } from "sinwan-ui-core/menu-sub";
import {
  useContextMenuCheckboxItem,
  useContextMenuContent,
  useContextMenuItem,
  useContextMenuRadioGroupRoot,
  useContextMenuRadioItem,
  useContextMenuRoot,
  useContextMenuSub,
  useContextMenuSubRoot,
  useContextMenuSubTrigger,
  useContextMenuTrigger,
  type ContextMenuCheckboxItemProps,
  type ContextMenuProps,
  type ContextMenuRadioGroupProps,
  type ContextMenuRadioItemProps,
  type ContextMenuSubProps,
} from "./useContextMenu";

const ContextMenu = cc<ContextMenuProps>((props) => {
  useContextMenuRoot(props);
  return <>{props.children}</>;
});

type ContextMenuTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function ContextMenuTrigger({
  children,
  class: className,
  asChild,
}: ContextMenuTriggerProps) {
  const onContextMenu = useContextMenuTrigger();
  if (asChild) {
    return (
      <Slot
        class={cn("select-none", className)}
        oncontextmenu={onContextMenu}
      >
        {children}
      </Slot>
    );
  }
  return (
    <div
      data-slot="context-menu-trigger"
      class={cn("select-none", className)}
      oncontextmenu={onContextMenu}
    >
      {children}
    </div>
  );
}

type ContextMenuPortalProps = {
  children?: SinwanNode;
};

function ContextMenuPortal({ children }: ContextMenuPortalProps) {
  return <UiPortal>{children}</UiPortal>;
}

type ContextMenuGroupProps = {
  children?: SinwanNode;
  class?: string;
};

function ContextMenuGroup({ children, class: className }: ContextMenuGroupProps) {
  return (
    <div data-slot="context-menu-group" role="group" class={className}>
      {children}
    </div>
  );
}

type ContextMenuContentProps = {
  children?: SinwanNode;
  class?: string;
};

function ContextMenuContent({
  class: className,
  children,
}: ContextMenuContentProps) {
  const content = useContextMenuContent();

  return (
    <Presence
      present={content.open.value}
    >
      <UiPortal>
        <div
          data-slot="context-menu-content"
          data-state={content.state.value}
          data-side={content.side.value}
          role="menu"
          class={cn(
            "z-50 max-h-96 min-w-36 overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
            className,
          )}
          style={content.style.value}
          ref={content.setContentEl}
        >
          {children}
        </div>
      </UiPortal>
    </Presence>
  );
}

type ContextMenuItemProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onclick?: (e: MouseEvent) => void;
};

function ContextMenuItem({
  class: className,
  inset,
  variant = "default",
  disabled,
  children,
  onclick,
}: ContextMenuItemProps) {
  const select = useContextMenuItem(onclick);
  return (
    <button
      type="button"
      role="menuitem"
      data-slot="context-menu-item"
      data-inset={inset ? "" : undefined}
      data-variant={variant}
      disabled={disabled}
      class={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onclick={select}
    >
      {children}
    </button>
  );
}

const ContextMenuCheckboxItem = cc<ContextMenuCheckboxItemProps>((props) => {
  const toggle = useContextMenuCheckboxItem(props);
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={(props.checked ? "true" : "false")}
      data-slot="context-menu-checkbox-item"
      data-inset={props.inset ? "" : undefined}
      disabled={props.disabled}
      class={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      onclick={toggle}
    >
      <span
        class="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="context-menu-checkbox-item-indicator"
      >
        <Show when={Boolean(props.checked)} fallback={null}>
          <Icon icon={Check} />
        </Show>
      </span>
      {props.children}
    </button>
  );
});

const ContextMenuRadioGroup = cc<ContextMenuRadioGroupProps>((props) => {
  useContextMenuRadioGroupRoot(props);
  return (
    <div data-slot="context-menu-radio-group" role="group">
      {props.children}
    </div>
  );
});

const ContextMenuRadioItem = cc<ContextMenuRadioItemProps>((props) => {
  const item = useContextMenuRadioItem(props);
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={(item.selected.value ? "true" : "false")}
      data-slot="context-menu-radio-item"
      data-inset={props.inset ? "" : undefined}
      disabled={props.disabled}
      class={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      onclick={item.select}
    >
      <span
        class="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="context-menu-radio-item-indicator"
      >
        <Show when={item.selected.value} fallback={null}>
          <Icon icon={Check} />
        </Show>
      </span>
      {props.children}
    </button>
  );
});

type ContextMenuLabelProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
};

function ContextMenuLabel({
  class: className,
  inset,
  children,
}: ContextMenuLabelProps) {
  return (
    <div
      data-slot="context-menu-label"
      data-inset={inset ? "" : undefined}
      class={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ContextMenuSeparatorProps = {
  class?: string;
};

function ContextMenuSeparator({ class: className }: ContextMenuSeparatorProps) {
  return (
    <div
      data-slot="context-menu-separator"
      class={cn("-mx-1 my-1 h-px bg-border", className)}
    />
  );
}

type ContextMenuShortcutProps = {
  children?: SinwanNode;
  class?: string;
};

function ContextMenuShortcut({
  class: className,
  children,
}: ContextMenuShortcutProps) {
  return (
    <span
      data-slot="context-menu-shortcut"
      class={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

const ContextMenuSub = cc<ContextMenuSubProps>((props) => {
  useContextMenuSubRoot(props);
  return <div data-slot="context-menu-sub">{props.children}</div>;
});

type ContextMenuSubTriggerProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
};

function ContextMenuSubTrigger({
  class: className,
  inset,
  children,
}: ContextMenuSubTriggerProps) {
  const trigger = useContextMenuSubTrigger();
  return (
    <button
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={trigger.openAttr.value === ""}
      data-slot="context-menu-sub-trigger"
      data-inset={inset ? "" : undefined}
      data-open={trigger.openAttr.value}
      class={cn(
        "flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:ps-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onmouseenter={trigger.onMouseEnter}
      onmouseleave={trigger.onMouseLeave}
      onclick={trigger.onClick}
      onkeydown={trigger.onKeyDown}
      ref={trigger.setTriggerEl}
    >
      {children}
      <Icon icon={ChevronRight} class="ms-auto rtl:rotate-180" />
    </button>
  );
}

type ContextMenuSubContentProps = {
  children?: SinwanNode;
  class?: string;
};

function ContextMenuSubContent({
  class: className,
  children,
}: ContextMenuSubContentProps) {
  const sub = useContextMenuSub("ContextMenuSubContent");
  return (
    <MenuSubContentLayer
      api={sub}
      slot="context-menu-sub-content"
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
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
