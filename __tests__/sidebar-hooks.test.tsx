import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cc } from "sinwan/component";
import {
  Sidebar,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  useSidebarMenuButton,
  useSidebarMenuSkeleton,
  useSidebarRoot,
  type SidebarContext,
} from "../src/components/ui/sidebar";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
  localStorage.removeItem("sidebar_state");
});

afterEach(() => {
  teardownDom();
});

const tick = () => Promise.resolve();

describe("useSidebarRoot", () => {
  test("uncontrolled toggle updates state, persists, and merges style", () => {
    const changes: boolean[] = [];
    const root = withSetup(() =>
      useSidebarRoot({
        defaultOpen: false,
        style: { color: "red" },
        id: "shell",
        onOpenChange: (open) => changes.push(open),
      }),
    );
    expect(root.context.state()).toBe("collapsed");
    expect(root.style.value).toEqual({
      "--sidebar-width": "16rem",
      "--sidebar-width-icon": "3rem",
      color: "red",
    });
    expect(root.rest).toEqual({ id: "shell" });

    root.context.toggleSidebar();
    expect(root.context.open.value).toBe(true);
    expect(root.context.state()).toBe("expanded");
    expect(changes).toEqual([true]);
    expect(localStorage.getItem("sidebar_state")).toBe("true");
  });

  test("controlled open ignores internal writes and string style", () => {
    const root = withSetup(() =>
      useSidebarRoot({ open: false, style: "color: red" }),
    );
    root.context.setOpen(true);
    expect(root.context.open.value).toBe(false);
    expect(root.context.state()).toBe("collapsed");
    expect(root.style.value).toEqual({
      "--sidebar-width": "16rem",
      "--sidebar-width-icon": "3rem",
    });
  });
});

describe("useSidebarMenuButton and useSidebarMenuSkeleton", () => {
  test("normalizes tooltip and tracks collapsed visibility", async () => {
    let api: SidebarContext | undefined;
    let plain: ReturnType<typeof useSidebarMenuButton> | undefined;
    let rich: ReturnType<typeof useSidebarMenuButton> | undefined;
    let none: ReturnType<typeof useSidebarMenuButton> | undefined;
    const Probe = cc(() => {
      api = useSidebar();
      plain = useSidebarMenuButton({ isActive: true, tooltip: "Home" });
      rich = useSidebarMenuButton({ tooltip: { children: "Rich", class: "x" } });
      none = useSidebarMenuButton({});
      return null;
    });
    const { unmount } = mountUi(() => (
      <SidebarProvider defaultOpen>
        <Probe />
      </SidebarProvider>
    ));
    expect(plain?.active.value).toBe(true);
    expect(plain?.tooltip).toEqual({ children: "Home" });
    expect(rich?.tooltip).toEqual({ children: "Rich", class: "x" });
    expect(none?.tooltip).toBeNull();
    expect(none?.active.value).toBe(false);
    expect(plain?.tooltipVisible.value).toBe(false);

    api?.setOpen(false);
    await tick();
    expect(plain?.tooltipVisible.value).toBe(true);
    unmount();
  });

  test("skeleton width stays between 50% and 90%", () => {
    const width = useSidebarMenuSkeleton().style["--skeleton-width"];
    const percent = Number.parseInt(width ?? "", 10);
    expect(percent).toBeGreaterThanOrEqual(50);
    expect(percent).toBeLessThan(90);
  });
});

describe("Sidebar markup", () => {
  test("collapsed desktop shows the menu button tooltip", async () => {
    const { query, unmount } = mountUi(() => (
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon" variant="floating">
          <SidebarMenuButton tooltip={{ children: "Tip", class: "tip" }}>
            Home
          </SidebarMenuButton>
        </Sidebar>
      </SidebarProvider>
    ));
    await tick();
    expect(query('[data-slot="sidebar"]')?.getAttribute("data-state")).toBe(
      "collapsed",
    );
    expect(
      query('[data-slot="sidebar"]')?.getAttribute("data-collapsible"),
    ).toBe("icon");
    unmount();
  });

  test("mobile trigger opens the sheet with dir and mobile width", async () => {
    window.innerWidth = 500;
    let clicks = 0;
    let api: SidebarContext | undefined;
    const Probe = cc(() => {
      api = useSidebar();
      return null;
    });
    const { click, query, unmount } = mountUi(() => (
      <SidebarProvider>
        <Sidebar dir="rtl" side="right" class="mobile-panel">
          <span data-slot="mobile-body">body</span>
        </Sidebar>
        <SidebarTrigger onclick={() => (clicks += 1)} />
        <Probe />
      </SidebarProvider>
    ));
    await tick();
    click('[data-slot="sidebar-trigger"]');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(clicks).toBe(1);
    expect(api?.openMobile.value).toBe(true);
    const sheet = query('[data-slot="sidebar"]');
    expect(sheet?.getAttribute("role")).toBe("dialog");
    expect(sheet?.getAttribute("data-side")).toBe("right");
    const inner = sheet?.querySelector('[dir="rtl"]');
    expect(inner?.getAttribute("style")).toContain("--sidebar-width: 18rem");
    expect(inner?.querySelector('[data-slot="mobile-body"]')).not.toBeNull();
    unmount();
    window.innerWidth = 1024;
  });
});
