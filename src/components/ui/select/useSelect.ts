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
  untrack,
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

export type SelectContext = {
  open: Signal<boolean> | Computed<boolean>;
  setOpen: (value: boolean) => void;
  value: Signal<string> | Computed<string>;
  setValue: (value: string, label?: string) => void;
  label: Computed<string>;
  registerItem: (value: string, label: string) => void;
  placeholder: string;
  triggerEl: Signal<HTMLElement | null>;
  contentEl: Signal<HTMLElement | null>;
  viewportEl: Signal<HTMLElement | null>;
  canScrollUp: Signal<boolean>;
  canScrollDown: Signal<boolean>;
};

export type SelectProps = {
  children?: SinwanNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
};

export type SelectValueReturn = {
  empty: Computed<boolean>;
  text: Computed<string>;
};

export type SelectTriggerReturn = {
  open: Signal<boolean> | Computed<boolean>;
  toggle: () => void;
  setTrigger: (element: HTMLElement | null) => void;
};

export type SelectContentOptions = {
  align?: Align;
};

export type SelectContentReturn = {
  open: Signal<boolean> | Computed<boolean>;
  state: Computed<"open" | "closed">;
  side: Signal<Placement>;
  style: Signal<FloatingStyle>;
  setContent: (element: HTMLElement | null) => void;
  bindViewport: (element: HTMLElement | null) => void;
  onPointerDown: (event: PointerEvent) => void;
  closedItemsHost: () => HTMLElement;
};

export type SelectItemProps = {
  children?: SinwanNode;
  class?: string;
  value: string;
  disabled?: boolean;
};

export type SelectItemReturn = {
  selected: Computed<boolean>;
  select: (event: MouseEvent) => void;
  setItem: (element: HTMLElement | null) => void;
};

export type SelectScrollDirection = "up" | "down";

const SELECT_SCROLL_PX = 8;

let selectAutoScrollFrame = 0;
let selectAutoScrollApi: SelectContext | null = null;
let selectAutoScrollDirection: 1 | -1 = 1;

function selectContentMinWidth(anchor: DOMRect): Record<string, string> {
  return { minWidth: `${anchor.width}px` };
}

function stopSelectAutoScroll(): void {
  if (selectAutoScrollFrame === 0) return;
  cancelAnimationFrame(selectAutoScrollFrame);
  selectAutoScrollFrame = 0;
}

function stepSelectAutoScroll(): void {
  const api = selectAutoScrollApi;
  const viewport = api?.viewportEl.value;
  if (!api || !viewport) {
    stopSelectAutoScroll();
    return;
  }
  viewport.scrollTop += selectAutoScrollDirection * SELECT_SCROLL_PX;
  selectAutoScrollFrame = requestAnimationFrame(stepSelectAutoScroll);
}

function endSelectAutoScroll(): void {
  stopSelectAutoScroll();
  window.removeEventListener("pointerup", endSelectAutoScroll);
  window.removeEventListener("pointercancel", endSelectAutoScroll);
}

function startSelectAutoScroll(api: SelectContext, direction: 1 | -1): void {
  stopSelectAutoScroll();
  selectAutoScrollApi = api;
  selectAutoScrollDirection = direction;
  selectAutoScrollFrame = requestAnimationFrame(stepSelectAutoScroll);
  window.addEventListener("pointerup", endSelectAutoScroll);
  window.addEventListener("pointercancel", endSelectAutoScroll);
}

function holdSelectScroll(
  event: PointerEvent,
  api: SelectContext,
  direction: 1 | -1,
): void {
  event.preventDefault();
  startSelectAutoScroll(api, direction);
}

function holdSelectScrollFromTarget(event: PointerEvent, api: SelectContext): void {
  for (const node of event.composedPath()) {
    if (!(node instanceof Element)) continue;
    const slot = node.getAttribute("data-slot");
    const shown = node.getAttribute("data-state") === "visible";
    if (slot === "select-scroll-up-button") {
      if (shown) holdSelectScroll(event, api, -1);
      return;
    }
    if (slot === "select-scroll-down-button") {
      if (shown) holdSelectScroll(event, api, 1);
      return;
    }
  }
}

function syncSelectViewportScroll(api: SelectContext, viewport: HTMLElement | null): void {
  if (!viewport) {
    api.canScrollUp.value = false;
    api.canScrollDown.value = false;
    return;
  }
  const max = viewport.scrollHeight - viewport.clientHeight;
  api.canScrollUp.value = viewport.scrollTop > 1;
  api.canScrollDown.value = max > 1 && viewport.scrollTop < max - 1;
}

const SelectKey: InjectionKey<SelectContext> = Symbol("sinwan-ui.select");

/**
 * Select open state, value, label, and element refs without default styles.
 * Call from a root select component; parts use `useSelect()`.
 */
export function useSelectRoot(props: SelectProps): SelectContext {
  const openLocal = signal(props.defaultOpen ?? false);
  const open =
    "open" in props ? computed(() => Boolean(props.open)) : openLocal;
  const setOpenLocal = (next: boolean) => {
    if (!("open" in props)) openLocal.value = next;
  };
  const valueLocal = signal(props.defaultValue ?? "");
  const value =
    "value" in props ? computed(() => props.value ?? "") : valueLocal;
  const setValueLocal = (next: string) => {
    if (!("value" in props)) valueLocal.value = next;
  };
  const itemLabels = signal<ReadonlyMap<string, string>>(new Map());
  const registerItem = (itemValue: string, text: string) => {
    const current = untrack(() => itemLabels.value);
    if (current.get(itemValue) === text) return;
    itemLabels.value = new Map(current).set(itemValue, text);
  };

  const select: SelectContext = {
    open,
    setOpen: (v: boolean) => {
      setOpenLocal(v);
      props.onOpenChange?.(v);
    },
    value,
    setValue: (v: string, text?: string) => {
      if (text !== undefined) registerItem(v, text);
      setValueLocal(v);
      props.onValueChange?.(v);
      setOpenLocal(false);
      props.onOpenChange?.(false);
    },
    label: computed(() => itemLabels.value.get(value.value) ?? ""),
    registerItem,
    placeholder: props.placeholder ?? "",
    triggerEl: signal<HTMLElement | null>(null),
    contentEl: signal<HTMLElement | null>(null),
    viewportEl: signal<HTMLElement | null>(null),
    canScrollUp: signal(false),
    canScrollDown: signal(false),
  };

  provide(SelectKey, select);

  return select;
}

/**
 * Inject the select context. Must be used under a root that called
 * `useSelectRoot` (or the default `<Select />`).
 */
export function useSelect(consumer = "useSelect"): SelectContext {
  const context = inject(SelectKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <Select />`);
  }
  return context;
}

/**
 * Selected label, falling back to the part placeholder, then the root
 * placeholder.
 */
export function useSelectValue(placeholder?: string): SelectValueReturn {
  const select = useSelect("SelectValue");
  return {
    empty: computed(() => !select.value.value),
    text: computed(
      () => select.label.value || placeholder || select.placeholder || "",
    ),
  };
}

/**
 * Toggles the list and registers the trigger as the positioning anchor.
 */
export function useSelectTrigger(): SelectTriggerReturn {
  const select = useSelect("SelectTrigger");
  return {
    open: select.open,
    toggle: () => select.setOpen(!select.open.value),
    setTrigger: (element) => {
      select.triggerEl.value = element;
    },
  };
}

/**
 * Anchored list behavior: positioning, keyboard navigation, outside dismiss,
 * viewport scroll tracking, and hold-to-scroll on the chevrons.
 *
 * `closedItemsHost` is a detached container: render the items into it while
 * the list is closed so their labels register and `SelectValue` can show the
 * selected label before the first open.
 */
export function useSelectContent(
  options: SelectContentOptions = {},
): SelectContentReturn {
  const select = useSelect("SelectContent");
  let viewportNode: HTMLElement | null = null;
  let viewportObserver: ResizeObserver | null = null;
  let closedItemsHost: HTMLElement | null = null;
  const { style, side } = useAnchorPosition({
    open: select.open,
    trigger: select.triggerEl,
    content: select.contentEl,
    placement: "bottom",
    align: options.align ?? "center",
    gap: 4,
    fallbackSize: { width: 144, height: 200 },
    extra: selectContentMinWidth,
  });
  const onViewportScroll = () => {
    syncSelectViewportScroll(select, viewportNode);
  };
  const unbindViewport = () => {
    if (viewportNode) {
      viewportNode.removeEventListener("scroll", onViewportScroll);
    }
    viewportObserver?.disconnect();
    viewportObserver = null;
    viewportNode = null;
  };
  const bindViewport = (el: HTMLElement | null) => {
    unbindViewport();
    select.viewportEl.value = el;
    if (!el) {
      syncSelectViewportScroll(select, null);
      stepSelectAutoScroll();
      return;
    }
    viewportNode = el;
    el.addEventListener("scroll", onViewportScroll, { passive: true });
    viewportObserver = new ResizeObserver(onViewportScroll);
    viewportObserver.observe(el);
    const inner = el.firstElementChild;
    if (inner) viewportObserver.observe(inner);
    syncSelectViewportScroll(select, el);
    requestAnimationFrame(onViewportScroll);
  };

  onMounted(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!select.open.value) return;
      const root = select.contentEl.value;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('[data-slot="select-item"]'),
      ).filter((el) => el.getAttribute("data-disabled") !== "true");
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = items.findIndex((el) => el === active);
      if (e.key === "Escape") {
        e.preventDefault();
        select.setOpen(false);
        select.triggerEl.value?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[Math.min(idx + 1, items.length - 1)] ?? items[0]!;
        next.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = items[Math.max(idx - 1, 0)] ?? items[items.length - 1]!;
        prev.focus();
      } else if (e.key === "Enter" && active?.dataset.slot === "select-item") {
        e.preventDefault();
        active.click();
      }
    };

    const onDoc = (e: MouseEvent) => {
      if (!select.open.value) return;
      const t = e.target;
      if (
        (t instanceof Node && select.triggerEl.value?.contains(t)) ||
        (t instanceof Node && select.contentEl.value?.contains(t)) ||
        isDismissExemptPointerTarget(t)
      ) {
        return;
      }
      select.setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDoc);
    onUnmounted(() => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDoc);
      unbindViewport();
      stopSelectAutoScroll();
    });
  });

  return {
    open: select.open,
    state: computed(() => (select.open.value ? "open" : "closed")),
    side,
    style,
    setContent: (element) => {
      select.contentEl.value = element;
    },
    bindViewport,
    onPointerDown: (event) => {
      holdSelectScrollFromTarget(event, select);
    },
    closedItemsHost: () => (closedItemsHost ??= document.createElement("div")),
  };
}

function selectItemLabel(element: HTMLElement): string {
  return (element.textContent ?? "").trim();
}

/**
 * Item selected state, pick handler, and label registration. Reads
 * `props.value` on each access so compiler-wrapped mapped values resolve to
 * strings.
 */
export function useSelectItem(props: SelectItemProps): SelectItemReturn {
  const select = useSelect("SelectItem");
  let itemEl: HTMLElement | null = null;

  onMounted(() => {
    if (itemEl) select.registerItem(props.value, selectItemLabel(itemEl));
  });

  return {
    selected: computed(() => select.value.value === props.value),
    select: (event) => {
      const target = event.currentTarget;
      select.setValue(
        props.value,
        target instanceof HTMLElement ? selectItemLabel(target) : undefined,
      );
    },
    setItem: (element) => {
      itemEl = element;
    },
  };
}

/**
 * Visibility of one scroll chevron; true while the viewport can scroll that way.
 */
export function useSelectScrollButton(
  direction: SelectScrollDirection,
): Signal<boolean> {
  const select = useSelect(
    direction === "up" ? "SelectScrollUpButton" : "SelectScrollDownButton",
  );
  return direction === "up" ? select.canScrollUp : select.canScrollDown;
}
