import { inject, onUnmounted, type SinwanNode } from "sinwan/component";
import type { Computed, Signal } from "sinwan/reactivity";

import { PopoverKey, type OpenApi } from "sinwan-ui-core/overlay";
import type { Align, Placement } from "sinwan-ui-core/floating";

export type HoverCardContext = OpenApi & { placement: Placement; align: Align };

export type HoverCardProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type HoverCardTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

export type HoverCardContentProps = {
  children?: SinwanNode;
  class?: string;
  align?: Align;
  side?: Placement;
  sideOffset?: number;
};

export type HoverCardTriggerHandlers = {
  onmouseenter: () => void;
  onmouseleave: () => void;
  onfocus: () => void;
  onblur: () => void;
  ref: (el: HTMLElement | null) => void;
};

export type HoverCardTriggerReturn = {
  open: Signal<boolean> | Computed<boolean>;
  handlers: HoverCardTriggerHandlers;
};

export type HoverCardContentReturn = {
  onmouseenter: () => void;
  onmouseleave: () => void;
};

const OPEN_DELAY_MS = 100;
const CLOSE_DELAY_MS = 120;

/**
 * Inject the popover context provided by `<HoverCard />`.
 */
export function useHoverCard(consumer = "useHoverCard"): HoverCardContext {
  const context = inject(PopoverKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <HoverCard />`);
  }
  return context;
}

/**
 * Trigger behavior: opens after a short hover/focus delay (unless the
 * reopen lock is active) and requests a delayed close on leave/blur.
 */
export function useHoverCardTrigger(): HoverCardTriggerReturn {
  const api = useHoverCard("HoverCardTrigger");
  let openTimer: number | undefined;
  const clearOpenTimer = () => {
    if (openTimer !== undefined) {
      window.clearTimeout(openTimer);
      openTimer = undefined;
    }
  };
  const show = () => {
    if (api.isHoverOpenBlocked()) return;
    api.cancelClose();
    clearOpenTimer();
    openTimer = window.setTimeout(() => {
      openTimer = undefined;
      if (api.isHoverOpenBlocked()) return;
      api.setOpen(true);
    }, OPEN_DELAY_MS);
  };
  const hide = () => {
    clearOpenTimer();
    api.requestClose(CLOSE_DELAY_MS);
  };
  onUnmounted(clearOpenTimer);
  return {
    open: api.open,
    handlers: {
      onmouseenter: () => {
        api.setPointerOverTrigger(true);
        show();
      },
      onmouseleave: () => {
        api.setPointerOverTrigger(false);
        hide();
      },
      onfocus: show,
      onblur: hide,
      ref: (el) => {
        api.triggerEl.value = el;
      },
    },
  };
}

/**
 * Content behavior: hovering the card keeps it open; leaving requests a
 * delayed close.
 */
export function useHoverCardContent(): HoverCardContentReturn {
  const api = useHoverCard("HoverCardContent");
  return {
    onmouseenter: () => {
      api.cancelClose();
      api.setOpen(true);
    },
    onmouseleave: () => {
      api.requestClose(CLOSE_DELAY_MS);
    },
  };
}
