"use server"

import { createClient } from "@/lib/supabase/server"

export interface DeliveryData {
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  recipientCity: string
  codAmount?: string
  items?: string
  serviceCharges?: string
  productCost?: string
  senderName: string
  senderPhone: string
  senderCnic: string
  senderAddress: string
}

export async function saveDelivery(data: DeliveryData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to create a delivery")
  }

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      recipient_name: data.recipientName,
      recipient_phone: data.recipientPhone,
      recipient_address: data.recipientAddress,
      recipient_city: data.recipientCity,
      cod_amount: data.codAmount || null,
      items: data.items || null,
      service_charges: data.serviceCharges ? parseFloat(data.serviceCharges) : null,
      product_cost: data.productCost ? parseFloat(data.productCost) : null,
      sender_name: data.senderName,
      sender_phone: data.senderPhone,
      sender_cnic: data.senderCnic,
      sender_address: data.senderAddress,
      status: "new",
      user_id: user.id,
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
          "id, recipient_name, recipient_phone, recipient_city, cod_amount, status, created_at, tracking_number, items, service_charges, product_cost",
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(250)

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
    console.log(`[v0] Fetching ${ids.length} deliveries for bulk print`)

    // Process in batches if there are many IDs to avoid URL/query limits
    const batchSize = 100
    const batches = []

    for (let i = 0; i < ids.length; i += batchSize) {
      batches.push(ids.slice(i, i + batchSize))
    }

    const queryPromise = (async () => {
      const allData = []

      for (const batch of batches) {
        const { data, error } = await supabase.from("deliveries").select("*").in("id", batch)

        if (error) {
          console.error("[v0] Batch fetch error:", error)
          throw new Error("Failed to fetch deliveries")
        }

        if (data) {
          allData.push(...data)
        }
      }

      // Sort by created_at after fetching all batches
      return allData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })()

    // Increased timeout to 30 seconds for large batches
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Query timeout - please try selecting fewer deliveries")), 30000),
    )

    const deliveries = await Promise.race([queryPromise, timeoutPromise])
    console.log(`[v0] Successfully fetched ${deliveries.length} deliveries`)
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

// Normalize Pakistani phone numbers to 11-digit format starting with 0
function normalizePhoneNumber(phone: string | undefined): string | undefined {
  if (!phone) return undefined

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "")

  // If starts with 92 (international format), convert to 0 format
  let normalized = digitsOnly.startsWith("92") ? "0" + digitsOnly.slice(2) : digitsOnly

  // Ensure it starts with 0 and has 11 digits total
  if (!normalized.startsWith("0")) {
    normalized = "0" + normalized
  }

  // Take only the last 11 digits to ensure 11-digit format
  if (normalized.length > 11) {
    normalized = normalized.slice(-11)
  }

  // Pad with leading zeros if less than 11 digits (though 0 should already be there)
  if (normalized.length < 11) {
    return undefined // Invalid format
  }

  // Validate format: First digit should be 0, second digit should be 3-9 (for mobile) or 0-9 (for landline starting with 00)
  const secondDigit = parseInt(normalized[1])
  if (isNaN(secondDigit)) {
    return undefined
  }

  return normalized
}

export async function extractDeliveryInfoFromImage(base64Image: string) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured")
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this delivery label or address image and extract the following information:
- Recipient Name
- Phone Number
- Full Address
- City

Return the data in JSON format like this:
{
  "name": "extracted name or null",
  "phone": "extracted phone or null",
  "address": "extracted address or null",
  "city": "extracted city or null"
}

Only return valid JSON, no other text.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Groq API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No response from Groq API")
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from response")
    }

    const extractedData = JSON.parse(jsonMatch[0])

    return {
      name: extractedData.name || undefined,
      phone: normalizePhoneNumber(extractedData.phone),
      address: extractedData.address || undefined,
      city: extractedData.city || undefined,
    }
  } catch (error) {
    console.error("[v0] OCR extraction error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to extract information from image")
  }
}

export async function extractInvoiceInfo(base64Image: string) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured")
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this courier shipping invoice and extract the following information:
- Tracking Number (CN or Consignment Number - this is the most important field)
- Service Charges (extract the total service charges amount including all fees)

Return the data in JSON format like this:
{
  "trackingNumber": "extracted CN or consignment number or null",
  "serviceCharges": "extracted service charges amount as number or null"
}

For service charges, look for lines that say "Service Charge", "Handling Fee", "Delivery Charge", "Total Charges" etc. and extract the total amount.
Only return valid JSON, no other text.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Groq API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No response from Groq API")
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from response")
    }

    const extractedData = JSON.parse(jsonMatch[0])

    return {
      trackingNumber: extractedData.trackingNumber || undefined,
      serviceCharges: extractedData.serviceCharges ? parseFloat(extractedData.serviceCharges) : undefined,
    }
  } catch (error) {
    console.error("[v0] Invoice OCR extraction error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to extract information from invoice")
  }
}

export async function updateInvoiceData(deliveryId: string, trackingNumber?: string, serviceCharges?: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("deliveries").update({
    ...(trackingNumber && { tracking_number: trackingNumber }),
    ...(serviceCharges !== undefined && { service_charges: serviceCharges }),
  }).eq("id", deliveryId)

  if (error) {
    console.error("[v0] Error updating invoice data:", error)
    throw new Error("Failed to update delivery with invoice data")
  }

  return { success: true }
}

export async function claimUnassignedDeliveries() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to claim deliveries")
  }

  const { error } = await supabase.from("deliveries").update({ user_id: user.id }).is("user_id", null)

  if (error) {
    console.error("[v0] Error claiming deliveries:", error)
    throw new Error("Failed to claim deliveries")
  }

  return { success: true }
}
