import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  useMenubar,
  useMenubarItem,
  useMenubarMenu,
  useMenubarMenuRoot,
  useMenubarRadioGroup,
  useMenubarRadioItem,
  useMenubarSub,
  useMenubarSubTrigger,
  useMenubarTrigger,
} from "../src/components/ui/menubar";
import { setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("menubar hooks outside their providers", () => {
  test("context hooks throw with the consumer name", () => {
    expect(() => withSetup(() => useMenubar())).toThrow(
      "useMenubar must be used within a <Menubar />",
    );
    expect(() => withSetup(() => useMenubarMenuRoot())).toThrow(
      "MenubarMenu must be used within a <Menubar />",
    );
    expect(() => withSetup(() => useMenubarMenu())).toThrow(
      "useMenubarMenu must be used within a <MenubarMenu />",
    );
    expect(() => withSetup(() => useMenubarTrigger())).toThrow(
      "MenubarTrigger must be used within a <MenubarMenu />",
    );
    expect(() => withSetup(() => useMenubarItem())).toThrow(
      "MenubarItem must be used within a <MenubarMenu />",
    );
    expect(() => withSetup(() => useMenubarRadioGroup())).toThrow(
      "useMenubarRadioGroup must be used within a <MenubarRadioGroup />",
    );
    expect(() =>
      withSetup(() => useMenubarRadioItem({ value: "a" })),
    ).toThrow("MenubarRadioItem must be used within a <MenubarRadioGroup />");
    expect(() => withSetup(() => useMenubarSub())).toThrow(
      "useMenubarSub must be used within a <MenubarSub />",
    );
    expect(() => withSetup(() => useMenubarSubTrigger())).toThrow(
      "MenubarSubTrigger must be used within a <MenubarSub />",
    );
  });
});
