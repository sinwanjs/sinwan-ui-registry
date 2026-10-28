import {
  inject,
  onMounted,
  onUnmounted,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import { computed, signal, type Computed, type Signal } from "sinwan/reactivity";

export type ScrollOrientation = "vertical" | "horizontal";

export type ScrollAreaContext = {
  viewportEl: Signal<HTMLElement | null>;
};

export type ScrollAreaProps = {
  children?: SinwanNode;
  class?: string;
  viewportClass?: string;
};

export type ScrollBarProps = {
  class?: string;
  orientation?: ScrollOrientation;
};

export type ScrollAreaRootReturn = {
  class: Computed<string | undefined>;
  viewportClass: Computed<string | undefined>;
  children: Computed<SinwanNode | undefined>;
  viewportEl: Signal<HTMLElement | null>;
  viewportRef: (el: HTMLElement | null) => void;
};

export type ScrollBarReturn = {
  class: Computed<string | undefined>;
  orientation: Computed<ScrollOrientation>;
  vertical: Computed<boolean>;
  overflow: Signal<boolean>;
  scrolling: Signal<boolean>;
  offset: Signal<number>;
  size: Signal<number>;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  endDrag: () => void;
};

const ScrollAreaKey: InjectionKey<ScrollAreaContext> = Symbol(
  "sinwan-ui.scroll-area",
);

const OVERLAY_MIN_THUMB = 24;
const OVERLAY_TRACK_PAD = 4;
const OVERLAY_HIDE_MS = 700;

type OverlayThumbMetrics = {
  offset: number;
  size: number;
  overflow: boolean;
};

function overlayThumbMetrics(
  viewport: HTMLElement,
  orientation: ScrollOrientation,
): OverlayThumbMetrics {
  const vertical = orientation === "vertical";
  const client = vertical ? viewport.clientHeight : viewport.clientWidth;
  const scroll = vertical ? viewport.scrollHeight : viewport.scrollWidth;
  const pos = vertical ? viewport.scrollTop : viewport.scrollLeft;
  if (client <= 0 || scroll - client <= 1) {
    return { offset: 0, size: 0, overflow: false };
  }
  const track = Math.max(0, client - OVERLAY_TRACK_PAD);
  const size = Math.min(
    track,
    Math.max(OVERLAY_MIN_THUMB, (client / scroll) * track),
  );
  const maxOffset = Math.max(0, track - size);
  const maxScroll = scroll - client;
  const offset = maxOffset === 0 ? 0 : (pos / maxScroll) * maxOffset;
  return { offset, size, overflow: true };
}

function applyOverlayScroll(
  viewport: HTMLElement,
  orientation: ScrollOrientation,
  origin: number,
  pointerOrigin: number,
  pointer: number,
): void {
  const metrics = overlayThumbMetrics(viewport, orientation);
  if (!metrics.overflow) return;
  const vertical = orientation === "vertical";
  const client = vertical ? viewport.clientHeight : viewport.clientWidth;
  const scroll = vertical ? viewport.scrollHeight : viewport.scrollWidth;
  const maxOffset = Math.max(0, client - OVERLAY_TRACK_PAD - metrics.size);
  const maxScroll = scroll - client;
  if (maxOffset <= 0) return;
  const next = origin + ((pointer - pointerOrigin) / maxOffset) * maxScroll;
  if (vertical) viewport.scrollTop = next;
  else viewport.scrollLeft = next;
}

export function useScrollAreaRoot(
  props: ScrollAreaProps,
): ScrollAreaRootReturn {
  const viewportEl = signal<HTMLElement | null>(null);
  provide(ScrollAreaKey, { viewportEl });

  return {
    class: computed(() => props.class),
    viewportClass: computed(() => props.viewportClass),
    children: computed(() => props.children),
    viewportEl,
    viewportRef: (el) => {
      viewportEl.value = el;
    },
  };
}

export function useScrollBar(props: ScrollBarProps): ScrollBarReturn {
  const orientation = computed(() => props.orientation ?? "vertical");
  const vertical = computed(() => orientation.value === "vertical");
  const api = inject(ScrollAreaKey);
  const overflow = signal(false);
  const offset = signal(0);
  const size = signal(0);
  const scrolling = signal(false);
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let dragging = false;
  let dragOrigin = 0;
  let scrollOrigin = 0;

  const sync = (): void => {
    const viewport = api?.viewportEl.value;
    if (!viewport) {
      overflow.value = false;
      return;
    }
    const metrics = overlayThumbMetrics(viewport, orientation.value);
    overflow.value = metrics.overflow;
    offset.value = metrics.offset;
    size.value = metrics.size;
  };

  const markScrolling = (): void => {
    scrolling.value = true;
    if (hideTimer !== null) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      scrolling.value = false;
      hideTimer = null;
    }, OVERLAY_HIDE_MS);
  };

  onMounted(() => {
    sync();
    const viewport = api?.viewportEl.value;
    if (!viewport) return;

    const onScroll = (): void => {
      sync();
      markScrolling();
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            sync();
          });
    observer?.observe(viewport);
    const content = viewport.firstElementChild;
    if (content) observer?.observe(content);

    sync();

    onUnmounted(() => {
      viewport.removeEventListener("scroll", onScroll);
      observer?.disconnect();
      if (hideTimer !== null) clearTimeout(hideTimer);
    });
  });

  return {
    class: computed(() => props.class),
    orientation,
    vertical,
    overflow,
    scrolling,
    offset,
    size,
    onPointerDown: (event) => {
      const viewport = api?.viewportEl.value;
      if (!viewport || !overflow.value) return;
      dragging = true;
      dragOrigin = vertical.value ? event.clientY : event.clientX;
      scrollOrigin = vertical.value ? viewport.scrollTop : viewport.scrollLeft;
      const target = event.currentTarget as HTMLElement;
      if (typeof target.setPointerCapture === "function") {
        target.setPointerCapture(event.pointerId);
      }
      markScrolling();
      event.preventDefault();
    },
    onPointerMove: (event) => {
      if (!dragging) return;
      const viewport = api?.viewportEl.value;
      if (!viewport || !viewport.isConnected) return;
      applyOverlayScroll(
        viewport,
        orientation.value,
        scrollOrigin,
        dragOrigin,
        vertical.value ? event.clientY : event.clientX,
      );
      markScrolling();
    },
    endDrag: () => {
      dragging = false;
    },
  };
}
