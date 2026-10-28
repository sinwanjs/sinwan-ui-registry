import {
  inject,
  onMounted,
  onUnmounted,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import { computed, signal, type Computed, type Signal } from "sinwan/reactivity";

import {
  useAnchorPosition,
  type Align,
  type FloatingStyle,
  type Placement,
} from "sinwan-ui-core/floating";
import { isDismissExemptPointerTarget } from "sinwan-ui-core/dismiss";
import {
  createMenuSubApi,
  createMenuSubTriggerHandlers,
  isInsideMenuSubContent,
  type MenuSubApi,
  type MenuSubTriggerHandlers,
} from "sinwan-ui-core/menu-sub";

export type DropdownMenuContext = {
  open: Signal<boolean> | Computed<boolean>;
  setOpen: (value: boolean) => void;
  triggerEl: Signal<HTMLElement | null>;
};

export type DropdownMenuProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DropdownMenuTriggerReturn = {
  open: Signal<boolean> | Computed<boolean>;
  toggle: () => void;
  setTrigger: (element: HTMLElement | null) => void;
};

export type DropdownMenuContentOptions = {
  align?: Align;
  sideOffset?: number;
};

export type DropdownMenuState = "open" | "closed";

export type DropdownMenuContentReturn = {
  open: Signal<boolean> | Computed<boolean>;
  state: Computed<DropdownMenuState>;
  side: Signal<Placement>;
  style: Signal<FloatingStyle>;
  setContent: (element: HTMLElement | null) => void;
};

export type DropdownMenuItemOptions = {
  onclick?: (e: MouseEvent) => void;
};

export type DropdownMenuCheckboxItemOptions = {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export type DropdownMenuCheckboxItemReturn = {
  checked: Computed<boolean>;
  toggle: () => void;
};

export type DropdownMenuRadioGroupContext = {
  value: Signal<string> | Computed<string>;
  setValue: (value: string) => void;
};

export type DropdownMenuRadioGroupProps = {
  children?: SinwanNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export type DropdownMenuRadioItemOptions = {
  value: string;
  disabled?: boolean;
};

export type DropdownMenuRadioItemReturn = {
  selected: Computed<boolean>;
  select: () => void;
};

export type DropdownMenuSubProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DropdownMenuSubTriggerReturn = MenuSubTriggerHandlers & {
  open: Signal<boolean> | Computed<boolean>;
  setTrigger: (element: HTMLElement | null) => void;
};

const DropdownMenuKey: InjectionKey<DropdownMenuContext> = Symbol("sinwan-ui.dropdown-menu");

const DropdownSubKey: InjectionKey<MenuSubApi> = Symbol("sinwan-ui.dropdown-sub");

const DropdownRadioKey: InjectionKey<DropdownMenuRadioGroupContext> = Symbol(
  "sinwan-ui.dropdown-radio",
);

/**
 * Dropdown open state and trigger ref without default styles. Call from a
 * root dropdown component; parts use `useDropdownMenu()`.
 */
export function useDropdownMenuRoot(props: DropdownMenuProps): DropdownMenuContext {
  const openLocal = signal(props.defaultOpen ?? false);
  const open =
    "open" in props ? computed(() => Boolean(props.open)) : openLocal;
  const context: DropdownMenuContext = {
    open,
    setOpen: (v: boolean) => {
      if (!("open" in props)) openLocal.value = v;
      props.onOpenChange?.(v);
    },
    triggerEl: signal<HTMLElement | null>(null),
  };
  provide(DropdownMenuKey, context);
  return context;
}

/**
 * Inject the dropdown context. Must be used under a root that called
 * `useDropdownMenuRoot` (or the default `<DropdownMenu />`).
 */
export function useDropdownMenu(consumer = "useDropdownMenu"): DropdownMenuContext {
  const context = inject(DropdownMenuKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <DropdownMenu />`);
  }
  return context;
}

/**
 * Toggles the menu and registers the anchor element.
 */
export function useDropdownMenuTrigger(): DropdownMenuTriggerReturn {
  const menu = useDropdownMenu("DropdownMenuTrigger");
  return {
    open: menu.open,
    toggle: () => menu.setOpen(!menu.open.value),
    setTrigger: (element) => {
      menu.triggerEl.value = element;
    },
  };
}

/**
 * Anchored position, open/closed state, and outside-pointer / Escape dismiss
 * for the menu content layer.
 */
export function useDropdownMenuContent(
  options: DropdownMenuContentOptions,
): DropdownMenuContentReturn {
  const menu = useDropdownMenu("DropdownMenuContent");
  const contentEl = signal<HTMLElement | null>(null);
  const { style, side } = useAnchorPosition({
    open: menu.open,
    trigger: menu.triggerEl,
    content: contentEl,
    placement: "bottom",
    align: options.align ?? "start",
    gap: options.sideOffset ?? 4,
    fallbackSize: { width: 180, height: 200 },
    extra: (anchor) => ({
      minWidth: `${Math.max(anchor.width, 128)}px`,
    }),
  });

  onMounted(() => {
    function onDoc(e: MouseEvent) {
      if (!menu.open.value) return;
      const t = e.target;
      if (
        (t instanceof Node && menu.triggerEl.value?.contains(t)) ||
        isDismissExemptPointerTarget(t)
      ) {
        return;
      }
      menu.setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") menu.setOpen(false);
    }
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    onUnmounted(() => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    });
  });

  return {
    open: menu.open,
    state: computed(() => (menu.open.value ? "open" : "closed")),
    side,
    style,
    setContent: (element) => {
      contentEl.value = element;
    },
  };
}

/**
 * Item click handler: runs `onclick`, then closes the menu unless the event
 * was prevented or the item sits inside submenu content.
 */
export function useDropdownMenuItem(
  options: DropdownMenuItemOptions,
): (e: MouseEvent) => void {
  const menu = useDropdownMenu("DropdownMenuItem");
  return (e) => {
    options.onclick?.(e);
    if (e.defaultPrevented || isInsideMenuSubContent(e.currentTarget)) {
      return;
    }
    menu.setOpen(false);
  };
}

/**
 * Live checked state and toggle for a checkbox item. Does not close the menu.
 */
export function useDropdownMenuCheckboxItem(
  options: DropdownMenuCheckboxItemOptions,
): DropdownMenuCheckboxItemReturn {
  const checked = computed(() => Boolean(options.checked));
  return {
    checked,
    toggle: () => {
      if (options.disabled) return;
      options.onCheckedChange?.(!checked.value);
    },
  };
}

/**
 * Radio group value (controlled or local). Call from a radio group root;
 * items use `useDropdownMenuRadioGroup()`.
 */
export function useDropdownMenuRadioGroupRoot(
  props: DropdownMenuRadioGroupProps,
): DropdownMenuRadioGroupContext {
  const valueLocal = signal(props.defaultValue ?? "");
  const value =
    "value" in props ? computed(() => props.value ?? "") : valueLocal;
  const set = (next: string) => {
    if (!("value" in props)) valueLocal.value = next;
  };
  const context: DropdownMenuRadioGroupContext = {
    value,
    setValue: (v: string) => {
      set(v);
      props.onValueChange?.(v);
    },
  };
  provide(DropdownRadioKey, context);
  return context;
}

/**
 * Inject the radio group context. Must be used under a root that called
 * `useDropdownMenuRadioGroupRoot` (or `<DropdownMenuRadioGroup />`).
 */
export function useDropdownMenuRadioGroup(
  consumer = "useDropdownMenuRadioGroup",
): DropdownMenuRadioGroupContext {
  const context = inject(DropdownRadioKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <DropdownMenuRadioGroup />`);
  }
  return context;
}

/**
 * Live selected state and select action for a radio item.
 */
export function useDropdownMenuRadioItem(
  options: DropdownMenuRadioItemOptions,
): DropdownMenuRadioItemReturn {
  const radio = useDropdownMenuRadioGroup("DropdownMenuRadioItem");
  return {
    selected: computed(() => radio.value.value === options.value),
    select: () => {
      if (options.disabled) return;
      radio.setValue(options.value);
    },
  };
}

/**
 * Submenu open state with hover close delay. Closes when the enclosing menu or
 * submenu closes. Call from a submenu root; parts use `useDropdownMenuSub()`.
 */
export function useDropdownMenuSubRoot(props: DropdownMenuSubProps): MenuSubApi {
  const parent = inject(DropdownSubKey, null) ?? inject(DropdownMenuKey, null);
  const sub = createMenuSubApi({
    controlled: "open" in props,
    defaultOpen: props.defaultOpen,
    readOpen: () => Boolean(props.open),
    onOpenChange: props.onOpenChange,
    parentOpen: parent ? () => parent.open.value : undefined,
  });
  provide(DropdownSubKey, sub);
  return sub;
}

/**
 * Inject the submenu context. Must be used under a root that called
 * `useDropdownMenuSubRoot` (or `<DropdownMenuSub />`).
 */
export function useDropdownMenuSub(consumer = "useDropdownMenuSub"): MenuSubApi {
  const context = inject(DropdownSubKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <DropdownMenuSub />`);
  }
  return context;
}

/**
 * Hover, click and ArrowRight open the submenu (a click never closes it);
 * also registers the anchor ref.
 */
export function useDropdownMenuSubTrigger(): DropdownMenuSubTriggerReturn {
  const sub = useDropdownMenuSub("DropdownMenuSubTrigger");
  return {
    ...createMenuSubTriggerHandlers(sub),
    open: sub.open,
    setTrigger: (element) => {
      sub.triggerEl.value = element;
    },
  };
}
