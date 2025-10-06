"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        console.log("ProtectedRoute - isLoading:", isLoading, "isAuthenticated:", isAuthenticated)

        if (isLoading) return
        if (!isAuthenticated) {
            console.log("Not authenticated, redirecting to login")
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
        console.log("Showing loading spinner")
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!isAuthenticated) {
        console.log("Not authenticated, returning null")
        return null
    }

    console.log("Rendering protected content")
    return <>{children}</>
}