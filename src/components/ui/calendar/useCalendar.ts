import {
  computed,
  signal,
  type Computed,
  type Signal,
} from "sinwan/reactivity";
import type { SinwanNode } from "sinwan/component";

import type { ButtonProps } from "../button";

type SignalOrComputed<T> = Signal<T> | Computed<T>;

export type DateRange = {
  from?: Date;
  to?: Date;
};

export type CalendarMode = "single" | "range" | "multiple";

export type CalendarDayContext = {
  date: Date;
  outside: boolean;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  rangeMiddle: boolean;
};

export type CalendarProps = {
  selected?: Date | Date[] | DateRange;
  onSelect?: (value?: Date | Date[] | DateRange) => void;
  mode?: CalendarMode;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  captionLayout?: "label" | "dropdown";
  showWeekNumber?: boolean;
  showOutsideDays?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  fromYear?: number;
  toYear?: number;
  dir?: "ltr" | "rtl";
  timeZone?: string;
  class?: string;
  disabled?: boolean | Date[] | ((date: Date) => boolean);
  locale?: string | { code?: string };
  buttonVariant?: ButtonProps["variant"];
  calendar?: string;
  modifiers?: Record<string, Date[] | ((date: Date) => boolean)>;
  modifiersClassNames?: Record<string, string>;
  renderDay?: (ctx: CalendarDayContext) => SinwanNode;
};

export type DayCell = {
  date: Date;
  outside: boolean;
  key: string;
};

export type CalendarViewParts = {
  year: number;
  month: number;
};

export type CalendarMonthOption = {
  value: string;
  label: string;
};

export type CalendarDayState = CalendarDayContext & {
  extraClass: string;
};

export type UseCalendarReturn = {
  mode: CalendarMode;
  calendar: string;
  locale: string | undefined;
  today: Date;
  selected: SignalOrComputed<Date | Date[] | DateRange | undefined>;
  viewMonth: SignalOrComputed<Date>;
  numberOfMonths: number;
  weekStartsOn: number;
  showOutsideDays: boolean;
  showWeekNumber: boolean | undefined;
  captionLayout: "label" | "dropdown";
  fromYear: number;
  toYear: number;
  buttonVariant: ButtonProps["variant"];
  dir: CalendarProps["dir"];
  class: string | undefined;
  renderDay: CalendarProps["renderDay"];
  monthList: Date[];
  setMonth: (next: Date) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  pick: (date: Date) => void;
  weekdayLabels: (monthDate?: Date) => string[];
  weeksFor: (monthDate: Date) => DayCell[][];
  viewPartsFor: (monthDate: Date) => CalendarViewParts;
  showDropdownsFor: (monthIndex: number) => boolean;
  monthOptionsFor: (monthDate: Date) => CalendarMonthOption[];
  yearOptions: CalendarMonthOption[];
  selectMonth: (monthDate: Date, nextMonth: number) => void;
  selectYear: (monthDate: Date, nextYear: number) => void;
  dayStateFor: (cell: DayCell) => CalendarDayState;
  formatCaption: (monthDate: Date) => string;
  formatDayLabel: (date: Date) => string;
  formatWeekNumber: (date: Date) => string;
  formatDataDay: (date: Date) => string;
  isGregory: boolean;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function addDays(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
}

/** @sinwan-pure */
function isGregory(calendar: string): boolean {
  return calendar === "gregory";
}

/** @sinwan-pure */
function calendarParts(
  date: Date,
  calendar: string,
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    calendar,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((entry) => entry.type === type);
    return Number(part?.value ?? "0");
  };
  return { year: read("year"), month: read("month"), day: read("day") };
}

function formatCalendarOptions(
  calendar: string,
): Intl.DateTimeFormatOptions {
  return { calendar };
}

function formatDayLabel(
  date: Date,
  locale: string | undefined,
  calendar: string,
): string {
  return date.toLocaleDateString(locale, {
    ...formatCalendarOptions(calendar),
    day: "numeric",
  });
}

function formatCaption(
  date: Date,
  locale: string | undefined,
  calendar: string,
): string {
  return date.toLocaleDateString(locale, {
    ...formatCalendarOptions(calendar),
    month: "long",
    year: "numeric",
  });
}

function formatNumber(value: number, locale: string | undefined): string {
  return new Intl.NumberFormat(locale, { useGrouping: false }).format(value);
}

function sameDay(a?: Date, b?: Date): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** @sinwan-pure */
function zonedToday(timeZone?: string): Date {
  if (!timeZone) return startOfDay(new Date());
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((entry) => entry.type === type);
    return Number(part?.value ?? "0");
  };
  return new Date(read("year"), read("month") - 1, read("day"));
}

function weekdayLabels(
  code: string | undefined,
  weekStartsOn: number,
  calendar: string,
): string[] {
  const base = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + ((weekStartsOn + i) % 7));
    return d.toLocaleDateString(code, {
      ...formatCalendarOptions(calendar),
      weekday: "short",
    });
  });
}

function isoWeekNumber(date: Date): number {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function startOfCalendarMonth(date: Date, calendar: string): Date {
  if (isGregory(calendar)) return startOfMonth(date);
  const { day } = calendarParts(date, calendar);
  return addDays(startOfDay(date), 1 - day);
}

/** @sinwan-pure */
function addCalendarMonths(date: Date, count: number, calendar: string): Date {
  if (isGregory(calendar)) return addMonths(date, count);
  let cursor = startOfCalendarMonth(date, calendar);
  const step = count >= 0 ? 1 : -1;
  for (let i = 0; i < Math.abs(count); i++) {
    cursor = startOfCalendarMonth(addDays(cursor, step > 0 ? 32 : -1), calendar);
  }
  return cursor;
}

function daysInCalendarMonth(start: Date, calendar: string): number {
  if (isGregory(calendar)) {
    return new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  }
  const { year, month } = calendarParts(start, calendar);
  let count = 0;
  let cursor = start;
  while (count < 32) {
    const parts = calendarParts(cursor, calendar);
    if (parts.year !== year || parts.month !== month) break;
    count += 1;
    cursor = addDays(cursor, 1);
  }
  return count;
}

function cellKey(prefix: string, date: Date): string {
  return `${prefix}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function buildMonthGrid(
  view: Date,
  showOutsideDays: boolean,
  weekStartsOn: number,
  calendar: string,
): DayCell[][] {
  const start = startOfCalendarMonth(view, calendar);
  const startOffset = (start.getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = daysInCalendarMonth(start, calendar);
  const cells: DayCell[] = [];

  for (let i = 0; i < startOffset; i++) {
    const date = addDays(start, i - startOffset);
    cells.push({
      date,
      outside: true,
      key: showOutsideDays ? cellKey("o", date) : `h-${cellKey("x", start)}-${i}`,
    });
  }

  for (let day = 0; day < daysInMonth; day++) {
    const date = addDays(start, day);
    cells.push({
      date,
      outside: false,
      key: cellKey("d", date),
    });
  }

  while (cells.length % 7 !== 0) {
    const date = addDays(cells[cells.length - 1]!.date, 1);
    cells.push({
      date,
      outside: true,
      key: showOutsideDays ? cellKey("t", date) : `e-${cellKey("x", start)}-${cells.length}`,
    });
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function isDisabled(
  date: Date,
  disabled: CalendarProps["disabled"],
): boolean {
  if (disabled === true) return true;
  if (typeof disabled === "function") return disabled(date);
  if (Array.isArray(disabled)) {
    return disabled.some((entry) => sameDay(entry, date));
  }
  return false;
}

function modifierMatch(
  date: Date,
  spec: Date[] | ((date: Date) => boolean),
): boolean {
  if (typeof spec === "function") return spec(date);
  return spec.some((entry) => sameDay(entry, date));
}

function asSingle(value: CalendarProps["selected"]): Date | undefined {
  return value instanceof Date ? value : undefined;
}

function asDates(value: CalendarProps["selected"]): Date[] {
  return Array.isArray(value) ? value : [];
}

function asRange(value: CalendarProps["selected"]): DateRange {
  if (!value || value instanceof Date || Array.isArray(value)) return {};
  return value;
}

function inRange(date: Date, from?: Date, to?: Date): boolean {
  if (!from || !to) return false;
  const time = startOfDay(date).getTime();
  return time > startOfDay(from).getTime() && time < startOfDay(to).getTime();
}

function nextRange(current: DateRange, date: Date): DateRange {
  const picked = startOfDay(date);
  if (!current.from || current.to) {
    return { from: picked };
  }
  if (picked.getTime() < startOfDay(current.from).getTime()) {
    return { from: picked, to: current.from };
  }
  return { from: current.from, to: picked };
}

function toggleDate(list: Date[], date: Date): Date[] {
  const exists = list.some((entry) => sameDay(entry, date));
  if (exists) return list.filter((entry) => !sameDay(entry, date));
  return [...list, startOfDay(date)];
}

function yearsBetween(fromYear: number, toYear: number): number[] {
  const years: number[] = [];
  for (let year = fromYear; year <= toYear; year++) years.push(year);
  return years;
}

/**
 * Calendar selection, navigation, and day-grid logic without default styles.
 * Use this to build a custom calendar UI while keeping the same behavior.
 */
export function useCalendar(props: CalendarProps): UseCalendarReturn {
  // Resizable-style derivedLocals: plain prop expressions promote. A same-file
  // @sinwan-pure helper and a call to a local getter promote too. Math.max,
  // Array.from, and Date methods do not — those stay explicit getters.
  const mode = props.mode ?? "single";
  const weekStartsOn = props.weekStartsOn ?? 0;
  const showOutsideDays = props.showOutsideDays ?? true;
  const requestedMonths = props.numberOfMonths ?? 1;
  const numberOfMonths = requestedMonths < 1 ? 1 : requestedMonths;
  const code =
    !props.locale
      ? undefined
      : typeof props.locale === "string"
        ? props.locale
        : props.locale.code;
  const calendar =
    props.calendar && props.calendar !== "iso8601"
      ? props.calendar
      : "gregory";
  const today = zonedToday(props.timeZone);
  const selectedLocal = signal<Date | Date[] | DateRange | undefined>(
    undefined,
  );
  const selected =
    "selected" in props ? computed(() => props.selected) : selectedLocal;
  const setSelected = (next: Date | Date[] | DateRange | undefined) => {
    if (!("selected" in props)) selectedLocal.value = next;
  };

  const fallbackMonth = startOfCalendarMonth(today, calendar);
  const viewMonthLocal = signal(
    props.month ? startOfCalendarMonth(props.month, calendar) : fallbackMonth,
  );
  const viewMonth =
    "month" in props
      ? computed(() =>
          startOfCalendarMonth(props.month ?? fallbackMonth, calendar),
        )
      : viewMonthLocal;
  const setViewMonth = (next: Date) => {
    if (!("month" in props)) viewMonthLocal.value = next;
  };

  const setMonth = (next: Date) => {
    const normalized = startOfCalendarMonth(next, calendar);
    setViewMonth(normalized);
    props.onMonthChange?.(normalized);
  };

  const commit = (next: Date | Date[] | DateRange | undefined) => {
    setSelected(next);
    props.onSelect?.(next);
  };

  const pick = (date: Date) => {
    if (mode === "range") {
      commit(nextRange(asRange(selected.value), date));
      return;
    }
    if (mode === "multiple") {
      commit(toggleDate(asDates(selected.value), date));
      return;
    }
    const current = asSingle(selected.value);
    commit(sameDay(current, date) ? undefined : startOfDay(date));
  };

  const monthList = Array.from({ length: numberOfMonths }, (_, index) =>
    addCalendarMonths(viewMonth.value, index, calendar),
  );

  const yearNow = isGregory(calendar)
    ? today.getFullYear()
    : calendarParts(today, calendar).year;
  const fromYear = props.fromYear ?? yearNow - 10;
  const toYear = props.toYear ?? yearNow + 10;
  const captionLayout = props.captionLayout ?? "label";
  const gregory = isGregory(calendar);

  const goToPreviousMonth = () => {
    setMonth(addCalendarMonths(viewMonth.value, -1, calendar));
  };

  const goToNextMonth = () => {
    setMonth(addCalendarMonths(viewMonth.value, 1, calendar));
  };

  const viewPartsFor = (monthDate: Date): CalendarViewParts => {
    if (gregory) {
      return {
        year: monthDate.getFullYear(),
        month: monthDate.getMonth(),
      };
    }
    const parts = calendarParts(monthDate, calendar);
    return { year: parts.year, month: parts.month };
  };

  const monthOptionsFor = (monthDate: Date): CalendarMonthOption[] => {
    if (gregory) {
      return Array.from({ length: 12 }, (_, month) => ({
        value: String(month),
        label: new Date(2024, month, 1).toLocaleDateString(code, {
          ...formatCalendarOptions(calendar),
          month: "short",
        }),
      }));
    }
    const viewParts = viewPartsFor(monthDate);
    return Array.from({ length: 12 }, (_, index) => {
      const optionDate = addCalendarMonths(
        monthDate,
        index + 1 - viewParts.month,
        calendar,
      );
      return {
        value: String(index + 1),
        label: optionDate.toLocaleDateString(code, {
          ...formatCalendarOptions(calendar),
          month: "short",
        }),
      };
    });
  };

  const yearOptions: CalendarMonthOption[] = yearsBetween(fromYear, toYear).map(
    (year) => ({
      value: String(year),
      label: formatNumber(year, code),
    }),
  );

  const selectMonth = (monthDate: Date, nextMonth: number) => {
    if (gregory) {
      setMonth(new Date(monthDate.getFullYear(), nextMonth, 1));
      return;
    }
    setMonth(
      addCalendarMonths(
        monthDate,
        nextMonth - calendarParts(monthDate, calendar).month,
        calendar,
      ),
    );
  };

  const selectYear = (monthDate: Date, nextYear: number) => {
    if (gregory) {
      setMonth(new Date(nextYear, monthDate.getMonth(), 1));
      return;
    }
    setMonth(
      addCalendarMonths(
        monthDate,
        (nextYear - calendarParts(monthDate, calendar).year) * 12,
        calendar,
      ),
    );
  };

  const dayStateFor = (cell: DayCell): CalendarDayState => {
    const currentSelected = selected.value;
    const single = asSingle(currentSelected);
    const dates = asDates(currentSelected);
    const range = asRange(currentSelected);
    const disabledDay = isDisabled(cell.date, props.disabled);
    const isSelected =
      sameDay(single, cell.date) ||
      dates.some((entry) => sameDay(entry, cell.date)) ||
      sameDay(range.from, cell.date) ||
      sameDay(range.to, cell.date);
    const rangeStart = sameDay(range.from, cell.date);
    const rangeEnd = sameDay(range.to, cell.date);
    const rangeMiddle = inRange(cell.date, range.from, range.to);
    const isToday = sameDay(today, cell.date);
    const extraClass = Object.entries(props.modifiersClassNames ?? {})
      .filter(([name]) => {
        const spec = props.modifiers?.[name];
        return spec ? modifierMatch(cell.date, spec) : false;
      })
      .map(([, className]) => className)
      .join(" ");

    return {
      date: cell.date,
      outside: cell.outside,
      selected: isSelected,
      today: isToday,
      disabled: disabledDay,
      rangeStart,
      rangeEnd,
      rangeMiddle,
      extraClass,
    };
  };

  return {
    mode,
    calendar,
    locale: code,
    today,
    selected,
    viewMonth,
    numberOfMonths,
    weekStartsOn,
    showOutsideDays,
    showWeekNumber: props.showWeekNumber,
    captionLayout,
    fromYear,
    toYear,
    buttonVariant: props.buttonVariant ?? "ghost",
    dir: props.dir,
    class: props.class,
    renderDay: props.renderDay,
    monthList,
    setMonth,
    goToPreviousMonth,
    goToNextMonth,
    pick,
    weekdayLabels: () => weekdayLabels(code, weekStartsOn, calendar),
    weeksFor: (monthDate) =>
      buildMonthGrid(monthDate, showOutsideDays, weekStartsOn, calendar),
    viewPartsFor,
    showDropdownsFor: (monthIndex) =>
      captionLayout === "dropdown" && monthIndex === 0,
    monthOptionsFor,
    yearOptions,
    selectMonth,
    selectYear,
    dayStateFor,
    formatCaption: (monthDate) => formatCaption(monthDate, code, calendar),
    formatDayLabel: (date) => formatDayLabel(date, code, calendar),
    formatWeekNumber: (date) => formatNumber(isoWeekNumber(date), code),
    formatDataDay: (date) =>
      date.toLocaleDateString(code, {
        ...formatCalendarOptions(calendar),
      }),
    isGregory: gregory,
  };
}
