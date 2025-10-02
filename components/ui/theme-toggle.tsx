"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    const current = theme === "system" ? systemTheme : theme

    return (
        <button
            onClick={() => setTheme(current === "dark" ? "light" : "dark")}
            className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            {current === "dark" ? "Switch to Light" : "Switch to Dark"}
        </button>
    )
}