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

export type CommandContext = {
  query: Signal<string>;
  setQuery: (value: string) => void;
  matchCount: Signal<number>;
  setItemMatch: (id: symbol, matches: boolean) => void;
  clearItemMatch: (id: symbol) => void;
};

export type CommandItemProps = {
  children?: SinwanNode;
  class?: string;
  value?: string;
  keywords?: string[];
  disabled?: boolean;
  checked?: boolean;
  onclick?: (e: MouseEvent) => void;
};

export type CommandItemReturn = {
  matches: Computed<boolean>;
};

const CommandKey: InjectionKey<CommandContext> = Symbol("sinwan-ui.command");

function itemValueText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Command query and match counting without default styles. Call from a root
 * command component; parts use `useCommand()`.
 */
export function useCommandRoot(): CommandContext {
  const query = signal("");
  const itemMatch = new Map<symbol, boolean>();
  const matchCount = signal(0);

  const recountMatches = () => {
    let next = 0;
    for (const hit of itemMatch.values()) {
      if (hit) next += 1;
    }
    matchCount.value = next;
  };

  const command: CommandContext = {
    query,
    setQuery: (v) => {
      query.value = v;
    },
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
  };

  provide(CommandKey, command);
  return command;
}

/**
 * Inject the command context. Must be used under a root that called
 * `useCommandRoot` (or the default `<Command />`).
 */
export function useCommand(consumer = "useCommand"): CommandContext {
  const context = inject(CommandKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <Command />`);
  }
  return context;
}

/**
 * Input handler that updates the command query, then calls `oninput`.
 */
export function useCommandInput(
  oninput?: (event: Event) => void,
): (event: Event) => void {
  const command = useCommand("CommandInput");
  return (event) => {
    const next = (event.target as HTMLInputElement).value;
    command.setQuery(next);
    oninput?.(event);
  };
}

/**
 * Item filter match against `value` and `keywords`. Registers its match state
 * so `CommandEmpty` knows when nothing matches.
 */
export function useCommandItem(props: CommandItemProps): CommandItemReturn {
  const command = useCommand("CommandItem");
  const itemId = Symbol();
  const matches = computed(() => {
    const q = command.query.value.trim().toLowerCase();
    if (!q) return true;
    const keywords = Array.isArray(props.keywords) ? props.keywords : [];
    const hay = [itemValueText(props.value), ...keywords]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
  effect(() => {
    command.setItemMatch(itemId, matches.value);
  });
  onUnmounted(() => {
    command.clearItemMatch(itemId);
  });
  return { matches };
}
