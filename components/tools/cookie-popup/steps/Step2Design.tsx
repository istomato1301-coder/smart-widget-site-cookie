"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CookiePopupPreview } from "@/components/tools/cookie-popup/CookiePopupPreview";
import {
  type CookiePopupConfig,
  defaultConfig,
  PRESET_COLORS,
  type PopupPosition,
  type PopupSize,
  type PopupStyle,
  type PopupAnimation,
  type PopupDelay,
} from "@/lib/cookiePopupConfig";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cookie-popup-generator-step2";

function loadFromStorage(): CookiePopupConfig {
  if (typeof window === "undefined") {
    return defaultConfig;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }

  return defaultConfig;
}

function saveToStorage(data: CookiePopupConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function Step2Design() {
  const [config, setConfig] = useState<CookiePopupConfig>(defaultConfig);

  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    const loaded = loadFromStorage();
    setConfig(loaded);
  }, []);

  // Сохраняем данные в localStorage при изменении
  useEffect(() => {
    saveToStorage(config);
  }, [config]);

  const updateConfig = <K extends keyof CookiePopupConfig>(
    key: K,
    value: CookiePopupConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="w-full"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Левая колонка - Настройки */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">Настройки дизайна</h2>

            <div className="space-y-6">
              {/* Расположение попапа */}
              <div className="space-y-3">
                <Label>Расположение попапа</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "bottom-center", label: "По центру" },
                      { value: "bottom-left", label: "Слева" },
                      { value: "bottom-right", label: "Справа" },
                    ] as const
                  ).map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        config.position === option.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateConfig("position", option.value as PopupPosition)
                      }
                      className="w-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Размер */}
              <div className="space-y-3">
                <Label>Размер</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "small", label: "Маленький" },
                      { value: "medium", label: "Средний" },
                      { value: "large", label: "Большой" },
                    ] as const
                  ).map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        config.size === option.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateConfig("size", option.value as PopupSize)
                      }
                      className="w-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Стиль */}
              <div className="space-y-3">
                <Label>Стиль</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "minimal", label: "Минимальный" },
                      { value: "rounded", label: "Скруглённый" },
                      { value: "soft-shadow", label: "С тенью" },
                    ] as const
                  ).map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        config.style === option.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateConfig("style", option.value as PopupStyle)
                      }
                      className="w-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Цвет кнопки */}
              <div className="space-y-3">
                <Label>Цвет кнопки</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateConfig("buttonColor", color.value)}
                        className={cn(
                          "h-10 w-full rounded-md border-2 transition-all",
                          config.buttonColor === color.value
                            ? "border-foreground ring-2 ring-ring ring-offset-2"
                            : "border-border hover:border-ring"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={config.buttonColor}
                      onChange={(e) =>
                        updateConfig("buttonColor", e.target.value)
                      }
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.buttonColor}
                      onChange={(e) =>
                        updateConfig("buttonColor", e.target.value)
                      }
                      placeholder="#3b82f6"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Текст кнопки */}
              <div className="space-y-2">
                <Label htmlFor="button-text">Текст кнопки согласия</Label>
                <Input
                  id="button-text"
                  type="text"
                  placeholder="Принять"
                  value={config.buttonText}
                  onChange={(e) => updateConfig("buttonText", e.target.value)}
                />
              </div>

              {/* Текст уведомления */}
              <div className="space-y-2">
                <Label htmlFor="notification-text">Текст уведомления</Label>
                <Textarea
                  id="notification-text"
                  placeholder="Мы используем cookie для улучшения работы сайта"
                  value={config.notificationText}
                  onChange={(e) =>
                    updateConfig("notificationText", e.target.value)
                  }
                  rows={3}
                />
              </div>

              {/* Анимация появления */}
              <div className="space-y-3">
                <Label>Анимация появления</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "fade", label: "Fade" },
                      { value: "slide-up", label: "Slide up" },
                      { value: "none", label: "Нет" },
                    ] as const
                  ).map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        config.animation === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateConfig(
                          "animation",
                          option.value as PopupAnimation
                        )
                      }
                      className="w-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Задержка показа */}
              <div className="space-y-2">
                <Label htmlFor="delay">Задержка показа</Label>
                <Select
                  value={config.delay}
                  onValueChange={(value) =>
                    updateConfig("delay", value as PopupDelay)
                  }
                >
                  <SelectTrigger id="delay" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Сразу</SelectItem>
                    <SelectItem value="2s">2 секунды</SelectItem>
                    <SelectItem value="5s">5 секунд</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка - Live Preview */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Предпросмотр</h2>
              <span className="text-xs text-muted-foreground">
                Обновляется автоматически
              </span>
            </div>
            <CookiePopupPreview config={config} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
