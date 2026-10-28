import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { inject } from "sinwan/component";
import { signal } from "sinwan/reactivity";
import { Button } from "../src/components/ui/button";
import {
  ThemeProvider,
  ThemeToggle,
  useTheme,
  type Palette,
  type ThemeApi,
} from "sinwan-ui-core/theme";
import {
  DirectionKey,
  DirectionProvider,
  useDirection,
  type Direction,
  type DirectionApi,
} from "sinwan-ui-core/direction";
import { useIsMobile } from "../src/hooks/use-mobile";
import { toast, Toaster } from "../src/components/ui/sonner";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-palette");
  document.documentElement.removeAttribute("data-theme");
  localStorage.clear();
});

afterEach(() => {
  teardownDom();
});

describe("ThemeProvider", () => {
  test("provides theme api and applies dark class", () => {
    let api: ThemeApi | undefined;
    const Child = () => {
      api = useTheme();
      return <span>child</span>;
    };
    const { unmount } = mountUi(() => (
      <ThemeProvider defaultTheme="dark">
        <Child />
      </ThemeProvider>
    ));
    expect(api).toBeDefined();
    api!.setTheme("light");
    expect(api!.theme.value).toBe("light");
    unmount();

    const second = mountUi(() => (
      <ThemeProvider defaultTheme="dark" disableTransitionOnChange>
        <span>x</span>
      </ThemeProvider>
    ));
    expect(second.root.textContent).toContain("x");
    second.unmount();
  });

  test("ThemeToggle flips theme", () => {
    let api: ThemeApi | undefined;
    const Capture = () => {
      api = useTheme();
      return <ThemeToggle />;
    };
    const { click, root, unmount } = mountUi(() => (
      <ThemeProvider defaultTheme="light">
        <Capture />
      </ThemeProvider>
    ));
    expect(api!.theme.value).toBe("light");
    expect(root.textContent).toContain("Dark");
    click('[data-slot="theme-toggle"]');
    expect(api!.theme.value).toBe("dark");
    unmount();
  });

  test("ThemeToggle renders custom children", () => {
    const { root, unmount } = mountUi(() => (
      <ThemeProvider defaultTheme="light">
        <ThemeToggle>
          <span>sun</span>
          <span>moon</span>
        </ThemeToggle>
      </ThemeProvider>
    ));
    expect(root.textContent).toContain("sun");
    expect(root.textContent).toContain("moon");
    expect(root.textContent).not.toContain("Dark");
    unmount();
  });

  test("useTheme throws outside provider", () => {
    expect(() => withSetup(() => useTheme())).toThrow(/ThemeProvider/);
  });

  test("locks transitions and applies document theme before variant classes", () => {
    let api: ThemeApi | undefined;
    const htmlWhenVariantRan: string[] = [];
    const Child = () => {
      api = useTheme();
      return (
        <Button
          // Side-effect getter: must run on each variant read (not a bare .value).
          // @ts-expect-error intentional live getter with instrumentation
          variant={() => {
            htmlWhenVariantRan.push(document.documentElement.className);
            return api!.theme.value === "dark" ? "default" : "outline";
          }}
        >
          Dark
        </Button>
      );
    };
    const { query, unmount } = mountUi(() => (
      <ThemeProvider defaultTheme="light">
        <Child />
      </ThemeProvider>
    ));
    htmlWhenVariantRan.length = 0;
    api!.setTheme("dark");
    const lock = [...document.head.querySelectorAll("style")].some((style) =>
      (style.textContent ?? "").includes("transition:none"),
    );
    expect(lock).toBe(true);
    expect(htmlWhenVariantRan.at(-1)).toContain("dark");
    expect(query("[data-slot=button]")?.getAttribute("data-variant")).toBe(
      "default",
    );
    expect(query("[data-slot=button]")?.className).toContain("bg-primary");
    unmount();
  });

  test("keeps CSS transitions when disableTransitionOnChange is false", () => {
    let api: ThemeApi | undefined;
    const Child = () => {
      api = useTheme();
      return <span>child</span>;
    };
    const { unmount } = mountUi(() => (
      <ThemeProvider defaultTheme="light" disableTransitionOnChange={false}>
        <Child />
      </ThemeProvider>
    ));
    api!.setTheme("dark");
    const lock = [...document.head.querySelectorAll("style")].some((style) =>
      (style.textContent ?? "").includes("transition:none"),
    );
    expect(lock).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    unmount();
  });

  test("defaults to credit-blue palette and switches via setPalette", () => {
    let api: ThemeApi | undefined;
    const Child = () => {
      api = useTheme();
      return <span>child</span>;
    };
    const { unmount } = mountUi(() => (
      <ThemeProvider defaultTheme="light">
        <Child />
      </ThemeProvider>
    ));
    expect(api!.palette.value).toBe("credit-blue");
    expect(api!.palettes).toEqual(["credit-blue", "jomlaty"]);
    expect(document.documentElement.getAttribute("data-palette")).toBe(
      "credit-blue",
    );
    api!.setPalette("jomlaty");
    expect(api!.palette.value).toBe("jomlaty");
    expect(document.documentElement.getAttribute("data-palette")).toBe(
      "jomlaty",
    );
    expect(localStorage.getItem("sinwan-ui-palette")).toBe("jomlaty");
    unmount();
  });

  test("restores palette from storage and forcedPalette blocks setPalette", () => {
    localStorage.setItem("sinwan-ui-palette", "jomlaty");
    let api: ThemeApi | undefined;
    const Capture = () => {
      api = useTheme();
      return <span />;
    };
    const stored = mountUi(() => (
      <ThemeProvider defaultTheme="light">
        <Capture />
      </ThemeProvider>
    ));
    expect(api!.palette.value).toBe("jomlaty");
    stored.unmount();

    const forced = mountUi(() => (
      <ThemeProvider defaultTheme="light" forcedPalette="credit-blue">
        <Capture />
      </ThemeProvider>
    ));
    expect(api!.palette.value).toBe("credit-blue");
    api!.setPalette("jomlaty");
    expect(api!.palette.value).toBe("credit-blue");
    expect(document.documentElement.getAttribute("data-palette")).toBe(
      "credit-blue",
    );
    forced.unmount();
  });

  test("ignores unknown palette values from storage and setPalette", () => {
    localStorage.setItem("custom-palette", "not-a-palette");
    let api: ThemeApi | undefined;
    const Child = () => {
      api = useTheme();
      return <span />;
    };
    const { unmount } = mountUi(() => (
      <ThemeProvider
        defaultTheme="light"
        defaultPalette="credit-blue"
        paletteStorageKey="custom-palette"
        palettes={["credit-blue", "jomlaty"]}
      >
        <Child />
      </ThemeProvider>
    ));
    expect(api!.palette.value).toBe("credit-blue");
    api!.setPalette("jomlaty");
    expect(api!.palette.value).toBe("jomlaty");
    api!.setPalette("neon" as Palette);
    expect(api!.palette.value).toBe("jomlaty");
    unmount();

    const empty = mountUi(() => (
      <ThemeProvider defaultTheme="light" palettes={[]}>
        <Child />
      </ThemeProvider>
    ));
    expect(api!.palettes).toEqual(["credit-blue", "jomlaty"]);
    empty.unmount();
  });
});

describe("DirectionProvider", () => {
  test("sets dir and useDirection reads it", () => {
    let seen = "";
    const Child = () => {
      seen = useDirection();
      return <span>{seen}</span>;
    };
    const { root, unmount } = mountUi(() => (
      <DirectionProvider dir="rtl">
        <Child />
      </DirectionProvider>
    ));
    expect(seen).toBe("rtl");
    expect(root.querySelector('[data-slot="direction-provider"]')?.getAttribute("dir")).toBe(
      "rtl",
    );
    unmount();
    expect(withSetup(() => useDirection())).toBe("ltr");
  });

  test("live dir prop updates the wrapper attribute", async () => {
    const dir = signal<Direction>("ltr");
    const { root, unmount } = mountUi(() => (
      <DirectionProvider
        dir={dir.value}
      >
        <span>sample</span>
      </DirectionProvider>
    ));
    const provider = () =>
      root.querySelector('[data-slot="direction-provider"]');
    expect(provider()?.getAttribute("dir")).toBe("ltr");
    dir.value = "rtl";
    await Promise.resolve();
    expect(provider()?.getAttribute("dir")).toBe("rtl");
    unmount();
  });

  test("uncontrolled setDir updates the wrapper attribute", async () => {
    let api: DirectionApi | undefined;
    const { root, unmount } = mountUi(() => {
      const Probe = () => {
        api = inject(DirectionKey);
        return <span />;
      };
      return (
        <DirectionProvider>
          <Probe />
        </DirectionProvider>
      );
    });
    expect(
      root.querySelector('[data-slot="direction-provider"]')?.getAttribute("dir"),
    ).toBe("ltr");
    api!.setDir("rtl");
    await Promise.resolve();
    expect(
      root.querySelector('[data-slot="direction-provider"]')?.getAttribute("dir"),
    ).toBe("rtl");
    unmount();
  });
});

describe("useIsMobile", () => {
  test("returns getter during setup", () => {
    withSetup(() => {
      const isMobile = useIsMobile();
      expect(typeof isMobile()).toBe("boolean");
    });
  });
});

describe("toast", () => {
  test("queues and dismisses toasts", async () => {
    toast("hello");
    toast.success("ok");
    toast.error("bad");
    toast.info("info");
    toast.warning("warn");
    const id = toast.loading("load");
    expect(id).toBeTruthy();
    toast.dismiss(id);
    toast.dismiss();
    const { query, unmount } = mountUi(() => <Toaster />);
    expect(query('[data-slot="toaster"]')).toBeTruthy();
    toast.success({ title: "colored", description: "done" });
    toast.error("fail");
    toast.info("note");
    toast.warning("careful");
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[data-type="success"]')).toBeTruthy();
    expect(document.querySelector('[data-type="error"]')).toBeTruthy();
    expect(document.querySelector('[data-type="info"]')).toBeTruthy();
    expect(document.querySelector('[data-type="warning"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="toast-icon"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="toast-title"]')).toBeTruthy();
    expect(
      document.querySelector('[data-type="success"]')?.className,
    ).toContain("text-success");
    toast.dismiss();
    unmount();
  });

  test("Toaster without a ThemeProvider renders silently with the system theme", () => {
    const warn = console.warn;
    const seen: unknown[] = [];
    console.warn = (...args: unknown[]) => {
      seen.push(args[0]);
    };
    try {
      const { query, unmount } = mountUi(() => <Toaster />);
      expect(query('[data-slot="toaster"]')?.getAttribute("data-theme")).toBe(
        "system",
      );
      unmount();
    } finally {
      console.warn = warn;
    }
    expect(seen).toEqual([]);
  });

  test("Toaster data-theme follows the ThemeProvider theme", async () => {
    let api: ThemeApi | undefined;
    const Capture = () => {
      api = useTheme();
      return null;
    };
    const { query, unmount } = mountUi(() => (
      <ThemeProvider defaultTheme="dark">
        <Capture />
        <Toaster />
      </ThemeProvider>
    ));
    const toaster = query('[data-slot="toaster"]');
    expect(toaster?.getAttribute("data-theme")).toBe("dark");
    api!.setTheme("light");
    await Promise.resolve();
    expect(toaster?.getAttribute("data-theme")).toBe("light");
    unmount();
  });
});
