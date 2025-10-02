"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type UserResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Mail, Shield } from "lucide-react"
import { format } from "date-fns"

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, isAuthenticated } = useAuth()
  const [userDetails, setUserDetails] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    loadUserDetails()
  }, [isAuthenticated, router])

  const loadUserDetails = async () => {
    if (!authUser) return
    try {
      const data = await api.getUserById(authUser.userId)
      setUserDetails(data)
    } catch (error) {
      console.error("Failed to load user details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-mono text-xl font-bold">Profile Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your account information</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details and account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="text-lg font-semibold">{authUser?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p className="text-lg font-semibold">{authUser?.email}</p>
                  </div>
                  {userDetails?.createdAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                      <p className="text-lg font-semibold">{format(new Date(userDetails.createdAt), "MMMM d, yyyy")}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-chart-2" />
                  <CardTitle className="text-base">Account Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-chart-2">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="font-mono font-medium">{authUser?.userId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-chart-1" />
                  <CardTitle className="text-base">Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Email notifications are enabled for your reminders and task updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Configuration */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Backend connection settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">API Base URL</label>
                <p className="font-mono text-sm">{process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}</p>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <h4 className="mb-2 text-sm font-semibold">Environment Setup</h4>
                <p className="mb-2 text-sm text-muted-foreground">
                  To configure the API endpoint, set the following environment variable:
                </p>
                <code className="block rounded bg-background p-2 font-mono text-xs">
                  NEXT_PUBLIC_API_BASE_URL=http://your-backend-url:8080
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  )
}
