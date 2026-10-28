import { cc } from "sinwan/component";
import { ChevronLeft, ChevronRight } from "lucide";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import { Button } from "../button";
import { NativeSelect, NativeSelectOption } from "../native-select";
import { useCalendar, type CalendarProps } from "./useCalendar";

export const Calendar = cc<CalendarProps>((props) => {
  const cal = useCalendar(props);

  return (
    <div
      data-slot="calendar"
      data-calendar={cal.calendar}
      data-locale={cal.locale ?? ""}
      lang={cal.locale ?? ""}
      dir={cal.dir}
      class={cn(
        "group/calendar bg-background w-fit p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        cal.class,
      )}
    >
      <div class="relative flex w-full flex-col gap-4 md:flex-row">
        <div
          data-slot="calendar-nav"
          class="pointer-events-none absolute inset-x-0 top-0 z-20 flex w-full items-center justify-between gap-1"
        >
          <Button
            type="button"
            variant={cal.buttonVariant}
            size="icon"
            class="pointer-events-auto size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
            aria-label="Previous month"
            onclick={cal.goToPreviousMonth}
          >
            <Icon icon={ChevronLeft} class="size-4 rtl:rotate-180" />
          </Button>
          <Button
            type="button"
            variant={cal.buttonVariant}
            size="icon"
            class="pointer-events-auto size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
            aria-label="Next month"
            onclick={cal.goToNextMonth}
          >
            <Icon icon={ChevronRight} class="size-4 rtl:rotate-180" />
          </Button>
        </div>

        {cal.monthList.map((monthDate, monthIndex) => {
          const labels = cal.weekdayLabels();
          const weeks = cal.weeksFor(monthDate);
          const showDropdowns = cal.showDropdownsFor(monthIndex);
          const viewParts = cal.viewPartsFor(monthDate);

          return (
            <div class="flex w-full flex-col gap-4">
              <div class="flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)">
                {showDropdowns ? (
                  <div class="flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium">
                    <NativeSelect
                      aria-label="Month"
                      size="sm"
                      class="min-w-20"
                      value={String(viewParts.month)}
                      onchange={(event: Event) => {
                        const next = Number(
                          (event.currentTarget as HTMLSelectElement).value,
                        );
                        cal.selectMonth(monthDate, next);
                      }}
                    >
                      {cal.monthOptionsFor(monthDate).map((option) => (
                        <NativeSelectOption value={option.value}>
                          {option.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <NativeSelect
                      aria-label="Year"
                      size="sm"
                      class="min-w-20"
                      value={String(viewParts.year)}
                      onchange={(event: Event) => {
                        const next = Number(
                          (event.currentTarget as HTMLSelectElement).value,
                        );
                        cal.selectYear(monthDate, next);
                      }}
                    >
                      {cal.yearOptions.map((option) => (
                        <NativeSelectOption value={option.value}>
                          {option.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                ) : (
                  <div class="text-sm font-medium select-none">
                    {cal.formatCaption(monthDate)}
                  </div>
                )}
              </div>

              <div class="w-full border-collapse">
                <div class="flex">
                  {cal.showWeekNumber ? (
                    <div class="w-(--cell-size) select-none" />
                  ) : null}
                  {labels.map((label) => (
                    <div class="flex-1 rounded-(--cell-radius) text-center text-[0.8rem] font-normal text-muted-foreground select-none">
                      {label}
                    </div>
                  ))}
                </div>

                {weeks.map((week) => (
                  <div class="mt-2 flex w-full">
                    {cal.showWeekNumber ? (
                      <div class="flex w-(--cell-size) items-center justify-center text-[0.8rem] text-muted-foreground select-none">
                        {cal.formatWeekNumber(week[0]!.date)}
                      </div>
                    ) : null}
                    {week.map((cell) => {
                      if (!cal.showOutsideDays && cell.outside) {
                        return (
                          <div class="relative flex-1 aspect-square h-full w-full min-w-0 p-0 invisible" />
                        );
                      }
                      const day = cal.dayStateFor(cell);

                      return (
                        <div
                          class={cn(
                            "group/day relative flex-1 aspect-square h-full w-full min-w-0 rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-e-(--cell-radius)",
                            cal.showWeekNumber
                              ? "[&:nth-child(2)[data-selected=true]_button]:rounded-s-(--cell-radius)"
                              : "[&:first-child[data-selected=true]_button]:rounded-s-(--cell-radius)",
                            day.rangeStart &&
                              "relative isolate z-0 rounded-s-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:end-0 after:w-4 after:bg-muted",
                            day.rangeMiddle && "rounded-none",
                            day.rangeEnd &&
                              "relative isolate z-0 rounded-e-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:start-0 after:w-4 after:bg-muted",
                          )}
                          data-outside={cell.outside ? "" : undefined}
                          data-selected={day.selected ? "true" : undefined}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={day.disabled}
                            data-day={cal.formatDataDay(cell.date)}
                            data-selected-single={
                              day.selected &&
                              !day.rangeStart &&
                              !day.rangeEnd &&
                              !day.rangeMiddle
                                ? "true"
                                : undefined
                            }
                            data-range-start={
                              day.rangeStart ? "true" : undefined
                            }
                            data-range-end={day.rangeEnd ? "true" : undefined}
                            data-range-middle={
                              day.rangeMiddle ? "true" : undefined
                            }
                            data-today={day.today ? "" : undefined}
                            class={cn(
                              "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-e-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-s-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
                              cell.outside && "text-muted-foreground",
                              day.today &&
                                !day.selected &&
                                "rounded-(--cell-radius) bg-muted text-foreground",
                              day.disabled &&
                                "text-muted-foreground opacity-50",
                              day.extraClass,
                            )}
                            onclick={() => {
                              cal.pick(cell.date);
                            }}
                          >
                            {cal.formatDayLabel(cell.date)}
                            {cal.renderDay?.(day)}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
