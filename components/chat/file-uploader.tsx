"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: string
  multiple?: boolean
}

export default function FileUploader({
  onFileSelect,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = "*",
  multiple = true,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate file sizes and types
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`)
        return false
      }

      if (accept !== "*" && !file.type.match(accept)) {
        toast.error(`${file.name} has an invalid file type`)
        return false
      }

      return true
    })

    validFiles.forEach((file) => {
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 0,
      }))

      // Simulate upload progress
      simulateUpload(file.name)
    })

    setSelectedFiles((prev) => [...prev, ...validFiles])
    onFileSelect(validFiles)
  }

  const simulateUpload = (fileName: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress((prev) => ({
        ...prev,
        [fileName]: progress,
      }))

      if (progress >= 100) {
        clearInterval(interval)
      }
    }, 200)
  }

  const removeFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName))
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-4 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => fileInputRef.current?.click()}
            >
              Click to upload
            </button>
            {" or drag and drop"}
          </div>
          <p className="text-xs text-muted-foreground">
            {accept === "*" ? "Any file type" : accept.replace(/,/g, ", ")} up to {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {selectedFiles.map((file) => (
              <div key={file.name} className="relative rounded-md border p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)}KB</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.name)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Progress value={uploadProgress[file.name]} className="mt-2 h-1" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

