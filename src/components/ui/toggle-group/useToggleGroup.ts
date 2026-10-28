import {
  getRawProps,
  inject,
  provide,
  type InjectionKey,
  type SinwanNode,
} from "sinwan/component";
import { computed, type Computed } from "sinwan/reactivity";
import type { VariantProps } from "class-variance-authority";

import type { toggleVariants } from "../toggle";

type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
type ToggleSize = VariantProps<typeof toggleVariants>["size"];

export type ToggleGroupOrientation = "horizontal" | "vertical";

export type ToggleGroupContext = VariantProps<typeof toggleVariants> & {
  spacing?: number;
  orientation?: ToggleGroupOrientation;
};

export type ToggleGroupProps = ToggleGroupContext & {
  children?: SinwanNode;
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (v: string | string[]) => void;
  class?: string;
};

export type ToggleGroupItemProps = {
  children?: SinwanNode;
  class?: string;
  value: string;
  disabled?: boolean;
  variant?: ToggleVariant;
  size?: ToggleSize;
};

export type ToggleGroupRootRest = Omit<
  ToggleGroupProps,
  "class" | "variant" | "size" | "spacing" | "orientation" | "children"
>;

export type ToggleGroupRootReturn = {
  class: string | undefined;
  children: SinwanNode | undefined;
  rest: ToggleGroupRootRest;
  variant: Computed<ToggleVariant>;
  size: Computed<ToggleSize>;
  spacing: Computed<number>;
  orientation: Computed<ToggleGroupOrientation>;
};

export type ToggleGroupItemRest = Omit<
  ToggleGroupItemProps,
  "class" | "children" | "variant" | "size"
>;

export type ToggleGroupItemReturn = {
  class: string | undefined;
  children: SinwanNode | undefined;
  rest: ToggleGroupItemRest;
  variant: ToggleVariant;
  size: ToggleSize;
  spacing: number;
  orientation: ToggleGroupOrientation | undefined;
};

const ToggleGroupStyleKey: InjectionKey<ToggleGroupContext> = Symbol(
  "sinwan-ui.toggle-group-style",
);

/**
 * Resolves group style defaults and provides them to `ToggleGroupItem`s.
 */
export function useToggleGroupRoot(
  props: ToggleGroupProps,
): ToggleGroupRootReturn {
  const {
    class: className,
    variant: _variant,
    size: _size,
    spacing: _spacing,
    orientation: _orientation,
    children,
    ...rest
  } = getRawProps(props);
  const variant = computed(() => props.variant ?? "default");
  const size = computed(() => props.size ?? "default");
  const spacing = computed(() => props.spacing ?? 2);
  const orientation = computed(() => props.orientation ?? "horizontal");
  provide(ToggleGroupStyleKey, {
    variant: props.variant ?? "default",
    size: props.size ?? "default",
    spacing: props.spacing ?? 2,
    orientation: props.orientation ?? "horizontal",
  });
  return { class: className, children, rest, variant, size, spacing, orientation };
}

/**
 * Reads the nearest group style, or the default style outside a group.
 */
export function useToggleGroup(): ToggleGroupContext {
  return (
    inject(ToggleGroupStyleKey) ?? {
      variant: "default",
      size: "default",
      spacing: 2,
      orientation: "horizontal",
    }
  );
}

/**
 * Resolves an item's variant, size, and spacing from the group context.
 */
export function useToggleGroupItem(
  props: ToggleGroupItemProps,
): ToggleGroupItemReturn {
  const {
    class: className,
    children,
    variant = "default",
    size = "default",
    ...rest
  } = getRawProps(props);
  const context = useToggleGroup();
  return {
    class: className,
    children,
    rest,
    variant: context.variant || variant,
    size: context.size || size,
    spacing: context.spacing ?? 2,
    orientation: context.orientation,
  };
}
