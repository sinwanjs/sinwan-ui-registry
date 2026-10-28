import {
  computed,
  signal,
  type Computed,
  type Signal,
} from "sinwan/reactivity";

export type SliderValue = number | number[];

export type SliderOrientation = "horizontal" | "vertical";

export type SliderProps = {
  class?: string;
  defaultValue?: SliderValue;
  value?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: SliderOrientation;
  onValueChange?: (value: number[]) => void;
  id?: string;
  name?: string;
};

export type UseSliderReturn = {
  min: Computed<number>;
  max: Computed<number>;
  step: Computed<number>;
  orientation: Computed<SliderOrientation>;
  values: Signal<number[]> | Computed<number[]>;
  primary: Computed<number>;
  percent: Computed<number>;
  commit: (next: number) => void;
};

function toValues(
  value: SliderValue | undefined,
  fallback: SliderValue | undefined,
  min: number,
): number[] {
  const source = value ?? fallback;
  if (Array.isArray(source) && source.length > 0) {
    return source.map((n) => Number(n));
  }
  if (typeof source === "number") return [source];
  return [min];
}

function sameValues(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function snapValue(
  next: number,
  min: number,
  max: number,
  step: number,
): number {
  if (!(step > 0)) {
    return Math.min(max, Math.max(min, next));
  }
  const snapped = Math.round((next - min) / step) * step + min;
  const decimals = String(step).includes(".")
    ? (String(step).split(".")[1]?.length ?? 0)
    : 0;
  const rounded =
    decimals > 0 ? Number(snapped.toFixed(decimals)) : snapped;
  return Math.min(max, Math.max(min, rounded));
}

export function useSlider(props: SliderProps): UseSliderReturn {
  const min = computed(() => props.min ?? 0);
  const max = computed(() => props.max ?? 100);
  const step = computed(() => props.step ?? 1);
  const orientation = computed<SliderOrientation>(
    () => props.orientation ?? "horizontal",
  );
  const valuesLocal = signal(
    toValues(undefined, props.defaultValue, min.value),
  );
  const values =
    "value" in props
      ? computed(() => toValues(props.value, undefined, min.value))
      : valuesLocal;
  const set = (next: number[]) => {
    if (!("value" in props)) valuesLocal.value = next;
  };

  const primary = computed(() => values.value[0] ?? min.value);
  const percent = computed(
    () =>
      ((primary.value - min.value) / (max.value - min.value || 1)) * 100,
  );

  const commit = (next: number) => {
    const clamped = snapValue(next, min.value, max.value, step.value);
    if (!sameValues([clamped], values.value)) {
      set([clamped]);
    }
    props.onValueChange?.([clamped]);
  };

  return { min, max, step, orientation, values, primary, percent, commit };
}
