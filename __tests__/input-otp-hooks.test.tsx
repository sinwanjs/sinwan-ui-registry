import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cc } from "sinwan/component";
import { signal } from "sinwan/reactivity";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  useInputOtp,
  useInputOtpRoot,
  useInputOtpSlot,
  type InputOTPProps,
  type InputOtpRootReturn,
  type OtpApi,
} from "../src/components/ui/input-otp";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});
afterEach(() => {
  teardownDom();
});

describe("input-otp hooks", () => {
  test("slots update char, active state, and caret reactively", async () => {
    const { root, queryAll, unmount } = mountUi(() => (
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>
    ));
    const input = root.querySelector(
      '[data-slot="input-otp-hidden"]',
    ) as HTMLInputElement;
    const slots = () => queryAll('[data-slot="input-otp-slot"]');
    const caretCount = () => root.querySelectorAll(".animate-caret-blink").length;

    expect(slots()[0]?.getAttribute("data-active")).toBeNull();
    expect(caretCount()).toBe(0);

    input.dispatchEvent(new FocusEvent("focus"));
    await Promise.resolve();
    expect(slots()[0]?.getAttribute("data-active")).toBe("true");
    expect(slots()[0]?.querySelector(".animate-caret-blink")).toBeTruthy();

    input.value = "1";
    input.dispatchEvent(new Event("input"));
    await Promise.resolve();
    expect(slots()[0]?.textContent).toBe("1");
    expect(slots()[0]?.getAttribute("data-active")).toBeNull();
    expect(slots()[1]?.getAttribute("data-active")).toBe("true");
    expect(input.value).toBe("1");

    input.value = "12";
    input.dispatchEvent(new Event("input"));
    await Promise.resolve();
    expect(slots()[1]?.textContent).toBe("2");
    expect(slots()[1]?.querySelector(".animate-caret-blink")).toBeTruthy();

    input.dispatchEvent(new FocusEvent("blur"));
    await Promise.resolve();
    expect(slots()[1]?.getAttribute("data-active")).toBeNull();
    expect(caretCount()).toBe(0);
    unmount();
  });

  test("useInputOtp returns the root api and throws outside InputOTP", () => {
    let api: OtpApi | undefined;
    const Probe = cc(() => {
      api = useInputOtp();
      return null;
    });
    const { unmount } = mountUi(() => (
      <InputOTP maxLength={3} value="12">
        <Probe />
      </InputOTP>
    ));
    expect(api?.maxLength).toBe(3);
    expect(api?.value.value).toBe("12");
    unmount();

    expect(() => withSetup(() => useInputOtp())).toThrow(
      "useInputOtp must be used within InputOTP",
    );
    expect(() => withSetup(() => useInputOtpSlot(() => 0))).toThrow(
      "InputOTPSlot must be used within InputOTP",
    );
  });

  test("disabled, callbacks, and maxLength follow later prop updates", async () => {
    const disabled = signal(false);
    const maxLength = signal(2);
    const seen: string[] = [];
    const onChange = signal<(value: string) => void>((value) => {
      seen.push(`a:${value}`);
    });
    const { root, unmount } = mountUi(() => (
      <InputOTP
        disabled={disabled.value}
        maxLength={maxLength.value}
        onChange={() => onChange.value}
      >
        <InputOTPSlot index={0} />
      </InputOTP>
    ));
    const input = root.querySelector(
      '[data-slot="input-otp-hidden"]',
    ) as HTMLInputElement;
    expect(input.disabled).toBe(false);
    expect(input.maxLength).toBe(2);

    disabled.value = true;
    maxLength.value = 4;
    await Promise.resolve();
    expect(input.disabled).toBe(true);
    expect(input.maxLength).toBe(4);

    input.value = "1";
    input.dispatchEvent(new Event("input"));
    onChange.value = (value) => {
      seen.push(`b:${value}`);
    };
    input.value = "12";
    input.dispatchEvent(new Event("input"));
    expect(seen).toEqual(["a:1", "b:12"]);
    unmount();
  });

  test("useInputOtpRoot maxLength follows the prop", () => {
    const maxLength = signal<number | undefined>(3);
    let root: InputOtpRootReturn | undefined;
    const Custom = cc((props: InputOTPProps) => {
      root = useInputOtpRoot(props);
      return null;
    });
    const { unmount } = mountUi(() => <Custom maxLength={maxLength.value} />);
    expect(root?.maxLength).toBe(3);
    maxLength.value = undefined;
    expect(root?.maxLength).toBe(6);
    unmount();
  });
});
