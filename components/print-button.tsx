"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton({ count }: { count: number }) {
  return (
    <div className="no-print mb-6 flex justify-center">
      <Button onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Print All ({count} {count === 1 ? "Label" : "Labels"})
      </Button>
    </div>
  )
}
