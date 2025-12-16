"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { recordScan, getQRCode } from "@/lib/qrDatabase";

export default function QRRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  useEffect(() => {
    if (!code) return;

    // Get QR code record
    const qrCode = getQRCode(code);
    
    if (!qrCode) {
      // QR code not found, redirect to home
      router.push("/");
      return;
    }

    // Record the scan
    recordScan(code);

    // Redirect to target URL
    window.location.href = qrCode.targetUrl;
  }, [code, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Перенаправление...</p>
      </div>
    </div>
  );
}

