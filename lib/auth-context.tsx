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
        try {
            const token = localStorage.getItem("token")
            const userData = localStorage.getItem("user")

            if (token && userData) {
                setUser(JSON.parse(userData))
            }
        } catch (err) {
            console.error("Failed to restore auth state:", err)
            localStorage.removeItem("token")
            localStorage.removeItem("user")
        } finally {
            setInitialized(true)
        }
    }, [])

    const login = (userData: LoginResponse) => {
        localStorage.setItem("token", userData.token)
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
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
