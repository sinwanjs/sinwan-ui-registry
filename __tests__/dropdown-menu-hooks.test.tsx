import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  useDropdownMenu,
  useDropdownMenuContent,
  useDropdownMenuItem,
  useDropdownMenuRadioGroup,
  useDropdownMenuRadioItem,
  useDropdownMenuSub,
  useDropdownMenuSubTrigger,
  useDropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import { setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("dropdown-menu hooks outside their providers", () => {
  test("context hooks throw with the consumer name", () => {
    expect(() => withSetup(() => useDropdownMenu())).toThrow(
      "useDropdownMenu must be used within a <DropdownMenu />",
    );
    expect(() => withSetup(() => useDropdownMenuTrigger())).toThrow(
      "DropdownMenuTrigger must be used within a <DropdownMenu />",
    );
    expect(() => withSetup(() => useDropdownMenuContent({}))).toThrow(
      "DropdownMenuContent must be used within a <DropdownMenu />",
    );
    expect(() => withSetup(() => useDropdownMenuItem({}))).toThrow(
      "DropdownMenuItem must be used within a <DropdownMenu />",
    );
    expect(() => withSetup(() => useDropdownMenuRadioGroup())).toThrow(
      "useDropdownMenuRadioGroup must be used within a <DropdownMenuRadioGroup />",
    );
    expect(() =>
      withSetup(() => useDropdownMenuRadioItem({ value: "a" })),
    ).toThrow(
      "DropdownMenuRadioItem must be used within a <DropdownMenuRadioGroup />",
    );
    expect(() => withSetup(() => useDropdownMenuSub())).toThrow(
      "useDropdownMenuSub must be used within a <DropdownMenuSub />",
    );
    expect(() => withSetup(() => useDropdownMenuSubTrigger())).toThrow(
      "DropdownMenuSubTrigger must be used within a <DropdownMenuSub />",
    );
  });
});
