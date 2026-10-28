import { getRawProps } from "sinwan/component";
import { cn } from "../../lib/utils";
import { SwitchRoot } from "sinwan-ui-core/controls";

type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  class?: string;
  id?: string;
  size?: "sm" | "default";
};

function Switch(props: SwitchProps) {
  const {
    class: className,
    size = "default",
    ...rest
  } = getRawProps(props);
  return (
    <SwitchRoot
      data-size={size}
      class={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-input shadow-xs transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      <span
        data-slot="switch-thumb"
        class="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform group-data-[size=sm]/switch:size-3 translate-x-0 group-data-[state=checked]/switch:translate-x-[calc(100%-2px)] group-data-[state=checked]/switch:bg-primary-foreground dark:group-data-[state=unchecked]/switch:bg-foreground"
      />
    </SwitchRoot>
  );
}

export { Switch };
