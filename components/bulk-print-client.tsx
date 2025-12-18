"use client"

import { useEffect, useState } from "react"
import { DeliveryLabel } from "@/components/delivery-label"
import { PrintButton } from "@/components/print-button"

interface Delivery {
  id: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  recipient_city: string
  cod_amount: string | null
  items?: string | null // Add items field
  sender_name: string
  sender_phone: string
  sender_cnic: string
  sender_address: string
}

export function BulkPrintClient({ deliveries }: { deliveries: Delivery[] }) {
  const [isReady, setIsReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    console.log("[v0] BulkPrintClient loaded with", deliveries.length, "deliveries")

    // Give the browser time to render all labels before triggering print
    const renderDelay = Math.min(2000, deliveries.length * 50) // 50ms per label, max 2s

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, renderDelay / 10)

    const timer = setTimeout(() => {
      setIsReady(true)
      setLoadingProgress(100)
      clearInterval(progressInterval)

      // Trigger print after everything is ready
      setTimeout(() => {
        console.log("[v0] Triggering print dialog for", deliveries.length, "deliveries")
        window.print()
      }, 300)
    }, renderDelay)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [deliveries.length])

  if (deliveries.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Failed to load deliveries for printing</p>
      </div>
    )
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          
          /* Ensure each label fits on one page */
          .delivery-label-wrapper {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .loading-overlay {
            display: none !important;
          }
        }
      `,
        }}
      />

      {!isReady && (
        <div className="loading-overlay fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Preparing {deliveries.length} labels for printing...</p>
              <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">{loadingProgress}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background p-4">
        <PrintButton count={deliveries.length} />

        <div className="space-y-8">
          {deliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className={`delivery-label-wrapper ${index < deliveries.length - 1 ? "page-break" : ""}`}
            >
              <DeliveryLabel delivery={delivery} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
