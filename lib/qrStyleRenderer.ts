import QRCode from "qrcode";
import type { QRPremiumConfig, ModuleShape, CornerShape } from "./qrPremiumConfig";

export async function generateStyledQR(
  text: string,
  config: QRPremiumConfig,
  size: number = 512
): Promise<string> {
  // Generate QR code data
  const qrData = await QRCode.create(text, {
    errorCorrectionLevel: config.logo ? "H" : "M",
    margin: 2,
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
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // Draw QR modules
  const modules = qrData.modules.data;
  const cornerSize = 7; // Standard QR corner size
  const corners = [
    { x: 0, y: 0 },
    { x: moduleCount - cornerSize, y: 0 },
    { x: 0, y: moduleCount - cornerSize },
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

        ctx.fillStyle = config.foregroundColor;

        if (isCorner) {
          drawCornerModule(ctx, x, y, moduleSize, config.cornerShape);
        } else {
          drawModule(ctx, x, y, moduleSize, config.moduleShape);
        }
      }
    }
  }

  // Apply logo if present
  if (config.logo) {
    await drawLogo(ctx, config.logo, size, margin, moduleSize, moduleCount);
  }

  return canvas.toDataURL("image/png");
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: ModuleShape
) {
  if (shape === "square") {
    ctx.fillRect(x, y, size, size);
  } else if (shape === "rounded") {
    const radius = size * 0.25;
    roundRect(ctx, x, y, size, size, radius);
    ctx.fill();
  } else if (shape === "dot") {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.35, 0, Math.PI * 2);
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
  logo: NonNullable<QRPremiumConfig["logo"]>,
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

