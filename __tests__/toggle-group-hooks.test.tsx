import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";

import { ToggleGroup, ToggleGroupItem } from "../src/components/ui/toggle-group";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("toggle group hooks", () => {
  test("root variant, size, spacing, and orientation follow later prop updates", async () => {
    const orientation = signal<"horizontal" | "vertical">("horizontal");
    const size = signal<"default" | "sm">("default");
    const { root, unmount } = mountUi(() => (
      <ToggleGroup
        type="single"
        orientation={orientation.value}
        size={size.value}
        spacing={0}
      >
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    ));
    const group = root.querySelector('[data-slot="toggle-group"]');
    if (!(group instanceof HTMLElement)) throw new Error("missing group");
    expect(group.getAttribute("data-orientation")).toBe("horizontal");
    expect(group.classList.contains("flex-col")).toBe(false);

    orientation.value = "vertical";
    size.value = "sm";
    await Promise.resolve();
    expect(group.getAttribute("data-orientation")).toBe("vertical");
    expect(group.getAttribute("data-size")).toBe("sm");
    expect(group.classList.contains("flex-col")).toBe(true);
    expect(group.style.getPropertyValue("--gap")).toBe("0");
    unmount();
  });
});
