import {
  inject,
  onMounted,
  onUnmounted,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import {
  computed,
  effect,
  signal,
  type Computed,
  type Signal,
} from "sinwan/reactivity";

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

export type MenubarContext = {
  openMenu: Signal<string | null>;
  setOpenMenu: (id: string | null) => void;
};

export type MenubarMenuContext = {
  id: string;
  open: Signal<boolean>;
  setOpen: (value: boolean) => void;
  triggerEl: Signal<HTMLElement | null>;
};

export type MenubarRadioGroupContext = {
  value: Signal<string> | Computed<string>;
  setValue: (value: string) => void;
};

export type MenubarSubContext = MenuSubApi;

export type MenubarRadioGroupProps = {
  children?: SinwanNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export type MenubarCheckboxItemProps = {
  children?: SinwanNode;
  class?: string;
  checked?: boolean;
  inset?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export type MenubarRadioItemProps = {
  children?: SinwanNode;
  class?: string;
  value: string;
  inset?: boolean;
  disabled?: boolean;
};

export type MenubarSubProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type MenubarTriggerReturn = {
  open: Signal<boolean>;
  toggle: () => void;
  setTrigger: (element: HTMLElement | null) => void;
};

export type MenubarContentOptions = {
  align: Align;
  sideOffset: number;
};

export type MenubarContentReturn = {
  open: Signal<boolean>;
  state: Computed<"open" | "closed">;
  side: Signal<Placement>;
  style: Signal<FloatingStyle>;
  setContent: (element: HTMLElement | null) => void;
};

export type MenubarItemReturn = {
  select: (event: MouseEvent) => void;
};

export type MenubarCheckboxItemReturn = {
  checked: Computed<boolean>;
  toggle: () => void;
};

export type MenubarRadioItemReturn = {
  checked: Computed<boolean>;
  select: () => void;
};

export type MenubarSubTriggerReturn = MenuSubTriggerHandlers & {
  openAttr: Computed<"" | undefined>;
  setTrigger: (element: HTMLElement | null) => void;
};

const MenubarKey: InjectionKey<MenubarContext> = Symbol("sinwan-ui.menubar");

const MenubarMenuKey: InjectionKey<MenubarMenuContext> = Symbol(
  "sinwan-ui.menubar-menu",
);

const MenubarSubKey: InjectionKey<MenubarSubContext> = Symbol(
  "sinwan-ui.menubar-sub",
);

const MenubarRadioKey: InjectionKey<MenubarRadioGroupContext> = Symbol(
  "sinwan-ui.menubar-radio",
);

let menuSeq = 0;

/**
 * Menubar state: tracks which top-level menu is open. Call from a root
 * menubar component; parts use `useMenubar()`.
 */
export function useMenubarRoot(): MenubarContext {
  const openMenu = signal<string | null>(null);
  const context: MenubarContext = {
    openMenu,
    setOpenMenu: (id: string | null) => {
      openMenu.value = id;
    },
  };
  provide(MenubarKey, context);
  return context;
}

/**
 * Inject the menubar context. Must be used under a root that called
 * `useMenubarRoot` (or the default `<Menubar />`).
 */
export function useMenubar(consumer = "useMenubar"): MenubarContext {
  const context = inject(MenubarKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <Menubar />`);
  }
  return context;
}

/**
 * One top-level menu. Opening it closes any other menu in the same menubar.
 */
export function useMenubarMenuRoot(): MenubarMenuContext {
  const bar = useMenubar("MenubarMenu");
  const id = `menubar-menu-${++menuSeq}`;
  const open = signal(false);
  function setOpen(v: boolean) {
    open.value = v;
    if (v) bar.setOpenMenu(id);
    else if (bar.openMenu.value === id) bar.setOpenMenu(null);
  }
  effect(() => {
    if (bar.openMenu.value !== id && open.value) {
      open.value = false;
    }
  });
  const context: MenubarMenuContext = {
    id,
    open,
    setOpen,
    triggerEl: signal<HTMLElement | null>(null),
  };
  provide(MenubarMenuKey, context);
  return context;
}

/**
 * Inject the enclosing menu context. Must be used under `<MenubarMenu />`.
 */
export function useMenubarMenu(consumer = "useMenubarMenu"): MenubarMenuContext {
  const context = inject(MenubarMenuKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <MenubarMenu />`);
  }
  return context;
}

/**
 * Trigger toggles its menu on click (never on hover) and anchors the content.
 */
export function useMenubarTrigger(): MenubarTriggerReturn {
  const menu = useMenubarMenu("MenubarTrigger");
  return {
    open: menu.open,
    toggle: () => menu.setOpen(!menu.open.value),
    setTrigger: (element) => {
      menu.triggerEl.value = element;
    },
  };
}

/**
 * Content positioning plus outside-pointer and Escape dismissal.
 */
export function useMenubarContent(
  options: MenubarContentOptions,
): MenubarContentReturn {
  const menu = useMenubarMenu("MenubarContent");
  const contentEl = signal<HTMLElement | null>(null);
  const { style, side } = useAnchorPosition({
    open: menu.open,
    trigger: menu.triggerEl,
    content: contentEl,
    placement: "bottom",
    align: options.align,
    gap: options.sideOffset,
    fallbackSize: { width: 180, height: 200 },
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
 * Item click runs `onclick`, then closes the menu unless the event was
 * prevented or the item sits inside submenu content.
 */
export function useMenubarItem(
  onclick?: (event: MouseEvent) => void,
): MenubarItemReturn {
  const menu = useMenubarMenu("MenubarItem");
  return {
    select: (e) => {
      onclick?.(e);
      if (e.defaultPrevented || isInsideMenuSubContent(e.currentTarget)) {
        return;
      }
      menu.setOpen(false);
    },
  };
}

/**
 * Radio group value, controlled through `value` or local through
 * `defaultValue`.
 */
export function useMenubarRadioGroupRoot(
  props: MenubarRadioGroupProps,
): MenubarRadioGroupContext {
  const valueLocal = signal(props.defaultValue ?? "");
  const value =
    "value" in props ? computed(() => props.value ?? "") : valueLocal;
  const set = (next: string) => {
    if (!("value" in props)) valueLocal.value = next;
  };
  const context: MenubarRadioGroupContext = {
    value,
    setValue: (v: string) => {
      set(v);
      props.onValueChange?.(v);
    },
  };
  provide(MenubarRadioKey, context);
  return context;
}

/**
 * Inject the radio group context. Must be used under `<MenubarRadioGroup />`.
 */
export function useMenubarRadioGroup(
  consumer = "useMenubarRadioGroup",
): MenubarRadioGroupContext {
  const context = inject(MenubarRadioKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <MenubarRadioGroup />`);
  }
  return context;
}

/**
 * Checkbox item reading live `checked`; toggling does not close the menu.
 */
export function useMenubarCheckboxItem(
  props: MenubarCheckboxItemProps,
): MenubarCheckboxItemReturn {
  return {
    checked: computed(() => Boolean(props.checked)),
    toggle: () => {
      if (props.disabled) return;
      props.onCheckedChange?.(!Boolean(props.checked));
    },
  };
}

/**
 * Radio item selection within the enclosing radio group.
 */
export function useMenubarRadioItem(
  props: MenubarRadioItemProps,
): MenubarRadioItemReturn {
  const radio = useMenubarRadioGroup("MenubarRadioItem");
  return {
    checked: computed(() => radio.value.value === props.value),
    select: () => {
      if (props.disabled) return;
      radio.setValue(props.value);
    },
  };
}

/**
 * Submenu open state, controlled through `open` or local through
 * `defaultOpen`. Closes when the enclosing menu or submenu closes.
 */
export function useMenubarSubRoot(props: MenubarSubProps): MenubarSubContext {
  const parent = inject(MenubarSubKey, null) ?? inject(MenubarMenuKey, null);
  const context = createMenuSubApi({
    controlled: "open" in props,
    defaultOpen: props.defaultOpen,
    readOpen: () => Boolean(props.open),
    onOpenChange: props.onOpenChange,
    parentOpen: parent ? () => parent.open.value : undefined,
  });
  provide(MenubarSubKey, context);
  return context;
}

/**
 * Inject the submenu context. Must be used under `<MenubarSub />`.
 */
export function useMenubarSub(consumer = "useMenubarSub"): MenubarSubContext {
  const context = inject(MenubarSubKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <MenubarSub />`);
  }
  return context;
}

/**
 * Submenu trigger: hover, click and ArrowRight open it (a click never closes
 * it); leaving starts the hover close delay.
 */
export function useMenubarSubTrigger(): MenubarSubTriggerReturn {
  const sub = useMenubarSub("MenubarSubTrigger");
  return {
    ...createMenuSubTriggerHandlers(sub),
    openAttr: computed(() => (sub.open.value ? "" : undefined)),
    setTrigger: (element) => {
      sub.triggerEl.value = element;
    },
  };
}
