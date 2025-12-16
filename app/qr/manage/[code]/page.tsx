"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Download,
  Link as LinkIcon,
  BarChart3,
  Bookmark,
  Info,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getQRCodeByToken,
  saveQRCode,
  getScanStats,
  type QRCodeRecord,
} from "@/lib/qrDatabase";

export default function QRManagePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const token = searchParams.get("token");

  const [qrCode, setQrCode] = useState<QRCodeRecord | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    last30Days: 0,
    daily: [] as { date: string; count: number }[],
  });

  useEffect(() => {
    if (!code || !token) return;

    const record = getQRCodeByToken(code, token);
    if (record) {
      setQrCode(record);
      setTargetUrl(record.targetUrl);
      const scanStats = getScanStats(code);
      setStats(scanStats);
    }
  }, [code, token]);

  const handleSaveUrl = () => {
    if (!qrCode || !targetUrl.trim()) return;

    setIsSaving(true);
    const updated = {
      ...qrCode,
      targetUrl: targetUrl.trim(),
    };
    saveQRCode(updated);
    setQrCode(updated);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDownload = async (format: "svg" | "png", size?: number) => {
    if (!qrCode?.qrDataUrl) return;

    if (format === "png") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx || !qrCode.qrDataUrl) return;

      const exportSize = size || 2048;
      canvas.width = exportSize;
      canvas.height = exportSize;

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = qrCode.qrDataUrl!;
      });

      ctx.drawImage(img, 0, 0, exportSize, exportSize);

      const link = document.createElement("a");
      link.download = `qr-${code}-${exportSize}x${exportSize}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } else {
      // SVG export
      const link = document.createElement("a");
      link.download = `qr-${code}.svg`;
      link.href = qrCode.qrDataUrl.replace("image/png", "image/svg+xml");
      link.click();
    }
  };

  const copyManagementLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!qrCode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">QR-код не найден</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверьте правильность ссылки
          </p>
        </div>
      </div>
    );
  }

  const managementUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/qr/manage/${code}?token=${token}`
    : "";
  const redirectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/r/${code}`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              Управление QR-кодом
            </h1>
            <p className="text-muted-foreground">
              Изменяйте ссылку и отслеживайте статистику сканирований
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: QR Preview and Download */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 text-lg font-semibold">QR-код</h2>
                {qrCode.qrDataUrl ? (
                  <div className="mb-4 flex justify-center rounded-lg border bg-white p-4">
                    <img
                      src={qrCode.qrDataUrl}
                      alt="QR Code"
                      className="max-w-full"
                      width={256}
                      height={256}
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-64 items-center justify-center rounded-lg border bg-muted">
                    <p className="text-sm text-muted-foreground">
                      Превью недоступно
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Скачать QR-код</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("svg")}
                      disabled={!qrCode.qrDataUrl}
                    >
                      <Download className="mr-2 size-4" />
                      SVG
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("png", 2048)}
                      disabled={!qrCode.qrDataUrl}
                    >
                      <Download className="mr-2 size-4" />
                      PNG 2048
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Management Link */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Bookmark className="size-4 text-primary" />
                  <h3 className="font-semibold">Ссылка для управления</h3>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Сохраните эту ссылку, чтобы управлять QR-кодом в будущем
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
                    onClick={copyManagementLink}
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Right: URL Editor and Stats */}
            <div className="space-y-6">
              {/* URL Editor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <LinkIcon className="size-4 text-primary" />
                  <h2 className="text-lg font-semibold">Целевая ссылка</h2>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="target-url">URL адрес</Label>
                    <Input
                      id="target-url"
                      type="url"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <Button
                    onClick={handleSaveUrl}
                    disabled={isSaving || !targetUrl.trim()}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Сохранение...
                      </>
                    ) : isSaved ? (
                      <>
                        <Check className="mr-2 size-4" />
                        Сохранено!
                      </>
                    ) : (
                      "Сохранить изменения"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    ⚡ Изменения применяются мгновенно. QR-код перегенерировать не нужно!
                  </p>
                </div>
              </motion.div>

              {/* Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  <h2 className="text-lg font-semibold">Статистика</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">
                      Всего сканирований
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.today}</div>
                    <div className="text-xs text-muted-foreground">Сегодня</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.last30Days}</div>
                    <div className="text-xs text-muted-foreground">
                      За 30 дней
                    </div>
                  </div>
                </div>

                {/* Simple Chart */}
                {stats.daily.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-medium">
                      Сканирования по дням (последние 30 дней)
                    </h3>
                    <div className="flex h-32 items-end gap-1">
                      {stats.daily.map((day, index) => {
                        const maxCount = Math.max(
                          ...stats.daily.map((d) => d.count),
                          1
                        );
                        const height = (day.count / maxCount) * 100;
                        return (
                          <div
                            key={index}
                            className="flex-1 rounded-t bg-primary"
                            style={{ height: `${height}%` }}
                            title={`${day.date}: ${day.count}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-4 rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Info className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Как это работает</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">
                  Как изменить ссылку в QR-коде
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">1.</span>
                    <span>
                      Введите новую ссылку в поле "Целевая ссылка" выше
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">2.</span>
                    <span>Нажмите "Сохранить изменения"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">3.</span>
                    <span>
                      Готово! Все сканирования теперь ведут на новую ссылку
                    </span>
                  </li>
                </ol>
                <p className="mt-3 text-xs font-medium text-foreground">
                  💡 Важно: QR-код перегенерировать не нужно! Изображение
                  остается тем же, меняется только ссылка.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">
                  Как просмотреть статистику сканирований
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">1.</span>
                    <span>
                      Статистика обновляется автоматически при каждом сканировании
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">2.</span>
                    <span>
                      Просматривайте общее количество, сканирования за сегодня и
                      за последние 30 дней
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">3.</span>
                    <span>
                      График показывает динамику сканирований по дням
                    </span>
                  </li>
                </ol>
                <p className="mt-3 text-xs font-medium text-foreground">
                  📊 Данные обновляются в реальном времени
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-primary/10 p-4">
              <p className="text-sm font-medium text-primary">
                💾 Совет: Сохраните ссылку для управления в закладках, чтобы
                быстро находить эту страницу в будущем
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

