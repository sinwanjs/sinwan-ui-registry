import { cc } from "sinwan/component";
import { cn } from "../../../lib/utils";
import { useSlider, type SliderProps } from "./useSlider";

const Slider = cc<SliderProps>((props) => {
  const slider = useSlider(props);

  return (
    <div
      data-slot="slider"
      data-orientation={slider.orientation.value}
      data-disabled={props.disabled ? "" : undefined}
      class={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        slider.orientation.value === "vertical" &&
          "h-full min-h-40 w-auto flex-col",
        props.disabled && "opacity-50",
        props.class,
      )}
    >
      <div
        data-slot="slider-track"
        class={cn(
          "relative grow overflow-hidden rounded-full bg-muted",
          slider.orientation.value === "vertical" ? "h-full w-1" : "h-1 w-full",
        )}
      >
        <div
          data-slot="slider-range"
          class={cn(
            "absolute bg-primary select-none",
            slider.orientation.value === "vertical"
              ? "w-full bottom-0"
              : "h-full start-0",
          )}
          style={slider.orientation.value === "vertical"
              ? `height: ${slider.percent.value}%`
              : `width: ${slider.percent.value}%`
          }
        />
      </div>
      <input
        type="range"
        data-slot="slider-input"
        id={props.id}
        name={props.name}
        min={String(slider.min.value)}
        max={String(slider.max.value)}
        step={String(slider.step.value)}
        disabled={props.disabled}
        aria-orientation={slider.orientation.value}
        value={String(slider.primary.value)}
        class={cn(
          "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:pointer-events-none disabled:cursor-not-allowed",
          slider.orientation.value === "vertical" &&
            "[writing-mode:vertical-lr]",
        )}
        oninput={(event) => {
          const target = event.currentTarget as HTMLInputElement;
          slider.commit(Number(target.value));
        }}
      />
      <span
        data-slot="slider-thumb"
        aria-hidden="true"
        class={cn(
          "pointer-events-none absolute z-0 size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2",
          // The native range runs right to left in RTL; the thumb follows from the start side.
          slider.orientation.value === "vertical"
            ? "left-1/2 -translate-x-1/2 translate-y-1/2"
            : "-translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2",
        )}
        style={slider.orientation.value === "vertical"
            ? `bottom: ${slider.percent.value}%`
            : `top: 50%; inset-inline-start: ${slider.percent.value}%`
        }
      />
    </div>
  );
});

export { Slider };
