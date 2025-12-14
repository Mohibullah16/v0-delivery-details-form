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

    return (
        <div className="rounded-lg border-2 border-border bg-white p-6 text-black">
            {/* Header with QR Code */}
            <div className="mb-6 flex items-start justify-between border-b-2 border-black pb-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold uppercase tracking-wide">Delivery Label</h1>
                    <p className="text-xs text-gray-600 mt-1">ID: {delivery.id.slice(0, 8)}</p>
                </div>
                <div ref={qrCodeRef} className="flex-shrink-0" />
            </div>

            {/* Recipient Section - Large */}
            <div className="mb-6">
                <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-gray-700">Deliver To:</h2>
                <div className="space-y-2">
                    <div>
                        <p className="text-xs font-semibold text-gray-600">Name</p>
                        <p className="text-3xl font-bold leading-tight">{delivery.recipient_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-600">Phone</p>
                            <p className="text-2xl font-semibold">{delivery.recipient_phone}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600">City</p>
                            <p className="text-2xl font-semibold">{delivery.recipient_city}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-600">Address</p>
                        <p className="text-xl font-medium leading-snug">{delivery.recipient_address}</p>
                    </div>
                </div>
            </div>

            {/* COD Amount - Huge (if present) */}
            {delivery.cod_amount && (
                <div className="mb-6 rounded-lg border-4 border-black bg-yellow-50 p-4 text-center">
                    <p className="text-lg font-bold uppercase tracking-wider text-gray-700">Cash on Delivery</p>
                    <p className="text-5xl font-black tracking-tight">Rs. {delivery.cod_amount}</p>
                </div>
            )}

            {/* Sender Section - Compact */}
            <div className="rounded border border-gray-300 bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-bold uppercase text-gray-700">From:</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                        <span className="font-semibold text-gray-600">Name: </span>
                        <span className="font-medium">{delivery.sender_name}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">Phone: </span>
                        <span className="font-medium">{delivery.sender_phone}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="font-semibold text-gray-600">CNIC: </span>
                        <span className="font-medium">{delivery.sender_cnic}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="font-semibold text-gray-600">Address: </span>
                        <span className="font-medium">{delivery.sender_address}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
