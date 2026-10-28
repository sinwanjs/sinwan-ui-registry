import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  useAvatar,
  useAvatarFallback,
  useAvatarImage,
  useAvatarRoot,
} from "../src/components/ui/avatar";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("avatar hooks", () => {
  test("context hooks throw outside an Avatar root", () => {
    expect(() => withSetup(() => useAvatar())).toThrow(
      "useAvatar must be used within a <Avatar />",
    );
    expect(() => withSetup(() => useAvatarImage({}))).toThrow(
      "AvatarImage must be used within a <Avatar />",
    );
    expect(() => withSetup(() => useAvatarFallback())).toThrow(
      "AvatarFallback must be used within a <Avatar />",
    );
  });

  test("root state drives image and fallback visibility", () => {
    const { root, image, fallback } = withSetup(() => ({
      root: useAvatarRoot(),
      image: useAvatarImage({}),
      fallback: useAvatarFallback(),
    }));

    expect(image.visible.value).toBe(true);
    expect(fallback.visible.value).toBe(true);

    root.loaded.value = true;
    expect(image.loaded.value).toBe(true);
    expect(fallback.visible.value).toBe(false);

    root.failed.value = true;
    expect(image.visible.value).toBe(false);
    expect(fallback.visible.value).toBe(true);
  });

  test("image events update state and forward to callbacks", async () => {
    const calls: string[] = [];
    const ui = mountUi(() => (
      <Avatar>
        <AvatarImage
          src="https://example.test/a.png"
          alt="A"
          onload={(event) => calls.push(`load:${event.type}`)}
          onerror={(event) => calls.push(`error:${event.type}`)}
        />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    ));

    const image = ui.root.querySelector('[data-slot="avatar-image"]');
    if (!image) throw new Error("missing image");
    image.dispatchEvent(new Event("load"));
    await Promise.resolve();
    expect(ui.root.querySelector('[data-slot="avatar-fallback"]')).toBeNull();

    image.dispatchEvent(new Event("error"));
    await Promise.resolve();
    expect(ui.root.querySelector('[data-slot="avatar-image"]')).toBeNull();
    expect(ui.root.querySelector('[data-slot="avatar-fallback"]')?.textContent).toBe("A");
    expect(calls).toEqual(["load:load", "error:error"]);

    ui.unmount();
  });

  test("group and group count render their slots", () => {
    const ui = mountUi(() => (
      <AvatarGroup class="custom-group">
        <Avatar size="sm">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <AvatarGroupCount class="custom-count">+3</AvatarGroupCount>
      </AvatarGroup>
    ));

    const group = ui.root.querySelector('[data-slot="avatar-group"]');
    const count = ui.root.querySelector('[data-slot="avatar-group-count"]');
    expect(group?.className).toContain("custom-group");
    expect(count?.className).toContain("custom-count");
    expect(count?.textContent).toBe("+3");
    expect(ui.root.querySelector('[data-slot="avatar"]')?.getAttribute("data-size")).toBe("sm");

    ui.unmount();
  });

  test("image callbacks follow the latest props", () => {
    const seen: string[] = [];
    const onload = signal(() => {
      seen.push("a");
    });
    const { root, unmount } = mountUi(() => (
      <Avatar>
        <AvatarImage alt="face" onload={() => onload.value} />
      </Avatar>
    ));
    const image = root.querySelector('[data-slot="avatar-image"]');
    if (!(image instanceof HTMLElement)) throw new Error("missing image");
    image.dispatchEvent(new Event("load"));
    onload.value = () => {
      seen.push("b");
    };
    image.dispatchEvent(new Event("load"));
    expect(seen).toEqual(["a", "b"]);
    unmount();
  });
});
