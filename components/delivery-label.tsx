"use client"

import { useEffect, useRef } from "react"
import QRCodeStyling from "qr-code-styling"

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

export function DeliveryLabel({ delivery }: { delivery: Delivery }) {
    const qrCodeRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!qrCodeRef.current || !delivery.id) return

        const qrCode = new QRCodeStyling({
            width: 200,
            height: 200,
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

    return (
        <div className="rounded-lg border-2 border-border bg-white p-3 text-black">
            {/* Items Section - If present */}
            {delivery.items && (
                <div className="mb-3 rounded border-2 border-black bg-blue-50 p-3">
                    <p className="text-base font-bold text-black mb-2">ITEMS TO PACK:</p>
                    <p className="text-lg font-bold text-black">{delivery.items}</p>
                </div>
            )}

            {/* Header with QR Code */}
            <div className="mb-3 flex items-start justify-between border-b-2 border-black pb-2">
                <div className="flex-1">
                    <h1 className="text-4xl font-black uppercase tracking-wide">Delivery Label</h1>
                    <p className="text-base font-bold text-black mt-1">ID: {delivery.id.slice(0, 8)}</p>
                </div>
                <div ref={qrCodeRef} className="flex-shrink-0" />
            </div>

            {/* Recipient Section - Large */}
            <div className="mb-3">
                <h2 className="mb-2 text-3xl font-black uppercase tracking-wide text-black">Deliver To:</h2>
                <div className="space-y-2">
                    <div>
                        <p className="text-base font-black text-black mb-1">NAME</p>
                        <p className="text-3xl font-black leading-tight text-black">{delivery.recipient_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-base font-black text-black mb-1">PHONE</p>
                            <p className="text-3xl font-black text-black">{delivery.recipient_phone}</p>
                        </div>
                        <div>
                            <p className="text-base font-black text-black mb-1">CITY</p>
                            <p className="text-3xl font-black text-black">{delivery.recipient_city}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-base font-black text-black mb-1">ADDRESS</p>
                        <p className="text-3xl font-black leading-snug text-black">{delivery.recipient_address}</p>
                    </div>
                </div>
            </div>

            {/* COD Amount - Huge (if present) */}
            {delivery.cod_amount && (
                <div className="mb-3 rounded-lg border-2 border-black bg-yellow-50 p-3 text-center">
                    <p className="text-lg font-black uppercase tracking-wider text-black">Cash on Delivery</p>
                    <p className="text-5xl font-black tracking-tight text-black">Rs. {delivery.cod_amount}</p>
                </div>
            )}

            {/* Sender Section - Compact */}
            <div className="rounded border-2 border-black bg-gray-100 p-3">
                <h3 className="mb-2 text-xl font-black uppercase text-black">From (Sender):</h3>
                <div className="space-y-1 text-lg">
                    <div>
                        <span className="font-black text-black">Name: </span>
                        <span className="font-black text-black">{delivery.sender_name}</span>
                    </div>
                    <div>
                        <span className="font-black text-black">Phone: </span>
                        <span className="font-black text-black">{delivery.sender_phone}</span>
                    </div>
                    <div>
                        <span className="font-black text-black">CNIC: </span>
                        <span className="font-black text-black">{delivery.sender_cnic}</span>
                    </div>
                    <div>
                        <span className="font-black text-black">Address: </span>
                        <span className="font-black text-black">{delivery.sender_address}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
