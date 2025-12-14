"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DeliveryPrint from "@/components/delivery-print"
import { saveDelivery } from "./actions"
import Link from "next/link"
import { Database } from "lucide-react"

const SENDER_DETAILS = {
  name: "Mohibullah Azhar",
  phone: "03360942599",
  cnic: "37405-7179397-9",
  address: "House no. H-115, Street 6, Arya Muhallah 2, Gordon College Road, Rawalpindi, Pakistan",
}

export default function DeliveryForm() {
  const [showPrint, setShowPrint] = useState(false)
  const [deliveryId, setDeliveryId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recipientDetails, setRecipientDetails] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    codAmount: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const delivery = await saveDelivery({
        recipientName: recipientDetails.name,
        recipientPhone: recipientDetails.phone,
        recipientAddress: recipientDetails.address,
        recipientCity: recipientDetails.city,
        codAmount: recipientDetails.codAmount,
        senderName: SENDER_DETAILS.name,
        senderPhone: SENDER_DETAILS.phone,
        senderCnic: SENDER_DETAILS.cnic,
        senderAddress: SENDER_DETAILS.address,
      })

      setDeliveryId(delivery.id)
      setShowPrint(true)
    } catch (error) {
      console.error("[v0] Error creating delivery:", error)
      alert("Failed to create delivery label. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setShowPrint(false)
    setDeliveryId("")
    setRecipientDetails({
      name: "",
      phone: "",
      address: "",
      city: "",
      codAmount: "",
    })
  }

  if (showPrint && deliveryId) {
    const delivery = {
      id: deliveryId,
      recipient_name: recipientDetails.name,
      recipient_phone: recipientDetails.phone,
      recipient_address: recipientDetails.address,
      recipient_city: recipientDetails.city,
      cod_amount: recipientDetails.codAmount || null,
      sender_name: SENDER_DETAILS.name,
      sender_phone: SENDER_DETAILS.phone,
      sender_cnic: SENDER_DETAILS.cnic,
      sender_address: SENDER_DETAILS.address,
    }

    return <DeliveryPrint delivery={delivery} onBack={handleReset} />
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" asChild>
            <Link href="/deliveries">
              <Database className="mr-2 h-4 w-4" />
              View All Deliveries
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Delivery Details Form</CardTitle>
            <CardDescription>Enter recipient information for delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Recipient Name *</Label>
                <Input
                  id="name"
                  required
                  value={recipientDetails.name}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, name: e.target.value })}
                  placeholder="Enter recipient name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={recipientDetails.phone}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  required
                  value={recipientDetails.address}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, address: e.target.value })}
                  placeholder="Enter complete address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={recipientDetails.city}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codAmount">COD Amount (Optional)</Label>
                <Input
                  id="codAmount"
                  type="number"
                  value={recipientDetails.codAmount}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, codAmount: e.target.value })}
                  placeholder="Enter COD amount if applicable"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Creating Label..." : "Generate Delivery Label"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
