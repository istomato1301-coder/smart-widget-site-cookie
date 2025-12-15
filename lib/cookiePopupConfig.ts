export type PopupPosition = "bottom-center" | "bottom-left" | "bottom-right";
export type PopupSize = "small" | "medium" | "large";
export type PopupStyle = "minimal" | "rounded" | "soft-shadow";
export type PopupAnimation = "fade" | "slide-up" | "none";
export type PopupDelay = "immediate" | "2s" | "5s";

export interface CookiePopupConfig {
  position: PopupPosition;
  size: PopupSize;
  style: PopupStyle;
  buttonColor: string;
  buttonText: string;
  notificationText: string;
  animation: PopupAnimation;
  delay: PopupDelay;
}

export const defaultConfig: CookiePopupConfig = {
  position: "bottom-center",
  size: "medium",
  style: "rounded",
  buttonColor: "#3b82f6",
  buttonText: "Принять",
  notificationText: "Мы используем cookie для улучшения работы сайта",
  animation: "fade",
  delay: "immediate",
};

export const PRESET_COLORS = [
  { name: "Синий", value: "#3b82f6" },
  { name: "Зелёный", value: "#10b981" },
  { name: "Фиолетовый", value: "#8b5cf6" },
  { name: "Красный", value: "#ef4444" },
  { name: "Оранжевый", value: "#f59e0b" },
  { name: "Серый", value: "#6b7280" },
];

export function getSizeClasses(size: PopupSize): {
  container: string;
  text: string;
  button: string;
} {
  switch (size) {
    case "small":
      return {
        container: "p-3 gap-2",
        text: "text-sm",
        button: "px-3 py-1.5 text-sm",
      };
    case "large":
      return {
        container: "p-6 gap-4",
        text: "text-base",
        button: "px-6 py-3 text-base",
      };
    default: // medium
      return {
        container: "p-4 gap-3",
        text: "text-sm",
        button: "px-4 py-2 text-sm",
      };
  }
}

export function getStyleClasses(style: PopupStyle): string {
  switch (style) {
    case "minimal":
      return "border border-border";
    case "soft-shadow":
      return "shadow-lg shadow-black/10";
    default: // rounded
      return "rounded-lg border border-border";
  }
}

export function getPositionClasses(position: PopupPosition): string {
  switch (position) {
    case "bottom-left":
      return "left-4 bottom-4";
    case "bottom-right":
      return "right-4 bottom-4";
    default: // bottom-center
      return "left-1/2 -translate-x-1/2 bottom-4";
  }
}

export function getAnimationClasses(animation: PopupAnimation): string {
  switch (animation) {
    case "fade":
      return "animate-in fade-in-0 duration-300";
    case "slide-up":
      return "animate-in slide-in-from-bottom-4 duration-300";
    default: // none
      return "";
  }
}

