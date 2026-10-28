import { getRawProps, inject, provide, type InjectionKey } from "sinwan/component";
import {
  computed,
  signal,
  unwrap,
  type Computed,
  type Signal,
} from "sinwan/reactivity";

export type AvatarContext = {
  loaded: Signal<boolean>;
  failed: Signal<boolean>;
};

export type AvatarImageProps = JSX.IntrinsicElements["img"];

type AvatarImageLoadEvent = Parameters<NonNullable<AvatarImageProps["onload"]>>[0];
type AvatarImageErrorEvent = Parameters<NonNullable<AvatarImageProps["onerror"]>>[0];

export type AvatarImageOptions = Pick<AvatarImageProps, "onload" | "onerror">;

export type AvatarImageReturn = {
  visible: Computed<boolean>;
  loaded: Signal<boolean>;
  onLoad: (event: AvatarImageLoadEvent) => void;
  onError: (event: AvatarImageErrorEvent) => void;
};

export type AvatarFallbackReturn = {
  visible: Computed<boolean>;
};

const AvatarKey: InjectionKey<AvatarContext> = Symbol("sinwan-ui.avatar");

export function useAvatarRoot(): AvatarContext {
  const avatar: AvatarContext = {
    loaded: signal(false),
    failed: signal(false),
  };
  provide(AvatarKey, avatar);
  return avatar;
}

export function useAvatar(consumer = "useAvatar"): AvatarContext {
  const context = inject(AvatarKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a <Avatar />`);
  }
  return context;
}

export function useAvatarImage(props: AvatarImageOptions): AvatarImageReturn {
  const avatar = useAvatar("AvatarImage");

  return {
    visible: computed(() => !avatar.failed.value),
    loaded: avatar.loaded,
    onLoad: (event) => {
      avatar.loaded.value = true;
      avatar.failed.value = false;
      const onload = unwrap(getRawProps(props).onload);
      if (typeof onload === "function") onload(event);
    },
    onError: (event) => {
      avatar.failed.value = true;
      avatar.loaded.value = false;
      const onerror = unwrap(getRawProps(props).onerror);
      if (typeof onerror === "function") onerror(event);
    },
  };
}

export function useAvatarFallback(): AvatarFallbackReturn {
  const avatar = useAvatar("AvatarFallback");

  return {
    visible: computed(() => avatar.failed.value || !avatar.loaded.value),
  };
}
