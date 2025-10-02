"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type TodoResponse, type ReminderResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Bell, Mail, Smartphone, Trash2, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

export default function TodoDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated, isLoading } = useAuth()
    const [todo, setTodo] = useState<TodoResponse | null>(null)
    const [reminders, setReminders] = useState<ReminderResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newReminder, setNewReminder] = useState({
        remindAt: "",
        type: "EMAIL" as "EMAIL" | "DESKTOP_NOTIFICATION" | "BOTH",
    })

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated) {
            router.push("/login")
            return
        }
        loadData()
    }, [isAuthenticated, isLoading, router, params.id])

    const loadData = async () => {
        const todoId = Number(params.id)
        if (!Number.isFinite(todoId)) {
            setLoading(false)
            return
        }
        try {
            const [todoData, remindersData] = await Promise.all([
                api.getTodoById(todoId),
                api.getRemindersByTodo(todoId),
            ])
            if (todoData) {
                setTodo(todoData)
            }
            setReminders(remindersData)
        } catch (error) {
            console.error("Failed to load data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateReminder = async (e: React.FormEvent) => {
        e.preventDefault()
        const todoId = Number(params.id)

        try {
            const local = newReminder.remindAt
            const date = new Date(local)

            if (isNaN(date.getTime())) {
                console.error("Invalid date")
                return
            }

            if (date.getTime() < Date.now()) {
                console.error("Remind time must be in the future")
                return
            }

            if (newReminder.type === "BOTH") {
                // Create two reminders: one EMAIL, one DESKTOP_NOTIFICATION
                await Promise.all([
                    api.createReminder(todoId, { remindAt: date.toISOString(), type: "EMAIL" }),
                    api.createReminder(todoId, { remindAt: date.toISOString(), type: "DESKTOP_NOTIFICATION" }),
                ])
            } else {
                // Normal single reminder
                await api.createReminder(todoId, {
                    remindAt: date.toISOString(),
                    type: newReminder.type,
                })
            }

            setNewReminder({ remindAt: "", type: "EMAIL" })
            setCreateDialogOpen(false)
            loadData()
        } catch (error) {
            console.error("Failed to create reminder:", error)
        }
    }

    const handleDeleteReminder = async (id: number) => {
        try {
            await api.deleteReminder(id)
            loadData()
        } catch (error) {
            console.error("Failed to delete reminder:", error)
        }
    }

    const getReminderIcon = (type: string) => {
        switch (type) {
            case "EMAIL":
                return <Mail className="h-4 w-4" />
            case "DESKTOP_NOTIFICATION":
                return <Smartphone className="h-4 w-4" />
            default:
                return <Bell className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!todo) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Todo not found</h2>
                    <Button className="mt-4" onClick={() => router.push("/dashboard")}>
                        Back to Dashboard
                    </Button>
                </div>
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
                        <h1 className="font-mono text-xl font-bold">Task Reminders</h1>
                        <p className="text-xs text-muted-foreground">Manage reminders for your task</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Todo Info Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{todo.title}</CardTitle>
                                {todo.description && <CardDescription className="mt-2">{todo.description}</CardDescription>}
                            </div>
                            {todo.completed && (
                                <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Completed
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    {todo.dueDate && (
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Bell className="h-4 w-4" />
                                Due: {format(new Date(todo.dueDate), "PPP 'at' p")}
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Reminders Section */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Reminders</h2>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Reminder
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Reminder</DialogTitle>
                                <DialogDescription>Set up a reminder for this task</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateReminder} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="remindAt">Remind At</Label>
                                    <Input
                                        id="remindAt"
                                        type="datetime-local"
                                        value={newReminder.remindAt}
                                        onChange={(e) => setNewReminder({ ...newReminder, remindAt: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Notification Type</Label>
                                    <Select
                                        value={newReminder.type}
                                        onValueChange={(value: any) => setNewReminder({ ...newReminder, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EMAIL">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    Email
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="DESKTOP_NOTIFICATION">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4" />
                                                    Desktop Notification
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="BOTH">
                                                <div className="flex items-center gap-2">
                                                    <Bell className="h-4 w-4" />
                                                    Both
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Create Reminder</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Reminders List */}
                {reminders.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {reminders.map((reminder) => (
                            <Card key={reminder.id} className={reminder.triggered ? "opacity-60" : ""}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {getReminderIcon(reminder.type)}
                                            <CardTitle className="text-base">{reminder.type}</CardTitle>
                                        </div>
                                        {reminder.triggered && (
                                            <Badge variant="secondary" className="text-xs">
                                                Triggered
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm">
                                        <p className="text-muted-foreground">Scheduled for</p>
                                        <p className="font-medium">{format(new Date(reminder.remindAt), "PPP 'at' p")}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteReminder(reminder.id)}
                                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Reminder
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mb-2 text-lg font-semibold">No reminders set</h3>
                            <p className="mb-4 text-sm text-muted-foreground">Add a reminder to get notified about this task</p>
                            <Button onClick={() => setCreateDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Reminder
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
