import { cc, getRawProps, type SinwanNode } from "sinwan/component";
import type { IconNode } from "lucide";
import { cn } from "./utils";

export type IconProps = {
  icon: IconNode;
  class?: string;
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-label"?: string;
  role?: string;
  [key: string]: unknown;
};

function isIconNode(value: unknown): value is IconNode {
  return (
    Array.isArray(value) &&
    value.every(
      (entry: unknown) =>
        Array.isArray(entry) &&
        typeof entry[0] === "string" &&
        typeof entry[1] === "object" &&
        entry[1] !== null,
    )
  );
}

function toElement(node: IconNode[number], key: number): SinwanNode {
  const [tag, attrs] = node;
  const parts: readonly unknown[] = node;
  const nested = parts[2];
  const childNodes = isIconNode(nested) ? nested.map((child, i) => toElement(child, i)) : [];
  return {
    tag,
    props: { ...attrs, key },
    children: childNodes,
  };
}

function iconStrokeWidth(props: IconProps): number | string {
  const size = props.size ?? 24;
  const strokeWidth = props.strokeWidth ?? 2;
  return props.absoluteStrokeWidth && typeof size === "number"
    ? (Number(strokeWidth) * 24) / size
    : strokeWidth;
}

/**
 * Render a Lucide icon node tree as a Sinwan SVG element.
 */
export const Icon = cc((props: IconProps) => {
  const {
    icon: _icon,
    class: _className,
    size: _size,
    strokeWidth: _strokeWidth,
    absoluteStrokeWidth: _absoluteStrokeWidth,
    ...rest
  } = getRawProps(props);
  return (
    <svg
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={() => iconStrokeWidth(props)}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cn("lucide", props.class)}
      {...rest}
    >
      {props.icon.map((node, i) => toElement(node, i))}
    </svg>
  );
});

export type { IconNode };
