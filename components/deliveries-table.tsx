"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { deleteDelivery, updateDeliveryStatus, updateTrackingNumber, updateItems, updateDelivery } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Eye, Printer, ChevronDown, Upload, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ProfitCalculator } from "./profit-calculator"
import InvoiceUpload from "./invoice-upload"

interface Delivery {
  id: string
  recipient_name: string
  recipient_phone: string
  recipient_city: string
  cod_amount: string | null
  status: string
  created_at: string
  tracking_number: string | null
  items: string | null
  service_charges: number | null
  product_cost: number | null
}

const statusConfig = {
  new: { label: "New", color: "bg-gray-500" },
  prepared: { label: "Prepared", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-yellow-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  payment_received: { label: "Payment Received", color: "bg-purple-500" },
  returned: { label: "Returned", color: "bg-orange-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
}

export function DeliveriesTable({ deliveries }: { deliveries: Delivery[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [showFinancials, setShowFinancials] = useState(false)
  const [uploadingInvoiceId, setUploadingInvoiceId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return

    setDeletingId(id)
    try {
      await deleteDelivery(id)
      router.refresh()
    } catch (error) {
      alert(`Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDeletingId(null)
    }
  }, [router])

  const handleStatusUpdate = useCallback(async (id: string, newStatus: string) => {
    setUpdatingStatusId(id)
    try {
      await updateDeliveryStatus(id, newStatus)
      router.refresh()
    } catch (error) {
      alert(`Failed to update status: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setUpdatingStatusId(null)
    }
  }, [router])

  const startEditing = (id: string, field: string, currentValue: string | null) => {
    setEditingCell({ id, field })
    // Strip "Rs. " prefix from price fields for editing
    let value = currentValue || ""
    if (["cod_amount", "service_charges", "product_cost"].includes(field) && value.startsWith("Rs. ")) {
      value = value.replace("Rs. ", "").trim()
    }
    setEditValue(value)
  }

  const saveEdit = async () => {
    if (!editingCell) return

    try {
      const { id, field } = editingCell
      // Strip "Rs. " prefix and store only the number
      let valueToSave = editValue.trim()
      if (["cod_amount", "service_charges", "product_cost"].includes(field)) {
        valueToSave = valueToSave.replace("Rs. ", "").trim()
      }

      if (field === "tracking_number") {
        await updateTrackingNumber(id, valueToSave)
      } else if (field === "items") {
        await updateItems(id, valueToSave)
      } else {
        await updateDelivery(id, field, valueToSave)
      }

      router.refresh()
      setEditingCell(null)
      setEditValue("")
    } catch (error) {
      alert(`Failed to update: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit()
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  const renderEditableCell = useCallback((delivery: Delivery, field: string, displayValue: string | React.ReactNode) => {
    const isEditing = editingCell?.id === delivery.id && editingCell?.field === field

    if (isEditing) {
      return (
        <Input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
          className="h-8 text-sm"
          onClick={(e) => e.stopPropagation()}
        />
      )
    }

    return (
      <div
        onDoubleClick={() => startEditing(delivery.id, field, editValue || (displayValue as string))}
        className="cursor-text hover:bg-muted/50 p-1 rounded transition-colors"
      >
        {displayValue}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uploadingInvoiceId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Upload Invoice</h2>
        <button
          className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          onClick={() => startEditing(delivery.id, field, String(displayValue))}
        >
          {displayValue}
        </button>
      )
    }
  }, [editingCell, editValue])
                          >
                            {statusConfig[delivery.status as keyof typeof statusConfig]?.label || delivery.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="prepared">Prepared</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="payment_received">Payment Received</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(delivery.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUploadingInvoiceId(delivery.id)}
                        title="Upload courier invoice to extract tracking and charges"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/delivery/${delivery.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(delivery.id)}
                        disabled={deletingId === delivery.id}
                      >
                        {deletingId === delivery.id ? (
                          <span className="h-4 w-4 animate-spin">⏳</span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
