import { cc } from "sinwan/component";
import { Show } from "sinwan/control-flow";
import { Minus } from "lucide";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import {
  useInputOtpRoot,
  useInputOtpSlot,
  type InputOTPProps,
} from "./useInputOtp";

export const InputOTP = cc<InputOTPProps>((props) => {
  const root = useInputOtpRoot(props);

  return (
    <div
      data-slot="input-otp"
      class={cn(
        "cn-input-otp relative flex items-center has-disabled:opacity-50",
        props.containerClass,
      )}
      aria-invalid={props["aria-invalid"]}
    >
      <input
        ref={root.setInput}
        data-slot="input-otp-hidden"
        class={cn(
          "absolute inset-0 h-full w-full cursor-default opacity-0 disabled:cursor-not-allowed",
          props.class,
        )}
        value={root.value.value}
        maxLength={props.maxLength ?? 6}
        disabled={props.disabled}
        inputMode={props.inputMode ?? "numeric"}
        autocomplete={props.autocomplete ?? "one-time-code"}
        spellcheck={false}
        aria-invalid={props["aria-invalid"]}
        onfocus={root.onFocus}
        onblur={root.onBlur}
        oninput={root.onInput}
        onpaste={root.onPaste}
      />
      <div class="flex items-center" onclick={root.onContainerClick}>
        {props.children}
      </div>
    </div>
  );
});

export function InputOTPGroup({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="input-otp-group"
      class={cn(
        "flex items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export type InputOTPSlotProps = JSX.IntrinsicElements["div"] & {
  index: number;
};

export const InputOTPSlot = cc<InputOTPSlotProps>(
  ({ index, class: className, ...props }) => {
    const slot = useInputOtpSlot(() => index);

    return (
      <div
        data-slot="input-otp-slot"
        data-active={slot.isActive.value ? "true" : undefined}
        class={cn(
          "relative flex size-8 items-center justify-center border-y border-r border-input text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
          className,
        )}
        {...props}
      >
        {slot.char.value}
        <Show when={slot.hasFakeCaret.value}>
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div class="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
          </div>
        </Show>
      </div>
    );
  },
);

export function InputOTPSeparator(props: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="input-otp-separator"
      class="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <Icon icon={Minus} />
    </div>
  );
}
