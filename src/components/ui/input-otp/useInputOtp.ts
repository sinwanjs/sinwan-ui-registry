import {
  getRawProps,
  inject,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import {
  computed,
  signal,
  unwrap,
  type Computed,
  type Signal,
} from "sinwan/reactivity";

export type OtpSlotState = {
  char: string;
  hasFakeCaret: boolean;
  isActive: boolean;
};

export type OtpApi = {
  value: Signal<string>;
  maxLength: number;
  slots: () => OtpSlotState[];
  focus: () => void;
};

export const OTPInputContext: InjectionKey<OtpApi> = Symbol("sinwan-ui.input-otp");

export type InputOTPProps = {
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  class?: string;
  containerClass?: string;
  disabled?: boolean;
  children?: SinwanNode;
  pattern?: string;
  inputMode?: JSX.IntrinsicElements["input"]["inputMode"];
  autocomplete?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

export type InputOtpRootReturn = {
  otp: OtpApi;
  value: Signal<string>;
  maxLength: number;
  setInput: (element: HTMLInputElement | null) => void;
  onFocus: () => void;
  onBlur: () => void;
  onInput: (event: Event) => void;
  onPaste: (event: ClipboardEvent) => void;
  onContainerClick: () => void;
};

export type InputOtpSlotReturn = {
  char: Computed<string>;
  isActive: Computed<boolean>;
  hasFakeCaret: Computed<boolean>;
};

function sanitize(value: string, maxLength: number, pattern?: string): string {
  let next = value;
  if (!pattern) {
    next = value.replace(/\s/g, "");
    return next.slice(0, maxLength);
  }
  try {
    const re = new RegExp(pattern, "g");
    next = (next.match(re) ?? []).join("");
  } catch {
    next = value.replace(/\s/g, "");
  }
  return next.slice(0, maxLength);
}

export function useInputOtpRoot(props: InputOTPProps): InputOtpRootReturn {
  const value = signal(props.value ?? "");
  if (props.value !== undefined) value.value = props.value;

  let inputEl: HTMLInputElement | null = null;
  const focused = signal(false);
  const length = () => props.maxLength ?? 6;

  const setValue = (next: string) => {
    const maxLength = length();
    const cleaned = sanitize(next, maxLength, props.pattern);
    value.value = cleaned;
    const raw = getRawProps(props);
    const onChange = unwrap(raw.onChange);
    const onComplete = unwrap(raw.onComplete);
    if (typeof onChange === "function") onChange(cleaned);
    if (cleaned.length >= maxLength && typeof onComplete === "function") {
      onComplete(cleaned);
    }
  };

  const slots = (): OtpSlotState[] => {
    const maxLength = length();
    const current = value.value;
    const activeIndex = Math.min(current.length, maxLength - 1);
    return Array.from({ length: maxLength }, (_, index) => ({
      char: current[index] ?? "",
      isActive: focused.value && index === activeIndex,
      hasFakeCaret:
        focused.value && index === activeIndex && current.length < maxLength
          ? index === current.length
          : focused.value &&
            index === activeIndex &&
            current.length === maxLength &&
            index === maxLength - 1,
    }));
  };

  const otp: OtpApi = {
    value,
    get maxLength() {
      return length();
    },
    slots,
    focus: () => inputEl?.focus(),
  };
  provide(OTPInputContext, otp);

  return {
    otp,
    value,
    get maxLength() {
      return length();
    },
    setInput: (element) => {
      inputEl = element;
    },
    onFocus: () => {
      focused.value = true;
    },
    onBlur: () => {
      focused.value = false;
    },
    onInput: (event) => {
      const target = event.target as HTMLInputElement;
      setValue(target.value);
    },
    onPaste: (event) => {
      event.preventDefault();
      const text = event.clipboardData?.getData("text") ?? "";
      setValue(text);
    },
    onContainerClick: () => {
      if (!props.disabled) inputEl?.focus();
    },
  };
}

export function useInputOtp(consumer = "useInputOtp"): OtpApi {
  const otp = inject(OTPInputContext);
  if (!otp) {
    throw new Error(`${consumer} must be used within InputOTP`);
  }
  return otp;
}

export function useInputOtpSlot(index: () => number): InputOtpSlotReturn {
  const otp = useInputOtp("InputOTPSlot");
  const slot = computed(() => otp.slots()[index()]);
  return {
    char: computed(() => slot.value?.char ?? ""),
    isActive: computed(() => Boolean(slot.value?.isActive)),
    hasFakeCaret: computed(() => Boolean(slot.value?.hasFakeCaret)),
  };
}
