import {
  inject,
  onUnmounted,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import { computed, signal, type Computed, type Signal } from "sinwan/reactivity";

export type ResizableOrientation = "horizontal" | "vertical";

export type ResizablePanelState = {
  id: string;
  size: Signal<number>;
  minSize: number;
  maxSize: number;
  defaultSize: number;
  snap: boolean;
  collapsed: Signal<boolean>;
};

export type ResizableSizes = number[];

export type ResizableResizeHandler = (sizes: ResizableSizes) => void;

export type ResizablePanelRegistration = Omit<
  ResizablePanelState,
  "size" | "collapsed"
> & {
  size?: Signal<number>;
  collapsed?: Signal<boolean>;
};

export type ResizableResizeResult = { changed: boolean; collapsed: boolean };

export type ResizableGroupContext = {
  orientation: ResizableOrientation;
  panels: Signal<ResizablePanelState[]>;
  registerPanel: (panel: ResizablePanelRegistration) => {
    size: Signal<number>;
    collapsed: Signal<boolean>;
  };
  registerHandle: () => number;
  resizeFromHandle: (
    handleIndex: number,
    deltaPx: number,
    containerSize: number,
  ) => ResizableResizeResult;
  expandPanel: (panelId: string) => boolean;
  snapshotSizes: () => ResizableSizes;
  onResizeStart?: ResizableResizeHandler;
  onResize?: ResizableResizeHandler;
  onResizeEnd?: ResizableResizeHandler;
};

export type ResizablePanelGroupProps = {
  orientation?: ResizableOrientation;
  class?: string;
  children?: SinwanNode;
  id?: string;
  onResizeStart?: (startSize: ResizableSizes) => void;
  onResize?: (liveSize: ResizableSizes) => void;
  onResizeEnd?: (endSize: ResizableSizes) => void;
};

export type ResizablePanelGroupRootReturn = {
  orientation: ResizableOrientation;
  context: ResizableGroupContext;
};

export type ResizablePanelProps = {
  class?: string;
  children?: SinwanNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  snap?: boolean;
  id?: string;
};

export type ResizablePanelStyle = {
  flexBasis: string;
  flexGrow: number;
  flexShrink: number;
};

export type ResizablePanelReturn = {
  panelId: string;
  size: Signal<number>;
  collapsed: Signal<boolean>;
  dataSize: Computed<string>;
  dataCollapsed: Computed<"true" | undefined>;
  ariaHidden: Computed<true | undefined>;
  style: Computed<ResizablePanelStyle>;
  open: Computed<boolean>;
};

export type ResizableHandleProps = {
  class?: string;
  withHandle?: boolean;
  disabled?: boolean;
};

export type ResizableHandleStyle = { cursor: string };

export type ResizableHandleReturn = {
  orientation: ResizableOrientation;
  ariaOrientation: ResizableOrientation;
  seamInactive: Computed<boolean>;
  inactive: Computed<boolean>;
  collapsedSeam: Computed<"true" | undefined>;
  ariaDisabled: Computed<true | undefined>;
  tabIndex: Computed<number>;
  canResizeAcrossSeam: Computed<boolean>;
  resizeCursor: Computed<"true" | "false">;
  style: Computed<ResizableHandleStyle>;
  showStartExpand: Computed<boolean>;
  showEndExpand: Computed<boolean>;
  onPointerDown: (event: PointerEvent) => void;
  expandStart: (event: MouseEvent) => void;
  expandEnd: (event: MouseEvent) => void;
};

const ResizableGroupKey: InjectionKey<ResizableGroupContext> = Symbol(
  "sinwan-ui.resizable-group",
);

let panelSeq = 0;

function bySizeDescending(
  a: ResizablePanelState,
  b: ResizablePanelState,
): number {
  return b.size.value - a.size.value;
}

/** Walk from `start` until an open (non-collapsed) panel, or -1. */
function nearestOpenIndex(
  list: readonly ResizablePanelState[],
  start: number,
  direction: -1 | 1,
): number {
  let index = start;
  while (index >= 0 && index < list.length) {
    const panel = list[index];
    if (panel && !panel.collapsed.value) return index;
    index += direction;
  }
  return -1;
}

function isCollapsedAt(
  list: readonly ResizablePanelState[],
  index: number,
): boolean {
  return Boolean(list[index]?.collapsed.value);
}

function isSeamInactive(
  list: readonly ResizablePanelState[],
  handleIndex: number,
): boolean {
  const leftCollapsed = isCollapsedAt(list, handleIndex);
  const rightCollapsed = isCollapsedAt(list, handleIndex + 1);
  return (
    (leftCollapsed && rightCollapsed) ||
    // Hide the duplicate stacked handle behind a collapsed left when the
    // previous seam is still active (its left neighbor is open).
    (handleIndex > 0 &&
      leftCollapsed &&
      !rightCollapsed &&
      Boolean(list[handleIndex - 1]) &&
      !isCollapsedAt(list, handleIndex - 1))
  );
}

/**
 * Panel registry, resize math, and group context without default styles.
 * Call from a root group component; panels and handles use
 * `useResizableGroup()`.
 */
export function useResizablePanelGroupRoot(
  props: ResizablePanelGroupProps,
): ResizablePanelGroupRootReturn {
  const orientation = props.orientation ?? "horizontal";
  const panels = signal<ResizablePanelState[]>([]);
  let nextHandleIndex = 0;
  const snapshotSizes = (): ResizableSizes =>
    panels.value.map((panel) => panel.size.value);

  const registerPanel: ResizableGroupContext["registerPanel"] = (panel) => {
    const size = panel.size ?? signal(panel.defaultSize);
    const collapsed = panel.collapsed ?? signal(false);
    const state: ResizablePanelState = {
      id: panel.id,
      size,
      minSize: panel.minSize,
      maxSize: panel.maxSize,
      defaultSize: panel.defaultSize,
      snap: panel.snap,
      collapsed,
    };
    panels.value = [...panels.value, state];
    return { size, collapsed };
  };

  const registerHandle = (): number => {
    const index = nextHandleIndex;
    nextHandleIndex += 1;
    return index;
  };

  const collapsePanel = (
    panel: ResizablePanelState,
    donor: ResizablePanelState,
  ): void => {
    donor.collapsed.value = false;
    donor.size.value = donor.size.value + panel.size.value;
    panel.size.value = 0;
    panel.collapsed.value = true;
  };

  const expandPanel = (panelId: string): boolean => {
    const list = panels.value;
    const panel = list.find((candidate) => candidate.id === panelId);
    if (!panel || !panel.collapsed.value) return false;

    const donors = list
      .filter(
        (candidate) =>
          candidate.id !== panelId &&
          !candidate.collapsed.value &&
          candidate.size.value > 0,
      )
      .sort(bySizeDescending);
    if (donors.length === 0) return false;

    const target = Math.max(panel.minSize, panel.defaultSize);
    let got = 0;

    for (const donor of donors) {
      if (got >= target) break;
      const take = Math.min(target - got, donor.size.value);
      if (take <= 0) continue;
      donor.size.value -= take;
      got += take;
      if (donor.snap && donor.size.value <= 0) {
        donor.size.value = 0;
        donor.collapsed.value = true;
      }
    }

    panel.size.value = got;
    panel.collapsed.value = false;
    return true;
  };

  const resizeFromHandle = (
    handleIndex: number,
    deltaPx: number,
    containerSize: number,
  ): ResizableResizeResult => {
    const list = panels.value;
    // Skip collapsed neighbors so a fresh drag on the merged seam can still
    // resize the nearest open panes. Mid-gesture snap ends the drag session
    // in the handle so the user must click the seam again.
    const leftIndex = nearestOpenIndex(list, handleIndex, -1);
    const rightIndex = nearestOpenIndex(list, handleIndex + 1, 1);
    const left = leftIndex >= 0 ? list[leftIndex] : undefined;
    const right = rightIndex >= 0 ? list[rightIndex] : undefined;
    if (!left || !right || containerSize <= 0) {
      return { changed: false, collapsed: false };
    }

    const deltaPct = (deltaPx / containerSize) * 100;
    if (deltaPct === 0) return { changed: false, collapsed: false };

    if (left.snap && left.size.value <= left.minSize && deltaPct < 0) {
      collapsePanel(left, right);
      return { changed: true, collapsed: true };
    }
    if (right.snap && right.size.value <= right.minSize && deltaPct > 0) {
      collapsePanel(right, left);
      return { changed: true, collapsed: true };
    }

    let nextLeft = left.size.value + deltaPct;
    let nextRight = right.size.value - deltaPct;

    nextLeft = Math.min(left.maxSize, Math.max(left.minSize, nextLeft));
    nextRight = Math.min(right.maxSize, Math.max(right.minSize, nextRight));

    const appliedLeft = nextLeft - left.size.value;
    const appliedRight = right.size.value - nextRight;
    const applied = Math.min(Math.abs(appliedLeft), Math.abs(appliedRight));
    if (applied === 0) return { changed: false, collapsed: false };

    const dir = deltaPct >= 0 ? 1 : -1;
    left.size.value = left.size.value + dir * applied;
    right.size.value = right.size.value - dir * applied;
    return { changed: true, collapsed: false };
  };

  const context: ResizableGroupContext = {
    orientation,
    panels,
    registerPanel,
    registerHandle,
    resizeFromHandle,
    expandPanel,
    snapshotSizes,
    onResizeStart: props.onResizeStart,
    onResize: props.onResize,
    onResizeEnd: props.onResizeEnd,
  };
  provide(ResizableGroupKey, context);

  return { orientation, context };
}

/**
 * Inject the resizable group context. Must be used under a root that called
 * `useResizablePanelGroupRoot` (or the default `<ResizablePanelGroup />`).
 */
export function useResizableGroup(
  consumer = "useResizableGroup",
): ResizableGroupContext {
  const context = inject(ResizableGroupKey);
  if (!context) {
    throw new Error(`${consumer} must be used within ResizablePanelGroup`);
  }
  return context;
}

/** Register a panel with the group and expose its live size / collapse state. */
export function useResizablePanel(
  props: ResizablePanelProps,
): ResizablePanelReturn {
  const api = useResizableGroup("ResizablePanel");

  panelSeq += 1;
  const panelId = props.id ?? `panel-${panelSeq}`;
  const { size, collapsed } = api.registerPanel({
    id: panelId,
    defaultSize: props.defaultSize ?? 50,
    minSize: props.minSize ?? 10,
    maxSize: props.maxSize ?? 100,
    snap: props.snap ?? false,
  });

  return {
    panelId,
    size,
    collapsed,
    dataSize: computed(() => String(size.value)),
    dataCollapsed: computed(() => (collapsed.value ? "true" : undefined)),
    ariaHidden: computed(() => (collapsed.value ? true : undefined)),
    style: computed(() => ({
      flexBasis: `${size.value}%`,
      flexGrow: 0,
      flexShrink: 0,
    })),
    open: computed(() => !collapsed.value),
  };
}

/**
 * Seam state, drag gesture, and expand-grip actions for a handle between two
 * panels. Style the separator and grips yourself.
 */
export function useResizableHandle(
  props: ResizableHandleProps,
): ResizableHandleReturn {
  const api = useResizableGroup("ResizableHandle");
  const handleIndex = api.registerHandle();
  const orientation = api.orientation;
  let stopResize: (() => void) | null = null;

  // Neighbors register after this handle in JSX order and collapse later, so
  // seam flags must stay live rather than snapshot at setup.
  const leftCollapsed = computed(() =>
    isCollapsedAt(api.panels.value, handleIndex),
  );
  const rightCollapsed = computed(() =>
    isCollapsedAt(api.panels.value, handleIndex + 1),
  );
  const seamInactive = computed(() =>
    isSeamInactive(api.panels.value, handleIndex),
  );
  const inactive = computed(() => Boolean(props.disabled) || seamInactive.value);
  const showStartExpand = computed(
    () => !seamInactive.value && leftCollapsed.value && !rightCollapsed.value,
  );
  const showEndExpand = computed(
    () => !seamInactive.value && rightCollapsed.value && !leftCollapsed.value,
  );
  // Edge seams (collapsed run flush left/right with no open pane beyond) cannot
  // resize — only the expand grip works — so use a normal cursor there.
  // Middle seams with open panes on both sides keep the resize cursor.
  const canResizeAcrossSeam = computed(() => {
    const list = api.panels.value;
    if (isSeamInactive(list, handleIndex)) return false;
    return (
      nearestOpenIndex(list, handleIndex, -1) >= 0 &&
      nearestOpenIndex(list, handleIndex + 1, 1) >= 0
    );
  });
  const resizeCursorValue =
    orientation === "horizontal" ? "col-resize" : "row-resize";

  const expandAt = (panelIndex: number, event: MouseEvent): void => {
    const panel = api.panels.value[panelIndex];
    if (!panel) return;
    event.preventDefault();
    event.stopPropagation();
    api.expandPanel(panel.id);
    const sizes = api.snapshotSizes();
    api.onResize?.(sizes);
    api.onResizeEnd?.(sizes);
  };

  const onPointerDown = (event: PointerEvent): void => {
    // Inert collapsed-collapsed seams stay dead. An active seam with a
    // collapsed neighbor still resizes the nearest open panes; reopen is
    // grip-only (expand button click), never drag. Resolve open neighbors
    // at event time — panels after this handle are not registered yet at setup.
    if (inactive.value) return;
    const eventTarget = event.target;
    if (
      eventTarget instanceof Element &&
      eventTarget.closest('[data-slot="resizable-panel-expand"]')
    ) {
      return;
    }
    const list = api.panels.value;
    if (
      nearestOpenIndex(list, handleIndex, -1) < 0 ||
      nearestOpenIndex(list, handleIndex + 1, 1) < 0
    ) {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const group = target.parentElement;
    if (
      !group ||
      group.getAttribute("data-slot") !== "resizable-panel-group"
    ) {
      return;
    }

    stopResize?.();

    const start = orientation === "horizontal" ? event.clientX : event.clientY;
    const rect = group.getBoundingClientRect();
    const containerSize =
      orientation === "horizontal" ? rect.width : rect.height;
    const previousBodyCursor = document.body.style.cursor;
    const previousHtmlCursor = document.documentElement.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = resizeCursorValue;
    document.documentElement.style.cursor = resizeCursorValue;
    document.body.style.userSelect = "none";
    group.setAttribute("data-resizing", "");
    target.setAttribute("data-resizing", "");
    api.onResizeStart?.(api.snapshotSizes());

    let last = start;
    const onMoveRelative = (moveEvent: PointerEvent) => {
      const current =
        orientation === "horizontal" ? moveEvent.clientX : moveEvent.clientY;
      const result = api.resizeFromHandle(
        handleIndex,
        current - last,
        containerSize,
      );
      last = current;
      if (result.changed) {
        api.onResize?.(api.snapshotSizes());
      }
      // Snap ends this gesture: restore a normal cursor and require a fresh
      // click on the merged seam (or expand grip) before resizing again.
      if (result.collapsed) {
        onUp();
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMoveRelative);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = previousBodyCursor;
      document.documentElement.style.cursor = previousHtmlCursor;
      document.body.style.userSelect = previousUserSelect;
      group.removeAttribute("data-resizing");
      target.removeAttribute("data-resizing");
      stopResize = null;
      api.onResizeEnd?.(api.snapshotSizes());
    };

    stopResize = onUp;
    window.addEventListener("pointermove", onMoveRelative);
    window.addEventListener("pointerup", onUp);
  };

  onUnmounted(() => {
    stopResize?.();
  });

  return {
    orientation,
    ariaOrientation: orientation === "vertical" ? "horizontal" : "vertical",
    seamInactive,
    inactive,
    collapsedSeam: computed(() => (seamInactive.value ? "true" : undefined)),
    ariaDisabled: computed(() => (inactive.value ? true : undefined)),
    tabIndex: computed(() => (inactive.value ? -1 : 0)),
    canResizeAcrossSeam,
    resizeCursor: computed(() =>
      canResizeAcrossSeam.value ? "true" : "false",
    ),
    style: computed(() => ({
      cursor: canResizeAcrossSeam.value ? resizeCursorValue : "default",
    })),
    showStartExpand,
    showEndExpand,
    onPointerDown,
    expandStart: (event: MouseEvent) => expandAt(handleIndex, event),
    expandEnd: (event: MouseEvent) => expandAt(handleIndex + 1, event),
  };
}
