import {
  inject,
  onMounted,
  onUnmounted,
  provide,
  type InjectionKey,
} from "sinwan/component";
import {
  computed,
  effect,
  signal,
  type Computed,
  type Signal,
} from "sinwan/reactivity";

import { isDismissExemptPointerTarget } from "sinwan-ui-core/dismiss";
import { DirectionKey, type Direction } from "sinwan-ui-core/direction";

export type NavigationMenuContext = {
  openItem: Signal<string | null>;
  pinned: Signal<boolean>;
  setOpenItem: (id: string | null, pin?: boolean) => void;
  closeAll: () => void;
  viewport: boolean;
};

export type NavigationMenuItemContext = {
  id: string;
  open: Signal<boolean>;
  setOpen: (value: boolean, pin?: boolean) => void;
};

export type NavigationMenuRootOptions = {
  viewport: boolean;
};

export type NavigationMenuRootReturn = {
  navigationMenu: NavigationMenuContext;
  pinned: Signal<boolean>;
  dir: Computed<Direction>;
  setNavElement: (element: HTMLElement | null) => void;
};

export type NavigationMenuItemOptions = {
  value?: string;
};

export type NavigationMenuItemRootReturn = {
  item: NavigationMenuItemContext;
  cancelClose: () => void;
  requestClose: () => void;
};

export type NavigationMenuTriggerReturn = {
  open: Signal<boolean>;
  toggle: () => void;
  openOnHover: () => void;
};

export type NavigationMenuContentReturn = {
  open: Signal<boolean>;
  detached: boolean;
};

export type NavigationMenuViewportReturn = {
  open: Computed<boolean>;
};

export type NavigationMenuIndicatorReturn = {
  visible: Computed<boolean>;
};

const NavMenuKey: InjectionKey<NavigationMenuContext> = Symbol(
  "sinwan-ui.navigation-menu",
);

const NavItemKey: InjectionKey<NavigationMenuItemContext> = Symbol(
  "sinwan-ui.navigation-menu-item",
);

const NAV_ITEM_CLOSE_MS = 120;

let navItemSeq = 0;

/**
 * Navigation menu open item, click-pin state, and document dismissal without
 * default styles. Call from a root component; parts use `useNavigationMenu()`.
 */
export function useNavigationMenuRoot(
  options: NavigationMenuRootOptions,
): NavigationMenuRootReturn {
  const openItem = signal<string | null>(null);
  const pinned = signal(false);
  const direction = inject(DirectionKey, undefined);
  const dir = computed<Direction>(() => direction?.dir.value ?? "ltr");
  let navEl: HTMLElement | null = null;

  function setOpenItem(id: string | null, pin = false) {
    openItem.value = id;
    if (id == null) {
      pinned.value = false;
      return;
    }
    if (pin) pinned.value = true;
  }

  function closeAll() {
    setOpenItem(null);
  }

  const navigationMenu: NavigationMenuContext = {
    openItem,
    pinned,
    setOpenItem,
    closeAll,
    viewport: options.viewport,
  };
  provide(NavMenuKey, navigationMenu);

  onMounted(() => {
    function onDoc(e: PointerEvent) {
      if (openItem.value == null) return;
      const t = e.target;
      if (t instanceof Node && navEl?.contains(t)) return;
      if (isDismissExemptPointerTarget(t)) return;
      closeAll();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    onUnmounted(() => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    });
  });

  return {
    navigationMenu,
    pinned,
    dir,
    setNavElement: (element: HTMLElement | null) => {
      navEl = element;
    },
  };
}

export function useNavigationMenu(
  consumer = "useNavigationMenu",
): NavigationMenuContext {
  const context = inject(NavMenuKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <NavigationMenu />`);
  }
  return context;
}

/**
 * Item open state with a delayed hover close. Closes itself when another item
 * opens. Parts inside the item use `useNavigationMenuItem()`.
 */
export function useNavigationMenuItemRoot(
  options: NavigationMenuItemOptions,
): NavigationMenuItemRootReturn {
  const root = useNavigationMenu("NavigationMenuItem");
  const id = options.value ?? `nav-item-${++navItemSeq}`;
  const open = signal(false);
  let closeTimer: number | undefined;
  function cancelClose() {
    if (closeTimer !== undefined) {
      window.clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }
  function setOpen(next: boolean, pin = false) {
    cancelClose();
    open.value = next;
    if (next) root.setOpenItem(id, pin);
    else if (root.openItem.value === id) root.setOpenItem(null);
  }
  function requestClose() {
    if (root.pinned.value) return;
    cancelClose();
    closeTimer = window.setTimeout(() => {
      closeTimer = undefined;
      setOpen(false);
    }, NAV_ITEM_CLOSE_MS);
  }
  effect(() => {
    const current = root.openItem.value;
    if (current !== id && open.value) {
      cancelClose();
      open.value = false;
    }
  });
  onUnmounted(cancelClose);
  const item: NavigationMenuItemContext = { id, open, setOpen };
  provide(NavItemKey, item);
  return { item, cancelClose, requestClose };
}

export function useNavigationMenuItem(
  consumer = "useNavigationMenuItem",
): NavigationMenuItemContext {
  const context = inject(NavItemKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <NavigationMenuItem />`);
  }
  return context;
}

export function useNavigationMenuTrigger(): NavigationMenuTriggerReturn {
  const item = useNavigationMenuItem("NavigationMenuTrigger");
  const root = useNavigationMenu("NavigationMenuTrigger");
  function toggle() {
    const pinnedHere =
      item.open.value &&
      root.pinned.value &&
      root.openItem.value === item.id;
    if (pinnedHere) item.setOpen(false);
    else item.setOpen(true, true);
  }
  return {
    open: item.open,
    toggle,
    openOnHover: () => item.setOpen(true),
  };
}

export function useNavigationMenuContent(): NavigationMenuContentReturn {
  const item = useNavigationMenuItem("NavigationMenuContent");
  const root = useNavigationMenu("NavigationMenuContent");
  return { open: item.open, detached: !root.viewport };
}

export function useNavigationMenuViewport(): NavigationMenuViewportReturn {
  const root = useNavigationMenu("NavigationMenuViewport");
  return { open: computed(() => Boolean(root.openItem.value)) };
}

export function useNavigationMenuIndicator(): NavigationMenuIndicatorReturn {
  const root = useNavigationMenu("NavigationMenuIndicator");
  return { visible: computed(() => root.openItem.value !== null) };
}
