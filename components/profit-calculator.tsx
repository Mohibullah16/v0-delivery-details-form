"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Delivery {
  id: string
  cod_amount: string | null
  service_charges: number | null
  product_cost: number | null
}

export function ProfitCalculator({ selectedDeliveries, allDeliveries }: { selectedDeliveries: string[]; allDeliveries: Delivery[] }) {
  const selected = allDeliveries.filter((d) => selectedDeliveries.includes(d.id))

  const totals = selected.reduce(
    (acc, delivery) => {
      const cod = parseFloat(delivery.cod_amount as string) || 0
      const charges = delivery.service_charges || 0
      const cost = delivery.product_cost || 0

      return {
        totalCOD: acc.totalCOD + cod,
        totalCharges: acc.totalCharges + charges,
        totalReceiving: acc.totalReceiving + (cod - charges),
        totalCost: acc.totalCost + cost,
      }
    },
    { totalCOD: 0, totalCharges: 0, totalReceiving: 0, totalCost: 0 },
  )

  const netProfit = totals.totalReceiving - totals.totalCost

  if (selectedDeliveries.length === 0) {
    return null
  }

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Profit Calculator</CardTitle>
        <CardDescription>{selectedDeliveries.length} order(s) selected</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Total COD</p>
            <p className="text-xl font-bold text-blue-600">{totals.totalCOD.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Service Charges</p>
            <p className="text-xl font-bold text-orange-600">{totals.totalCharges.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Receiving</p>
            <p className="text-xl font-bold text-green-600">{totals.totalReceiving.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Product Cost</p>
            <p className="text-xl font-bold text-red-600">{totals.totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t border-blue-200 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">Net Profit:</p>
            <Badge className={`text-lg px-4 py-1 ${netProfit >= 0 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
              {netProfit >= 0 ? "+" : ""} {netProfit.toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
