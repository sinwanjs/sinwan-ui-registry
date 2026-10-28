import { onMounted, onUnmounted } from "sinwan/component";
import { signal } from "sinwan/reactivity";

const MOBILE_BREAKPOINT = 768;

/**
 * Reactive mobile breakpoint (max-width 767px). Call during component setup.
 */
export function useIsMobile(): () => boolean {
  const isMobile = signal(false);

  onMounted(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
    };
    onChange();
    mql.addEventListener("change", onChange);
    onUnmounted(() => mql.removeEventListener("change", onChange));
  });

  return () => isMobile.value;
}

export { MOBILE_BREAKPOINT };
