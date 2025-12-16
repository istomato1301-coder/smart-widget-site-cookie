"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import {
  Download,
  Sparkles,
  Check,
  Upload,
  X,
  AlertCircle,
  Smartphone,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  QRPremiumConfig,
  QRStyle,
  QRPreset,
  ScanSafety,
  ModuleShape,
  CornerShape,
} from "@/lib/qrPremiumConfig";
import {
  DEFAULT_PREMIUM_CONFIG,
  PRESET_CONFIGS,
  STYLE_PREVIEWS,
  calculateScanSafety,
} from "@/lib/qrPremiumConfig";

interface PremiumQRBuilderProps {
  qrText: string;
  isPremium: boolean;
  onDynamicQRCreated?: (code: string, token: string, managementUrl: string) => void;
}

export function PremiumQRBuilder({ qrText, isPremium, onDynamicQRCreated }: PremiumQRBuilderProps) {
  const [config, setConfig] = useState<QRPremiumConfig>(DEFAULT_PREMIUM_CONFIG);
  const [previewMode, setPreviewMode] = useState<"light" | "dark" | "mobile">("light");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scanSafety, setScanSafety] = useState<ScanSafety>("high");
  const [isDynamic, setIsDynamic] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code when config or text changes
  useEffect(() => {
    if (!qrText.trim() || !isPremium) {
      setQrDataUrl(null);
      return;
    }

    // Check if we should create dynamic QR
    if (isDynamic && qrCode) {
      generateDynamicQR();
    } else {
      generatePremiumQR();
    }
  }, [config, qrText, isPremium, isDynamic, qrCode]);

  // Calculate scan safety
  useEffect(() => {
    if (qrDataUrl) {
      const safety = calculateScanSafety(config, 512);
      setScanSafety(safety);
    }
  }, [config, qrDataUrl]);

  const createDynamicQR = async () => {
    if (!qrText.trim()) return;

    setIsGenerating(true);
    try {
      const { generateQRCode, generateToken, saveQRCode } = await import("@/lib/qrDatabase");
      const code = generateQRCode();
      const newToken = generateToken();
      const redirectUrl = `${window.location.origin}/r/${code}`;

      // Generate QR code with styles using styled renderer
      const { generateStyledQR } = await import("@/lib/qrStyleRenderer");
      const finalDataUrl = await generateStyledQR(redirectUrl, config, 512);

      // Save QR code record
      const email = localStorage.getItem("qr-generator-premium-unlocked-email") || "unknown";
      saveQRCode({
        code,
        targetUrl: qrText.trim(),
        token: newToken,
        createdAt: Date.now(),
        createdBy: email,
        qrDataUrl: finalDataUrl,
        totalScans: 0,
      });

      setQrCode(code);
      setToken(newToken);
      setIsDynamic(true);
      setQrDataUrl(finalDataUrl);

      // Notify parent component
      const managementUrl = `${window.location.origin}/qr/manage/${code}?token=${newToken}`;
      onDynamicQRCreated?.(code, newToken, managementUrl);
    } catch (error) {
      console.error("Failed to create dynamic QR:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDynamicQR = async () => {
    if (!qrCode || !qrText.trim()) return;

    setIsGenerating(true);
    try {
      const redirectUrl = `${window.location.origin}/r/${qrCode}`;
      // Use styled QR renderer for proper style support
      const { generateStyledQR } = await import("@/lib/qrStyleRenderer");
      const dataUrl = await generateStyledQR(redirectUrl, config, 512);
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate dynamic QR:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePremiumQR = async () => {
    setIsGenerating(true);
    try {
      // Use styled QR renderer for proper style support
      const { generateStyledQR } = await import("@/lib/qrStyleRenderer");
      const dataUrl = await generateStyledQR(qrText, config, 512);
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate premium QR:", error);
      setQrDataUrl(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyLogo = async (
    ctx: CanvasRenderingContext2D,
    logo: typeof config.logo,
    size: number
  ) => {
    if (!logo) return;

    const logoSize = (size * logo.size) / 100;
    const centerX = size / 2;
    const centerY = size / 2;

    // Draw background if enabled
    if (logo.hasBackground) {
      ctx.fillStyle = logo.backgroundColor;
      if (logo.crop === "circle") {
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 20, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(
          centerX - logoSize / 2 - 20,
          centerY - logoSize / 2 - 20,
          logoSize + 40,
          logoSize + 40
        );
      }
    }

    // Draw logo
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = logo.image;
    });

    ctx.save();

    if (logo.crop === "circle") {
      ctx.beginPath();
      ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(
        centerX - logoSize / 2,
        centerY - logoSize / 2,
        logoSize,
        logoSize
      );
      ctx.clip();
    }

    ctx.drawImage(
      img,
      centerX - logoSize / 2,
      centerY - logoSize / 2,
      logoSize,
      logoSize
    );

    ctx.restore();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setConfig({
        ...config,
        logo: {
          image: imageUrl,
          size: config.logo?.size || 15,
          crop: config.logo?.crop || "circle",
          hasBackground: config.logo?.hasBackground || false,
          backgroundColor: config.logo?.backgroundColor || "#FFFFFF",
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async (format: "png" | "svg", size?: number) => {
    if (!qrDataUrl) return;

    if (format === "png") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const exportSize = size || 1024;
      canvas.width = exportSize;
      canvas.height = exportSize;

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = qrDataUrl;
      });

      ctx.drawImage(img, 0, 0, exportSize, exportSize);

      const link = document.createElement("a");
      link.download = `premium-qr-${exportSize}x${exportSize}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } else {
      // SVG export (simplified)
      const link = document.createElement("a");
      link.download = "premium-qr.svg";
      link.href = qrDataUrl.replace("image/png", "image/svg+xml");
      link.click();
    }
  };

  const applyPreset = (preset: QRPreset) => {
    setConfig(PRESET_CONFIGS[preset]);
  };

  const getSafetyColor = (safety: ScanSafety) => {
    switch (safety) {
      case "high":
        return "text-green-600 dark:text-green-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-red-600 dark:text-red-400";
    }
  };

  if (!isPremium) {
    return (
      <div className="rounded-lg border border-dashed border-muted bg-muted/30 p-8 text-center">
        <Sparkles className="mx-auto mb-4 size-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Премиум функции доступны после регистрации
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary">
          <Sparkles className="size-4" />
          <span className="font-medium">Премиум QR</span>
        </div>
        <div className={cn("flex items-center gap-2 text-sm font-medium", getSafetyColor(scanSafety))}>
          <AlertCircle className="size-4" />
          <span>
            {scanSafety === "high" && "Высокая читаемость"}
            {scanSafety === "medium" && "Средняя читаемость"}
            {scanSafety === "low" && "Низкая читаемость"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Presets */}
          <div className="space-y-3">
            <Label>Шаблоны</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRESET_CONFIGS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(key as QRPreset)}
                  className="h-auto flex-col gap-1 py-2"
                >
                  <span className="text-xs font-medium capitalize">{key}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Styles */}
          <div className="space-y-3">
            <Label>Стиль QR-кода</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STYLE_PREVIEWS).map(([key, style]) => {
                // Map style to module shape
                const getModuleShape = (styleKey: string): ModuleShape => {
                  switch (styleKey) {
                    case "rounded":
                      return "rounded";
                    case "modern":
                      return "dot";
                    case "bold":
                      return "square";
                    default:
                      return "square";
                  }
                };

                const getCornerShape = (styleKey: string): CornerShape => {
                  switch (styleKey) {
                    case "rounded":
                      return "rounded";
                    case "modern":
                      return "rounded";
                    default:
                      return "square";
                  }
                };

                return (
                  <button
                    key={key}
                    onClick={() => {
                      const moduleShape = getModuleShape(key);
                      const cornerShape = getCornerShape(key);
                      setConfig({
                        ...config,
                        style: key as QRStyle,
                        moduleShape,
                        cornerShape,
                      });
                    }}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      config.style === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="text-sm font-medium">{style.name}</div>
                    <div className="text-xs text-muted-foreground">{style.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <ColorPicker
              label="Цвет переднего плана"
              value={config.foregroundColor}
              onChange={(color) => setConfig({ ...config, foregroundColor: color })}
            />
            <ColorPicker
              label="Цвет фона"
              value={config.backgroundColor}
              onChange={(color) => setConfig({ ...config, backgroundColor: color })}
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-3">
            <Label>Логотип (опционально)</Label>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              {config.logo && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Размер логотипа: {config.logo.size}%</Label>
                    <Slider
                      value={config.logo.size}
                      onValueChange={(size) =>
                        setConfig({
                          ...config,
                          logo: config.logo ? { ...config.logo, size } : null,
                        })
                      }
                      min={5}
                      max={30}
                      step={1}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="logo-background"
                      checked={config.logo.hasBackground}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          logo: config.logo
                            ? { ...config.logo, hasBackground: e.target.checked }
                            : null,
                        })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="logo-background" className="text-sm">
                      Белый фон за логотипом
                    </Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfig({ ...config, logo: null })}
                  >
                    <X className="mr-2 size-4" />
                    Удалить логотип
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          {/* Preview Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={previewMode === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("light")}
            >
              <Sun className="size-4" />
            </Button>
            <Button
              variant={previewMode === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("dark")}
            >
              <Moon className="size-4" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="size-4" />
            </Button>
          </div>

          {/* QR Preview */}
          <div
            className={cn(
              "flex items-center justify-center rounded-lg border p-8",
              previewMode === "dark" && "bg-gray-900",
              previewMode === "light" && "bg-white",
              previewMode === "mobile" && "bg-gray-100"
            )}
          >
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Генерация...</p>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Premium QR Code"
                className="max-w-full"
                width={512}
                height={512}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Введите данные для генерации</p>
            )}
          </div>

          {/* Dynamic QR Toggle */}
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Динамический QR-код</Label>
                <p className="text-xs text-muted-foreground">
                  Создайте QR-код с отслеживанием сканирований
                </p>
              </div>
              <Button
                variant={isDynamic ? "default" : "outline"}
                size="sm"
                onClick={createDynamicQR}
                disabled={!qrText.trim() || isGenerating}
              >
                {isDynamic ? "✓ Создан" : "Создать"}
              </Button>
            </div>
            <div className="space-y-2 rounded-lg bg-background p-3 text-xs">
              <p className="font-medium text-foreground">Что это дает:</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>Отслеживание всех сканирований в реальном времени</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>Изменение целевой ссылки без перегенерации QR-кода</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>Статистика: общее количество, за день, за месяц</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>График сканирований по дням</span>
                </li>
              </ul>
              {isDynamic && (
                <p className="mt-2 rounded bg-primary/10 p-2 text-xs font-medium text-primary">
                  💡 После создания вы получите ссылку для управления QR-кодом
                </p>
              )}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-2">
            <Label>Экспорт</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("png", 1024)}
                disabled={!qrDataUrl}
              >
                PNG 1024
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("png", 2048)}
                disabled={!qrDataUrl}
              >
                PNG 2048
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("png", 4096)}
                disabled={!qrDataUrl}
              >
                PNG 4096
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("svg")}
                disabled={!qrDataUrl}
              >
                SVG
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

