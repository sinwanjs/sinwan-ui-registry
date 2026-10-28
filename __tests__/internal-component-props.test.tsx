import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("props passed to internal components", () => {
  test("SelectScrollUpButton and SelectScrollDownButton keep the consumer class", () => {
    const { unmount } = mountUi(() => (
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton class="extra-up" />
          <SelectItem value="a">A</SelectItem>
          <SelectScrollDownButton class="extra-down" />
        </SelectContent>
      </Select>
    ));

    const up = document.querySelector(".extra-up");
    const down = document.querySelector(".extra-down");
    expect(up?.getAttribute("data-slot")).toBe("select-scroll-up-button");
    expect(up?.className).toContain("absolute");
    expect(down?.getAttribute("data-slot")).toBe("select-scroll-down-button");
    expect(down?.className).toContain("absolute");
    unmount();
  });
});
