import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cc } from "sinwan/component";
import { signal } from "sinwan/reactivity";
import { Sheet, SheetContent } from "../src/components/ui/sheet";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  type SidebarContext,
} from "../src/components/ui/sidebar";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
  localStorage.removeItem("sidebar_state");
});

afterEach(() => {
  teardownDom();
});

const tick = () => Promise.resolve();

describe("SheetContent reactive props", () => {
  test("class, style, and data attributes follow live props", async () => {
    const tone = signal("tone-a");
    const mobile = signal("true");
    const { query, unmount } = mountUi(() => (
      <Sheet defaultOpen>
        <SheetContent
          class={tone.value}
          overlayClass={tone.value}
          data-mobile={mobile.value}
          data-sidebar="panel"
          style="color: red"
          showCloseButton={false}
        >
          body
        </SheetContent>
      </Sheet>
    ));
    await tick();
    const panel = query('[data-slot="sheet-content"]');
    expect(panel?.classList.contains("tone-a")).toBe(true);
    expect(panel?.classList.contains("fixed")).toBe(true);
    expect(
      query('[data-slot="dialog-overlay"]')?.classList.contains("tone-a"),
    ).toBe(true);
    expect(panel?.getAttribute("data-sidebar")).toBe("panel");
    expect(panel?.getAttribute("data-mobile")).toBe("true");
    expect(panel?.querySelector(".contents")?.getAttribute("style")).toContain(
      "color: red",
    );

    tone.value = "tone-b";
    mobile.value = "false";
    await tick();
    expect(panel?.classList.contains("tone-a")).toBe(false);
    expect(panel?.classList.contains("tone-b")).toBe(true);
    expect(panel?.getAttribute("data-mobile")).toBe("false");
    expect(
      query('[data-slot="dialog-overlay"]')?.classList.contains("tone-b"),
    ).toBe(true);
    unmount();
  });
});

describe("mobile Sidebar sheet", () => {
  test("panel gets sidebar classes and data attributes and opens right after mount", async () => {
    window.innerWidth = 500;
    let api: SidebarContext | undefined;
    const Probe = cc(() => {
      api = useSidebar();
      return null;
    });
    const { click, query, unmount } = mountUi(() => (
      <SidebarProvider>
        <Sidebar class="mobile-panel">
          <span data-slot="mobile-body">body</span>
        </Sidebar>
        <SidebarTrigger />
        <Probe />
      </SidebarProvider>
    ));
    await tick();
    click('[data-slot="sidebar-trigger"]');
    await tick();
    expect(api?.openMobile.value).toBe(true);
    const sheet = query('[role="dialog"]');
    expect(sheet?.getAttribute("data-slot")).toBe("sidebar");
    expect(sheet?.getAttribute("data-sidebar")).toBe("sidebar");
    expect(sheet?.getAttribute("data-mobile")).toBe("true");
    expect(sheet?.classList.contains("bg-sidebar")).toBe(true);
    expect(sheet?.classList.contains("p-0")).toBe(true);
    expect(sheet?.classList.contains("w-(--sidebar-width)")).toBe(true);
    expect(sheet?.classList.contains("mobile-panel")).toBe(true);
    expect(sheet?.querySelector('[data-slot="mobile-body"]')).not.toBeNull();

    api?.setOpenMobile(false);
    await tick();
    expect(sheet?.getAttribute("data-state")).toBe("closed");
    unmount();
    window.innerWidth = 1024;
  });
});
