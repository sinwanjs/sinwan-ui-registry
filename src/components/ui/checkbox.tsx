import { getRawProps, type SinwanNode } from "sinwan/component";
import { Check, Minus } from "lucide";

import { Icon } from "../../lib/icons";
import { cn } from "../../lib/utils";
import { CheckboxRoot } from "sinwan-ui-core/controls";

type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  class?: string;
  id?: string;
  name?: string;
  value?: string;
  "aria-label"?: string;
  children?: SinwanNode;
};

function Checkbox(props: CheckboxProps) {
  const { class: className, children, ...rest } = getRawProps(props);
  return (
    <CheckboxRoot
      class={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-checked:bg-primary dark:data-indeterminate:bg-primary",
        className,
      )}
      {...rest}
    >
      <span
        data-slot="checkbox-indicator"
        class="grid place-content-center text-current transition-none [&_svg]:size-3.5 [[data-state=unchecked]_&]:hidden"
      >
        <span class="[[data-state=indeterminate]_&]:hidden">
          {children ?? <Icon icon={Check} />}
        </span>
        <span class="hidden [[data-state=indeterminate]_&]:grid">
          <Icon icon={Minus} />
        </span>
      </span>
    </CheckboxRoot>
  );
}

export { Checkbox };
export type { CheckboxProps };
