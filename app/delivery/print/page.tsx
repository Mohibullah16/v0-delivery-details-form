import { getDeliveriesByIds } from "@/app/actions"
import { BulkPrintClient } from "@/components/bulk-print-client"

export default async function BulkPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const params = await searchParams
  const ids = params.ids?.split(",") || []

  if (ids.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No deliveries selected for printing</p>
      </div>
    )
  }

  const deliveries = await getDeliveriesByIds(ids)

  return <BulkPrintClient deliveries={deliveries} />
}
