"use client"

import { getDeliveriesByIds } from "@/app/actions"
import { DeliveryPrint } from "@/components/delivery-print"
import { PrintButton } from "@/components/print-button"

export default async function BulkPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const params = await searchParams
  const ids = params.ids?.split(",") || []

  if (ids.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No deliveries selected for printing</p>
      </div>
    )
  }

  const deliveries = await getDeliveriesByIds(ids)

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      <div className="min-h-screen bg-background p-4">
        <PrintButton count={deliveries.length} />

        <div id="print-area" className="space-y-8">
          {deliveries.map((delivery, index) => (
            <div key={delivery.id} className={index < deliveries.length - 1 ? "page-break" : ""}>
              <DeliveryPrint delivery={delivery} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
