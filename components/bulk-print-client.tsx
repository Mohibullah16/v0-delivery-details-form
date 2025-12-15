"use client"

import { useEffect } from "react"
import { DeliveryLabel } from "@/components/delivery-label"
import { PrintButton } from "@/components/print-button"

interface Delivery {
  id: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  recipient_city: string
  cod_amount: string | null
  sender_name: string
  sender_phone: string
  sender_cnic: string
  sender_address: string
}

export function BulkPrintClient({ deliveries }: { deliveries: Delivery[] }) {
  useEffect(() => {
    // Wait for content to fully render before triggering print
    const timer = setTimeout(() => {
      console.log("Triggering print dialog...")
      window.print()
    }, 1500) // 1.5 second delay to ensure QR codes are fully rendered

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{
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
        }
      `}} />

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
