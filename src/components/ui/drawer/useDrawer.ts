import { inject, onUnmounted } from "sinwan/component";
import { signal, type Signal } from "sinwan/reactivity";
import { DialogKey } from "sinwan-ui-core/overlay";

export type DrawerDirection = "top" | "bottom" | "left" | "right";

export type DrawerDragReturn = {
  isDragging: Signal<boolean>;
  onPointerDown: (event: PointerEvent) => void;
};

type DragAxis = {
  axis: "x" | "y";
  /** +1 when closing moves toward larger client coordinates. */
  sign: 1 | -1;
};

const DRAG_AXES: Record<DrawerDirection, DragAxis> = {
  bottom: { axis: "y", sign: 1 },
  top: { axis: "y", sign: -1 },
  right: { axis: "x", sign: 1 },
  left: { axis: "x", sign: -1 },
};

const CLOSE_DISTANCE_RATIO = 0.25;
const CLOSE_VELOCITY_PX_PER_MS = 0.4;
const VELOCITY_WINDOW_MS = 100;
const SNAP_BACK_MS = 200;
const SNAP_BACK_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

function resistedDistance(distance: number): number {
  if (distance >= 0) return distance;
  return -Math.sqrt(-distance) * 2;
}

function translate(axis: DragAxis["axis"], px: number): string {
  return axis === "x"
    ? `translate3d(${px}px, 0, 0)`
    : `translate3d(0, ${px}px, 0)`;
}

/**
 * Pointer drag on a drawer handle. Follows the pointer toward the drawer's
 * edge, closes past a quarter of the panel or on a flick, and otherwise
 * snaps back. A drag close points the exit animation off-screen so it
 * continues from the release position.
 */
export function useDrawerDrag(direction: DrawerDirection): DrawerDragReturn {
  const dialog = inject(DialogKey);
  if (!dialog) {
    throw new Error("useDrawerDrag must be used within a <Drawer />");
  }
  const { axis, sign } = DRAG_AXES[direction];
  const isDragging = signal(false);
  let stopDrag: (() => void) | null = null;
  let snapTimer: number | undefined;

  const clearSnapTimer = () => {
    if (snapTimer !== undefined) {
      window.clearTimeout(snapTimer);
      snapTimer = undefined;
    }
  };

  const clientAxis = (event: PointerEvent) =>
    axis === "x" ? event.clientX : event.clientY;

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const handle = event.currentTarget;
    const panel =
      handle instanceof Element
        ? handle.closest<HTMLElement>('[data-slot="drawer-content"]')
        : null;
    if (!panel) return;

    stopDrag?.();
    clearSnapTimer();
    const rect = panel.getBoundingClientRect();
    const size = axis === "x" ? rect.width : rect.height;
    const start = clientAxis(event);
    let distance = 0;
    let lastPos = start;
    let lastTime = performance.now();
    let velocity = 0;

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      isDragging.value = false;
      stopDrag = null;

      const recent = performance.now() - lastTime <= VELOCITY_WINDOW_MS;
      const flicked = recent && velocity >= CLOSE_VELOCITY_PX_PER_MS;
      const shouldClose =
        commit &&
        distance > 0 &&
        (distance >= size * CLOSE_DISTANCE_RATIO || flicked);
      if (shouldClose) {
        const offscreen = `max(100%, ${distance}px) + 1rem`;
        panel.style.setProperty(
          `--tw-exit-translate-${axis}`,
          sign > 0 ? `calc(${offscreen})` : `calc(-1 * (${offscreen}))`,
        );
        dialog.setOpen(false);
        return;
      }

      panel.style.transition = `transform ${SNAP_BACK_MS}ms ${SNAP_BACK_EASE}`;
      panel.style.transform = "";
      snapTimer = window.setTimeout(() => {
        snapTimer = undefined;
        panel.style.transition = "";
      }, SNAP_BACK_MS);
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.cancelable) moveEvent.preventDefault();
      const pos = clientAxis(moveEvent);
      const now = performance.now();
      if (now > lastTime) velocity = ((pos - lastPos) * sign) / (now - lastTime);
      lastPos = pos;
      lastTime = now;
      distance = (pos - start) * sign;
      panel.style.transform = translate(axis, resistedDistance(distance) * sign);
    };

    const onUp = () => finish(true);
    const onCancel = () => finish(false);

    stopDrag = () => finish(false);
    isDragging.value = true;
    panel.style.transition = "none";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  onUnmounted(() => {
    stopDrag?.();
    clearSnapTimer();
  });

  return { isDragging, onPointerDown };
}
