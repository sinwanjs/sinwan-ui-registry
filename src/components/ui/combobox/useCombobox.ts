import {
  inject,
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

import { PopoverKey } from "sinwan-ui-core/overlay";

export type ComboboxContext = {
  open: Signal<boolean> | Computed<boolean>;
  setOpen: (value: boolean) => void;
  value: Signal<string> | Computed<string>;
  setValue: (value: string, label?: string) => void;
  clearValue: (close: boolean) => void;
  label: Signal<string>;
  query: Signal<string>;
  setQuery: (value: string) => void;
  filtering: Signal<boolean>;
  matchCount: Signal<number>;
  setItemMatch: (id: symbol, matches: boolean) => void;
  clearItemMatch: (id: symbol) => void;
  multiple: boolean;
  values: Signal<string[]>;
  setValues: (values: string[]) => void;
};

export type ComboboxProps = {
  children?: SinwanNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiple?: boolean;
};

export type ComboboxRootReturn = {
  combobox: ComboboxContext;
  onPopoverOpenChange: (open: boolean) => void;
};

export type ComboboxTriggerReturn = {
  setAnchor: (element: HTMLElement | null) => void;
  toggle: () => void;
};

export type ComboboxInputReturn = ComboboxTriggerReturn & {
  display: Computed<string>;
  onInput: (event: Event) => void;
  onFocus: () => void;
};

export type ComboboxItemProps = {
  children?: SinwanNode;
  class?: string;
  value: string;
  disabled?: boolean;
};

export type ComboboxItemReturn = {
  selected: Computed<boolean>;
  matches: Computed<boolean>;
  select: (event: MouseEvent) => void;
};

const ComboboxKey: InjectionKey<ComboboxContext> = Symbol("sinwan-ui.combobox");

function itemValueText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function openIfClosed(combobox: ComboboxContext): void {
  if (!combobox.open.value) combobox.setOpen(true);
}

/**
 * Combobox value, query, open state, and match counting without default
 * styles. Call from a root combobox component; parts use `useCombobox()`.
 */
export function useComboboxRoot(props: ComboboxProps): ComboboxRootReturn {
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
  const label = signal("");
  const query = signal("");
  const filtering = signal(false);
  const values = signal<string[]>([]);
  const itemMatch = new Map<symbol, boolean>();
  const matchCount = signal(0);

  const recountMatches = () => {
    let next = 0;
    for (const hit of itemMatch.values()) {
      if (hit) next += 1;
    }
    matchCount.value = next;
  };

  const setOpen = (v: boolean) => {
    setOpenLocal(v);
    props.onOpenChange?.(v);
  };

  const combobox: ComboboxContext = {
    open,
    setOpen,
    value,
    setValue: (v: string, text?: string) => {
      setValueLocal(v);
      if (text !== undefined) label.value = text;
      query.value = "";
      filtering.value = false;
      props.onValueChange?.(v);
      setOpenLocal(false);
      props.onOpenChange?.(false);
    },
    clearValue: (close: boolean) => {
      setValueLocal("");
      label.value = "";
      query.value = "";
      filtering.value = !close;
      props.onValueChange?.("");
      if (close) {
        setOpenLocal(false);
        props.onOpenChange?.(false);
      }
    },
    label,
    query,
    setQuery: (v: string) => {
      query.value = v;
    },
    filtering,
    matchCount,
    setItemMatch: (id, matches) => {
      if (itemMatch.get(id) === matches) return;
      itemMatch.set(id, matches);
      recountMatches();
    },
    clearItemMatch: (id) => {
      itemMatch.delete(id);
      recountMatches();
    },
    multiple: props.multiple ?? false,
    values,
    setValues: (next) => {
      values.value = next;
    },
  };

  provide(ComboboxKey, combobox);

  return {
    combobox,
    onPopoverOpenChange: setOpen,
  };
}

/**
 * Inject the combobox context. Must be used under a root that called
 * `useComboboxRoot` (or the default `<Combobox />`).
 */
export function useCombobox(consumer = "useCombobox"): ComboboxContext {
  const context = inject(ComboboxKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <Combobox />`);
  }
  return context;
}

/**
 * Ref callback that anchors the combobox popover to an element.
 */
export function useComboboxPopoverAnchor(): (element: HTMLElement | null) => void {
  const popover = inject(PopoverKey);
  return (element) => {
    if (popover) popover.triggerEl.value = element;
  };
}

/**
 * Anchors the popover to an element and toggles the combobox open state;
 * the popover follows it.
 */
export function useComboboxTrigger(): ComboboxTriggerReturn {
  const combobox = useCombobox("ComboboxTrigger");
  return {
    setAnchor: useComboboxPopoverAnchor(),
    toggle: () => combobox.setOpen(!combobox.open.value),
  };
}

/**
 * Text input behavior: shows the query while filtering, otherwise the
 * selected label. Emptying the input clears the selection and stays open.
 */
export function useComboboxInput(
  oninput?: (event: Event) => void,
): ComboboxInputReturn {
  const combobox = useCombobox("ComboboxInput");
  const trigger = useComboboxTrigger();
  const open = () => openIfClosed(combobox);
  return {
    ...trigger,
    display: computed(() =>
      combobox.filtering.value
        ? combobox.query.value
        : combobox.label.value || combobox.value.value,
    ),
    onInput: (event) => {
      const next = (event.target as HTMLInputElement).value;
      combobox.filtering.value = true;
      combobox.setQuery(next);
      if (next === "") combobox.clearValue(false);
      open();
      oninput?.(event);
    },
    onFocus: open,
  };
}

/**
 * Item selection and filter match. Registers its match state so
 * `ComboboxEmpty` knows when nothing matches.
 */
export function useComboboxItem(props: ComboboxItemProps): ComboboxItemReturn {
  const combobox = useCombobox("ComboboxItem");
  const itemId = Symbol();
  const selected = computed(() => {
    const value = itemValueText(props.value);
    return combobox.multiple
      ? combobox.values.value.includes(value)
      : combobox.value.value === value;
  });
  const matches = computed(() => {
    const q = combobox.query.value.trim().toLowerCase();
    if (!q) return true;
    return itemValueText(props.value).toLowerCase().includes(q);
  });
  effect(() => {
    combobox.setItemMatch(itemId, matches.value);
  });
  onUnmounted(() => {
    combobox.clearItemMatch(itemId);
  });
  return {
    selected,
    matches,
    select: (event) => {
      const value = itemValueText(props.value);
      const text = (event.currentTarget as HTMLElement).innerText.trim();
      if (combobox.multiple) {
        const next = selected.value
          ? combobox.values.value.filter((v) => v !== value)
          : [...combobox.values.value, value];
        combobox.setValues(next);
      } else {
        combobox.setValue(value, text);
      }
    },
  };
}

/**
 * Removes one value from a multiple combobox.
 */
export function useComboboxChip(value: string | undefined): () => void {
  const combobox = useCombobox("ComboboxChip");
  return () => {
    if (!value) return;
    combobox.setValues(combobox.values.value.filter((v) => v !== value));
  };
}

/**
 * Query input inside the chips row. Typing filters and opens the list.
 */
export function useComboboxChipsInput(
  oninput?: (event: Event) => void,
): (event: Event) => void {
  const combobox = useCombobox("ComboboxChipsInput");
  return (event) => {
    const next = (event.target as HTMLInputElement).value;
    combobox.setQuery(next);
    openIfClosed(combobox);
    oninput?.(event);
  };
}

export function useComboboxAnchor(): Signal<HTMLElement | null> {
  return signal<HTMLElement | null>(null);
}
