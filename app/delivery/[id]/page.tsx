import { notFound } from "next/navigation"
import { getDelivery } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const delivery = await getDelivery(id)

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-xl font-bold">Recipient Details</h3>
                <div className="space-y-2 rounded-lg bg-muted p-4">
                  <p>
                    <span className="font-semibold">Name:</span> {delivery.recipient_name}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {delivery.recipient_phone}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span> {delivery.recipient_address}
                  </p>
                  <p>
                    <span className="font-semibold">City:</span> {delivery.recipient_city}
                  </p>
                  {delivery.cod_amount && (
                    <p>
                      <span className="font-semibold">COD Amount:</span> Rs. {delivery.cod_amount}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xl font-bold">Sender Details</h3>
                <div className="space-y-2 rounded-lg bg-muted p-4">
                  <p>
                    <span className="font-semibold">Name:</span> {delivery.sender_name}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {delivery.sender_phone}
                  </p>
                  <p>
                    <span className="font-semibold">CNIC:</span> {delivery.sender_cnic}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span> {delivery.sender_address}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Delivery ID: {delivery.id}</p>
                <p>Created: {new Date(delivery.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error loading delivery:", error)
    notFound()
  }
}
