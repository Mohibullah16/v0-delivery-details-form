"use client"

import { useState } from "react"
import { deleteDelivery, updateDeliveryStatus } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Eye, Printer } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Delivery {
  id: string
  recipient_name: string
  recipient_phone: string
  recipient_city: string
  cod_amount: string | null
  status: string
  created_at: string
}

const statusConfig = {
  prepared: { label: "Prepared", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-yellow-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  payment_received: { label: "Payment Received", color: "bg-purple-500" },
}

export function DeliveriesTable({ deliveries }: { deliveries: Delivery[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([]) // Track selected deliveries
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
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
    // Open multiple print windows or a combined print page
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
              <TableHead>COD Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
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
                  <TableCell className="font-medium">{delivery.recipient_name}</TableCell>
                  <TableCell>{delivery.recipient_phone}</TableCell>
                  <TableCell>{delivery.recipient_city}</TableCell>
                  <TableCell>
                    {delivery.cod_amount ? (
                      <span className="font-semibold text-green-600">Rs. {delivery.cod_amount}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
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
                  <TableCell className="text-muted-foreground">
                    {new Date(delivery.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
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
