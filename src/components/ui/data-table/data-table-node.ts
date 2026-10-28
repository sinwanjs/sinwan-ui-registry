import { onUnmounted, type SinwanNode } from "sinwan/component";
import { signal, type Signal } from "sinwan/reactivity";
import { FlexRender, type FlexRenderProps } from "@tanstack/table-core/flex-render";
import type { RowData } from "@tanstack/table-core";

import {
  type DataTableFeatures,
  type DataTableInstance,
} from "./data-table-features";

/**
 * TanStack `FlexRender` returns `unknown`. Narrow it to a Sinwan child without
 * hiding incompatible values behind a double assertion.
 */
export function toTableNode(value: unknown): SinwanNode {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "function" || typeof value === "object") {
    return value as SinwanNode;
  }
  return String(value);
}

export function DataTableFlexRender<TData extends RowData>(
  props: FlexRenderProps<DataTableFeatures, TData>,
): SinwanNode {
  return toTableNode(FlexRender(props));
}

export function useTableRevision(
  table: DataTableInstance,
): Signal<number> {
  const revision = signal(0);
  const subscription = table.store.subscribe(() => {
    revision.value += 1;
  });
  onUnmounted(() => {
    subscription.unsubscribe();
  });
  return revision;
}
