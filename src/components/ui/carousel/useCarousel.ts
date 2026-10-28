import {
  inject,
  onUnmounted,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import { computed, signal, type Computed, type Signal } from "sinwan/reactivity";

export type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  index: Signal<number>;
  canScrollPrev: Computed<boolean>;
  canScrollNext: Computed<boolean>;
};

export type CarouselContext = {
  orientation: "horizontal" | "vertical";
  index: Signal<number>;
  slideCount: Signal<number>;
  registerSlide: () => number;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: Computed<boolean>;
  canScrollNext: Computed<boolean>;
};

export type CarouselProps = {
  orientation?: "horizontal" | "vertical";
  class?: string;
  children?: SinwanNode;
  setApi?: (api: CarouselApi) => void;
  opts?: { startIndex?: number; loop?: boolean };
};

export type CarouselRootReturn = {
  orientation: "horizontal" | "vertical";
  class: string | undefined;
  children: SinwanNode | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  api: CarouselApi;
};

export type CarouselSwipeReturn = {
  orientation: "horizontal" | "vertical";
  index: Signal<number>;
  dragOffset: Signal<number>;
  isDragging: Signal<boolean>;
  onPointerDown: (event: PointerEvent) => void;
  trackTransform: () => string;
};

const CarouselKey: InjectionKey<CarouselContext> = Symbol("sinwan-ui.carousel");

const SWIPE_LOCK_PX = 8;
const SWIPE_COMMIT_PX = 48;
const SWIPE_EDGE_RESIST = 0.35;

function pointerClientPoint(
  event: Event,
): { clientX: number; clientY: number } | null {
  if (!("clientX" in event) || !("clientY" in event)) return null;
  const point = event as { clientX: number; clientY: number };
  return { clientX: point.clientX, clientY: point.clientY };
}

function swipeAxis(
  point: { clientX: number; clientY: number },
  orientation: "horizontal" | "vertical",
): { main: number; cross: number } {
  return orientation === "horizontal"
    ? { main: point.clientX, cross: point.clientY }
    : { main: point.clientY, cross: point.clientX };
}

function resistedSwipeDelta(
  raw: number,
  canScrollPrev: boolean,
  canScrollNext: boolean,
): number {
  if (raw > 0 && !canScrollPrev) return raw * SWIPE_EDGE_RESIST;
  if (raw < 0 && !canScrollNext) return raw * SWIPE_EDGE_RESIST;
  return raw;
}

/**
 * Carousel selection, navigation, and context without default styles.
 * Call from a root carousel component; children use `useCarousel()`.
 */
export function useCarouselRoot(props: CarouselProps): CarouselRootReturn {
  const orientation = props.orientation ?? "horizontal";
  const index = signal(props.opts?.startIndex ?? 0);
  const slideCount = signal(0);
  const loop = props.opts?.loop ?? false;
  let slideSeq = 0;

  const canScrollPrev = computed(() => loop || index.value > 0);
  const canScrollNext = computed(
    () => loop || index.value < slideCount.value - 1,
  );

  const scrollTo = (next: number) => {
    const count = slideCount.value;
    if (count <= 0) return;
    if (loop) {
      index.value = ((next % count) + count) % count;
      return;
    }
    index.value = Math.min(count - 1, Math.max(0, next));
  };

  const scrollPrev = () => scrollTo(index.value - 1);
  const scrollNext = () => scrollTo(index.value + 1);

  const registerSlide = () => {
    const current = slideSeq;
    slideSeq += 1;
    slideCount.value = slideSeq;
    return current;
  };

  const api: CarouselApi = {
    scrollPrev,
    scrollNext,
    scrollTo,
    index,
    canScrollPrev,
    canScrollNext,
  };
  props.setApi?.(api);

  provide(CarouselKey, {
    orientation,
    index,
    slideCount,
    registerSlide,
    scrollPrev,
    scrollNext,
    scrollTo,
    canScrollPrev,
    canScrollNext,
  });

  void computed(() => index.value);

  return {
    orientation,
    class: props.class,
    children: props.children,
    scrollPrev,
    scrollNext,
    api,
  };
}

/**
 * Inject the carousel context. Must be used under a root that called
 * `useCarouselRoot` (or the default `<Carousel />`).
 */
export function useCarousel(): CarouselContext {
  const context = inject(CarouselKey);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

/**
 * Pointer swipe / drag behavior for a carousel track. Style the viewport
 * and track yourself; this owns drag offset and slide commit.
 */
export function useCarouselSwipe(): CarouselSwipeReturn {
  const {
    orientation,
    index,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
  } = useCarousel();
  const dragOffset = signal(0);
  const isDragging = signal(false);
  let stopSwipe: (() => void) | null = null;

  const onPointerDown = (event: PointerEvent) => {
    if ("button" in event && event.button !== 0) return;
    const startPoint = pointerClientPoint(event);
    if (!startPoint) return;
    const start = swipeAxis(startPoint, orientation);
    let locked: boolean | null = null;
    let rawDelta = 0;

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      if (commit && locked && Math.abs(rawDelta) >= SWIPE_COMMIT_PX) {
        if (rawDelta < 0) {
          if (canScrollNext.value) scrollNext();
        } else if (canScrollPrev.value) {
          scrollPrev();
        }
      }
      dragOffset.value = 0;
      isDragging.value = false;
      stopSwipe = null;
    };

    const onMove = (moveEvent: Event) => {
      const point = pointerClientPoint(moveEvent);
      if (!point) return;
      const pos = swipeAxis(point, orientation);
      const dMain = pos.main - start.main;
      const dCross = pos.cross - start.cross;
      if (locked === null) {
        if (
          Math.abs(dMain) < SWIPE_LOCK_PX &&
          Math.abs(dCross) < SWIPE_LOCK_PX
        ) {
          return;
        }
        locked = Math.abs(dMain) >= Math.abs(dCross);
        if (!locked) return;
        isDragging.value = true;
      }
      if (!locked) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      rawDelta = dMain;
      dragOffset.value = resistedSwipeDelta(
        dMain,
        canScrollPrev.value,
        canScrollNext.value,
      );
    };

    const onUp = () => finish(true);
    const onCancel = () => finish(false);

    stopSwipe?.();
    stopSwipe = () => finish(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  onUnmounted(() => {
    stopSwipe?.();
  });

  const trackTransform = () => {
    const base = `${-index.value * 100}%`;
    const offset = dragOffset.value;
    if (offset === 0) return base;
    return `calc(${base} + ${offset}px)`;
  };

  return {
    orientation,
    index,
    dragOffset,
    isDragging,
    onPointerDown,
    trackTransform,
  };
}
