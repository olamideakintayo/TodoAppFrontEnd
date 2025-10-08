"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { LoginResponse } from "./api"

interface AuthContextType {
    user: LoginResponse | null
    login: (userData: LoginResponse) => void
    logout: () => void
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<LoginResponse | null>(null)
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        const initAuth = () => {
            try {
                if (typeof window === "undefined") {
                    setInitialized(true)
                    return
                }

                const token = localStorage.getItem("token")
                const userData = localStorage.getItem("user")

                console.log("Auth init - token exists:", !!token, "userData exists:", !!userData)

                if (token && userData) {
                    const parsedUser = JSON.parse(userData)


                    if (parsedUser.userId && !localStorage.getItem("userId")) {
                        localStorage.setItem("userId", String(parsedUser.userId))
                    }

                    console.log("Restoring user:", parsedUser)
                    setUser(parsedUser)
                }
            } catch (err) {
                console.error("Failed to restore auth state:", err)
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token")
                    localStorage.removeItem("user")
                    localStorage.removeItem("userId")
                }
            } finally {
                setInitialized(true)
                console.log("Auth initialized")
            }
        }

        initAuth()
    }, [])

    const login = (userData: LoginResponse) => {
        console.log("Login called with:", userData)
        localStorage.setItem("token", userData.token)
        localStorage.setItem("user", JSON.stringify(userData))


        if (userData.userId) {
            localStorage.setItem("userId", String(userData.userId))
        }

        setUser(userData)
    }

    const logout = () => {
        console.log("Logout called")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("userId")
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                isLoading: !initialized,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
