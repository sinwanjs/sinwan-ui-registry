import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { SidebarInput, SidebarProvider, SidebarSeparator } from "../src/components/ui/sidebar";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
  localStorage.removeItem("sidebar_state");
});

afterEach(() => {
  teardownDom();
});

describe("SidebarInput / SidebarSeparator classes", () => {
  test("forward sidebar and consumer classes to Input and Separator", () => {
    const { query, unmount } = mountUi(() => (
      <SidebarProvider>
        <SidebarInput class="extra-input" />
        <SidebarSeparator class="extra-sep" />
      </SidebarProvider>
    ));

    const input = query('[data-slot="sidebar-input"]');
    expect(input?.className).toContain("bg-background");
    expect(input?.className).toContain("shadow-none");
    expect(input?.className).toContain("extra-input");

    const separator = query('[data-slot="sidebar-separator"]');
    expect(separator?.className).toContain("bg-sidebar-border");
    expect(separator?.className).not.toContain("bg-border ");
    expect(separator?.className).toContain("extra-sep");
    unmount();
  });
});
