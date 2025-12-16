export type QRStyle = "classic" | "rounded" | "modern" | "bold" | "gradient";

export type ModuleShape = "square" | "rounded" | "dot";
export type CornerShape = "square" | "rounded" | "circle";

export type GradientType = "linear" | "radial" | "none";

export type QRPreset = "business" | "restaurant" | "social" | "event";

export type ScanSafety = "high" | "medium" | "low";

export interface QRGradient {
  type: GradientType;
  colors: string[];
  angle?: number; // For linear gradients (0-360)
  centerX?: number; // For radial gradients (0-1)
  centerY?: number; // For radial gradients (0-1)
}

export interface QRLogo {
  image: string; // Data URL
  size: number; // Percentage (0-30)
  crop: "circle" | "square";
  hasBackground: boolean;
  backgroundColor: string;
}

export interface QRPremiumConfig {
  style: QRStyle;
  foregroundColor: string;
  backgroundColor: string;
  gradient: QRGradient;
  moduleShape: ModuleShape;
  cornerShape: CornerShape;
  hasShadow: boolean;
  hasOutline: boolean;
  outlineColor: string;
  logo: QRLogo | null;
}

export const DEFAULT_PREMIUM_CONFIG: QRPremiumConfig = {
  style: "classic",
  foregroundColor: "#000000",
  backgroundColor: "#FFFFFF",
  gradient: {
    type: "none",
    colors: ["#000000", "#000000"],
  },
  moduleShape: "square",
  cornerShape: "square",
  hasShadow: false,
  hasOutline: false,
  outlineColor: "#000000",
  logo: null,
};

export const PRESET_CONFIGS: Record<QRPreset, QRPremiumConfig> = {
  business: {
    style: "rounded",
    foregroundColor: "#1a1a1a",
    backgroundColor: "#FFFFFF",
    gradient: {
      type: "none",
      colors: ["#1a1a1a", "#1a1a1a"],
    },
    moduleShape: "rounded",
    cornerShape: "rounded",
    hasShadow: true,
    hasOutline: false,
    outlineColor: "#1a1a1a",
    logo: null,
  },
  restaurant: {
    style: "modern",
    foregroundColor: "#d97706",
    backgroundColor: "#FFFFFF",
    gradient: {
      type: "linear",
      colors: ["#d97706", "#f59e0b"],
      angle: 135,
    },
    moduleShape: "dot",
    cornerShape: "rounded",
    hasShadow: false,
    hasOutline: true,
    outlineColor: "#d97706",
    logo: null,
  },
  social: {
    style: "gradient",
    foregroundColor: "#6366f1",
    backgroundColor: "#FFFFFF",
    gradient: {
      type: "linear",
      colors: ["#6366f1", "#8b5cf6", "#ec4899"],
      angle: 45,
    },
    moduleShape: "rounded",
    cornerShape: "circle",
    hasShadow: true,
    hasOutline: false,
    outlineColor: "#6366f1",
    logo: null,
  },
  event: {
    style: "bold",
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    gradient: {
      type: "none",
      colors: ["#000000", "#000000"],
    },
    moduleShape: "square",
    cornerShape: "square",
    hasShadow: false,
    hasOutline: true,
    outlineColor: "#dc2626",
    logo: null,
  },
};

export interface StylePreview {
  name: string;
  description: string;
  preview: string; // CSS or description
}

export const STYLE_PREVIEWS: Record<QRStyle, StylePreview> = {
  classic: {
    name: "Классический",
    description: "Квадратные модули, черно-белый",
  },
  rounded: {
    name: "Скругленный",
    description: "Скругленные модули",
  },
  modern: {
    name: "Современный",
    description: "Точечный стиль модулей",
  },
  bold: {
    name: "Жирный",
    description: "Толстые модули, высокий контраст",
  },
  gradient: {
    name: "Градиент",
    description: "Цветовые градиенты",
  },
};

// Calculate scan safety based on config
export function calculateScanSafety(
  config: QRPremiumConfig,
  qrSize: number
): ScanSafety {
  let score = 100;

  // Check contrast
  const contrast = getContrastRatio(
    config.foregroundColor,
    config.backgroundColor
  );
  if (contrast < 4.5) score -= 30;
  else if (contrast < 7) score -= 15;

  // Check logo size
  if (config.logo) {
    const logoSizePercent = config.logo.size;
    if (logoSizePercent > 25) score -= 25;
    else if (logoSizePercent > 20) score -= 15;
    else if (logoSizePercent > 15) score -= 5;
  }

  // Check module shape (dots are less reliable)
  if (config.moduleShape === "dot") score -= 10;

  // Check gradient (can reduce readability)
  if (config.gradient.type !== "none") score -= 5;

  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Calculate relative luminance of a color
function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928
      ? val / 12.92
      : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

