import {
  getRawProps,
  inject,
  onMounted,
  onUnmounted,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import { computed, signal, type Computed, type Signal } from "sinwan/reactivity";

export type MessageScrollerContext = {
  stickToBottom: Signal<boolean>;
  atBottom: Signal<boolean>;
  atTop: Signal<boolean>;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  viewportEl: Signal<HTMLElement | null>;
  contentEl: Signal<HTMLElement | null>;
};

export type MessageScrollerProviderProps = {
  children?: SinwanNode;
  initialStickToBottom?: boolean;
};

export type MessageScrollerViewportProps = JSX.IntrinsicElements["div"];

export type MessageScrollerDirection = "start" | "end";

type ScrollListener = (event: Event) => void;

function isScrollListener(value: unknown): value is ScrollListener {
  return typeof value === "function";
}

function isZeroArg(value: unknown): value is () => unknown {
  return typeof value === "function" && value.length === 0;
}

function currentScrollHandler(props: {
  onscroll?: MessageScrollerViewportProps["onscroll"];
}): ScrollListener | undefined {
  const raw: unknown = getRawProps(props).onscroll;
  if (isZeroArg(raw)) {
    const nested: unknown = raw();
    return isScrollListener(nested) ? nested : undefined;
  }
  return isScrollListener(raw) ? raw : undefined;
}

export type MessageScrollerViewportReturn = {
  viewportRef: (el: HTMLElement | null) => void;
  sentinelRef: (el: HTMLElement | null) => void;
  onScroll: (event: Event) => void;
};

export type MessageScrollerContentReturn = {
  contentRef: (el: HTMLElement | null) => void;
};

export type MessageScrollerButtonReturn = {
  active: Computed<boolean>;
  onClick: () => void;
};

const MessageScrollerKey: InjectionKey<MessageScrollerContext> = Symbol(
  "sinwan-ui.message-scroller",
);

const SCROLLER_EDGE_PX = 48;

function syncScrollerEdges(api: MessageScrollerContext): void {
  const el = api.viewportEl.value;
  if (!el) return;
  const overflow = el.scrollHeight - el.clientHeight;
  if (overflow <= 1) {
    api.atTop.value = true;
    api.atBottom.value = true;
    return;
  }
  api.atTop.value = el.scrollTop < SCROLLER_EDGE_PX;
  api.atBottom.value =
    overflow - el.scrollTop < SCROLLER_EDGE_PX;
  if (!api.atBottom.value) api.stickToBottom.value = false;
}

/**
 * Message scroller stick-to-bottom and edge state. Call from a provider
 * component; descendants use `useMessageScroller()`.
 */
export function useMessageScrollerRoot(
  props: MessageScrollerProviderProps,
): MessageScrollerContext {
  const stickToBottom = signal(props.initialStickToBottom ?? true);
  const atBottom = signal(true);
  const atTop = signal(true);
  const viewportEl = signal<HTMLElement | null>(null);
  const contentEl = signal<HTMLElement | null>(null);

  const api: MessageScrollerContext = {
    stickToBottom,
    atBottom,
    atTop,
    scrollToBottom: (behavior: ScrollBehavior = "smooth") => {
      const el = viewportEl.value;
      if (!el) return;
      stickToBottom.value = true;
      el.scrollTo({ top: el.scrollHeight, behavior });
      if (behavior !== "smooth") syncScrollerEdges(api);
    },
    viewportEl,
    contentEl,
  };

  provide(MessageScrollerKey, api);

  return api;
}

export function useMessageScroller(): MessageScrollerContext {
  const api = inject(MessageScrollerKey);
  if (!api) {
    throw new Error(
      "useMessageScroller must be used within MessageScrollerProvider",
    );
  }
  return api;
}

export function useMessageScrollerScrollable(): () => boolean {
  const api = useMessageScroller();
  return () => {
    const el = api.viewportEl.value;
    if (!el) return false;
    return el.scrollHeight > el.clientHeight + 1;
  };
}

export function useMessageScrollerVisibility(): () => boolean {
  const api = useMessageScroller();
  return () => !api.atBottom.value;
}

/**
 * Viewport wiring: registers the scroll element, pins or syncs edges on
 * mount, and tracks the bottom sentinel with an `IntersectionObserver`.
 */
export function useMessageScrollerViewport(
  props: { onscroll?: MessageScrollerViewportProps["onscroll"] },
): MessageScrollerViewportReturn {
  const api = useMessageScroller();
  let sentinel: HTMLElement | null = null;

  onMounted(() => {
    if (api.stickToBottom.value) {
      api.scrollToBottom("auto");
    } else {
      syncScrollerEdges(api);
    }

    const viewport = api.viewportEl.value;
    if (!viewport || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        api.atBottom.value = entry.isIntersecting;
        if (entry.isIntersecting) {
          api.stickToBottom.value = true;
        }
      },
      { root: viewport, threshold: 0.1 },
    );

    if (sentinel) observer.observe(sentinel);
    onUnmounted(() => observer.disconnect());
  });

  return {
    viewportRef: (el: HTMLElement | null) => {
      api.viewportEl.value = el;
    },
    sentinelRef: (el: HTMLElement | null) => {
      sentinel = el;
    },
    onScroll: (event: Event) => {
      syncScrollerEdges(api);
      currentScrollHandler(props)?.(event);
    },
  };
}

/**
 * Content wiring: registers the content element and re-pins or re-syncs
 * edges when its children change.
 */
export function useMessageScrollerContent(): MessageScrollerContentReturn {
  const api = useMessageScroller();

  onMounted(() => {
    const content = api.contentEl.value;
    if (!content || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      if (api.stickToBottom.value) {
        api.scrollToBottom("auto");
      } else {
        syncScrollerEdges(api);
      }
    });
    observer.observe(content, { childList: true, subtree: true });
    onUnmounted(() => observer.disconnect());
  });

  return {
    contentRef: (el: HTMLElement | null) => {
      api.contentEl.value = el;
    },
  };
}

/**
 * Jump control state. The end control is active off the bottom, the start
 * control off the top; `onClick` scrolls toward that edge.
 */
export function useMessageScrollerButton(
  props: { direction?: MessageScrollerDirection },
): MessageScrollerButtonReturn {
  const api = useMessageScroller();
  const edge = () => props.direction ?? "end";
  const active = computed(() =>
    edge() === "end" ? !api.atBottom.value : !api.atTop.value,
  );

  const onClick = () => {
    if (edge() === "end") {
      api.scrollToBottom("smooth");
      return;
    }
    const el = api.viewportEl.value;
    if (!el) return;
    api.stickToBottom.value = false;
    el.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { active, onClick };
}
