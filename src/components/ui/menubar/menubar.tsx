import { cc, type SinwanNode } from "sinwan/component";
import { Show } from "sinwan/control-flow";
import { Check, ChevronRight } from "lucide";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import { Presence, UiPortal } from "sinwan-ui-core/core";
import type { Align } from "sinwan-ui-core/floating";
import { MenuSubContentLayer } from "sinwan-ui-core/menu-sub";
import {
  useMenubarCheckboxItem,
  useMenubarContent,
  useMenubarItem,
  useMenubarMenuRoot,
  useMenubarRadioGroupRoot,
  useMenubarRadioItem,
  useMenubarRoot,
  useMenubarSub,
  useMenubarSubRoot,
  useMenubarSubTrigger,
  useMenubarTrigger,
  type MenubarCheckboxItemProps,
  type MenubarRadioGroupProps,
  type MenubarRadioItemProps,
  type MenubarSubProps,
} from "./useMenubar";

export type MenubarProps = {
  children?: SinwanNode;
  class?: string;
};

const Menubar = cc<MenubarProps>(({ children, class: className }) => {
  useMenubarRoot();
  return (
    <div
      data-slot="menubar"
      role="menubar"
      class={cn(
        "flex h-8 items-center gap-0.5 rounded-lg border p-[3px]",
        className,
      )}
    >
      {children}
    </div>
  );
});

export type MenubarMenuProps = {
  children?: SinwanNode;
};

const MenubarMenu = cc<MenubarMenuProps>(({ children }) => {
  useMenubarMenuRoot();
  return <div data-slot="menubar-menu">{children}</div>;
});

export type MenubarGroupProps = {
  children?: SinwanNode;
};

function MenubarGroup({ children }: MenubarGroupProps) {
  return (
    <div data-slot="menubar-group" role="group">
      {children}
    </div>
  );
}

export type MenubarPortalProps = {
  children?: SinwanNode;
};

function MenubarPortal({ children }: MenubarPortalProps) {
  return <UiPortal>{children}</UiPortal>;
}

const MenubarRadioGroup = cc<MenubarRadioGroupProps>((props) => {
  useMenubarRadioGroupRoot(props);
  return (
    <div data-slot="menubar-radio-group" role="group">
      {props.children}
    </div>
  );
});

export type MenubarTriggerProps = {
  children?: SinwanNode;
  class?: string;
};

function MenubarTrigger({ class: className, children }: MenubarTriggerProps) {
  const trigger = useMenubarTrigger();
  return (
    <button
      type="button"
      data-slot="menubar-trigger"
      aria-expanded={trigger.open.value}
      class={cn(
        "flex items-center rounded-sm px-1.5 py-[2px] text-sm font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",
        className,
      )}
      onclick={trigger.toggle}
      ref={trigger.setTrigger}
    >
      {children}
    </button>
  );
}

export type MenubarContentProps = {
  children?: SinwanNode;
  class?: string;
  align?: Align;
  sideOffset?: number;
};

function MenubarContent({
  class: className,
  align = "start",
  sideOffset = 8,
  children,
}: MenubarContentProps) {
  const content = useMenubarContent({ align, sideOffset });
  return (
    <Presence
      present={content.open.value}
    >
      <UiPortal>
        <div
          data-slot="menubar-content"
          data-state={content.state.value}
          data-side={content.side.value}
          role="menu"
          class={cn(
            "z-50 min-w-36 overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:!fill-mode-forwards",
            className,
          )}
          style={content.style.value}
          ref={content.setContent}
        >
          {children}
        </div>
      </UiPortal>
    </Presence>
  );
}

export type MenubarItemProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onclick?: (e: MouseEvent) => void;
};

function MenubarItem({
  class: className,
  inset,
  variant = "default",
  disabled,
  children,
  onclick,
}: MenubarItemProps) {
  const item = useMenubarItem(onclick);
  return (
    <button
      type="button"
      role="menuitem"
      data-slot="menubar-item"
      data-inset={inset ? "" : undefined}
      data-variant={variant}
      disabled={disabled}
      class={cn(
        "group/menubar-item relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onclick={item.select}
    >
      {children}
    </button>
  );
}

const MenubarCheckboxItem = cc<MenubarCheckboxItemProps>((props) => {
  const item = useMenubarCheckboxItem(props);
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={(item.checked.value ? "true" : "false")}
      data-slot="menubar-checkbox-item"
      data-inset={props.inset ? "" : undefined}
      disabled={props.disabled}
      class={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class,
      )}
      onclick={item.toggle}
    >
      <span class="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <Show when={item.checked.value} fallback={null}>
          <Icon icon={Check} />
        </Show>
      </span>
      {props.children}
    </button>
  );
});

const MenubarRadioItem = cc<MenubarRadioItemProps>((props) => {
  const item = useMenubarRadioItem(props);
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={(item.checked.value ? "true" : "false")}
      data-slot="menubar-radio-item"
      data-inset={props.inset ? "" : undefined}
      disabled={props.disabled}
      class={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      onclick={item.select}
    >
      <span class="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <Show when={item.checked.value} fallback={null}>
          <Icon icon={Check} />
        </Show>
      </span>
      {props.children}
    </button>
  );
});

export type MenubarLabelProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
};

function MenubarLabel({ class: className, inset, children }: MenubarLabelProps) {
  return (
    <div
      data-slot="menubar-label"
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

export type MenubarSeparatorProps = {
  class?: string;
};

function MenubarSeparator({ class: className }: MenubarSeparatorProps) {
  return (
    <div
      data-slot="menubar-separator"
      class={cn("-mx-1 my-1 h-px bg-border", className)}
    />
  );
}

export type MenubarShortcutProps = {
  children?: SinwanNode;
  class?: string;
};

function MenubarShortcut({ class: className, children }: MenubarShortcutProps) {
  return (
    <span
      data-slot="menubar-shortcut"
      class={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

const MenubarSub = cc<MenubarSubProps>((props) => {
  useMenubarSubRoot(props);
  return <div data-slot="menubar-sub">{props.children}</div>;
});

export type MenubarSubTriggerProps = {
  children?: SinwanNode;
  class?: string;
  inset?: boolean;
};

function MenubarSubTrigger({
  class: className,
  inset,
  children,
}: MenubarSubTriggerProps) {
  const trigger = useMenubarSubTrigger();
  return (
    <button
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={trigger.openAttr.value === ""}
      data-slot="menubar-sub-trigger"
      data-inset={inset ? "" : undefined}
      data-open={trigger.openAttr.value}
      class={cn(
        "flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent data-inset:ps-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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

export type MenubarSubContentProps = {
  children?: SinwanNode;
  class?: string;
};

function MenubarSubContent({
  class: className,
  children,
}: MenubarSubContentProps) {
  return (
    <MenuSubContentLayer
      api={useMenubarSub("MenubarSubContent")}
      slot="menubar-sub-content"
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
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
