"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Lock } from "lucide-react"

interface UserHeaderProps {
  email: string
}

export default function UserHeader({ email }: UserHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <User size={18} />
            <span className="hidden sm:inline text-sm">{email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled className="text-xs text-gray-500">
            {email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/auth/change-password" className="flex gap-2 cursor-pointer">
              <Lock size={16} />
              Change Password
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full text-left flex gap-2 text-red-600 hover:text-red-700 cursor-pointer"
            >
              <LogOut size={16} />
              {loading ? "Signing out..." : "Sign Out"}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
