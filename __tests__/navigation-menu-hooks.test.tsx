import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  useNavigationMenu,
  useNavigationMenuItem,
} from "../src/components/ui/navigation-menu";
import { DirectionProvider } from "sinwan-ui-core/direction";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

describe("navigation-menu hooks", () => {
  beforeEach(() => {
    setupDom();
  });

  afterEach(() => {
    teardownDom();
  });

  test("context hooks throw outside their providers", () => {
    expect(() => withSetup(() => useNavigationMenu())).toThrow(
      "useNavigationMenu must be used within a <NavigationMenu />",
    );
    expect(() => withSetup(() => useNavigationMenuItem())).toThrow(
      "useNavigationMenuItem must be used within a <NavigationMenuItem />",
    );
  });

  test("root reads direction, viewport tracks the open item, trigger pins and unpins", async () => {
    const ui = mountUi(() => (
      <DirectionProvider dir="rtl">
        <NavigationMenu viewport>
          <NavigationMenuList>
            <NavigationMenuItem value="a">
              <NavigationMenuTrigger>A</NavigationMenuTrigger>
              <NavigationMenuContent>Panel A</NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </DirectionProvider>
    ));
    const nav = ui.query('[data-slot="navigation-menu"]');
    expect(nav?.getAttribute("dir")).toBe("rtl");
    expect(
      ui.query('[data-slot="navigation-menu-viewport"]')?.getAttribute("data-state"),
    ).toBe("closed");

    ui.click('[data-slot="navigation-menu-trigger"]');
    await Promise.resolve();
    expect(
      ui.query('[data-slot="navigation-menu-viewport"]')?.getAttribute("data-state"),
    ).toBe("open");
    expect(nav?.hasAttribute("data-pinned")).toBe(true);

    ui.click('[data-slot="navigation-menu-trigger"]');
    await Promise.resolve();
    expect(
      ui.query('[data-slot="navigation-menu-viewport"]')?.getAttribute("data-state"),
    ).toBe("closed");
    expect(nav?.hasAttribute("data-pinned")).toBe(false);
    ui.unmount();
  });
});
