import { getAllDeliveries } from "@/app/actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UserHeader from "@/components/user-header"
import { DeliveriesMonthlyView } from "@/components/deliveries-monthly-view"

export default async function DeliveriesPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  let deliveries = []
  try {
    deliveries = await getAllDeliveries()
  } catch (error) {
    console.error("[v0] Failed to load deliveries:", error)
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
            <UserHeader email={session.user.email || ""} />
          </div>
        </div>

        {deliveries.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            <p>No deliveries found or unable to load deliveries. Please try again later.</p>
          </div>
        ) : (
          <DeliveriesMonthlyView deliveries={deliveries} />
        )}
      </div>
    </div>
  )
}
