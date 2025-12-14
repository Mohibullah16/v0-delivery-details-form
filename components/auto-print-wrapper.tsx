"use client"

import { useEffect } from "react"

export function AutoPrintWrapper({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Wait for content to fully render before triggering print
        const timer = setTimeout(() => {
            window.print()
        }, 1000) // 1000ms delay to ensure QR codes and content are fully rendered

        return () => clearTimeout(timer)
    }, [])

    return <>{children}</>
}
