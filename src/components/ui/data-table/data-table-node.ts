import { onUnmounted, type SinwanNode } from "sinwan/component";
import { effect, signal, untrack, type Signal } from "sinwan/reactivity";
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

/** Per table: bumped when its options change (`data`, `rowCount`, `columns`), which the store does not report. */
const optionVersions = new WeakMap<DataTableInstance, Signal<number>>();

function optionsVersion(table: DataTableInstance): Signal<number> {
  let version = optionVersions.get(table);
  if (!version) {
    version = signal(0);
    optionVersions.set(table, version);
  }
  return version;
}

/**
 * Call after `table.setOptions(...)`: rows, row counts and columns live in the
 * options, not in the state store, so revision readers would otherwise keep
 * showing the previous data.
 */
export function notifyTableOptions(table: DataTableInstance): void {
  const version = optionsVersion(table);
  version.value = untrack(() => version.value) + 1;
}

/** A counter that changes whenever the table's state or options change; read it to recompute table-derived values. */
export function useTableRevision(
  table: DataTableInstance,
): Signal<number> {
  const revision = signal(0);
  const bump = () => {
    revision.value = untrack(() => revision.value) + 1;
  };
  const subscription = table.store.subscribe(bump);
  const version = optionsVersion(table);
  const stopOptions = effect(() => {
    void version.value;
    bump();
  });
  onUnmounted(() => {
    subscription.unsubscribe();
    stopOptions();
  });
  return revision;
}
