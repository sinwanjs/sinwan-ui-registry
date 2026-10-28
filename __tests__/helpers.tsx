import { Window } from "happy-dom";
import {
  cc,
  createComponentInstance,
  getCurrentInstance,
  setCurrentInstance,
  type SinwanElement,
  type SinwanNode,
} from "sinwan/component";
import { mount } from "sinwan/renderer";

let windowRef: Window | null = null;

export type ControllableIntersectionObserver = {
  callback: IntersectionObserverCallback;
  observe: (target: Element) => void;
  unobserve: (target: Element) => void;
  disconnect: () => void;
  trigger: (entries: IntersectionObserverEntry[]) => void;
};

export type ControllableResizeObserver = {
  callback: ResizeObserverCallback;
  observe: (target: Element) => void;
  unobserve: (target: Element) => void;
  disconnect: () => void;
  trigger: (entries: ResizeObserverEntry[]) => void;
};

export type ControllableMutationObserver = {
  callback: MutationCallback;
  observe: (target: Node, options?: MutationObserverInit) => void;
  disconnect: () => void;
  trigger: (records?: MutationRecord[]) => void;
};

export let lastIntersectionObserver: ControllableIntersectionObserver | null =
  null;
export let lastResizeObserver: ControllableResizeObserver | null = null;
export let lastMutationObserver: ControllableMutationObserver | null = null;

type MediaQueryListener = (event: MediaQueryListEvent) => void;

export let matchMediaChangeListeners: MediaQueryListener[] = [];
/** Controls `(prefers-color-scheme: dark)` for ThemeProvider tests. */
let matchMediaPrefersDark = true;

export function setMatchMediaPrefersDark(value: boolean): void {
  matchMediaPrefersDark = value;
}

export function triggerMatchMediaChange(): void {
  const event = {
    matches: matchMediaPrefersDark,
  } as MediaQueryListEvent;
  for (const listener of [...matchMediaChangeListeners]) {
    listener(event);
  }
}

type HappyCanvasContextId =
  | "2d"
  | "webgl"
  | "webgl2"
  | "webgpu"
  | "bitmaprenderer";

function stubCanvasContext(proto: {
  getContext: (
    contextType: HappyCanvasContextId,
    contextAttributes?: Record<string, unknown>,
  ) => unknown;
}): void {
  proto.getContext = function getContext(
    this: object,
    contextType: HappyCanvasContextId,
  ) {
    if (contextType !== "2d") return null;
    const canvas = this;
    const gradient = { addColorStop() {} };
    return new Proxy(
      { canvas },
      {
        get(target, prop) {
          if (prop === "canvas") return canvas;
          if (prop in target) {
            return target[prop as keyof typeof target];
          }
          if (prop === "measureText") {
            return () => ({
              width: 0,
              actualBoundingBoxAscent: 0,
              actualBoundingBoxDescent: 0,
              actualBoundingBoxLeft: 0,
              actualBoundingBoxRight: 0,
              fontBoundingBoxAscent: 0,
              fontBoundingBoxDescent: 0,
            });
          }
          if (
            prop === "createLinearGradient" ||
            prop === "createRadialGradient" ||
            prop === "createConicGradient" ||
            prop === "createPattern"
          ) {
            return () => gradient;
          }
          if (prop === "getImageData" || prop === "createImageData") {
            return () => ({
              data: new Uint8ClampedArray(4),
              width: 1,
              height: 1,
              colorSpace: "srgb",
            });
          }
          if (prop === "getLineDash") return () => [];
          if (prop === "isPointInPath" || prop === "isPointInStroke") {
            return () => false;
          }
          return () => undefined;
        },
        set(target, prop, value) {
          (target as Record<PropertyKey, unknown>)[prop] = value;
          return true;
        },
      },
    );
  };
}

export function setupDom(): Window {
  const win = new Window({ url: "https://example.test/" });
  windowRef = win;
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = win;
  g.document = win.document;
  g.HTMLElement = win.HTMLElement;
  g.HTMLCanvasElement = win.HTMLCanvasElement;
  g.Element = win.Element;
  stubCanvasContext(win.HTMLCanvasElement.prototype);
  g.Node = win.Node;
  g.Comment = win.Comment;
  g.DocumentFragment = win.DocumentFragment;
  g.FormData = win.FormData;
  g.Event = win.Event;
  g.KeyboardEvent = win.KeyboardEvent;
  g.MouseEvent = win.MouseEvent;
  g.FocusEvent =
    (win as unknown as { FocusEvent?: typeof FocusEvent }).FocusEvent ??
    win.Event;
  g.PointerEvent =
    (win as unknown as { PointerEvent?: typeof PointerEvent }).PointerEvent ??
    win.MouseEvent;
  g.CustomEvent = win.CustomEvent;

  lastIntersectionObserver = null;
  lastResizeObserver = null;
  lastMutationObserver = null;
  matchMediaChangeListeners = [];

  g.MutationObserver = class {
    callback: MutationCallback;
    constructor(callback: MutationCallback) {
      this.callback = callback;
      lastMutationObserver = this as ControllableMutationObserver;
    }
    observe() {}
    disconnect() {}
    trigger(records: MutationRecord[] = []) {
      this.callback(records, this as unknown as MutationObserver);
    }
  };

  g.IntersectionObserver = class {
    callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      lastIntersectionObserver = this as ControllableIntersectionObserver;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    trigger(entries: IntersectionObserverEntry[]) {
      this.callback(entries, this as unknown as IntersectionObserver);
    }
  };

  g.ResizeObserver = class {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      lastResizeObserver = this as ControllableResizeObserver;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    trigger(entries: ResizeObserverEntry[]) {
      this.callback(entries, this as unknown as ResizeObserver);
    }
  };

  g.requestAnimationFrame = (cb: FrameRequestCallback) =>
    win.setTimeout(() => cb(0), 0) as unknown as number;
  g.cancelAnimationFrame = (id: number) => {
    win.clearTimeout(id as unknown as ReturnType<typeof win.setTimeout>);
  };
  const matchMediaImpl = (query: string) => ({
    matches: query.includes("prefers-color-scheme: dark")
      ? matchMediaPrefersDark
      : query.includes("max-width") &&
        (typeof window !== "undefined" ? window.innerWidth < 768 : false),
    media: query,
    addEventListener: (_type: string, listener: MediaQueryListener) => {
      matchMediaChangeListeners.push(listener);
    },
    removeEventListener: (_type: string, listener: MediaQueryListener) => {
      matchMediaChangeListeners = matchMediaChangeListeners.filter(
        (l) => l !== listener,
      );
    },
    addListener: (listener: MediaQueryListener) => {
      matchMediaChangeListeners.push(listener);
    },
    removeListener: (listener: MediaQueryListener) => {
      matchMediaChangeListeners = matchMediaChangeListeners.filter(
        (l) => l !== listener,
      );
    },
    onchange: null,
    dispatchEvent: () => false,
  });
  matchMediaPrefersDark = true;
  g.matchMedia = matchMediaImpl;
  (win as unknown as { matchMedia: typeof matchMediaImpl }).matchMedia =
    matchMediaImpl;
  g.localStorage = win.localStorage;
  return win;
}

export function teardownDom(): void {
  try {
    if (typeof document !== "undefined") {
      document.body.innerHTML = "";
    }
  } catch {
    /* ignore */
  }
  windowRef?.happyDOM.close();
  windowRef = null;
  lastIntersectionObserver = null;
  lastResizeObserver = null;
  lastMutationObserver = null;
  matchMediaChangeListeners = [];
}

export function withSetup<T>(run: () => T): T {
  const prev = getCurrentInstance();
  const inst = createComponentInstance(
    cc(() => null),
    {},
    null,
  );
  setCurrentInstance(inst);
  try {
    return run();
  } finally {
    setCurrentInstance(prev);
  }
}

export function asVNode(node: SinwanNode): SinwanElement {
  if (
    typeof node === "object" &&
    node !== null &&
    !Array.isArray(node) &&
    "tag" in node
  ) {
    return node as SinwanElement;
  }
  throw new Error("expected SinwanElement");
}

export function findBySlot(
  node: SinwanNode,
  slot: string,
): SinwanElement | null {
  if (
    typeof node !== "object" ||
    node === null ||
    Array.isArray(node) ||
    !("tag" in node)
  ) {
    return null;
  }
  const el = node as SinwanElement;
  if (el.props["data-slot"] === slot) return el;
  for (const child of el.children ?? []) {
    const found = findBySlot(child, slot);
    if (found) return found;
  }
  return null;
}

export type MountedUi = {
  root: HTMLElement;
  unmount: () => void;
  click: (selector: string) => void;
  query: (selector: string) => Element | null;
  queryAll: (selector: string) => Element[];
};

/**
 * Mount a JSX tree so provide/inject and lifecycle hooks run in order.
 * Prefer this over calling nested `cc` components as plain functions.
 */
export function mountUi(ui: () => SinwanNode): MountedUi {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const App = cc(() => ui());
  const app = mount(App, root);
  const scope = () => document.body;
  return {
    root,
    unmount: () => {
      app.unmount();
      root.remove();
    },
    click: (selector: string) => {
      const el =
        scope().querySelector(selector) ?? root.querySelector(selector);
      if (!el) throw new Error(`missing ${selector}`);
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    },
    query: (selector: string) =>
      scope().querySelector(selector) ?? root.querySelector(selector),
    queryAll: (selector: string) =>
      Array.from(
        new Set([
          ...Array.from(scope().querySelectorAll(selector)),
          ...Array.from(root.querySelectorAll(selector)),
        ]),
      ),
  };
}
