"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type TodoResponse, type ReminderResponse, type CreateReminderRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Plus,
    Bell,
    Mail,
    Smartphone,
    Trash2,
    CheckCircle2,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function TodoDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated, isLoading } = useAuth()

    const [todo, setTodo] = useState<TodoResponse | null>(null)
    const [reminders, setReminders] = useState<ReminderResponse[]>([])
    const [loading, setLoading] = useState(true)

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    const [newReminder, setNewReminder] = useState<CreateReminderRequest>({
        remindAt: "",
        type: "EMAIL",
    })

    const [editTodo, setEditTodo] = useState({
        title: "",
        description: "",
        dueDate: "",
        completed: false,
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
            const [todoRes, remindersRes] = await Promise.all([
                api.getTodoById(todoId),
                api.getRemindersByTodo(todoId),
            ])
            setTodo(todoRes)
            setReminders(remindersRes)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load todo details")
        } finally {
            setLoading(false)
        }
    }

    // Edit Todo
    const handleOpenEditDialog = () => {
        if (!todo) return
        setEditTodo({
            title: todo.title,
            description: todo.description || "",
            dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : "",
            completed: todo.completed,
        })
        setEditDialogOpen(true)
    }

    const handleUpdateTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!todo) return
        try {
            const updatedTodo = {
                title: editTodo.title,
                description: editTodo.description,
                dueDate: editTodo.dueDate ? new Date(editTodo.dueDate).toISOString() : null,
                completed: editTodo.completed,
            }
            const saved = await api.updateTodo(todo.id, updatedTodo)
            setTodo(saved)
            setEditDialogOpen(false)
            toast.success("Todo updated successfully")
        } catch (err) {
            console.error(err)
            toast.error("Failed to update todo")
        }
    }

    // Create Reminder
    const handleCreateReminder = async (e: React.FormEvent) => {
        e.preventDefault()
        const todoId = Number(params.id)
        if (!newReminder.remindAt) {
            toast.error("Please select a date and time")
            return
        }
        if (new Date(newReminder.remindAt).getTime() < Date.now()) {
            toast.error("Remind time must be in the future")
            return
        }
        try {
            await api.createReminder(todoId, newReminder)
            setNewReminder({ remindAt: "", type: "EMAIL" })
            setCreateDialogOpen(false)
            loadData()
            toast.success("Reminder created successfully")
        } catch (err) {
            console.error(err)
            toast.error("Failed to create reminder")
        }
    }

    const handleDeleteReminder = async (id: number) => {
        try {
            await api.deleteReminder(id)
            setReminders((prev) => prev.filter((r) => r.id !== id))
            toast.success("Reminder deleted")
        } catch (err) {
            console.error(err)
            toast.error("Failed to delete reminder")
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

    // UI States
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

            {/* Main */}
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Todo Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{todo.title}</CardTitle>
                                {todo.description && (
                                    <CardDescription className="mt-2">{todo.description}</CardDescription>
                                )}
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
                    <CardContent>
                        <Button onClick={handleOpenEditDialog}>Edit Todo</Button>
                    </CardContent>
                </Card>

                {/* Reminders */}
                <section className="mt-8">
                    {reminders.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {reminders.map((r) => (
                                <Card key={r.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                {getReminderIcon(r.type)}
                                                <CardTitle className="text-base">{r.type}</CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="text-sm">
                                            <p className="text-muted-foreground">Scheduled for</p>
                                            <p className="font-medium">{format(new Date(r.remindAt), "PPP 'at' p")}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteReminder(r.id)}
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
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Add a reminder to get notified about this task
                                </p>
                                <Button onClick={() => setCreateDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Reminder
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Create Reminder Dialog */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Reminder</DialogTitle>
                            <DialogDescription>Set a reminder for this task</DialogDescription>
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
                                <Label>Type</Label>
                                <Select
                                    value={newReminder.type}
                                    onValueChange={(val) => setNewReminder({ ...newReminder, type: val as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMAIL">Email</SelectItem>
                                        <SelectItem value="DESKTOP_NOTIFICATION">Desktop Notification</SelectItem>
                                        <SelectItem value="BOTH">Both</SelectItem>
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

                {/* Edit Todo Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Todo</DialogTitle>
                            <DialogDescription>Update your todo details</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateTodo} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={editTodo.title}
                                    onChange={(e) => setEditTodo({ ...editTodo, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={editTodo.description}
                                    onChange={(e) => setEditTodo({ ...editTodo, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="datetime-local"
                                    value={editTodo.dueDate}
                                    onChange={(e) => setEditTodo({ ...editTodo, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="completed"
                                    type="checkbox"
                                    checked={editTodo.completed}
                                    onChange={(e) => setEditTodo({ ...editTodo, completed: e.target.checked })}
                                />
                                <Label htmlFor="completed">Completed</Label>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}
