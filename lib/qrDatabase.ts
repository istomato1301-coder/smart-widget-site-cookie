// Database structure for QR codes and scans
// Currently uses localStorage, but structured for easy migration to real database

export interface QRCodeRecord {
  code: string;
  targetUrl: string;
  token: string;
  createdAt: number;
  createdBy: string; // email
  qrDataUrl?: string; // For preview
  totalScans: number;
}

export interface QRScan {
  code: string;
  timestamp: number;
  date: string; // YYYY-MM-DD format for easy grouping
}

const QR_CODES_KEY = "qr-codes-database";
const QR_SCANS_KEY = "qr-scans-database";

// Generate unique code
export function generateQRCode(): string {
  return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate secure token
export function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

// Save QR code record
export function saveQRCode(record: QRCodeRecord): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = localStorage.getItem(QR_CODES_KEY);
    const codes: QRCodeRecord[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = codes.findIndex((c) => c.code === record.code);
    if (existingIndex >= 0) {
      codes[existingIndex] = record;
    } else {
      codes.push(record);
    }

    localStorage.setItem(QR_CODES_KEY, JSON.stringify(codes));
  } catch (error) {
    console.error("Failed to save QR code:", error);
  }
}

// Get QR code by code
export function getQRCode(code: string): QRCodeRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(QR_CODES_KEY);
    const codes: QRCodeRecord[] = stored ? JSON.parse(stored) : [];
    return codes.find((c) => c.code === code) || null;
  } catch (error) {
    console.error("Failed to get QR code:", error);
    return null;
  }
}

// Get QR code by token
export function getQRCodeByToken(code: string, token: string): QRCodeRecord | null {
  const record = getQRCode(code);
  if (record && record.token === token) {
    return record;
  }
  return null;
}

// Record a scan
export function recordScan(code: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const now = Date.now();
    const date = new Date(now).toISOString().split("T")[0]; // YYYY-MM-DD

    // Save scan record
    const stored = localStorage.getItem(QR_SCANS_KEY);
    const scans: QRScan[] = stored ? JSON.parse(stored) : [];
    scans.push({ code, timestamp: now, date });

    // Keep only last 10000 scans to avoid storage issues
    if (scans.length > 10000) {
      scans.splice(0, scans.length - 10000);
    }

    localStorage.setItem(QR_SCANS_KEY, JSON.stringify(scans));

    // Update total scans in QR code record
    const qrCode = getQRCode(code);
    if (qrCode) {
      qrCode.totalScans = (qrCode.totalScans || 0) + 1;
      saveQRCode(qrCode);
    }
  } catch (error) {
    console.error("Failed to record scan:", error);
  }
}

// Get scans for a QR code
export function getScans(code: string): QRScan[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(QR_SCANS_KEY);
    const scans: QRScan[] = stored ? JSON.parse(stored) : [];
    return scans.filter((s) => s.code === code);
  } catch (error) {
    console.error("Failed to get scans:", error);
    return [];
  }
}

// Get scan statistics
export function getScanStats(code: string): {
  total: number;
  today: number;
  last30Days: number;
  daily: { date: string; count: number }[];
} {
  const scans = getScans(code);
  const now = Date.now();
  const today = new Date(now).toISOString().split("T")[0];
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const todayScans = scans.filter((s) => s.date === today);
  const last30DaysScans = scans.filter((s) => s.timestamp >= thirtyDaysAgo);

  // Group by date for daily stats
  const dailyMap = new Map<string, number>();
  last30DaysScans.forEach((scan) => {
    const count = dailyMap.get(scan.date) || 0;
    dailyMap.set(scan.date, count + 1);
  });

  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    total: scans.length,
    today: todayScans.length,
    last30Days: last30DaysScans.length,
    daily,
  };
}

// Get all QR codes for a user (by email)
export function getUserQRCodes(email: string): QRCodeRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(QR_CODES_KEY);
    const codes: QRCodeRecord[] = stored ? JSON.parse(stored) : [];
    return codes.filter((c) => c.createdBy === email);
  } catch (error) {
    console.error("Failed to get user QR codes:", error);
    return [];
  }
}

