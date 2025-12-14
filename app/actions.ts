"use server"

import { createClient } from "@/lib/supabase/server"

export interface DeliveryData {
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  recipientCity: string
  codAmount?: string
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

  const { data, error } = await supabase.from("deliveries").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching deliveries:", error)
    throw new Error("Failed to fetch deliveries")
  }

  return data
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

  const { data, error } = await supabase.from("deliveries").select("*").in("id", ids)

  if (error) {
    console.error("[v0] Error fetching deliveries:", error)
    throw new Error("Failed to fetch deliveries")
  }

  return data
}
