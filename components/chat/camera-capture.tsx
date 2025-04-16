"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export default function CameraCapture({ onCapture, disabled = false }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            onCapture(file);
            setIsOpen(false);
          }
        }, "image/jpeg");
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={disabled}>
          <Camera className="h-5 w-5" />
          <span className="sr-only">Take photo</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Take a Photo</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4">
          <div className="relative rounded overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <Button onClick={capturePhoto}>Capture</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
