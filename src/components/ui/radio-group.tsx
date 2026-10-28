import { getRawProps, type SinwanNode } from "sinwan/component";
import { cn } from "../../lib/utils";
import { RadioGroupItem as RadioGroupItemPrimitive, RadioGroupRoot } from "sinwan-ui-core/controls";

type RadioGroupProps = {
  children?: SinwanNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  class?: string;
  name?: string;
};

function RadioGroup(props: RadioGroupProps) {
  const { class: className, ...rest } = getRawProps(props);
  return (
    <RadioGroupRoot
      class={cn("grid w-full gap-2", className)}
      {...rest}
    />
  );
}

type RadioGroupItemProps = {
  value: string;
  class?: string;
  disabled?: boolean;
  id?: string;
  children?: SinwanNode;
};

function RadioGroupItem(props: RadioGroupItemProps) {
  const { class: className, children, ...rest } = getRawProps(props);
  return (
    <RadioGroupItemPrimitive
      class={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input bg-background outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className,
      )}
      {...rest}
    >
      {children ?? (
        <span
          data-slot="radio-group-indicator"
          class="flex size-4 items-center justify-center [[data-state=unchecked]_&]:hidden"
        >
          <span class="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
        </span>
      )}
    </RadioGroupItemPrimitive>
  );
}

export { RadioGroup, RadioGroupItem };
