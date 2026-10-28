import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cc, type SinwanNode } from "sinwan/component";
import { signal } from "sinwan/reactivity";
import {
  useMessageScroller,
  useMessageScrollerButton,
  useMessageScrollerContent,
  useMessageScrollerRoot,
  useMessageScrollerViewport,
  type MessageScrollerContext,
  type MessageScrollerDirection,
} from "../src/components/ui/message-scroller";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

const CustomRoot = cc((props: { children?: SinwanNode; stick?: boolean }) => {
  useMessageScrollerRoot({ initialStickToBottom: props.stick });
  return <>{props.children}</>;
});

const CustomViewport = cc(
  (props: { children?: SinwanNode; onscroll?: (event: Event) => void }) => {
    const viewport = useMessageScrollerViewport(props);
    const content = useMessageScrollerContent();
    return (
      <div
        data-testid="viewport"
        ref={viewport.viewportRef}
        onscroll={viewport.onScroll}
      >
        <div ref={content.contentRef}>{props.children}</div>
        <div ref={viewport.sentinelRef} />
      </div>
    );
  },
);

const CustomJump = cc((props: { direction: MessageScrollerDirection }) => {
  const button = useMessageScrollerButton(props);
  return (
    <button
      data-direction={props.direction}
      data-active={button.active.value ? "true" : "false"}
      onclick={button.onClick}
    />
  );
});

function stubViewport(viewport: HTMLElement, scrollTop: number): void {
  Object.defineProperty(viewport, "scrollHeight", {
    value: 800,
    configurable: true,
  });
  Object.defineProperty(viewport, "clientHeight", {
    value: 100,
    configurable: true,
  });
  Object.defineProperty(viewport, "scrollTop", {
    value: scrollTop,
    writable: true,
    configurable: true,
  });
}

describe("message scroller hooks", () => {
  test("useMessageScroller outside a provider keeps the existing message", () => {
    expect(() => withSetup(() => useMessageScroller())).toThrow(
      "useMessageScroller must be used within MessageScrollerProvider",
    );
  });

  test("headless hooks drive custom markup and forward onscroll", async () => {
    let api: MessageScrollerContext | undefined;
    const scrolls: Event[] = [];
    const Probe = cc(() => {
      api = useMessageScroller();
      return null;
    });
    const { root, unmount } = mountUi(() => (
      <CustomRoot stick={false}>
        <Probe />
        <CustomViewport onscroll={(event) => scrolls.push(event)}>
          <p>one</p>
        </CustomViewport>
        <CustomJump direction="end" />
        <CustomJump direction="start" />
      </CustomRoot>
    ));
    await Promise.resolve();

    expect(api?.stickToBottom.value).toBe(false);
    const viewport = root.querySelector(
      '[data-testid="viewport"]',
    ) as HTMLElement;
    expect(api?.viewportEl.value).toBe(viewport);
    expect(api?.contentEl.value).toBe(viewport.firstElementChild as HTMLElement);

    const end = root.querySelector('[data-direction="end"]') as HTMLElement;
    const start = root.querySelector('[data-direction="start"]') as HTMLElement;
    expect(end.getAttribute("data-active")).toBe("false");
    expect(start.getAttribute("data-active")).toBe("false");

    stubViewport(viewport, 300);
    viewport.dispatchEvent(new Event("scroll"));
    await Promise.resolve();

    expect(scrolls).toHaveLength(1);
    expect(end.getAttribute("data-active")).toBe("true");
    expect(start.getAttribute("data-active")).toBe("true");

    const targets: ScrollToOptions[] = [];
    viewport.scrollTo = ((options?: ScrollToOptions) => {
      if (options) targets.push(options);
    }) as typeof viewport.scrollTo;
    start.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    end.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(targets).toEqual([
      { top: 0, behavior: "smooth" },
      { top: 800, behavior: "smooth" },
    ]);
    expect(api?.stickToBottom.value).toBe(true);
    unmount();
  });

  test("direction and onscroll follow later updates", async () => {
    const direction = signal<MessageScrollerDirection>("end");
    const seen: string[] = [];
    const handler = signal<(event: Event) => void>(() => {
      seen.push("a");
    });
    const { root, unmount } = mountUi(() => (
      <CustomRoot stick={false}>
        <CustomViewport onscroll={() => handler.value}>
          <p>one</p>
        </CustomViewport>
        <CustomJump direction={direction.value} />
      </CustomRoot>
    ));
    await Promise.resolve();

    const button = root.querySelector("button");
    const viewport = root.querySelector('[data-testid="viewport"]');
    if (!(button instanceof HTMLElement) || !(viewport instanceof HTMLElement)) {
      throw new Error("missing scroller nodes");
    }
    stubViewport(viewport, 300);
    viewport.dispatchEvent(new Event("scroll"));
    await Promise.resolve();
    expect(button.getAttribute("data-active")).toBe("true");
    expect(seen).toEqual(["a"]);

    handler.value = () => {
      seen.push("b");
    };
    viewport.dispatchEvent(new Event("scroll"));
    await Promise.resolve();
    expect(seen).toEqual(["a", "b"]);

    stubViewport(viewport, 0);
    viewport.dispatchEvent(new Event("scroll"));
    await Promise.resolve();
    expect(button.getAttribute("data-active")).toBe("true");

    direction.value = "start";
    await Promise.resolve();
    expect(button.getAttribute("data-direction")).toBe("start");
    expect(button.getAttribute("data-active")).toBe("false");

    const targets: ScrollToOptions[] = [];
    viewport.scrollTo = ((options?: ScrollToOptions) => {
      if (options) targets.push(options);
    }) as typeof viewport.scrollTo;
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(targets).toEqual([{ top: 0, behavior: "smooth" }]);
    unmount();
  });

  test("a missing onscroll and an empty getter do not throw", async () => {
    let onScroll: ((event: Event) => void) | undefined;
    const empty = signal<((event: Event) => void) | undefined>(undefined);
    const Probe = cc((props: { onscroll?: (event: Event) => void }) => {
      onScroll = useMessageScrollerViewport(props).onScroll;
      return null;
    });
    const { unmount } = mountUi(() => (
      <CustomRoot stick={false}>
        <Probe />
      </CustomRoot>
    ));
    await Promise.resolve();
    onScroll?.(new Event("scroll"));
    unmount();

    const { unmount: emptyUnmount } = mountUi(() => (
      <CustomRoot stick={false}>
        <Probe onscroll={() => empty.value} />
      </CustomRoot>
    ));
    await Promise.resolve();
    onScroll?.(new Event("scroll"));
    emptyUnmount();
  });
});
