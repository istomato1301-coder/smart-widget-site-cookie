import QRCode from "qrcode";
import type {
  QRPremiumConfig,
  QRGradient,
  QRLogo,
  ModuleShape,
  CornerShape,
} from "./qrPremiumConfig";

export async function generatePremiumQR(
  text: string,
  config: QRPremiumConfig,
  size: number = 512
): Promise<string> {
  // Generate base QR code data
  const qrData = await QRCode.create(text, {
    errorCorrectionLevel: config.logo ? "H" : "M",
  });

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const moduleCount = qrData.modules.size;
  const moduleSize = size / (moduleCount + 4); // +4 for margin
  const margin = moduleSize * 2;

  // Draw background
  drawBackground(ctx, config, size);

  // Draw QR modules
  drawQRModules(ctx, qrData, config, moduleSize, margin, size);

  // Draw logo if present
  if (config.logo) {
    await drawLogo(ctx, config.logo, size, margin, moduleSize, moduleCount);
  }

  return canvas.toDataURL("image/png");
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  config: QRPremiumConfig,
  size: number
) {
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // Draw gradient if enabled
  if (config.gradient.type !== "none") {
    const gradient = createGradient(ctx, config.gradient, size);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
}

function createGradient(
  ctx: CanvasRenderingContext2D,
  gradient: QRGradient,
  size: number
): CanvasGradient {
  if (gradient.type === "linear") {
    const angle = (gradient.angle || 0) * (Math.PI / 180);
    const x1 = size / 2 - (size / 2) * Math.cos(angle);
    const y1 = size / 2 - (size / 2) * Math.sin(angle);
    const x2 = size / 2 + (size / 2) * Math.cos(angle);
    const y2 = size / 2 + (size / 2) * Math.sin(angle);

    const linearGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    const step = 1 / (gradient.colors.length - 1);
    gradient.colors.forEach((color, i) => {
      linearGradient.addColorStop(i * step, color);
    });
    return linearGradient;
  } else if (gradient.type === "radial") {
    const centerX = (gradient.centerX || 0.5) * size;
    const centerY = (gradient.centerY || 0.5) * size;
    const radius = Math.sqrt(size * size + size * size) / 2;

    const radialGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );
    const step = 1 / (gradient.colors.length - 1);
    gradient.colors.forEach((color, i) => {
      radialGradient.addColorStop(i * step, color);
    });
    return radialGradient;
  }

  // Fallback
  const linearGradient = ctx.createLinearGradient(0, 0, size, size);
  linearGradient.addColorStop(0, gradient.colors[0]);
  linearGradient.addColorStop(1, gradient.colors[1] || gradient.colors[0]);
  return linearGradient;
}

function drawQRModules(
  ctx: CanvasRenderingContext2D,
  qrData: any,
  config: QRPremiumConfig,
  moduleSize: number,
  margin: number,
  size: number
) {
  const modules = qrData.modules.data;
  const moduleCount = qrData.modules.size;

  // Determine corner positions (3 corner squares)
  const cornerSize = 7; // Standard QR corner size
  const corners = [
    { x: 0, y: 0 }, // Top-left
    { x: moduleCount - cornerSize, y: 0 }, // Top-right
    { x: 0, y: moduleCount - cornerSize }, // Bottom-left
  ];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const index = row * moduleCount + col;
      if (modules[index]) {
        const x = margin + col * moduleSize;
        const y = margin + row * moduleSize;

        // Check if this is part of a corner
        const isCorner = corners.some(
          (corner) =>
            col >= corner.x &&
            col < corner.x + cornerSize &&
            row >= corner.y &&
            row < corner.y + cornerSize
        );

        if (isCorner) {
          drawCornerModule(ctx, x, y, moduleSize, config.cornerShape);
        } else {
          drawModule(ctx, x, y, moduleSize, config.moduleShape);
        }
      }
    }
  }

  // Draw outline if enabled
  if (config.hasOutline) {
    ctx.strokeStyle = config.outlineColor;
    ctx.lineWidth = moduleSize * 0.1;
    ctx.strokeRect(margin, margin, size - margin * 2, size - margin * 2);
  }

  // Draw shadow if enabled
  if (config.hasShadow) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = moduleSize * 2;
    ctx.shadowOffsetX = moduleSize * 0.5;
    ctx.shadowOffsetY = moduleSize * 0.5;
  }
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: ModuleShape
) {
  ctx.fillStyle = "#000000"; // Will be replaced by gradient/color

  if (shape === "square") {
    ctx.fillRect(x, y, size, size);
  } else if (shape === "rounded") {
    const radius = size * 0.2;
    roundRect(ctx, x, y, size, size, radius);
    ctx.fill();
  } else if (shape === "dot") {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCornerModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: CornerShape
) {
  ctx.fillStyle = "#000000";

  if (shape === "square") {
    ctx.fillRect(x, y, size, size);
  } else if (shape === "rounded") {
    const radius = size * 0.3;
    roundRect(ctx, x, y, size, size, radius);
    ctx.fill();
  } else if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: QRLogo,
  size: number,
  margin: number,
  moduleSize: number,
  moduleCount: number
) {
  const logoSize = (size * logo.size) / 100;
  const centerX = size / 2;
  const centerY = size / 2;

  // Draw background if enabled
  if (logo.hasBackground) {
    ctx.fillStyle = logo.backgroundColor;
    if (logo.crop === "circle") {
      ctx.beginPath();
      ctx.arc(centerX, centerY, logoSize / 2 + moduleSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(
        centerX - logoSize / 2 - moduleSize,
        centerY - logoSize / 2 - moduleSize,
        logoSize + moduleSize * 2,
        logoSize + moduleSize * 2
      );
    }
  }

  // Draw logo image
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
}

// Export as SVG
export async function generatePremiumQRSVG(
  text: string,
  config: QRPremiumConfig,
  size: number = 512
): Promise<string> {
  // For SVG, we'll generate a simplified version
  // Full SVG implementation would be more complex
  const qrData = await QRCode.create(text, {
    errorCorrectionLevel: config.logo ? "H" : "M",
  });

  const moduleCount = qrData.modules.size;
  const moduleSize = size / (moduleCount + 4);
  const margin = moduleSize * 2;

  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="${config.backgroundColor}"/>`;

  const modules = qrData.modules.data;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const index = row * moduleCount + col;
      if (modules[index]) {
        const x = margin + col * moduleSize;
        const y = margin + row * moduleSize;
        svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${config.foregroundColor}"/>`;
      }
    }
  }

  svg += `</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

