import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { nextTick } from "sinwan/reactivity";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("Avatar fallback overlay", () => {
  test("keeps fallback inside the circle while the image is still loading", async () => {
    const { root, unmount } = mountUi(() => (
      <Avatar>
        <AvatarImage src="https://example.test/pending.png" alt="Ada" />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>
    ));

    const avatar = root.querySelector('[data-slot="avatar"]') as HTMLElement;
    const image = root.querySelector('[data-slot="avatar-image"]') as HTMLImageElement;
    const fallback = root.querySelector('[data-slot="avatar-fallback"]') as HTMLElement;

    expect(avatar.className).not.toContain("overflow-hidden");
    expect(image.className).toContain("absolute");
    expect(image.className).toContain("inset-0");
    expect(image.className).toContain("overflow-hidden");
    expect(image.className).toContain("opacity-0");
    expect(fallback.className).toContain("absolute");
    expect(fallback.className).toContain("inset-0");
    expect(fallback.className).toContain("overflow-hidden");
    expect(fallback.textContent).toBe("AD");

    image.dispatchEvent(new Event("load"));
    await nextTick();

    expect(root.querySelector('[data-slot="avatar-fallback"]')).toBeNull();
    expect(
      (root.querySelector('[data-slot="avatar-image"]') as HTMLElement).className,
    ).not.toContain("opacity-0");

    unmount();
  });

  test("keeps fallback inside the circle after the image fails", async () => {
    const { root, unmount } = mountUi(() => (
      <Avatar>
        <AvatarImage src="https://example.test/missing.png" alt="Bad" />
        <AvatarFallback>BK</AvatarFallback>
      </Avatar>
    ));

    const image = root.querySelector('[data-slot="avatar-image"]') as HTMLImageElement;
    image.dispatchEvent(new Event("error"));
    await nextTick();

    expect(root.querySelector('[data-slot="avatar-image"]')).toBeNull();
    const fallback = root.querySelector('[data-slot="avatar-fallback"]') as HTMLElement;
    expect(fallback.className).toContain("absolute");
    expect(fallback.className).toContain("inset-0");
    expect(fallback.textContent).toBe("BK");

    unmount();
  });

  test("does not clip AvatarBadge with root overflow", () => {
    const { root, unmount } = mountUi(() => (
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge class="bg-amber-500" />
      </Avatar>
    ));

    const avatar = root.querySelector('[data-slot="avatar"]') as HTMLElement;
    const badge = root.querySelector('[data-slot="avatar-badge"]') as HTMLElement;

    expect(avatar.className).not.toContain("overflow-hidden");
    expect(badge.className).toContain("absolute");
    expect(badge.className).toContain("z-10");
    expect(badge.className).toContain("right-0");
    expect(badge.className).toContain("bottom-0");

    unmount();
  });
});
