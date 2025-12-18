"use client"

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
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [editingItemsId, setEditingItemsId] = useState<string | null>(null)
  const [itemsInputs, setItemsInputs] = useState<Record<string, string>>({})
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldInputs, setFieldInputs] = useState<Record<string, string>>({})
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

  const handleTrackingEdit = (id: string, currentTracking: string | null) => {
    setEditingTrackingId(id)
    setTrackingInputs({ ...trackingInputs, [id]: currentTracking || "" })
  }

  const handleTrackingSave = async (id: string) => {
    const trackingNumber = trackingInputs[id]
    try {
      await updateTrackingNumber(id, trackingNumber)
      router.refresh()
      setEditingTrackingId(null)
    } catch (error) {
      alert(`Failed to update tracking number: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleTrackingCancel = () => {
    setEditingTrackingId(null)
    setTrackingInputs({})
  }

  const handleItemsEdit = (id: string, currentItems: string | null) => {
    setEditingItemsId(id)
    setItemsInputs({ ...itemsInputs, [id]: currentItems || "" })
  }

  const handleItemsSave = async (id: string) => {
    const items = itemsInputs[id]
    try {
      await updateItems(id, items)
      router.refresh()
      setEditingItemsId(null)
    } catch (error) {
      alert(`Failed to update items: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleItemsCancel = () => {
    setEditingItemsId(null)
    setItemsInputs({})
  }

  const handleFieldEdit = (id: string, field: string, currentValue: string | null) => {
    setEditingFieldId(id)
    setEditingField(field)
    setFieldInputs({ ...fieldInputs, [id]: currentValue || "" })
  }

  const handleFieldSave = async (id: string) => {
    if (!editingField) return
    const value = fieldInputs[id]
    try {
      await updateDelivery(id, editingField, value)
      router.refresh()
      setEditingFieldId(null)
      setEditingField(null)
    } catch (error) {
      alert(`Failed to update field: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleFieldCancel = () => {
    setEditingFieldId(null)
    setEditingField(null)
    setFieldInputs({})
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === deliveries.length && deliveries.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Recipient Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>COD Amount</TableHead>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
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
                    {editingFieldId === delivery.id && editingField === "recipient_name" ? (
                      <div className="flex gap-2">
                        <Input
                          value={fieldInputs[delivery.id] || ""}
                          onChange={(e) => setFieldInputs({ ...fieldInputs, [delivery.id]: e.target.value })}
                          placeholder="Recipient name"
                          className="h-8 text-sm"
                        />
                        <Button size="sm" onClick={() => handleFieldSave(delivery.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleFieldCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{delivery.recipient_name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFieldEdit(delivery.id, "recipient_name", delivery.recipient_name)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingFieldId === delivery.id && editingField === "recipient_phone" ? (
                      <div className="flex gap-2">
                        <Input
                          value={fieldInputs[delivery.id] || ""}
                          onChange={(e) => setFieldInputs({ ...fieldInputs, [delivery.id]: e.target.value })}
                          placeholder="Phone"
                          className="h-8 text-sm"
                        />
                        <Button size="sm" onClick={() => handleFieldSave(delivery.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleFieldCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{delivery.recipient_phone}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFieldEdit(delivery.id, "recipient_phone", delivery.recipient_phone)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingFieldId === delivery.id && editingField === "recipient_city" ? (
                      <div className="flex gap-2">
                        <Input
                          value={fieldInputs[delivery.id] || ""}
                          onChange={(e) => setFieldInputs({ ...fieldInputs, [delivery.id]: e.target.value })}
                          placeholder="City"
                          className="h-8 text-sm"
                        />
                        <Button size="sm" onClick={() => handleFieldSave(delivery.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleFieldCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{delivery.recipient_city}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFieldEdit(delivery.id, "recipient_city", delivery.recipient_city)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItemsId === delivery.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={itemsInputs[delivery.id] || ""}
                          onChange={(e) => setItemsInputs({ ...itemsInputs, [delivery.id]: e.target.value })}
                          placeholder="Items to pack"
                          className="h-8 text-sm"
                        />
                        <Button size="sm" onClick={() => handleItemsSave(delivery.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleItemsCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={delivery.items ? "font-mono text-sm" : "text-muted-foreground"}>
                          {delivery.items || "—"}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => handleItemsEdit(delivery.id, delivery.items)}>
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingFieldId === delivery.id && editingField === "cod_amount" ? (
                      <div className="flex gap-2">
                        <Input
                          value={fieldInputs[delivery.id] || ""}
                          onChange={(e) => setFieldInputs({ ...fieldInputs, [delivery.id]: e.target.value })}
                          placeholder="COD amount"
                          className="h-8 text-sm"
                        />
                        <Button size="sm" onClick={() => handleFieldSave(delivery.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleFieldCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {delivery.cod_amount ? (
                          <span className="font-semibold text-green-600">Rs. {delivery.cod_amount}</span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFieldEdit(delivery.id, "cod_amount", delivery.cod_amount || "")}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  {/* ... existing tracking number ... */}
                  <TableCell>
                    {editingTrackingId === delivery.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={trackingInputs[delivery.id] || ""}
                          onChange={(e) => setTrackingInputs({ ...trackingInputs, [delivery.id]: e.target.value })}
                          placeholder="Enter tracking number"
                          className="h-8 text-sm"
                        />
                        <Button size="sm" onClick={() => handleTrackingSave(delivery.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleTrackingCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={delivery.tracking_number ? "font-mono text-sm" : "text-muted-foreground"}>
                          {delivery.tracking_number || "—"}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTrackingEdit(delivery.id, delivery.tracking_number)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  {/* ... existing status ... */}
                  <TableCell>
                    <Select
                      value={delivery.status}
                      onValueChange={(value) => handleStatusUpdate(delivery.id, value)}
                      disabled={updatingStatusId === delivery.id}
                    >
                      <SelectTrigger className="w-40">
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
                  {/* ... existing created at ... */}
                  <TableCell className="text-muted-foreground">
                    {new Date(delivery.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  {/* ... existing actions ... */}
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
