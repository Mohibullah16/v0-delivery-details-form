"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DeliveryPrint from "@/components/delivery-print"
import { saveDelivery } from "./actions"
import Link from "next/link"
import { Database } from "lucide-react"
import OCRUpload from "@/components/ocr-upload"
import { createClient } from "@/lib/supabase/client"
import UserHeader from "@/components/user-header"

const SENDER_DETAILS = {
  name: "Mohibullah Azhar",
  phone: "03360942599",
  cnic: "37405-7179397-9",
  address: "House no. H-115, Street 6, Arya Muhallah 2, Gordon College Road, Rawalpindi, Pakistan",
}

export default function DeliveryForm() {
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPrint, setShowPrint] = useState(false)
  const [deliveryId, setDeliveryId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recipientDetails, setRecipientDetails] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    codAmount: "",
    items: "",
    serviceCharges: "",
    productCost: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login")
      } else {
        setUserEmail(session.user.email || null)
        try {
          const { claimUnassignedDeliveries } = await import("./actions")
          await claimUnassignedDeliveries()
        } catch (error) {
          console.log("[v0] No unassigned deliveries to claim")
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [supabase.auth, router])

  const handleOCRDataExtracted = (data: {
    name?: string
    phone?: string
    address?: string
    city?: string
  }) => {
    setRecipientDetails((prev) => ({
      ...prev,
      name: data.name || prev.name,
      phone: data.phone || prev.phone,
      address: data.address || prev.address,
      city: data.city || prev.city,
    }))
  }

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
        items: recipientDetails.items,
        serviceCharges: recipientDetails.serviceCharges,
        productCost: recipientDetails.productCost,
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
      items: "",
      serviceCharges: "",
      productCost: "",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (showPrint && deliveryId) {
    const delivery = {
      id: deliveryId,
      recipient_name: recipientDetails.name,
      recipient_phone: recipientDetails.phone,
      recipient_address: recipientDetails.address,
      recipient_city: recipientDetails.city,
      cod_amount: recipientDetails.codAmount || null,
      items: recipientDetails.items || null,
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
        <div className="mb-4 flex justify-between items-center">
          <div />
          <div className="flex gap-2 items-center">
            <Button variant="outline" asChild>
              <Link href="/deliveries">
                <Database className="mr-2 h-4 w-4" />
                View All Deliveries
              </Link>
            </Button>
            {userEmail && <UserHeader email={userEmail} />}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-black">Delivery Details Form</CardTitle>
            <CardDescription className="text-lg">Enter recipient information for delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <OCRUpload onDataExtracted={handleOCRDataExtracted} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-bold">
                  Recipient Name *
                </Label>
                <Input
                  id="name"
                  required
                  value={recipientDetails.name}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, name: e.target.value })}
                  placeholder="Enter recipient name"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-lg font-bold">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={recipientDetails.phone}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-lg font-bold">
                  Address *
                </Label>
                <textarea
                  id="address"
                  required
                  value={recipientDetails.address}
                  onChange={(e) => {
                    setRecipientDetails({ ...recipientDetails, address: e.target.value })
                    e.target.style.height = "auto"
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"
                  }}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto"
                    e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 200) + "px"
                  }}
                  placeholder="Enter complete address"
                  className="w-full p-3 border rounded-md text-lg min-h-24 resize-none font-sans"
                  style={{ overflow: "hidden" }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-lg font-bold">
                  City *
                </Label>
                <Input
                  id="city"
                  required
                  value={recipientDetails.city}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, city: e.target.value })}
                  placeholder="Enter city"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="items" className="text-lg font-bold">
                  Items to Pack (Optional)
                </Label>
                <Input
                  id="items"
                  value={recipientDetails.items}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, items: e.target.value })}
                  placeholder="e.g., 2x Books, 1x Phone, 1x Charger"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codAmount" className="text-lg font-bold">
                  COD Amount (Optional)
                </Label>
                <Input
                  id="codAmount"
                  type="number"
                  value={recipientDetails.codAmount}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, codAmount: e.target.value })}
                  placeholder="Enter COD amount if applicable"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceCharges" className="text-lg font-bold">
                  Service Charges (Optional)
                </Label>
                <Input
                  id="serviceCharges"
                  type="number"
                  step="0.01"
                  value={recipientDetails.serviceCharges}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, serviceCharges: e.target.value })}
                  placeholder="Enter service charges"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productCost" className="text-lg font-bold">
                  Product Cost (Optional)
                </Label>
                <Input
                  id="productCost"
                  type="number"
                  step="0.01"
                  value={recipientDetails.productCost}
                  onChange={(e) => setRecipientDetails({ ...recipientDetails, productCost: e.target.value })}
                  placeholder="Enter product cost for profit calculation"
                  className="h-12 text-lg"
                />
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={isSubmitting}>
                {isSubmitting ? "Creating Label..." : "Generate Delivery Label"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
