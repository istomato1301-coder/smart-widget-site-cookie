"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { Download, QrCode, X, Sparkles, Send, MessageCircle, Settings, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PremiumQRBuilder } from "@/components/tools/qr-premium/PremiumQRBuilder";

type QRType = "url" | "telegram" | "whatsapp" | "vk" | "email" | "phone" | "text";

interface QRTypeConfig {
  label: string;
  placeholder: string;
  format: (value: string) => string;
}

const QR_TYPES: Record<QRType, QRTypeConfig> = {
  url: {
    label: "URL",
    placeholder: "https://example.com",
    format: (value) => value,
  },
  telegram: {
    label: "Telegram",
    placeholder: "@username или t.me/username",
    format: (value) => {
      if (value.startsWith("@")) {
        return `https://t.me/${value.slice(1)}`;
      }
      if (value.startsWith("t.me/") || value.startsWith("https://t.me/")) {
        return value.startsWith("https://") ? value : `https://${value}`;
      }
      return `https://t.me/${value}`;
    },
  },
  whatsapp: {
    label: "WhatsApp",
    placeholder: "+1234567890 или 1234567890",
    format: (value) => {
      const phone = value.replace(/\D/g, "");
      return `https://wa.me/${phone}`;
    },
  },
  vk: {
    label: "VK",
    placeholder: "id123456 или vk.com/id123456",
    format: (value) => {
      if (value.startsWith("vk.com/") || value.startsWith("https://vk.com/")) {
        return value.startsWith("https://") ? value : `https://${value}`;
      }
      if (value.startsWith("id")) {
        return `https://vk.com/${value}`;
      }
      return `https://vk.com/${value}`;
    },
  },
  email: {
    label: "Email",
    placeholder: "example@email.com",
    format: (value) => `mailto:${value}`,
  },
  phone: {
    label: "Phone",
    placeholder: "+1234567890 или 1234567890",
    format: (value) => {
      const phone = value.replace(/\D/g, "");
      return `tel:${phone}`;
    },
  },
  text: {
    label: "Plain Text",
    placeholder: "Введите текст...",
    format: (value) => value,
  },
};

const STORAGE_KEY = "qr-generator-premium-modal-shown";
const SESSION_START_KEY = "qr-generator-session-start";
const PREMIUM_STORAGE_KEY = "qr-generator-premium-unlocked";
const EMAIL_STORAGE_KEY = "qr-generator-emails";

function getSessionStart(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    // Получаем или создаем идентификатор начала сессии
    // Используем sessionStorage, который автоматически очищается при закрытии вкладки
    let sessionStart = sessionStorage.getItem(SESSION_START_KEY);
    if (!sessionStart) {
      sessionStart = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem(SESSION_START_KEY, sessionStart);
    }
    return sessionStart;
  } catch (error) {
    console.error("Failed to get session start:", error);
    return `session-${Date.now()}`;
  }
}

function hasModalBeenShown(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const sessionStart = getSessionStart();
    const stored = localStorage.getItem(STORAGE_KEY);
    // Проверяем, был ли модал показан в текущей сессии
    // Сравниваем идентификатор сессии из sessionStorage с сохраненным в localStorage
    const hasBeenShown = stored === sessionStart;
    return hasBeenShown;
  } catch (error) {
    console.error("Failed to check localStorage:", error);
    return false;
  }
}

function markModalAsShown(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const sessionStart = getSessionStart();
    // Сохраняем идентификатор текущей сессии в localStorage
    // Это позволит отслеживать, был ли модал показан в текущей сессии
    localStorage.setItem(STORAGE_KEY, sessionStart);
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

function isPremiumUnlocked(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return localStorage.getItem(PREMIUM_STORAGE_KEY) === "true";
  } catch (error) {
    console.error("Failed to check premium status:", error);
    return false;
  }
}

function unlockPremium(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(PREMIUM_STORAGE_KEY, "true");
  } catch (error) {
    console.error("Failed to unlock premium:", error);
  }
}

function saveEmailAndQRData(email: string, qrData: { type: QRType; value: string; dataUrl: string }): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = localStorage.getItem(EMAIL_STORAGE_KEY);
    const emails = stored ? JSON.parse(stored) : [];
    emails.push({
      email,
      qrData,
      timestamp: Date.now(),
    });
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails));
  } catch (error) {
    console.error("Failed to save email and QR data:", error);
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function QRCodeGeneratorPage() {
  const [qrType, setQrType] = useState<QRType>("url");
  const [inputValue, setInputValue] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumBuilder, setShowPremiumBuilder] = useState(false);
  const [managementUrl, setManagementUrl] = useState<string | null>(null);
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const premiumBuilderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentConfig = QR_TYPES[qrType];

  // Инициализируем sessionStart и проверяем premium статус при монтировании компонента
  useEffect(() => {
    getSessionStart();
    setIsPremium(isPremiumUnlocked());
  }, []);

  // Generate QR code when input or type changes
  useEffect(() => {
    const generateQR = async () => {
      if (!inputValue.trim()) {
        setQrDataUrl(null);
        return;
      }

      setIsGenerating(true);
      try {
        const formattedValue = currentConfig.format(inputValue.trim());
        const dataUrl = await QRCode.toDataURL(formattedValue, {
          width: 512,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
        setQrDataUrl(null);
      } finally {
        setIsGenerating(false);
      }
    };

    const timeoutId = setTimeout(generateQR, 300);
    return () => clearTimeout(timeoutId);
  }, [inputValue, qrType, currentConfig]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    // Download immediately
    const link = document.createElement("a");
    link.download = `qrcode-${qrType}-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();

    // Show premium modal if not shown in this session
    // Проверяем только после того, как sessionStart уже создан
    const hasBeenShown = hasModalBeenShown();
    
    if (!hasBeenShown) {
      // Small delay to ensure download starts
      setTimeout(() => {
        setShowPremiumModal(true);
        markModalAsShown();
      }, 300);
    }
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
    setShowEmailForm(false);
    setEmail("");
    setEmailError("");
    setIsSubmitting(false);
  };

  const handleGetPremium = () => {
    // Показываем форму email внутри модального окна
    setShowEmailForm(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация email
    if (!email.trim()) {
      setEmailError("Пожалуйста, введите email");
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError("Пожалуйста, введите корректный email");
      return;
    }

    setIsSubmitting(true);
    setEmailError("");

    try {
      // Сохраняем email и QR данные
      if (qrDataUrl && inputValue) {
        saveEmailAndQRData(email.trim(), {
          type: qrType,
          value: inputValue,
          dataUrl: qrDataUrl,
        });
      }

      // Разблокируем premium
      unlockPremium();
      setIsPremium(true);

      // Закрываем модальное окно и открываем премиум-билдер
      setTimeout(() => {
        setShowPremiumModal(false);
        setShowEmailForm(false);
        setEmail("");
        setIsSubmitting(false);
        // Автоматически открываем премиум-билдер после разблокировки
        setShowPremiumBuilder(true);
        
        // Показываем уведомление о разблокировке
        setTimeout(() => {
          setShowUnlockNotification(true);
        }, 100);
        
        // Скроллим к премиум-билдеру после того, как он отрендерится
        setTimeout(() => {
          if (premiumBuilderRef.current) {
            premiumBuilderRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 800);
        
        // Автоматически скрываем уведомление через 5 секунд
        setTimeout(() => {
          setShowUnlockNotification(false);
        }, 5500);
      }, 500);
    } catch (error) {
      console.error("Failed to submit email:", error);
      setEmailError("Произошла ошибка. Попробуйте еще раз.");
      setIsSubmitting(false);
    }
  };

  const handleMaybeLater = () => {
    setShowPremiumModal(false);
    setShowEmailForm(false);
    // Показываем модальное окно с Telegram подпиской
    setTimeout(() => {
      setShowTelegramModal(true);
    }, 300);
  };

  const handleCloseTelegramModal = () => {
    setShowTelegramModal(false);
  };

  const handleTelegramSubscribe = () => {
    // TODO: Вставить ссылку на Telegram канал
    const telegramChannelUrl = "https://t.me/your_channel"; // Заменить позже
    window.open(telegramChannelUrl, "_blank");
    setShowTelegramModal(false);
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              QR Code Generator
            </h1>
            <p className="text-lg text-muted-foreground">
              Создайте QR-код для URL, контактов, социальных сетей и текста
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Controls */}
            <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
              {isPremium && (
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="size-4" />
                    <span>Премиум функции разблокированы</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPremiumBuilder(!showPremiumBuilder)}
                  >
                    <Settings className="mr-2 size-4" />
                    {showPremiumBuilder ? "Скрыть" : "Премиум настройки"}
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="qr-type">Тип QR-кода</Label>
                <Select value={qrType} onValueChange={(value) => setQrType(value as QRType)}>
                  <SelectTrigger id="qr-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QR_TYPES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-input">
                  {currentConfig.label === "Plain Text"
                    ? "Текст"
                    : currentConfig.label === "URL"
                      ? "URL адрес"
                      : currentConfig.label}
                </Label>
                <Input
                  id="qr-input"
                  type="text"
                  placeholder={currentConfig.placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* QR Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col items-center justify-center space-y-6 rounded-lg border bg-card p-8 shadow-sm"
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-16">
                  <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Генерация QR-кода...</p>
                </div>
              ) : qrDataUrl ? (
                <>
                  <div className="relative rounded-lg border-2 border-border bg-white p-4 shadow-lg">
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="size-64 sm:size-80"
                      width={512}
                      height={512}
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="gap-2"
                  >
                    <Download className="size-4" />
                    Скачать QR-код
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
                  <div className="rounded-lg border-2 border-dashed border-muted bg-muted/30 p-8">
                    <QrCode className="mx-auto size-16 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Введите данные выше, чтобы сгенерировать QR-код
                  </p>
                </div>
              )}
            </motion.div>

            {/* Unlock Notification */}
            <AnimatePresence>
              {showUnlockNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-lg border border-primary/20 bg-primary/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Sparkles className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">
                        Премиум функции разблокированы!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Теперь вы можете создавать красивые QR-коды с настройкой стилей, цветов и логотипов
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUnlockNotification(false)}
                      className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Builder */}
            {isPremium && showPremiumBuilder && (
              <motion.div
                ref={premiumBuilderRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <PremiumQRBuilder
                    qrText={inputValue ? currentConfig.format(inputValue.trim()) : ""}
                    isPremium={isPremium}
                    onDynamicQRCreated={(code, token, url) => {
                      setManagementUrl(url);
                    }}
                  />
                </div>

                {/* Management Link */}
                {managementUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-primary/20 bg-primary/5 p-6"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="size-5 text-primary" />
                      <h3 className="font-semibold text-primary">
                        Динамический QR-код создан!
                      </h3>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Сохраните эту ссылку для управления QR-кодом: изменения ссылки, просмотра статистики и скачивания в разных форматах.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={managementUrl}
                        readOnly
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(managementUrl);
                        }}
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => window.open(managementUrl, "_blank")}
                      >
                        Открыть
                      </Button>
                    </div>
                    <p className="mt-3 text-xs font-medium text-primary">
                      💾 Совет: Добавьте эту страницу в закладки для быстрого доступа
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={handleClosePremiumModal}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed left-1/2 top-1/2 z-[100] w-full max-w-md -translate-x-1/2 -translate-y-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mx-4 rounded-lg border bg-card p-6 shadow-lg">
                {/* Close button */}
                <button
                  onClick={handleClosePremiumModal}
                  className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <X className="size-4" />
                  <span className="sr-only">Закрыть</span>
                </button>

                {/* Content */}
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Sparkles className="size-6 text-primary" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Улучшите свой QR-код
                    </h2>
                  </div>

                  {/* Description */}
                  <div className="space-y-3 text-center text-sm text-muted-foreground">
                    <p>
                      Откройте премиум-функции для ваших QR-кодов:
                    </p>
                    <ul className="space-y-2 text-left">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 text-primary">•</span>
                        <span>Высокое разрешение изображения</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 text-primary">•</span>
                        <span>Кастомные цвета и стилизация</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 text-primary">•</span>
                        <span>Добавление логотипа в QR-код</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 text-primary">•</span>
                        <span>Статистика сканирований и аналитика</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 text-primary">•</span>
                        <span>Изменение ссылки в готовом QR-коде</span>
                      </li>
                    </ul>
                  </div>

                  {/* Email Form or Buttons */}
                  <AnimatePresence mode="wait">
                    {showEmailForm ? (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        onSubmit={handleEmailSubmit}
                        className="space-y-4 overflow-hidden"
                      >
                        {/* Информационный текст */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground"
                        >
                          <p className="mb-2 font-medium text-foreground">
                            Для доступа к премиум функциям нужен только ваш email
                          </p>
                          <p>
                            Мы не будем спамить и отправлять рекламу. Только важные обновления и полезные материалы.
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="premium-email">Ваш email</Label>
                          <Input
                            id="premium-email"
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setEmailError("");
                            }}
                            className={cn(emailError && "border-destructive")}
                            disabled={isSubmitting}
                            autoFocus
                          />
                          {emailError && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >
                              {emailError}
                            </motion.p>
                          )}
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-col gap-3"
                        >
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Обработка...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 size-4" />
                                Получить премиум QR бесплатно
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleMaybeLater}
                            variant="outline"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            Может быть позже
                          </Button>
                        </motion.div>
                      </motion.form>
                    ) : (
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleGetPremium}
                        size="lg"
                        className="w-full"
                      >
                        Получить премиум QR бесплатно
                      </Button>
                      <Button
                        onClick={handleMaybeLater}
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        Может быть позже
                      </Button>
                    </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Telegram Subscription Modal */}
      <AnimatePresence>
        {showTelegramModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={handleCloseTelegramModal}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed left-1/2 top-1/2 z-[100] w-full max-w-md -translate-x-1/2 -translate-y-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mx-4 rounded-lg border bg-card p-6 shadow-lg">
                {/* Close button */}
                <button
                  onClick={handleCloseTelegramModal}
                  className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <X className="size-4" />
                  <span className="sr-only">Закрыть</span>
                </button>

                {/* Content */}
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <MessageCircle className="size-6 text-primary" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Подпишитесь на наш Telegram канал
                    </h2>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                      Мы создаем умный виджет для сайта, который повышает конверсию и помогает бизнесу расти.
                    </p>
                    <div className="space-y-3">
                      <p className="text-center text-sm font-medium text-foreground">
                        В нашем Telegram канале вы найдете:
                      </p>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0 text-primary">•</span>
                          <span className="text-sm text-muted-foreground">Бесплатные советы по повышению конверсии</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0 text-primary">•</span>
                          <span className="text-sm text-muted-foreground">Кейсы и примеры успешных внедрений</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0 text-primary">•</span>
                          <span className="text-sm text-muted-foreground">Полезные материалы для онлайн и оффлайн бизнеса</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0 text-primary">•</span>
                          <span className="text-sm text-muted-foreground">Эксклюзивные обновления и новости</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleTelegramSubscribe}
                      size="lg"
                      className="w-full"
                    >
                      <MessageCircle className="mr-2 size-4" />
                      Подписаться на канал
                    </Button>
                    <Button
                      onClick={handleCloseTelegramModal}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Может быть позже
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

