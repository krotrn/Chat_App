"use client"

import { useState, useRef } from "react"
import { Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

interface CameraCaptureProps {
  onCapture: (file: File) => void
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCapturedImage(null)
  }

  const handleOpen = async () => {
    setIsOpen(true)
    await startCamera()
  }

  const handleClose = () => {
    setIsOpen(false)
    stopCamera()
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
            onCapture(file)
            handleClose()
          }
        }, "image/jpeg")
      }
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleOpen}>
        <Camera className="h-5 w-5" />
        <span className="sr-only">Open camera</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Camera Capture</SheetTitle>
          </SheetHeader>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={captureImage}>Capture</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

