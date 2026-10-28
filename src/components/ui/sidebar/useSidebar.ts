import {
  getRawProps,
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
  resolve,
  signal,
  untrack,
  type Computed,
  type Signal,
} from "sinwan/reactivity";

import { useIsMobile } from "../../../hooks/use-mobile";
import { DialogKey } from "sinwan-ui-core/overlay";
import type { ButtonProps } from "../button";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export type SidebarState = "expanded" | "collapsed";

export type SidebarContext = {
  state: () => SidebarState;
  open: Signal<boolean>;
  setOpen: (open: boolean) => void;
  openMobile: Signal<boolean>;
  setOpenMobile: (open: boolean) => void;
  isMobile: () => boolean;
  toggleSidebar: () => void;
};

export type SidebarProviderProps = JSX.IntrinsicElements["div"] & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: SinwanNode;
};

export type SidebarRootReturn = {
  context: SidebarContext;
  style: Computed<Record<string, unknown>>;
  rest: Omit<
    SidebarProviderProps,
    "defaultOpen" | "open" | "onOpenChange" | "class" | "style" | "children"
  >;
};

export type SidebarTriggerProps = ButtonProps;

export type SidebarTriggerReturn = {
  rest: Omit<SidebarTriggerProps, "class" | "onclick" | "children">;
  onClick: NonNullable<SidebarTriggerProps["onclick"]>;
};

export type SidebarMenuButtonTooltip =
  | string
  | { children?: SinwanNode; class?: string };

export type SidebarMenuButtonOptions = {
  isActive?: boolean;
  tooltip?: SidebarMenuButtonTooltip;
};

export type SidebarMenuButtonReturn = {
  active: Computed<boolean>;
  tooltip: { children?: SinwanNode; class?: string } | null;
  tooltipVisible: Computed<boolean>;
};

export type SidebarSheetSyncProps = { open: boolean };

export type SidebarMenuSkeletonReturn = {
  style: Record<string, string>;
};

const SidebarKey: InjectionKey<SidebarContext> = Symbol("sinwan-ui.sidebar");

function persistSidebarOpen(open: boolean): void {
  try {
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(SIDEBAR_COOKIE_NAME, String(open));
  } catch {
    /* ignore */
  }
}

function readPersistedOpen(fallback: boolean): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_COOKIE_NAME);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    /* ignore */
  }
  return fallback;
}

/**
 * Sidebar open state, persistence, keyboard shortcut, and context without
 * default styles. Call from a provider component; children use `useSidebar()`.
 */
export function useSidebarRoot(props: SidebarProviderProps): SidebarRootReturn {
  const {
    defaultOpen: _defaultOpen,
    open: _openProp,
    onOpenChange: _onOpenChange,
    class: _className,
    style: _style,
    children: _children,
    ...rest
  } = getRawProps(props);

  const isMobile = useIsMobile();
  const openMobile = signal(false);
  const _open = signal(props.open ?? readPersistedOpen(props.defaultOpen ?? true));
  if (props.open !== undefined) _open.value = props.open;

  const setOpen = (value: boolean) => {
    // Uncontrolled: always update the internal signal. Controlled (`open` set):
    // the parent owns state via onOpenChange; do not write _open here.
    if (props.open === undefined) {
      _open.value = value;
    }
    props.onOpenChange?.(value);
    persistSidebarOpen(value);
  };

  const setOpenMobile = (value: boolean) => {
    openMobile.value = value;
  };

  const toggleSidebar = () => {
    if (isMobile()) {
      setOpenMobile(!openMobile.value);
    } else {
      setOpen(!(props.open !== undefined ? props.open : _open.value));
    }
  };

  const parentSidebar = inject<SidebarContext | undefined>(SidebarKey, undefined);

  onMounted(() => {
    if (parentSidebar) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    onUnmounted(() => window.removeEventListener("keydown", handleKeyDown));
  });

  const context: SidebarContext = {
    state: () =>
      (props.open !== undefined ? props.open : _open.value)
        ? "expanded"
        : "collapsed",
    open: _open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  };
  provide(SidebarKey, context);

  const style = computed<Record<string, unknown>>(() => {
    const userStyle = props.style;
    return {
      "--sidebar-width": SIDEBAR_WIDTH,
      "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
      ...(typeof userStyle === "object" && userStyle !== null ? userStyle : {}),
    };
  });

  return { context, style, rest };
}

/**
 * Inject the sidebar context. Must be used under a provider that called
 * `useSidebarRoot` (or the default `<SidebarProvider />`).
 */
export function useSidebar(): SidebarContext {
  const context = inject(SidebarKey);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

/**
 * Drive the enclosing mobile sheet's open state from `props.open`. Call from
 * a component rendered inside the sheet root.
 */
export function useSidebarSheetSync(props: SidebarSheetSyncProps): void {
  const api = inject(DialogKey);
  if (api) {
    effect(() => {
      const next = Boolean(props.open);
      if (untrack(() => api.open.value) !== next) api.setOpen(next);
    });
  }
}

/** Trigger click handler: runs the consumer `onclick`, then toggles the sidebar. */
export function useSidebarTrigger(
  props: SidebarTriggerProps,
): SidebarTriggerReturn {
  const { toggleSidebar } = useSidebar();
  const {
    class: _className,
    onclick: _onclick,
    children: _children,
    ...rest
  } = getRawProps(props);

  const onClick: NonNullable<SidebarTriggerProps["onclick"]> = (event) => {
    const handler = props.onclick;
    if (typeof handler === "function") handler(event);
    toggleSidebar();
  };

  return { rest, onClick };
}

/** Active state and collapsed-only tooltip visibility for a menu button. */
export function useSidebarMenuButton(
  props: SidebarMenuButtonOptions,
): SidebarMenuButtonReturn {
  const { isMobile, state } = useSidebar();
  const tooltip = props.tooltip;

  return {
    // Read live `props.isActive` so controlled/asChild nav stays reactive.
    active: computed(() => Boolean(resolve(props.isActive))),
    tooltip: !tooltip
      ? null
      : typeof tooltip === "string"
        ? { children: tooltip }
        : tooltip,
    tooltipVisible: computed(() => state() === "collapsed" && !isMobile()),
  };
}

/** Random skeleton text width, fixed for the lifetime of the component. */
export function useSidebarMenuSkeleton(): SidebarMenuSkeletonReturn {
  return {
    style: { "--skeleton-width": `${Math.floor(Math.random() * 40) + 50}%` },
  };
}
