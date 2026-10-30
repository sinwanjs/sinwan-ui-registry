import { describe, expect, test } from "bun:test";
import { Loader2 } from "lucide";
import { cn } from "../src/lib/utils";
import { Slot } from "sinwan-ui-core/slot";
import { flattenChildren, isSinwanElement } from "sinwan-ui-core/types";
import { Icon } from "../src/lib/icons";
import { basePlacement, computePosition, createPointReference, createRectReference, createSizeFloating, estimatePosition, getFocusableElements, readDocumentRtl, toFloatingPlacement, trapFocus, useAnchorPosition, usePointPosition } from "sinwan-ui-core/core";
import { cc } from "sinwan/component";
import { signal } from "sinwan/reactivity";
import { setupDom, teardownDom, asVNode, mountUi } from "./helpers";

describe("cn", () => {
  test("merges tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-medium")).toContain("text-sm");
  });
});

describe("types helpers", () => {
  test("isSinwanElement and flattenChildren", () => {
    const el = { tag: "div", props: {}, children: [] };
    expect(isSinwanElement(el)).toBe(true);
    expect(isSinwanElement("x")).toBe(false);
    expect(flattenChildren(null)).toEqual([]);
    expect(flattenChildren([el, false, "a"])).toEqual([el, "a"]);
    expect(flattenChildren(() => el)).toEqual([el]);
    expect(flattenChildren(() => [el, false, "a"])).toEqual([el, "a"]);
  });
});

describe("Slot", () => {
  test("merges props onto single child", () => {
    const child = {
      tag: "button",
      props: { class: "child", onclick: () => {} },
      children: ["Go"],
    };
    let clicked = 0;
    const result = asVNode(
      Slot({
        class: "slot",
        onclick: () => {
          clicked += 1;
        },
        children: child,
      }),
    );
    expect(result.tag).toBe("button");
    expect(result.props.class).toBe("child slot");
    (result.props.onclick as () => void)();
    expect(clicked).toBe(1);
  });

  test("drops non-string class values", () => {
    const result = asVNode(
      Slot({
        class: 1 as unknown as string,
        children: {
          tag: "span",
          props: {},
          children: ["x"],
        },
      }),
    );
    expect(result.props.class).toBeUndefined();
  });

  test("merges getter class props", () => {
    const child = {
      tag: "a",
      props: { class: () => "child" },
      children: ["Go"],
    };
    const result = asVNode(
      Slot({
        class: () => "slot",
        children: child,
      }),
    );
    expect(typeof result.props.class).toBe("function");
    expect((result.props.class as () => string)()).toBe("child slot");
  });

  test("merges Computed / Signal class props with slot class", () => {
    const childClass = signal("child-active");
    const child = {
      tag: "a",
      props: { class: childClass },
      children: ["Go"],
    };
    const result = asVNode(
      Slot({
        class: "slot-base",
        children: child,
      }),
    );
    expect(typeof result.props.class).toBe("function");
    expect((result.props.class as () => string)()).toBe(
      "child-active slot-base",
    );
    childClass.value = "child-idle";
    expect((result.props.class as () => string)()).toBe("child-idle slot-base");
  });

  test("merges string child class with getter slot class", () => {
    const result = asVNode(
      Slot({
        class: () => "slot",
        children: {
          tag: "a",
          props: { class: "child" },
          children: ["Go"],
        },
      }),
    );
    expect((result.props.class as () => string)()).toBe("child slot");
  });

  test("drops class when neither side has a string", () => {
    const child = {
      tag: "span",
      props: { class: "" },
      children: ["x"],
    };
    const result = asVNode(Slot({ class: 1, children: child }));
    expect(result.props.class).toBeUndefined();
  });

  test("getter class merge with non-strings resolves empty", () => {
    const result = asVNode(
      Slot({
        class: () => 1,
        children: {
          tag: "span",
          props: { class: () => null },
          children: ["x"],
        },
      }),
    );
    expect((result.props.class as () => unknown)()).toBeUndefined();
  });

  test("throws without a single element child", () => {
    expect(() => Slot({ children: "text" })).toThrow(/exactly one/);
    expect(() => Slot({ children: () => "text" })).toThrow(/exactly one/);
    expect(() =>
      Slot({
        children: (_unused: unknown) => ({
          tag: "span",
          props: {},
          children: ["x"],
        }),
      }),
    ).toThrow(/exactly one/);
  });

  test("merges compiler child getters onto the element", () => {
    const child = {
      tag: "a",
      props: { class: "child", href: "#" },
      children: ["Go"],
    };
    const fromGetter = asVNode(
      Slot({
        class: "slot",
        children: () => child,
      }),
    );
    expect(fromGetter.tag).toBe("a");
    expect(fromGetter.props.class).toBe("child slot");
    expect(fromGetter.props.href).toBe("#");

    const fromNested = asVNode(
      Slot({
        class: "slot",
        children: () => () => child,
      }),
    );
    expect(fromNested.tag).toBe("a");
    expect(fromNested.props.class).toBe("child slot");
  });
});

describe("Icon", () => {
  test("renders svg from lucide node", () => {
    setupDom();
    try {
      const { query, unmount } = mountUi(() => (
        <Icon icon={Loader2} class="size-4" size={16} aria-label="Loading" />
      ));
      const svg = query("svg");
      expect(svg?.namespaceURI).toBe("http://www.w3.org/2000/svg");
      expect(svg?.getAttribute("class")).toBe("lucide size-4");
      expect(svg?.getAttribute("width")).toBe("16");
      expect(svg?.getAttribute("fill")).toBe("none");
      expect(svg?.getAttribute("stroke-width")).toBe("2");
      expect(svg?.getAttribute("stroke-linecap")).toBe("round");
      expect(svg?.getAttribute("aria-label")).toBe("Loading");
      expect(svg?.children.length).toBeGreaterThan(0);
      unmount();
    } finally {
      teardownDom();
    }
  });

  test("absoluteStrokeWidth adjusts stroke", () => {
    setupDom();
    try {
      const { query, unmount } = mountUi(() => (
        <Icon icon={Loader2} size={48} strokeWidth={2} absoluteStrokeWidth />
      ));
      expect(query("svg")?.getAttribute("stroke-width")).toBe("1");
      unmount();
    } finally {
      teardownDom();
    }
  });

  test("class, size and stroke follow later prop updates", async () => {
    setupDom();
    try {
      const className = signal("size-4");
      const size = signal(24);
      const { query, unmount } = mountUi(() => (
        <Icon
          icon={Loader2}
          class={className.value}
          size={size.value}
          absoluteStrokeWidth
        />
      ));
      const svg = query("svg");
      expect(svg?.getAttribute("class")).toBe("lucide size-4");
      expect(svg?.getAttribute("stroke-width")).toBe("2");

      className.value = "size-6";
      size.value = 48;
      await Promise.resolve();
      expect(svg?.getAttribute("class")).toBe("lucide size-6");
      expect(svg?.getAttribute("width")).toBe("48");
      expect(svg?.getAttribute("stroke-width")).toBe("1");
      unmount();
    } finally {
      teardownDom();
    }
  });
});

describe("position / focus helpers", () => {
  test("computePosition clamps within viewport", async () => {
    setupDom();
    try {
      const pos = await computePosition(
        { top: 10, left: 10, bottom: 30, right: 50, width: 40, height: 20 },
        { width: 100, height: 40 },
        "bottom",
        "center",
        8,
      );
      expect(pos.top).toBeGreaterThanOrEqual(8);
      expect(pos.left).toBeGreaterThanOrEqual(8);
      const left = await computePosition(
        { top: 100, left: 200, bottom: 120, right: 240, width: 40, height: 20 },
        { width: 80, height: 40 },
        "left",
        "start",
      );
      expect(left.left).toBeLessThan(200);
      const right = await computePosition(
        { top: 100, left: 10, bottom: 120, right: 50, width: 40, height: 20 },
        { width: 80, height: 40 },
        "right",
        "end",
      );
      expect(right.left).toBeGreaterThan(10);
      const top = await computePosition(
        { top: 100, left: 10, bottom: 120, right: 50, width: 40, height: 20 },
        { width: 80, height: 40 },
        "top",
        "end",
      );
      expect(top.top).toBeLessThan(100);
    } finally {
      teardownDom();
    }
  });

  test("toFloatingPlacement and estimatePosition cover sides", () => {
    setupDom();
    try {
      expect(toFloatingPlacement("bottom", "center")).toBe("bottom");
      expect(toFloatingPlacement("top", "start")).toBe("top-start");
      expect(basePlacement("bottom-end")).toBe("bottom");
      expect(basePlacement("weird")).toBe("bottom");
      const anchor = {
        top: 80,
        left: 100,
        bottom: 100,
        right: 140,
        width: 40,
        height: 20,
      };
      expect(estimatePosition(anchor, { width: 50, height: 20 }, "bottom", "start", 8).top).toBe(108);
      expect(estimatePosition(anchor, { width: 50, height: 20 }, "top", "end", 8).top).toBe(52);
      expect(estimatePosition(anchor, { width: 50, height: 20 }, "left", "center", 8).left).toBe(42);
      expect(estimatePosition(anchor, { width: 50, height: 20 }, "right", "start", 8).left).toBe(148);
      expect(estimatePosition(anchor, { width: 50, height: 20 }, "left", "end", 8).top).toBe(80);
      expect(estimatePosition(anchor, { width: 50, height: 20 }, "bottom", "center", 8).left).toBe(95);

      const ref = createRectReference(anchor).getBoundingClientRect();
      expect(ref.width).toBe(40);
      expect(ref.toJSON().left).toBe(100);
      const size = createSizeFloating(12, 34).getBoundingClientRect();
      expect(size.height).toBe(34);
      expect(size.toJSON().width).toBe(12);
      const point = createPointReference(9, 11).getBoundingClientRect();
      expect(point.x).toBe(9);
      expect(point.toJSON().y).toBe(11);

      expect(readDocumentRtl()).toBe(false);
      const original = window.getComputedStyle;
      (window as unknown as { getComputedStyle: unknown }).getComputedStyle = () => {
        throw new Error("boom");
      };
      expect(readDocumentRtl()).toBe(false);
      window.getComputedStyle = original;
    } finally {
      teardownDom();
    }
  });

  test("trapFocus cycles tab", () => {
    setupDom();
    try {
      const root = document.createElement("div");
      document.body.appendChild(root);
      const a = document.createElement("button");
      const b = document.createElement("button");
      root.append(a, b);
      a.focus();
      const forward = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
      });
      Object.defineProperty(forward, "shiftKey", { value: false });
      trapFocus(forward, root);
      expect(getFocusableElements(root).length).toBe(2);

      a.focus();
      const backward = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
      });
      Object.defineProperty(backward, "shiftKey", { value: true });
      let prevented = false;
      Object.defineProperty(backward, "preventDefault", {
        value: () => {
          prevented = true;
        },
      });
      trapFocus(backward, root);
      expect(prevented).toBe(true);
      expect(document.activeElement).toBe(b);
    } finally {
      teardownDom();
    }
  });

  test("useAnchorPosition updates when open becomes true", async () => {
    setupDom();
    try {
      HTMLElement.prototype.getBoundingClientRect = function () {
        return {
          x: 100,
          y: 80,
          width: 40,
          height: 20,
          top: 80,
          left: 100,
          bottom: 100,
          right: 140,
          toJSON() {
            return this;
          },
        } as DOMRect;
      };
      const open = signal(false);
      const trigger = signal<HTMLElement | null>(null);
      const Probe = cc(() => {
        const { style, present, ready } = useAnchorPosition({
          open,
          trigger,
          placement: "bottom",
          align: "start",
          gap: 8,
          fallbackSize: { width: 50, height: 20 },
        });
        return (
          <div
            data-slot="probe"
            data-ready={(ready.value ? "true" : undefined)}
            data-present={(present.value ? "true" : undefined)}
            style={style.value as unknown as string}
          />
        );
      });
      const { root, unmount } = mountUi(() => <Probe />);
      const el = document.createElement("button");
      document.body.appendChild(el);
      trigger.value = el;
      open.value = true;
      await Promise.resolve();
      await new Promise((r) => setTimeout(r, 0));
      const probe = root.querySelector("[data-slot=probe]") as HTMLElement;
      expect(probe.getAttribute("data-present")).toBe("true");
      expect(probe.style.top).not.toBe("0px");
      expect(Number.parseFloat(probe.style.top)).toBe(108);
      unmount();
    } finally {
      teardownDom();
    }
  });

  test("usePointPosition tracks pointer coordinates", async () => {
    setupDom();
    try {
      const open = signal(false);
      const point = signal({ x: 0, y: 0 });
      const Probe = cc(() => {
        const { style, present, ready } = usePointPosition({
          open,
          point,
        });
        return (
          <div
            data-slot="point"
            data-ready={(ready.value ? "true" : undefined)}
            data-present={(present.value ? "true" : undefined)}
            style={style.value as unknown as string}
          />
        );
      });
      const { root, unmount } = mountUi(() => <Probe />);
      point.value = { x: 42, y: 84 };
      open.value = true;
      await Promise.resolve();
      await new Promise((r) => setTimeout(r, 0));
      const el = root.querySelector("[data-slot=point]") as HTMLElement;
      expect(el.getAttribute("data-present")).toBe("true");
      expect(el.style.top).toBe("84px");
      expect(el.style.left).toBe("42px");
      unmount();
    } finally {
      teardownDom();
    }
  });

  test("autoUpdate does not throw for disconnected or non-Element content", async () => {
    setupDom();
    try {
      const trigger = document.createElement("button");
      document.body.appendChild(trigger);
      const disconnected = document.createElement("div");
      const connected = document.createElement("div");
      document.body.appendChild(connected);
      Object.assign(connected.style, { width: "40px", height: "20px" });

      const open = signal(true);
      const triggerEl = signal<HTMLElement | null>(trigger);
      const content = signal<HTMLElement | null>(disconnected);
      const pointAt = signal({ x: 4, y: 8 });
      const Probe = cc(() => {
        const anchor = useAnchorPosition({
          open,
          trigger: triggerEl,
          content,
        });
        const point = usePointPosition({
          open,
          point: pointAt,
          content,
        });
        return (
          <div
            data-slot="auto-update-probe"
            data-anchor={(anchor.present.value ? "yes" : "no")}
            data-point={(point.present.value ? "yes" : "no")}
          />
        );
      });

      const { root, unmount } = mountUi(() => <Probe />);
      await Promise.resolve();
      await new Promise((r) => setTimeout(r, 0));
      expect(root.querySelector("[data-slot=auto-update-probe]")).toBeTruthy();

      content.value = { isConnected: false } as unknown as HTMLElement;
      await Promise.resolve();
      await new Promise((r) => setTimeout(r, 0));

      content.value = {
        isConnected: false,
        getBoundingClientRect() {
          throw new Error("rect");
        },
      } as unknown as HTMLElement;
      await Promise.resolve();
      await new Promise((r) => setTimeout(r, 0));

      const originalGetComputedStyle = window.getComputedStyle.bind(window);
      window.getComputedStyle = (() => {
        throw new TypeError("parameter 1 is not of type 'Element'.");
      }) as typeof window.getComputedStyle;
      try {
        content.value = connected;
        await Promise.resolve();
        await new Promise((r) => setTimeout(r, 0));
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
      }

      open.value = false;
      await Promise.resolve();
      await new Promise((r) => setTimeout(r, 0));
      expect(
        root
          .querySelector("[data-slot=auto-update-probe]")
          ?.getAttribute("data-anchor"),
      ).toBe("no");

      unmount();
    } finally {
      teardownDom();
    }
  });
});
