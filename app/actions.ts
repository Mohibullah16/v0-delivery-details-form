"use server"

import { createClient } from "@/lib/supabase/server"

export interface DeliveryData {
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  recipientCity: string
  codAmount?: string
  items?: string // Add items field
  senderName: string
  senderPhone: string
  senderCnic: string
  senderAddress: string
}

export async function saveDelivery(data: DeliveryData) {
  const supabase = await createClient()

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      recipient_name: data.recipientName,
      recipient_phone: data.recipientPhone,
      recipient_address: data.recipientAddress,
      recipient_city: data.recipientCity,
      cod_amount: data.codAmount || null,
      items: data.items || null, // Include items in database
      sender_name: data.senderName,
      sender_phone: data.senderPhone,
      sender_cnic: data.senderCnic,
      sender_address: data.senderAddress,
      status: "prepared", // Set default status
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error saving delivery:", error)
    throw new Error("Failed to save delivery")
  }

  return delivery
}

export async function getDelivery(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("deliveries").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching delivery:", error)
    throw new Error("Delivery not found")
  }

  return data
}

export async function getAllDeliveries() {
  const supabase = await createClient()

  try {
    const queryPromise = (async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select(
          "id, recipient_name, recipient_phone, recipient_city, cod_amount, status, created_at, tracking_number, items",
        )
        .order("created_at", { ascending: false })
        .limit(500)

      if (error) {
        throw new Error("Failed to fetch deliveries")
      }

      return data || []
    })()

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Query timeout - taking too long")), 15000),
    )

    const deliveries = await Promise.race([queryPromise, timeoutPromise])
    return deliveries
  } catch (error) {
    console.error("[v0] Error in getAllDeliveries:", error)
    return []
  }
}

export async function deleteDelivery(id: string) {
  const supabase = await createClient()

  console.log("[v0] Deleting delivery with id:", id)

  const { error } = await supabase.from("deliveries").delete().eq("id", id)

  if (error) {
    console.error("[v0] Supabase delete error:", error)
    throw new Error(`Failed to delete delivery: ${error.message}`)
  }

  console.log("[v0] Successfully deleted delivery:", id)
  return { success: true }
}

export async function updateDeliveryStatus(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("deliveries").update({ status }).eq("id", id)

  if (error) {
    console.error("[v0] Error updating status:", error)
    throw new Error("Failed to update status")
  }

  return { success: true }
}

export async function getDeliveriesByIds(ids: string[]) {
  const supabase = await createClient()

  try {
    const queryPromise = (async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error("Failed to fetch deliveries")
      }

      return data || []
    })()

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Query timeout")), 10000),
    )

    const deliveries = await Promise.race([queryPromise, timeoutPromise])
    return deliveries
  } catch (error) {
    console.error("[v0] Error fetching deliveries by ids:", error)
    return []
  }
}

export async function updateTrackingNumber(id: string, trackingNumber: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("deliveries").update({ tracking_number: trackingNumber }).eq("id", id)

  if (error) {
    console.error("[v0] Error updating tracking number:", error)
    throw new Error("Failed to update tracking number")
  }

  return { success: true }
}

export async function updateItems(id: string, items: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("deliveries").update({ items }).eq("id", id)

  if (error) {
    console.error("[v0] Error updating items:", error)
    throw new Error("Failed to update items")
  }

  return { success: true }
}

export async function updateDelivery(id: string, field: string, value: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("deliveries")
    .update({ [field]: value })
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating delivery:", error)
    throw new Error(`Failed to update ${field}`)
  }

  return { success: true }
}
