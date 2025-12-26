"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, CheckCircle } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    setPasswordStrength(strength)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setSignupSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength === 2) return "bg-yellow-500"
    if (passwordStrength === 3) return "bg-blue-500"
    return "bg-green-500"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">Sign up to manage your deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {signupSuccess ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                <h3 className="font-semibold mb-2">Account Created!</h3>
                <p className="text-sm mb-4">
                  A confirmation email has been sent to <strong>{email}</strong>. Please check your inbox and confirm
                  your email to log in.
                </p>
                <p className="text-xs text-green-600">
                  You may need to check your spam folder if you don't see the email.
                </p>
              </div>
              <Link href="/auth/login" className="inline-block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      checkPasswordStrength(e.target.value)
                    }}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < passwordStrength ? getStrengthColor() : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password === confirmPassword && confirmPassword && (
                  <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                    <CheckCircle size={16} /> Passwords match
                  </div>
                )}
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

          {!signupSuccess && (
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
