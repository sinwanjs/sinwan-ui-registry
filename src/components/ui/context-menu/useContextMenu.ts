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
  signal,
  type Computed,
  type Signal,
} from "sinwan/reactivity";

import { usePointPosition, type Placement } from "sinwan-ui-core/floating";
import { isDismissExemptPointerTarget } from "sinwan-ui-core/dismiss";
import type { FloatingStyle } from "sinwan-ui-core/floating";
import {
  createMenuSubApi,
  createMenuSubTriggerHandlers,
  isInsideMenuSubContent,
  type MenuSubApi,
  type MenuSubTriggerHandlers,
} from "sinwan-ui-core/menu-sub";

export type ContextMenuContext = {
  open: Signal<boolean>;
  setOpen: (value: boolean) => void;
  point: Signal<{ x: number; y: number }>;
};

export type ContextMenuProps = {
  children?: SinwanNode;
  onOpenChange?: (open: boolean) => void;
};

export type ContextMenuContentReturn = {
  open: Signal<boolean>;
  state: Computed<"open" | "closed">;
  style: Signal<FloatingStyle>;
  side: Signal<Placement>;
  setContentEl: (element: HTMLElement | null) => void;
};

export type ContextMenuCheckboxItemProps = {
  children?: SinwanNode;
  class?: string;
  checked?: boolean;
  inset?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export type ContextMenuRadioGroupContext = {
  value: Signal<string> | Computed<string>;
  setValue: (value: string) => void;
};

export type ContextMenuRadioGroupProps = {
  children?: SinwanNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export type ContextMenuRadioItemProps = {
  children?: SinwanNode;
  class?: string;
  value: string;
  inset?: boolean;
  disabled?: boolean;
};

export type ContextMenuRadioItemReturn = {
  selected: Computed<boolean>;
  select: () => void;
};

export type ContextMenuSubProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ContextMenuSubTriggerReturn = MenuSubTriggerHandlers & {
  openAttr: Computed<"" | undefined>;
  setTriggerEl: (element: HTMLElement | null) => void;
};

const ContextMenuKey: InjectionKey<ContextMenuContext> = Symbol(
  "sinwan-ui.context-menu",
);

const ContextSubKey: InjectionKey<MenuSubApi> = Symbol("sinwan-ui.context-sub");

const ContextRadioKey: InjectionKey<ContextMenuRadioGroupContext> = Symbol(
  "sinwan-ui.context-radio",
);

/**
 * Context menu open state and pointer position without default styles.
 * Call from a root component; parts use `useContextMenu()`.
 */
export function useContextMenuRoot(props: ContextMenuProps): ContextMenuContext {
  const open = signal(false);
  const context: ContextMenuContext = {
    open,
    setOpen: (v: boolean) => {
      open.value = v;
      props.onOpenChange?.(v);
    },
    point: signal({ x: 0, y: 0 }),
  };
  provide(ContextMenuKey, context);
  return context;
}

/**
 * Inject the context menu context. Must be used under a root that called
 * `useContextMenuRoot` (or the default `<ContextMenu />`).
 */
export function useContextMenu(
  consumer = "useContextMenu",
): ContextMenuContext {
  const context = inject(ContextMenuKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <ContextMenu />`);
  }
  return context;
}

/**
 * `contextmenu` handler that records the pointer and opens the menu.
 */
export function useContextMenuTrigger(): (event: MouseEvent) => void {
  const menu = useContextMenu("ContextMenuTrigger");
  return (event) => {
    event.preventDefault();
    menu.point.value = { x: event.clientX, y: event.clientY };
    menu.setOpen(true);
  };
}

/**
 * Positions the menu layer at the pointer and dismisses it on an outside
 * pointerdown or Escape.
 */
export function useContextMenuContent(): ContextMenuContentReturn {
  const menu = useContextMenu("ContextMenuContent");
  const contentEl = signal<HTMLElement | null>(null);
  const { style, side } = usePointPosition({
    open: menu.open,
    point: menu.point,
    content: contentEl,
    fallbackSize: { width: 180, height: 200 },
  });

  onMounted(() => {
    function onDoc(e: MouseEvent) {
      if (!menu.open.value) return;
      if (isDismissExemptPointerTarget(e.target)) return;
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
    style,
    side,
    setContentEl: (element) => {
      contentEl.value = element;
    },
  };
}

/**
 * Item click handler: runs `onclick`, then closes the menu unless the event
 * was prevented or the item sits inside a submenu.
 */
export function useContextMenuItem(
  onclick?: (event: MouseEvent) => void,
): (event: MouseEvent) => void {
  const menu = useContextMenu("ContextMenuItem");
  return (event) => {
    onclick?.(event);
    if (event.defaultPrevented || isInsideMenuSubContent(event.currentTarget)) {
      return;
    }
    menu.setOpen(false);
  };
}

/**
 * Toggles a checkbox item from its live `checked` prop.
 */
export function useContextMenuCheckboxItem(
  props: ContextMenuCheckboxItemProps,
): () => void {
  return () => {
    if (props.disabled) return;
    props.onCheckedChange?.(!Boolean(props.checked));
  };
}

/**
 * Radio group value (controlled through `value` or local from
 * `defaultValue`). Items use `useContextMenuRadioGroup()`.
 */
export function useContextMenuRadioGroupRoot(
  props: ContextMenuRadioGroupProps,
): ContextMenuRadioGroupContext {
  const valueLocal = signal(props.defaultValue ?? "");
  const value =
    "value" in props ? computed(() => props.value ?? "") : valueLocal;
  const set = (next: string) => {
    if (!("value" in props)) valueLocal.value = next;
  };
  const context: ContextMenuRadioGroupContext = {
    value,
    setValue: (v: string) => {
      set(v);
      props.onValueChange?.(v);
    },
  };
  provide(ContextRadioKey, context);
  return context;
}

/**
 * Inject the radio group context. Must be used under a root that called
 * `useContextMenuRadioGroupRoot` (or the default `<ContextMenuRadioGroup />`).
 */
export function useContextMenuRadioGroup(
  consumer = "useContextMenuRadioGroup",
): ContextMenuRadioGroupContext {
  const context = inject(ContextRadioKey);
  if (!context) {
    throw new Error(
      `${consumer} must be used within a <ContextMenuRadioGroup />`,
    );
  }
  return context;
}

/**
 * Radio item selection against the group value.
 */
export function useContextMenuRadioItem(
  props: ContextMenuRadioItemProps,
): ContextMenuRadioItemReturn {
  const radio = useContextMenuRadioGroup("ContextMenuRadioItem");
  return {
    selected: computed(() => radio.value.value === props.value),
    select: () => {
      if (props.disabled) return;
      radio.setValue(props.value);
    },
  };
}

/**
 * Submenu open state (controlled through `open` or local from
 * `defaultOpen`). Closes when the enclosing menu or submenu closes. Parts use
 * `useContextMenuSub()`.
 */
export function useContextMenuSubRoot(props: ContextMenuSubProps): MenuSubApi {
  const parent = inject(ContextSubKey, null) ?? inject(ContextMenuKey, null);
  const sub = createMenuSubApi({
    controlled: "open" in props,
    defaultOpen: props.defaultOpen,
    readOpen: () => Boolean(props.open),
    onOpenChange: props.onOpenChange,
    parentOpen: parent ? () => parent.open.value : undefined,
  });
  provide(ContextSubKey, sub);
  return sub;
}

/**
 * Inject the submenu API. Must be used under a root that called
 * `useContextMenuSubRoot` (or the default `<ContextMenuSub />`).
 */
export function useContextMenuSub(consumer = "useContextMenuSub"): MenuSubApi {
  const context = inject(ContextSubKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <ContextMenuSub />`);
  }
  return context;
}

/**
 * Hover, click and ArrowRight open the submenu (a click never closes it);
 * also registers the anchor ref.
 */
export function useContextMenuSubTrigger(): ContextMenuSubTriggerReturn {
  const sub = useContextMenuSub("ContextMenuSubTrigger");
  return {
    ...createMenuSubTriggerHandlers(sub),
    openAttr: computed(() => (sub.open.value ? "" : undefined)),
    setTriggerEl: (element) => {
      sub.triggerEl.value = element;
    },
  };
}
