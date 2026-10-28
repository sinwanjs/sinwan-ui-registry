import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";
import { transformJSX } from "sinwan-compiler";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  useSelect,
  useSelectRoot,
} from "../src/components/ui/select";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("useSelect", () => {
  test("throws outside a Select root", () => {
    expect(() => withSetup(() => useSelect())).toThrow(
      "useSelect must be used within a <Select />",
    );
    expect(() => withSetup(() => useSelect("SelectTrigger"))).toThrow(
      "SelectTrigger must be used within a <Select />",
    );
  });

  test("uncontrolled root defaults and local updates", () => {
    const select = withSetup(() => useSelectRoot({}));
    expect(select.open.value).toBe(false);
    expect(select.value.value).toBe("");
    expect(select.placeholder).toBe("");
    select.setOpen(true);
    expect(select.open.value).toBe(true);
    select.setValue("a");
    expect(select.value.value).toBe("a");
    expect(select.label.value).toBe("");
    expect(select.open.value).toBe(false);
  });

  test("controlled open and value follow props and ignore local updates", () => {
    const opens: boolean[] = [];
    const values: string[] = [];
    const select = withSetup(() =>
      useSelectRoot({
        open: true,
        value: "b",
        placeholder: "Root",
        onOpenChange: (next) => opens.push(next),
        onValueChange: (next) => values.push(next),
      }),
    );
    expect(select.open.value).toBe(true);
    expect(select.value.value).toBe("b");
    expect(select.placeholder).toBe("Root");
    select.setValue("c", "C");
    expect(select.value.value).toBe("b");
    expect(select.label.value).toBe("");
    select.registerItem("b", "B");
    select.registerItem("b", "B");
    expect(select.label.value).toBe("B");
    expect(select.open.value).toBe(true);
    select.setOpen(false);
    expect(select.open.value).toBe(true);
    expect(values).toEqual(["c"]);
    expect(opens).toEqual([false, false]);
  });

  test("controlled value prop may be undefined", () => {
    const select = withSetup(() => useSelectRoot({ value: undefined }));
    expect(select.value.value).toBe("");
  });
});

describe("Select markup", () => {
  test("group, label, separator, and root placeholder render; picking updates value", async () => {
    const { query, unmount } = mountUi(() => (
      <Select defaultOpen placeholder="Root placeholder">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup class="extra-group">
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectSeparator class="extra-separator" />
            <SelectItem value="pear">Pear</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    ));
    expect(query('[data-slot="select-group"]')?.className).toContain(
      "extra-group",
    );
    expect(query('[data-slot="select-label"]')?.textContent).toBe("Fruits");
    expect(query('[data-slot="select-separator"]')?.className).toContain(
      "extra-separator",
    );
    const value = query('[data-slot="select-value"]');
    expect(value?.textContent).toBe("Root placeholder");
    expect(value?.hasAttribute("data-placeholder")).toBe(true);
    expect(
      query('[data-slot="select-trigger"]')?.getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      query('[data-slot="select-content"]')?.getAttribute("data-state"),
    ).toBe("open");

    const pear = document.querySelectorAll('[data-slot="select-item"]')[1];
    pear?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(value?.hasAttribute("data-placeholder")).toBe(false);
    expect(value?.textContent).toBe("Pear");
    expect(pear?.getAttribute("aria-selected")).toBe("true");
    expect(
      query('[data-slot="select-trigger"]')?.getAttribute("aria-expanded"),
    ).not.toBe("");
    expect(
      query('[data-slot="select-content"]')?.getAttribute("data-state"),
    ).toBe("closed");
    unmount();
  });

  test("an initial value shows its item label before the list is opened", async () => {
    const { query, queryAll, unmount } = mountUi(() => (
      <>
        <Select value="apple">
          <SelectTrigger>
            <SelectValue placeholder="Fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="pear">Pear</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="pear">
          <SelectTrigger>
            <SelectValue placeholder="Fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="pear">Pear</SelectItem>
          </SelectContent>
        </Select>
      </>
    ));
    await Promise.resolve();
    const values = queryAll('[data-slot="select-value"]');
    expect(values.map((value) => value.textContent)).toEqual(["Apple", "Pear"]);
    expect(values.some((value) => value.hasAttribute("data-placeholder"))).toBe(
      false,
    );
    expect(query('[data-slot="select-content"]')).toBeNull();
    expect(query('[data-slot="select-item"]')).toBeNull();
    unmount();
  });

  test("a controlled value change updates the label without opening", async () => {
    const value = signal("apple");
    const { query, unmount } = mountUi(() => (
      <Select value={value.value}>
        <SelectTrigger>
          <SelectValue placeholder="Fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="pear">Pear</SelectItem>
        </SelectContent>
      </Select>
    ));
    await Promise.resolve();
    const text = query('[data-slot="select-value"]');
    expect(text?.textContent).toBe("Apple");
    value.value = "pear";
    await Promise.resolve();
    expect(text?.textContent).toBe("Pear");
    value.value = "";
    await Promise.resolve();
    expect(text?.textContent).toBe("Fruit");
    expect(text?.hasAttribute("data-placeholder")).toBe(true);
    unmount();
  });

  test("SelectTrigger passes button attributes and composes onclick", async () => {
    const clicks: string[] = [];
    const { query, unmount } = mountUi(() => (
      <Select>
        <SelectTrigger
          id="fruit"
          name="fruit"
          aria-label="Fruit"
          aria-invalid="true"
          class="extra-trigger"
          size="sm"
          onclick={() => clicks.push("user")}
        >
          <SelectValue placeholder="Fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    ));
    const trigger = query('[data-slot="select-trigger"]');
    expect(trigger?.id).toBe("fruit");
    expect(trigger?.getAttribute("name")).toBe("fruit");
    expect(trigger?.getAttribute("aria-label")).toBe("Fruit");
    expect(trigger?.getAttribute("aria-invalid")).toBe("true");
    expect(trigger?.getAttribute("type")).toBe("button");
    expect(trigger?.getAttribute("data-size")).toBe("sm");
    expect(trigger?.className).toContain("extra-trigger");
    trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(clicks).toEqual(["user"]);
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    unmount();
  });

  test("SelectTrigger forwards callback and object refs", () => {
    const callbackRefs: (HTMLButtonElement | null)[] = [];
    const objectRef: { current: HTMLButtonElement | null } = { current: null };
    const { unmount } = mountUi(() => (
      <Select>
        <SelectTrigger ref={(element) => callbackRefs.push(element)} />
        <SelectTrigger ref={objectRef} />
        <SelectTrigger ref={null} />
      </Select>
    ));
    const triggers = document.querySelectorAll<HTMLButtonElement>(
      '[data-slot="select-trigger"]',
    );
    expect(callbackRefs[0]).toBe(triggers.item(0));
    expect(objectRef.current).toBe(triggers.item(1));
    unmount();
  });

  test("a prevented trigger click keeps the list closed; disabled passes through", () => {
    const { query, unmount } = mountUi(() => (
      <Select>
        <SelectTrigger onclick={(event) => event.preventDefault()}>
          <SelectValue placeholder="Fruit" />
        </SelectTrigger>
        <SelectTrigger disabled>
          <SelectValue placeholder="Fruit" />
        </SelectTrigger>
      </Select>
    ));
    const [prevented, disabled] = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-slot="select-trigger"]'),
    );
    prevented?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(prevented?.getAttribute("aria-expanded")).toBe("false");
    expect(disabled?.disabled).toBe(true);
    expect(query('[data-slot="select-content"]')).toBeNull();
    unmount();
  });

  test("SelectContent follows class, position, and children prop changes", async () => {
    const extra = signal("first-class");
    const position = signal<"popper" | "item-aligned">("popper");
    const label = signal("Apple");
    const { query, unmount } = mountUi(() => (
      <Select defaultOpen>
        <SelectContent class={extra.value} position={position.value}>
          <SelectItem value="apple">{label.value}</SelectItem>
        </SelectContent>
      </Select>
    ));
    const content = query('[data-slot="select-content"]');
    const viewport = query('[data-slot="select-viewport"]');
    expect(content?.className).toContain("first-class");
    expect(viewport?.getAttribute("data-position")).toBe("popper");
    expect(content?.hasAttribute("data-align-trigger")).toBe(false);
    extra.value = "second-class";
    position.value = "item-aligned";
    label.value = "Green apple";
    await Promise.resolve();
    expect(content?.className).toContain("second-class");
    expect(content?.className).not.toContain("first-class");
    expect(viewport?.getAttribute("data-position")).toBe("item-aligned");
    expect(content?.hasAttribute("data-align-trigger")).toBe(true);
    expect(query('[data-slot="select-item"]')?.textContent).toBe("Green apple");
    unmount();
  });
});

describe("Select source under consumer compiler defaults", () => {
  test("select.tsx compiles without derived-local snapshot warnings", async () => {
    const path = new URL("../src/components/ui/select/select.tsx", import.meta.url)
      .pathname;
    const source = await Bun.file(path).text();
    const warn = console.warn;
    const seen: string[] = [];
    console.warn = (...args: unknown[]) => {
      seen.push(String(args[0]));
    };
    try {
      transformJSX(source, path, {
        hoist: true,
        explicitBindings: false,
        derivedLocals: false,
        dev: true,
      });
    } finally {
      console.warn = warn;
    }
    expect(seen.filter((line) => line.includes("derived local"))).toEqual([]);
  });
});
