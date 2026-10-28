import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import {
  useContextMenu,
  useContextMenuRadioGroup,
  useContextMenuSub,
} from "../src/components/ui/context-menu";
import { setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("context menu hooks", () => {
  test("context hooks throw outside their roots", () => {
    expect(() => withSetup(() => useContextMenu())).toThrow(
      "useContextMenu must be used within a <ContextMenu />",
    );
    expect(() => withSetup(() => useContextMenuRadioGroup())).toThrow(
      "useContextMenuRadioGroup must be used within a <ContextMenuRadioGroup />",
    );
    expect(() => withSetup(() => useContextMenuSub())).toThrow(
      "useContextMenuSub must be used within a <ContextMenuSub />",
    );
  });
});
