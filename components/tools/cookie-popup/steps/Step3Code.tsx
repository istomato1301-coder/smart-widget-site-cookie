"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { generateCookiePopupCode } from "@/lib/cookiePopupCodeGenerator";
import type { CookiePopupConfig } from "@/lib/cookiePopupConfig";
import type { CookiePolicyData } from "@/lib/cookiePolicyGenerator";
import { defaultConfig } from "@/lib/cookiePopupConfig";
import { cn } from "@/lib/utils";

const STORAGE_KEY_STEP1 = "cookie-popup-generator-step1";
const STORAGE_KEY_STEP2 = "cookie-popup-generator-step2";
const STORAGE_KEY_SKIP_POLICY = "cookie-popup-generator-skip-policy-step";

interface Step3CodeProps {
  onBack?: () => void;
}

function loadStep1Data(): CookiePolicyData {
  if (typeof window === "undefined") {
    return {
      websiteUrl: "",
      companyName: "",
      contactEmail: "",
      analytics: {
        yandexMetrica: false,
        googleAnalytics: false,
      },
      skipPolicy: false,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_STEP1);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load step1 data:", error);
  }

  return {
    websiteUrl: "",
    companyName: "",
    contactEmail: "",
    analytics: {
      yandexMetrica: false,
      googleAnalytics: false,
    },
    skipPolicy: false,
  };
}

function loadStep2Data(): CookiePopupConfig {
  if (typeof window === "undefined") {
    return defaultConfig;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_STEP2);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load step2 data:", error);
  }

  return defaultConfig;
}

function loadSkipPolicyStep(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_SKIP_POLICY);
    return stored === "true";
  } catch (error) {
    return false;
  }
}

export function Step3Code({ onBack }: Step3CodeProps) {
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const policyData = loadStep1Data();
    const popupConfig = loadStep2Data();
    const skipPolicyStep = loadSkipPolicyStep();

    const generatedCode = generateCookiePopupCode({
      popupConfig,
      policyData,
      skipPolicyStep,
    });

    setCode(generatedCode);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
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
      className="w-full space-y-6"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Левая колонка - Инструкции */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Инструкция по установке</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Скопируйте код справа и вставьте его на ваш сайт. Код работает
                на любой платформе и не требует дополнительных зависимостей.
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">WordPress</h3>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li>Перейдите в раздел "Внешний вид" → "Редактор тем"</li>
                  <li>Выберите файл footer.php</li>
                  <li>Вставьте код перед закрывающим тегом &lt;/body&gt;</li>
                  <li>Сохраните изменения</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Tilda</h3>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li>Откройте настройки страницы</li>
                  <li>Перейдите в "HTML-код" → "Код перед &lt;/body&gt;"</li>
                  <li>Вставьте скопированный код</li>
                  <li>Сохраните изменения</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">HTML сайт</h3>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li>Откройте файл index.html (или другой HTML файл)</li>
                  <li>Найдите закрывающий тег &lt;/body&gt;</li>
                  <li>Вставьте код перед этим тегом</li>
                  <li>Сохраните файл</li>
                </ol>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs">
                  <strong className="text-foreground">Примечание:</strong> Код
                  автоматически определяет, было ли уже дано согласие, и не
                  показывает попап повторно.
                </p>
              </div>
            </div>
          </div>

          {/* Кнопка "Назад" */}
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к дизайну
            </Button>
          )}
        </div>

        {/* Правая колонка - Код */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-lg font-semibold">Готовый код</Label>
              <Button
                onClick={handleCopy}
                size="sm"
                variant={copied ? "default" : "outline"}
                className={cn(
                  "transition-colors",
                  copied && "bg-green-600 hover:bg-green-700"
                )}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Скопировать код
                  </>
                )}
              </Button>
            </div>

            <Textarea
              value={code}
              readOnly
              className="min-h-[500px] font-mono text-xs"
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
              }}
            />
          </div>
        </div>
      </div>

      {/* Soft CTA блок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-8 text-center shadow-sm"
      >
        <h3 className="mb-2 text-xl font-semibold">
          Мы скоро запускаем умный виджет
        </h3>
        <p className="mb-4 text-muted-foreground">
          который увеличивает конверсию
        </p>
        <p className="text-sm text-muted-foreground">
          Следите за обновлениями в нашем{" "}
          <a
            href="https://t.me/your_channel"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Telegram канале
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
