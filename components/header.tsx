"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header() {
    return (
        <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold">Tasking</h1>
            <ThemeToggle />
        </div>
    )
}