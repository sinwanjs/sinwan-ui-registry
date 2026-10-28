import { cc, type SinwanComponent } from "sinwan/component";
import { ChevronLeft, ChevronRight } from "lucide";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import { Button, type ButtonProps } from "../button";
import {
  useCarousel,
  useCarouselRoot,
  useCarouselSwipe,
  type CarouselProps,
} from "./useCarousel";

export const Carousel: SinwanComponent<CarouselProps> = cc((props) => {
  const root = useCarouselRoot(props);

  return (
    <div
      data-slot="carousel"
      role="region"
      aria-roledescription="carousel"
      class={cn("relative", root.class)}
      onkeydown={(event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          root.scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          root.scrollNext();
        }
      }}
    >
      {root.children}
    </div>
  );
});

export type CarouselContentProps = JSX.IntrinsicElements["div"];

export const CarouselContent: SinwanComponent<CarouselContentProps> = cc(
  ({ class: className, ...props }) => {
    const swipe = useCarouselSwipe();

    return (
      <div
        class={cn(
          "overflow-hidden touch-manipulation select-none",
          swipe.orientation === "horizontal" ? "touch-pan-y" : "touch-pan-x",
        )}
        data-slot="carousel-content"
        data-dragging={swipe.isDragging.value ? "" : undefined}
        onpointerdown={swipe.onPointerDown}
      >
        <div
          class={cn(
            "flex ease-out",
            swipe.isDragging.value
              ? "transition-none"
              : "transition-transform duration-300",
            swipe.orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className,
          )}
          style={
            swipe.orientation === "horizontal"
              ? { transform: `translateX(${swipe.trackTransform()})` }
              : { transform: `translateY(${swipe.trackTransform()})` }
          }
          {...props}
        />
      </div>
    );
  },
);

export type CarouselItemProps = JSX.IntrinsicElements["div"];

export const CarouselItem: SinwanComponent<CarouselItemProps> = cc(
  ({ class: className, ...props }) => {
    const { orientation, registerSlide } = useCarousel();
    registerSlide();

    return (
      <div
        role="group"
        aria-roledescription="slide"
        data-slot="carousel-item"
        class={cn(
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        {...props}
      />
    );
  },
);

export type CarouselControlProps = ButtonProps;

export const CarouselPrevious: SinwanComponent<CarouselControlProps> = cc(
  ({
    class: className,
    variant = "outline",
    size = "icon-sm",
    ...props
  }) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        data-slot="carousel-previous"
        variant={variant}
        size={size}
        class={cn(
          "absolute touch-manipulation rounded-full data-disabled:pointer-events-none data-disabled:opacity-50",
          orientation === "horizontal"
            ? "inset-y-0 -left-12 my-auto"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        data-disabled={!canScrollPrev.value ? "" : undefined}
        onclick={() => {
          if (canScrollPrev.value) scrollPrev();
        }}
        {...(props as ButtonProps)}
      >
        <Icon icon={ChevronLeft} />
        <span class="sr-only">Previous slide</span>
      </Button>
    );
  },
);

export const CarouselNext: SinwanComponent<CarouselControlProps> = cc(
  ({
    class: className,
    variant = "outline",
    size = "icon-sm",
    ...props
  }) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        data-slot="carousel-next"
        variant={variant}
        size={size}
        class={cn(
          "absolute touch-manipulation rounded-full data-disabled:pointer-events-none data-disabled:opacity-50",
          orientation === "horizontal"
            ? "inset-y-0 -right-12 my-auto"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        data-disabled={!canScrollNext.value ? "" : undefined}
        onclick={() => {
          if (canScrollNext.value) scrollNext();
        }}
        {...(props as ButtonProps)}
      >
        <Icon icon={ChevronRight} />
        <span class="sr-only">Next slide</span>
      </Button>
    );
  },
);
