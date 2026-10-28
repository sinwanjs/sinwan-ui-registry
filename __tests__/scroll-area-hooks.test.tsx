import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";

import { ScrollArea, ScrollBar } from "../src/components/ui/scroll-area";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("scroll area live props", () => {
  test("class, children, and orientation follow later updates", async () => {
    const extra = signal("alpha");
    const viewportClass = signal("view-a");
    const show = signal(true);
    const orientation = signal<"vertical" | "horizontal">("vertical");
    const { root, unmount } = mountUi(() => (
      <ScrollArea class={extra.value} viewportClass={viewportClass.value}>
        {show.value ? (
          <span data-testid="child-a">a</span>
        ) : (
          <span data-testid="child-b">b</span>
        )}
        <ScrollBar orientation={orientation.value} class={extra.value} />
      </ScrollArea>
    ));
    const area = root.querySelector('[data-slot="scroll-area"]');
    const view = root.querySelector('[data-slot="scroll-area-viewport"]');
    if (!(area instanceof HTMLElement) || !(view instanceof HTMLElement)) {
      throw new Error("missing scroll area");
    }
    const customBar = () =>
      [...root.querySelectorAll('[data-slot="scroll-area-scrollbar"]')].find(
        (bar) =>
          bar.classList.contains("alpha") || bar.classList.contains("beta"),
      );

    expect(area.classList.contains("alpha")).toBe(true);
    expect(view.classList.contains("view-a")).toBe(true);
    expect(view.querySelector('[data-testid="child-a"]')).not.toBeNull();
    const bar = customBar();
    if (!(bar instanceof HTMLElement)) throw new Error("missing custom bar");
    expect(bar.getAttribute("data-orientation")).toBe("vertical");
    expect(bar.hasAttribute("data-vertical")).toBe(true);

    extra.value = "beta";
    viewportClass.value = "view-b";
    show.value = false;
    orientation.value = "horizontal";
    await Promise.resolve();

    expect(area.classList.contains("alpha")).toBe(false);
    expect(area.classList.contains("beta")).toBe(true);
    expect(view.classList.contains("view-a")).toBe(false);
    expect(view.classList.contains("view-b")).toBe(true);
    expect(view.querySelector('[data-testid="child-a"]')).toBeNull();
    expect(view.querySelector('[data-testid="child-b"]')).not.toBeNull();
    const updated = customBar();
    if (!(updated instanceof HTMLElement)) throw new Error("missing updated bar");
    expect(updated.getAttribute("data-orientation")).toBe("horizontal");
    expect(updated.hasAttribute("data-horizontal")).toBe(true);
    expect(updated.classList.contains("beta")).toBe(true);
    unmount();
  });
});
