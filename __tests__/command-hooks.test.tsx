import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  useCommand,
} from "../src/components/ui/command";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("command hooks", () => {
  test("useCommand outside a root throws with the consumer name", () => {
    expect(() => withSetup(() => useCommand())).toThrow(
      "useCommand must be used within a <Command />",
    );
    expect(() => withSetup(() => useCommand("CommandEmpty"))).toThrow(
      "CommandEmpty must be used within a <Command />",
    );
  });

  test("input filters items, forwards oninput, and empty tracks matches", async () => {
    const seen: string[] = [];
    const { root, unmount } = mountUi(() => (
      <Command>
        <CommandInput
          oninput={(e: Event) => {
            seen.push((e.target as HTMLInputElement).value);
          }}
        />
        <CommandList>
          <CommandEmpty />
          <CommandItem value="alpha" keywords={["first"]}>
            Alpha
          </CommandItem>
          <CommandItem value="beta">Beta</CommandItem>
        </CommandList>
      </Command>
    ));
    const input = root.querySelector<HTMLInputElement>("[data-slot=command-input]");
    if (!input) throw new Error("command input missing");
    const items = () => root.querySelectorAll("[data-slot=command-item]").length;
    const empty = () => root.querySelector("[data-slot=command-empty]");
    const flush = async () => {
      await Promise.resolve();
      await Promise.resolve();
    };

    await flush();
    expect(items()).toBe(2);
    expect(empty()).toBeNull();

    input.value = "first";
    input.dispatchEvent(new Event("input"));
    await flush();
    expect(items()).toBe(1);
    expect(empty()).toBeNull();

    input.value = "zzz";
    input.dispatchEvent(new Event("input"));
    await flush();
    expect(items()).toBe(0);
    expect(empty()?.textContent).toBe("No results found.");
    expect(seen).toEqual(["first", "zzz"]);
    unmount();
  });

  test("styled parts render their slots inside a dialog", async () => {
    const { unmount } = mountUi(() => (
      <CommandDialog defaultOpen title="Palette" description="Run" class="x-dialog">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandGroup heading="Suggestions">
              <CommandItem value="calendar" checked disabled>
                Calendar
                <CommandShortcut>⌘C</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value="emoji">Emoji</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    ));
    await Promise.resolve();
    await Promise.resolve();
    const body = document.body;
    expect(body.textContent).toContain("Palette");
    expect(body.textContent).toContain("Run");
    expect(body.querySelectorAll("[data-slot=command-group]").length).toBe(2);
    expect(body.querySelector("[data-slot=command-separator]")).toBeTruthy();
    expect(body.querySelector("[data-slot=command-shortcut]")?.textContent).toBe("⌘C");
    const item = body.querySelector("[data-slot=command-item]");
    expect(item?.getAttribute("data-checked")).toBe("true");
    expect(item?.getAttribute("data-disabled")).toBe("true");
    unmount();
  });
});
