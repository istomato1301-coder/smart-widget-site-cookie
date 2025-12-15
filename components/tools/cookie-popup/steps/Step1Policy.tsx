"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { generateCookiePolicy, type CookiePolicyData } from "@/lib/cookiePolicyGenerator";

const STORAGE_KEY = "cookie-popup-generator-step1";
const STORAGE_KEY_SKIP_POLICY = "cookie-popup-generator-skip-policy-step";

const defaultData: CookiePolicyData = {
  websiteUrl: "",
  companyName: "",
  contactEmail: "",
  analytics: {
    yandexMetrica: false,
    googleAnalytics: false,
  },
  skipPolicy: false,
};

function loadFromStorage(): CookiePolicyData {
  if (typeof window === "undefined") {
    return defaultData;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }

  return defaultData;
}

function saveToStorage(data: CookiePolicyData): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

interface Step1PolicyProps {
  onNextStep?: () => void;
}

function loadSkipPolicyStep(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_SKIP_POLICY);
    return stored === "true";
  } catch (error) {
    console.error("Failed to load skipPolicyStep from localStorage:", error);
    return false;
  }
}

function saveSkipPolicyStep(skip: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY_SKIP_POLICY, skip.toString());
  } catch (error) {
    console.error("Failed to save skipPolicyStep to localStorage:", error);
  }
}

export function Step1Policy({ onNextStep }: Step1PolicyProps) {
  const [formData, setFormData] = useState<CookiePolicyData>(defaultData);

  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    const loaded = loadFromStorage();
    setFormData(loaded);
  }, []);

  // Сохраняем данные в localStorage при изменении
  useEffect(() => {
    saveToStorage(formData);
  }, [formData]);

  const handleInputChange = (field: keyof CookiePolicyData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAnalyticsChange = (
    service: "yandexMetrica" | "googleAnalytics",
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [service]: checked,
      },
    }));
  };

  const handleSkipPolicyChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      skipPolicy: checked,
    }));
  };

  const handleContinue = () => {
    if (onNextStep) {
      onNextStep();
    }
  };

  const handleSkipStep = () => {
    saveSkipPolicyStep(true);
    setFormData((prev) => ({
      ...prev,
      skipPolicy: true,
    }));
    if (onNextStep) {
      onNextStep();
    }
  };

  const policyText = generateCookiePolicy(formData);

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
        {/* Левая колонка - Форма */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">Параметры политики</h2>

            <div className="space-y-6">
              {/* Переключатель пропуска */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="skip-policy"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    У меня уже есть политика Cookie
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Пропустить этот шаг
                  </p>
                </div>
                <Switch
                  id="skip-policy"
                  checked={formData.skipPolicy}
                  onCheckedChange={handleSkipPolicyChange}
                />
              </div>

              {!formData.skipPolicy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Адрес сайта */}
                  <div className="space-y-2">
                    <Label htmlFor="website-url">Адрес сайта</Label>
                    <Input
                      id="website-url"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.websiteUrl}
                      onChange={(e) =>
                        handleInputChange("websiteUrl", e.target.value)
                      }
                    />
                  </div>

                  {/* Название компании */}
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Название компании</Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="ООО «Пример»"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                    />
                  </div>

                  {/* Email для связи */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email для связи</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="contact@example.com"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        handleInputChange("contactEmail", e.target.value)
                      }
                    />
                  </div>

                  {/* Чекбоксы аналитики */}
                  <div className="space-y-4">
                    <Label>Сервисы аналитики</Label>
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="yandex-metrica"
                          checked={formData.analytics.yandexMetrica}
                          onCheckedChange={(checked) =>
                            handleAnalyticsChange(
                              "yandexMetrica",
                              checked === true
                            )
                          }
                        />
                        <Label
                          htmlFor="yandex-metrica"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Яндекс.Метрика
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="google-analytics"
                          checked={formData.analytics.googleAnalytics}
                          onCheckedChange={(checked) =>
                            handleAnalyticsChange(
                              "googleAnalytics",
                              checked === true
                            )
                          }
                        />
                        <Label
                          htmlFor="google-analytics"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Google Analytics
                        </Label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Кнопки управления */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button onClick={handleContinue} className="w-full">
                  Продолжить
                </Button>
                <Button
                  onClick={handleSkipStep}
                  variant="outline"
                  className="w-full"
                >
                  У меня уже есть политика cookie
                </Button>
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

            {formData.skipPolicy ? (
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
                <p className="text-center text-sm text-muted-foreground">
                  Политика пропущена
                  <br />
                  <span className="text-xs">
                    Включите генерацию политики в настройках слева
                  </span>
                </p>
              </div>
            ) : (
              <motion.div
                key={policyText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="prose prose-sm max-w-none dark:prose-invert"
              >
                <div className="rounded-lg border bg-background p-6">
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
                    {policyText || (
                      <span className="text-muted-foreground">
                        Заполните форму слева, чтобы увидеть сгенерированную
                        политику
                      </span>
                    )}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
