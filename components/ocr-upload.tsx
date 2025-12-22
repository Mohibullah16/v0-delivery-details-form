"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"
import { extractDeliveryInfoFromImage } from "@/app/actions"

interface OCRUploadProps {
  onDataExtracted: (data: {
    name?: string
    phone?: string
    address?: string
    city?: string
  }) => void
}

export default function OCRUpload({ onDataExtracted }: OCRUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(",")[1]
        if (!base64) {
          setError("Failed to process image")
          return
        }

        try {
          const extractedData = await extractDeliveryInfoFromImage(base64)
          onDataExtracted(extractedData)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to extract data from image")
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError("Failed to upload image")
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Extract from Image (OCR)
        </CardTitle>
        <CardDescription>Upload a delivery note or address label to auto-fill the form</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
            }}
            disabled={isLoading}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-semibold">Extracting information...</span>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-semibold mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </label>
        </div>

        {error && <p className="text-red-600 text-sm mt-3 font-semibold">{error}</p>}
      </CardContent>
    </Card>
  )
}
