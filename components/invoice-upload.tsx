"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, CheckCircle } from "lucide-react"
import { extractInvoiceInfo, updateInvoiceData } from "@/app/actions"

interface InvoiceUploadProps {
  deliveryId: string
  onDataExtracted?: (data: { trackingNumber?: string; serviceCharges?: number }) => void
}

export default function InvoiceUpload({ deliveryId, onDataExtracted }: InvoiceUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [success, setSuccess] = useState(false)
  const [extractedData, setExtractedData] = useState<{ trackingNumber?: string; serviceCharges?: number } | null>(null)

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(",")[1]
        if (!base64) {
          setError("Failed to process image")
          setIsLoading(false)
          return
        }

        try {
          const data = await extractInvoiceInfo(base64)
          setExtractedData(data)
          
          // Auto-update the delivery with extracted data
          await updateInvoiceData(deliveryId, data.trackingNumber, data.serviceCharges)
          
          setSuccess(true)
          onDataExtracted?.(data)
          
          // Clear form after 2 seconds
          setTimeout(() => {
            setSuccess(false)
            setExtractedData(null)
          }, 2000)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to extract data from invoice")
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
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Shipping Invoice
        </CardTitle>
        <CardDescription>Extract tracking number and service charges from courier invoice</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="rounded-lg p-6 bg-green-50 border border-green-200 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-semibold">Invoice processed successfully!</p>
            {extractedData?.trackingNumber && (
              <p className="text-sm text-green-600">Tracking: {extractedData.trackingNumber}</p>
            )}
            {extractedData?.serviceCharges && (
              <p className="text-sm text-green-600">Service Charges: Rs. {extractedData.serviceCharges.toFixed(2)}</p>
            )}
          </div>
        ) : (
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
              id="invoice-upload"
            />
            <label htmlFor="invoice-upload" className="cursor-pointer block">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-semibold">Extracting invoice data...</span>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-semibold mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-600">Invoice image (PNG, JPG, GIF up to 10MB)</p>
                </div>
              )}
            </label>
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-3 font-semibold">{error}</p>}
      </CardContent>
    </Card>
  )
}
