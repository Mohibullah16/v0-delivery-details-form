"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import QRCodeStyling from "qr-code-styling"

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

interface DeliveryPrintProps {
  delivery: Delivery
  onBack?: () => void
}

export function DeliveryPrint({ delivery, onBack }: DeliveryPrintProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!qrCodeRef.current || !delivery.id) return

    const qrCode = new QRCodeStyling({
      width: 150,
      height: 150,
      data: `${window.location.origin}/delivery/${delivery.id}`,
      margin: 0,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H",
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0,
      },
      dotsOptions: {
        color: "#000000",
        type: "square",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      cornersSquareOptions: {
        color: "#000000",
        type: "square",
      },
      cornersDotOptions: {
        color: "#000000",
        type: "square",
      },
    })

    qrCodeRef.current.innerHTML = ""
    qrCode.append(qrCodeRef.current)
  }, [delivery.id])

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          #print-content,
          #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `,
        }}
      />

      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="no-print mb-6 flex gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Form
              </Button>
            )}
            <Button id="print-btn" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Label
            </Button>
          </div>

          <div id="print-content" className="rounded-lg border-2 border-border bg-white p-6 text-black">
            {/* Header with QR Code */}
            <div className="mb-6 flex items-start justify-between border-b-2 border-black pb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-black uppercase tracking-wide">Delivery Label</h1>
                <p className="text-sm font-semibold text-black mt-1">ID: {delivery.id.slice(0, 8)}</p>
              </div>
              <div ref={qrCodeRef} className="flex-shrink-0" />
            </div>

            {/* Recipient Section - Large */}
            <div className="mb-6">
              <h2 className="mb-4 text-2xl font-black uppercase tracking-wide text-black">Deliver To:</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-black text-black mb-1">NAME</p>
                  <p className="text-5xl font-black leading-tight text-black">{delivery.recipient_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-black text-black mb-1">PHONE</p>
                    <p className="text-3xl font-black text-black">{delivery.recipient_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-black mb-1">CITY</p>
                    <p className="text-3xl font-black text-black">{delivery.recipient_city}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-black text-black mb-1">ADDRESS</p>
                  <p className="text-2xl font-bold leading-snug text-black">{delivery.recipient_address}</p>
                </div>
              </div>
            </div>

            {/* COD Amount - Huge (if present) */}
            {delivery.cod_amount && (
              <div className="mb-6 rounded-lg border-4 border-black bg-yellow-50 p-4 text-center">
                <p className="text-lg font-black uppercase tracking-wider text-black">Cash on Delivery</p>
                <p className="text-5xl font-black tracking-tight text-black">Rs. {delivery.cod_amount}</p>
              </div>
            )}

            {/* Sender Section - Compact */}
            <div className="rounded border-2 border-black bg-gray-100 p-3">
              <h3 className="mb-3 text-base font-black uppercase text-black">From (Sender):</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="font-black text-black">Name: </span>
                  <span className="font-bold text-black">{delivery.sender_name}</span>
                </div>
                <div>
                  <span className="font-black text-black">Phone: </span>
                  <span className="font-bold text-black">{delivery.sender_phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-black text-black">CNIC: </span>
                  <span className="font-bold text-black">{delivery.sender_cnic}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-black text-black">Address: </span>
                  <span className="font-bold text-black">{delivery.sender_address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeliveryPrint
