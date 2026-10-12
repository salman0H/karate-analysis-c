"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { Camera, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelfieCaptureProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export function SelfieCapture({ value, onChange }: SelfieCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const capture = useCallback(() => {
    const dataUrl = webcamRef.current?.getScreenshot();
    if (dataUrl) {
      onChange(dataUrl);
      setIsCameraOpen(false);
    }
  }, [onChange]);

  if (value) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-slate-200">
          <Image src={value} alt="سلفی ورزشکار" fill className="object-cover" unoptimized />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onChange(null);
            setIsCameraOpen(false);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          گرفتن مجدد عکس
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {isCameraOpen ? (
        <div className="flex flex-col items-center gap-3">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              onUserMediaError={() => setCameraError("دسترسی به دوربین ممکن نشد. دسترسی مرورگر را بررسی کنید.")}
            />
          </div>
          <Button type="button" onClick={capture}>
            <Camera className="h-4 w-4" />
            ثبت عکس
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setIsCameraOpen(true)}>
          <Camera className="h-4 w-4" />
          باز کردن دوربین برای عکس سلفی
        </Button>
      )}
      {cameraError ? <p className="text-xs text-red-600">{cameraError}</p> : null}
    </div>
  );
}
