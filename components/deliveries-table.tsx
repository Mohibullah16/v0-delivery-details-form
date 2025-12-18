"use client"

import type React from "react"

import { useState } from "react"
import { deleteDelivery, updateDeliveryStatus, updateTrackingNumber, updateItems, updateDelivery } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Eye, Printer } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Delivery {
  id: string
  recipient_name: string
  recipient_phone: string
  recipient_city: string
  cod_amount: string | null
  status: string
  created_at: string
  tracking_number: string | null
  items: string | null // Add items field
}

const statusConfig = {
  prepared: { label: "Prepared", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-yellow-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  payment_received: { label: "Payment Received", color: "bg-purple-500" },
}

export function DeliveriesTable({ deliveries }: { deliveries: Delivery[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery?")) {
      return
    }

    setDeletingId(id)
    try {
      await deleteDelivery(id)
      router.refresh()
    } catch (error) {
      alert(`Failed to delete delivery: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === deliveries.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(deliveries.map((d) => d.id))
    }
  }

  const handleBulkPrint = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one delivery to print")
      return
    }

    // Warn if selecting too many deliveries
    if (selectedIds.length > 50) {
      const confirmed = confirm(
        `You are about to print ${selectedIds.length} delivery labels. This may take some time and could slow down your browser.\n\nFor best performance, consider printing in smaller batches (50 or fewer at a time).\n\nDo you want to continue?`
      )
      if (!confirmed) {
        return
      }
    }

    const printUrl = `/delivery/print?ids=${selectedIds.join(",")}`
    window.open(printUrl, "_blank")
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingStatusId(id)
    try {
      await updateDeliveryStatus(id, newStatus)
      router.refresh()
    } catch (error) {
      alert(`Failed to update status: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const startEditing = (id: string, field: string, currentValue: string | null) => {
    setEditingCell({ id, field })
    setEditValue(currentValue || "")
  }

  const saveEdit = async () => {
    if (!editingCell) return

    try {
      const { id, field } = editingCell

      if (field === "tracking_number") {
        await updateTrackingNumber(id, editValue)
      } else if (field === "items") {
        await updateItems(id, editValue)
      } else {
        await updateDelivery(id, field, editValue)
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

  const renderEditableCell = (delivery: Delivery, field: string, displayValue: string | React.ReactNode) => {
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
      {selectedIds.length > 0 && (
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
      )}

      <div className="rounded-lg border bg-card overflow-x-auto">
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
              <TableHead>Tracking</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No deliveries found. Create your first delivery label!
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((delivery) => (
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
                  <TableCell>{renderEditableCell(delivery, "recipient_phone", delivery.recipient_phone)}</TableCell>
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
                    {renderEditableCell(delivery, "tracking_number", delivery.tracking_number || "—")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={delivery.status}
                      onValueChange={(value) => handleStatusUpdate(delivery.id, value)}
                      disabled={updatingStatusId === delivery.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <Badge
                            className={
                              statusConfig[delivery.status as keyof typeof statusConfig]?.color || "bg-gray-500"
                            }
                          >
                            {statusConfig[delivery.status as keyof typeof statusConfig]?.label || delivery.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prepared">Prepared</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="payment_received">Payment Received</SelectItem>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
