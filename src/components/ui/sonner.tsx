import { cc, inject, onUnmounted, type SinwanNode } from "sinwan/component";
import { For, Portal, Show } from "sinwan/control-flow";
import { signal } from "sinwan/reactivity";
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert, X } from "lucide";
import { ThemeKey } from "sinwan-ui-core/theme";

import { Icon } from "../../lib/icons";
import { cn } from "../../lib/utils";

export type ToastType =
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning"
  | "loading";

export type ToastInput =
  | string
  | {
      title: string;
      description?: string;
      type?: ToastType;
      duration?: number;
      id?: string;
    };

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration: number;
};

const DEFAULT_DURATION = 4000;

/** Plain module store — no module-level signals (those must live inside `cc`). */
let toastItems: ToastItem[] = [];
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();
let toastSeq = 0;

function nextId(): string {
  toastSeq += 1;
  return `toast-${toastSeq}`;
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function removeToast(id: string): void {
  const timer = timers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toastItems = toastItems.filter((item) => item.id !== id);
  notify();
}

function scheduleDismiss(item: ToastItem): void {
  if (item.type === "loading" || item.duration <= 0) return;
  const timer = setTimeout(() => removeToast(item.id), item.duration);
  timers.set(item.id, timer);
}

function pushToast(input: ToastInput, typeOverride?: ToastType): string {
  const parsed =
    typeof input === "string"
      ? { title: input, type: typeOverride ?? ("default" as ToastType) }
      : {
          title: input.title,
          description: input.description,
          type: typeOverride ?? input.type ?? ("default" as ToastType),
          duration: input.duration,
          id: input.id,
        };

  const id = parsed.id ?? nextId();
  if (toastItems.some((item) => item.id === id)) {
    removeToast(id);
  }

  const item: ToastItem = {
    id,
    title: parsed.title,
    description: parsed.description,
    type: parsed.type,
    duration: parsed.duration ?? DEFAULT_DURATION,
  };

  toastItems = [...toastItems, item];
  notify();
  scheduleDismiss(item);
  return id;
}

type ToastFn = {
  (input: ToastInput): string;
  success: (input: ToastInput) => string;
  error: (input: ToastInput) => string;
  info: (input: ToastInput) => string;
  warning: (input: ToastInput) => string;
  loading: (input: ToastInput) => string;
  dismiss: (id?: string) => void;
};

export const toast: ToastFn = Object.assign(
  (input: ToastInput) => pushToast(input),
  {
    success: (input: ToastInput) => pushToast(input, "success"),
    error: (input: ToastInput) => pushToast(input, "error"),
    info: (input: ToastInput) => pushToast(input, "info"),
    warning: (input: ToastInput) => pushToast(input, "warning"),
    loading: (input: ToastInput) =>
      pushToast(
        typeof input === "string"
          ? { title: input, type: "loading", duration: 0 }
          : { ...input, type: "loading", duration: input.duration ?? 0 },
        "loading",
      ),
    dismiss: (id?: string) => {
      if (id) {
        removeToast(id);
        return;
      }
      for (const item of [...toastItems]) {
        removeToast(item.id);
      }
    },
  },
);

function ToastIcon({
  type,
}: {
  type: Exclude<ToastType, "default">;
}): SinwanNode {
  switch (type) {
    case "success":
      return <Icon icon={CircleCheck} class="size-4" />;
    case "info":
      return <Icon icon={Info} class="size-4" />;
    case "warning":
      return <Icon icon={TriangleAlert} class="size-4" />;
    case "error":
      return <Icon icon={OctagonX} class="size-4" />;
    case "loading":
      return <Icon icon={Loader2} class="size-4 animate-spin" />;
  }
}

const toastTypeClass: Record<ToastType, string> = {
  default:
    "border-border bg-popover text-popover-foreground [&_[data-slot=toast-icon]]:text-muted-foreground",
  success:
    "border-success/30 bg-success/10 text-foreground [&_[data-slot=toast-icon]]:text-success [&_[data-slot=toast-title]]:text-success",
  error:
    "border-destructive/30 bg-destructive/10 text-foreground [&_[data-slot=toast-icon]]:text-destructive [&_[data-slot=toast-title]]:text-destructive",
  info: "border-info/30 bg-info/10 text-foreground [&_[data-slot=toast-icon]]:text-info [&_[data-slot=toast-title]]:text-info",
  warning:
    "border-warning/30 bg-warning/10 text-foreground [&_[data-slot=toast-icon]]:text-warning [&_[data-slot=toast-title]]:text-warning",
  loading:
    "border-border bg-popover text-popover-foreground [&_[data-slot=toast-icon]]:text-muted-foreground",
};

export type ToasterProps = {
  class?: string;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
};

const positionClass: Record<NonNullable<ToasterProps["position"]>, string> = {
  "top-left": "top-4 left-4 items-start",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

export const Toaster = cc<ToasterProps>(
  ({ class: className, position = "bottom-right" }) => {
    const themeApi = inject(ThemeKey, undefined);
    // Reactive mirror — created inside cc setup only.
    const toasts = signal<ToastItem[]>([...toastItems]);
    const sync = () => {
      toasts.value = [...toastItems];
    };
    listeners.add(sync);
    onUnmounted(() => {
      listeners.delete(sync);
    });

    return (
      <Portal>
        <div
          data-slot="toaster"
          data-theme={themeApi?.theme.value ?? "system"}
          class={cn(
            "toaster group pointer-events-none fixed z-[100] flex w-full max-w-[420px] flex-col gap-2 p-4",
            positionClass[position],
            className,
          )}
          style="--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border); --border-radius: var(--radius);"
        >
          <For each={toasts.value}>
            {(item) => (
              <div
                data-slot="toast"
                data-type={item.type}
                class={cn(
                  "cn-toast pointer-events-auto flex w-full items-start gap-3 rounded-[var(--border-radius)] border p-3 text-sm shadow-lg",
                  toastTypeClass[item.type],
                )}
                role="status"
              >
                <Show when={item.type !== "default"}>
                  <span
                    data-slot="toast-icon"
                    class="mt-0.5 shrink-0"
                  >
                    <ToastIcon
                      type={item.type as Exclude<ToastType, "default">}
                    />
                  </span>
                </Show>
                <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div data-slot="toast-title" class="font-medium">
                    {item.title}
                  </div>
                  <Show when={Boolean(item.description)}>
                    <div class="text-muted-foreground text-xs">
                      {item.description}
                    </div>
                  </Show>
                </div>
                <button
                  type="button"
                  class="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Dismiss"
                  onclick={() => toast.dismiss(item.id)}
                >
                  <Icon icon={X} class="size-3.5" />
                </button>
              </div>
            )}
          </For>
        </div>
      </Portal>
    );
  },
);
