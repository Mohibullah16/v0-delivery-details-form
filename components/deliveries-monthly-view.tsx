"use client"

import { useState, useMemo } from "react"
import { DeliveriesTable } from "@/components/deliveries-table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

interface DeliveriesMonthlyViewProps {
  deliveries: Delivery[]
}

export function DeliveriesMonthlyView({ deliveries }: DeliveriesMonthlyViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Filter deliveries by current month
  const monthlyDeliveries = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59)

    return deliveries.filter((delivery) => {
      const deliveryDate = new Date(delivery.created_at)
      return deliveryDate >= startOfMonth && deliveryDate <= endOfMonth
    })
  }, [currentMonth, deliveries])

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div>
      {/* Monthly Navigation */}
      <div className="mb-6 flex items-center justify-between rounded-lg border bg-card p-4">
        <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{monthName}</h2>
          <p className="text-sm text-muted-foreground">{monthlyDeliveries.length} deliveries</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToNextMonth}>
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {monthlyDeliveries.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>No deliveries found for {monthName}</p>
        </div>
      ) : (
        <DeliveriesTable deliveries={monthlyDeliveries} />
      )}
    </div>
  )
}
