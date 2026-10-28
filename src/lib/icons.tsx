import { cc, type SinwanNode } from "sinwan/component";
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

/**
 * Render a Lucide icon node tree as a Sinwan SVG element.
 */
export const Icon = cc(
  ({
    icon,
    class: className,
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    ...props
  }: IconProps): SinwanNode => {
    const computedStroke =
      absoluteStrokeWidth && typeof size === "number"
        ? (Number(strokeWidth) * 24) / size
        : strokeWidth;

    return {
      tag: "svg",
      props: {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": computedStroke,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: cn("lucide", className),
        ...props,
      },
      children: icon.map((node, i) => toElement(node, i)),
    };
  },
);

export type { IconNode };
