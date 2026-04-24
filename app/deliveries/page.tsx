"use client"

import { useState, useEffect } from "react"
import { getAllDeliveries } from "@/app/actions"
import { DeliveriesTable } from "@/components/deliveries-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import UserHeader from "@/components/user-header"
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

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [monthlyDeliveries, setMonthlyDeliveries] = useState<Delivery[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = await createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login")
          return
        }

        setUser(session.user)

        const allDeliveries = await getAllDeliveries()
        setDeliveries(allDeliveries)
      } catch (error) {
        console.error("[v0] Failed to load deliveries:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Filter deliveries by current month
  useEffect(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const filtered = deliveries.filter((delivery) => {
      const deliveryDate = new Date(delivery.created_at)
      return deliveryDate >= startOfMonth && deliveryDate <= endOfMonth
    })

    setMonthlyDeliveries(filtered)
  }, [currentMonth, deliveries])

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthName = currentMonth.toLocaleDateString("default", { month: "long", year: "numeric" })

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground">Loading deliveries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Deliveries</h1>
            <p className="text-muted-foreground mt-1">View and manage all delivery records</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button asChild>
              <Link href="/">Create New Delivery</Link>
            </Button>
            <UserHeader email={user?.email || ""} />
          </div>
        </div>

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
    </div>
  )
}
