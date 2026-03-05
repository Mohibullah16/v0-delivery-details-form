"use client"

import type React from "react"

import { useState, useCallback } from "react"
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
        onDoubleClick={() => startEditing(delivery.id, field, String(displayValue))}
        className="cursor-text hover:bg-muted/50 p-1 rounded transition-colors"
      >
        {displayValue}
      </div>
    )
  }, [editingCell, editValue, handleKeyDown])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === deliveries.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(deliveries.map((d) => d.id))
    }
  }, [selectedIds.length, deliveries.length])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }, [])

  const handleBulkPrint = useCallback(() => {
    if (selectedIds.length === 0) return
    const idsParam = selectedIds.join(",")
    window.open(`/delivery/print?ids=${idsParam}`, "_blank")
  }, [selectedIds])

  return (
    <div className="space-y-4">
      {uploadingInvoiceId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Upload Invoice</h2>
              <button
                onClick={() => setUploadingInvoiceId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <InvoiceUpload
                deliveryId={uploadingInvoiceId}
                onDataExtracted={() => {
                  router.refresh()
                  setUploadingInvoiceId(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted p-4">
            <p className="text-sm font-medium">
              {selectedIds.length} {selectedIds.length === 1 ? "delivery" : "deliveries"} selected
            </p>
            <div className="flex gap-2">
              <Button onClick={handleBulkPrint} variant="default">
                <Printer className="mr-2 h-4 w-4" />
                Print Selected
              </Button>
              <Button onClick={() => setSelectedIds([])} variant="outline">
                Clear Selection
              </Button>
            </div>
          </div>
          <ProfitCalculator selectedDeliveries={selectedIds} allDeliveries={deliveries} />
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-x-auto">
        <div className="flex justify-end p-3 border-b">
          <Button variant="outline" size="sm" onClick={() => setShowFinancials(!showFinancials)}>
            <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showFinancials ? "rotate-180" : ""}`} />
            {showFinancials ? "Hide" : "Show"} Financials
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === deliveries.length && deliveries.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>COD</TableHead>
              <TableHead>Service Charges</TableHead>
              {showFinancials && <TableHead>Product Cost</TableHead>}
              {showFinancials && <TableHead>Profit</TableHead>}
              <TableHead>Tracking</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showFinancials ? 13 : 11} className="h-24 text-center text-muted-foreground">
                  No deliveries found. Create your first delivery label!
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((delivery) => {
                const receivingAmount = (delivery.cod_amount ? parseFloat(delivery.cod_amount) : 0) - (delivery.service_charges || 0)
                const profit = receivingAmount - (delivery.product_cost || 0)
                return (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(delivery.id)}
                        onCheckedChange={() => toggleSelection(delivery.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {renderEditableCell(delivery, "recipient_name", delivery.recipient_name)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{renderEditableCell(delivery, "recipient_phone", delivery.recipient_phone)}</span>
                        {delivery.recipient_phone && (
                          <a
                            href={`https://wa.me/+92${delivery.recipient_phone.replace(/^0/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Send WhatsApp message"
                            className="text-green-600 hover:text-green-700 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderEditableCell(delivery, "recipient_city", delivery.recipient_city)}</TableCell>
                    <TableCell>{renderEditableCell(delivery, "items", delivery.items || "—")}</TableCell>
                    <TableCell>
                      {renderEditableCell(
                        delivery,
                        "cod_amount",
                        delivery.cod_amount ? `Rs. ${delivery.cod_amount}` : "—",
                      )}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(
                        delivery,
                        "service_charges",
                        delivery.service_charges ? `Rs. ${delivery.service_charges.toFixed(2)}` : "—",
                      )}
                    </TableCell>
                    {showFinancials && (
                      <TableCell>
                        {renderEditableCell(
                          delivery,
                          "product_cost",
                          delivery.product_cost ? `Rs. ${delivery.product_cost.toFixed(2)}` : "—",
                        )}
                      </TableCell>
                    )}
                    {showFinancials && (
                      <TableCell>
                        <Badge className={profit >= 0 ? "bg-green-500" : "bg-red-500"}>
                          {profit >= 0 ? "+" : ""} Rs. {profit.toFixed(2)}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      {renderEditableCell(delivery, "tracking_number", delivery.tracking_number || "—")}
                    </TableCell>
                    <TableCell>
                      <Select value={delivery.status} onValueChange={(newStatus) => handleStatusUpdate(delivery.id, newStatus)}>
                        <SelectTrigger className="w-[140px]" disabled={updatingStatusId === delivery.id}>
                          <SelectValue
                            defaultValue={delivery.status}
                            placeholder="Select status"
                          />
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
