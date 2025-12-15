"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CookiePopupConfig } from "@/lib/cookiePopupConfig";
import {
  getSizeClasses,
  getStyleClasses,
  getPositionClasses,
  getAnimationClasses,
} from "@/lib/cookiePopupConfig";
import { cn } from "@/lib/utils";

interface CookiePopupPreviewProps {
  config: CookiePopupConfig;
}

export function CookiePopupPreview({ config }: CookiePopupPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Обработка задержки показа - перезапускаем при изменении конфигурации
  useEffect(() => {
    setIsAccepted(false);
    setIsVisible(false);

    let timeoutId: NodeJS.Timeout;

    switch (config.delay) {
      case "2s":
        timeoutId = setTimeout(() => setIsVisible(true), 2000);
        break;
      case "5s":
        timeoutId = setTimeout(() => setIsVisible(true), 5000);
        break;
      default: // immediate
        setIsVisible(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    config.delay,
    config.position,
    config.size,
    config.style,
    config.animation,
    config.buttonColor,
    config.buttonText,
    config.notificationText,
  ]);

  const handleAccept = () => {
    setIsAccepted(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  const sizeClasses = getSizeClasses(config.size);
  const styleClasses = getStyleClasses(config.style);
  const positionClasses = getPositionClasses(config.position);

  // Анимация появления
  const animationVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    "slide-up": {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
  };

  const variants = animationVariants[config.animation];

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg border bg-background">
      {/* Имитация страницы */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-background p-8">
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-muted/40" />
          <div className="h-4 w-1/2 rounded bg-muted/30" />
          <div className="h-4 w-2/3 rounded bg-muted/30" />
          <div className="mt-8 space-y-3">
            <div className="h-32 w-full rounded-lg border bg-card/50" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 rounded border bg-card/50" />
              <div className="h-24 rounded border bg-card/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Popup */}
      <AnimatePresence>
        {isVisible && !isAccepted && (
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: 0.3 }}
            className={cn(
              "absolute z-50 max-w-md bg-card border-border",
              positionClasses,
              styleClasses,
              sizeClasses.container
            )}
            style={{
              width: config.size === "small" ? "320px" : config.size === "large" ? "480px" : "400px",
            }}
          >
            <div className="flex flex-col gap-3">
              <p className={cn("text-foreground", sizeClasses.text)}>
                {config.notificationText}
              </p>
              <button
                onClick={handleAccept}
                className={cn(
                  "rounded-md font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  sizeClasses.button
                )}
                style={{
                  backgroundColor: config.buttonColor,
                  color: getContrastColor(config.buttonColor),
                }}
              >
                {config.buttonText}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Функция для определения контрастного цвета текста
function getContrastColor(hexColor: string): string {
  // Упрощенная проверка яркости цвета
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

