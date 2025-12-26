"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Loader } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>Recover your account access</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-green-900">Check your email</h3>
                  <p className="text-sm text-green-700 mt-1">
                    We've sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
                  </p>
                </div>
              </div>
              <Button onClick={() => router.push("/auth/login")} className="w-full bg-blue-600 hover:bg-blue-700">
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" /> Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
