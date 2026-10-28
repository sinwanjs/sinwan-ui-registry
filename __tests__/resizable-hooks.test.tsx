import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useResizableGroup,
  useResizableHandle,
  useResizablePanel,
  useResizablePanelGroupRoot,
  type ResizableSizes,
} from "../src/components/ui/resizable";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

const nextTick = () => Promise.resolve();

function stubWidth(el: Element, width: number): void {
  if (!(el instanceof HTMLElement)) throw new Error("expected HTMLElement");
  el.getBoundingClientRect = () => new DOMRect(0, 0, width, 100);
}

function htmlElements(nodes: Iterable<Element>): HTMLElement[] {
  return [...nodes].filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
}

function drag(handle: HTMLElement, fromX: number, moves: number[]): void {
  handle.dispatchEvent(
    new MouseEvent("pointerdown", { bubbles: true, clientX: fromX }),
  );
  for (const x of moves) {
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: x }));
  }
  window.dispatchEvent(new MouseEvent("pointerup"));
}

describe("resizable hooks", () => {
  beforeEach(() => {
    setupDom();
    globalThis.DOMRect = window.DOMRect;
  });
  afterEach(() => {
    teardownDom();
  });

  test("hooks outside a group throw with the consumer name", () => {
    expect(() => withSetup(() => useResizableGroup())).toThrow(
      "useResizableGroup must be used within ResizablePanelGroup",
    );
    expect(() => withSetup(() => useResizablePanel({}))).toThrow(
      "ResizablePanel must be used within ResizablePanelGroup",
    );
    expect(() => withSetup(() => useResizableHandle({}))).toThrow(
      "ResizableHandle must be used within ResizablePanelGroup",
    );
  });

  test("root provides the group context to panels and handles", () => {
    withSetup(() => {
      const root = useResizablePanelGroupRoot({ orientation: "vertical" });
      expect(root.orientation).toBe("vertical");
      expect(useResizableGroup()).toBe(root.context);

      const panel = useResizablePanel({ id: "a", defaultSize: 30 });
      const handle = useResizableHandle({});
      useResizablePanel({ defaultSize: 70 });

      expect(panel.panelId).toBe("a");
      expect(panel.dataSize.value).toBe("30");
      expect(panel.style.value).toEqual({
        flexBasis: "30%",
        flexGrow: 0,
        flexShrink: 0,
      });
      expect(panel.open.value).toBe(true);
      expect(handle.ariaOrientation).toBe("horizontal");
      expect(handle.style.value).toEqual({ cursor: "row-resize" });
      expect(handle.resizeCursor.value).toBe("true");
      expect(root.context.snapshotSizes()).toEqual([30, 70]);

      panel.collapsed.value = true;
      expect(panel.dataCollapsed.value).toBe("true");
      expect(panel.ariaHidden.value).toBe(true);
      expect(panel.open.value).toBe(false);
      expect(handle.showStartExpand.value).toBe(true);
      expect(handle.showEndExpand.value).toBe(false);
      expect(handle.style.value).toEqual({ cursor: "default" });
    });
  });

  test("seam inactive state updates handle class and attributes live", async () => {
    const ends: ResizableSizes[] = [];
    const { root, unmount } = mountUi(() => (
      <ResizablePanelGroup onResizeEnd={(sizes) => ends.push(sizes)}>
        <ResizablePanel defaultSize={50} minSize={10} snap>
          A
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={10} snap>
          B
        </ResizablePanel>
      </ResizablePanelGroup>
    ));
    const group = root.querySelector('[data-slot="resizable-panel-group"]');
    if (!group) throw new Error("missing group");
    stubWidth(group, 100);
    const [handle] = htmlElements(
      group.querySelectorAll('[data-slot="resizable-handle"]'),
    );
    if (!handle) throw new Error("missing handle");
    await nextTick();
    expect(handle.getAttribute("tabindex")).toBe("0");
    expect(handle.style.cursor).toBe("col-resize");

    drag(handle, 50, [5, -40]);
    await nextTick();
    const expand = handle.querySelector('[data-side="start"]');
    expect(expand).toBeTruthy();
    expect(handle.getAttribute("data-resize-cursor")).toBe("false");
    expect(handle.style.cursor).toBe("default");
    expect(handle.querySelector('[data-slot="resizable-handle-fill"]')).toBe(
      null,
    );

    expand?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(ends.at(-1)).toEqual([50, 50]);
    expect(handle.getAttribute("data-resize-cursor")).toBe("true");
    expect(handle.querySelector('[data-slot="resizable-handle-fill"]')).toBeTruthy();
    unmount();
  });

  test("disabled prop stays live on the handle", async () => {
    const disabled = signal(true);
    const starts: ResizableSizes[] = [];
    const { root, unmount } = mountUi(() => (
      <ResizablePanelGroup onResizeStart={(sizes) => starts.push(sizes)}>
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle disabled={disabled.value} />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>
    ));
    const group = root.querySelector('[data-slot="resizable-panel-group"]');
    if (!group) throw new Error("missing group");
    stubWidth(group, 100);
    const [handle] = htmlElements(
      group.querySelectorAll('[data-slot="resizable-handle"]'),
    );
    if (!handle) throw new Error("missing handle");
    await nextTick();
    expect(handle.getAttribute("aria-disabled")).toBe("true");
    expect(handle.getAttribute("tabindex")).toBe("-1");
    expect(handle.className).toContain("pointer-events-none");
    drag(handle, 50, [60]);
    expect(starts).toHaveLength(0);

    disabled.value = false;
    await nextTick();
    expect(handle.getAttribute("aria-disabled")).toBe(null);
    expect(handle.getAttribute("tabindex")).toBe("0");
    expect(handle.className).not.toContain("pointer-events-none");
    drag(handle, 50, [60]);
    await nextTick();
    expect(starts).toEqual([[50, 50]]);
    const panels = htmlElements(
      group.querySelectorAll('[data-slot="resizable-panel"]'),
    );
    expect(panels[0]?.getAttribute("data-size")).toBe("60");
    unmount();
  });
});
