"use client"

import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type TodoResponse } from "@/lib/api"
import { useReminder } from "@/hooks/use-reminder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckSquare, Plus, LogOut, User, Check, Clock } from "lucide-react"
import { TodoCard } from "@/components/todo-card"

export default function DashboardPage() {
    const router = useRouter()
    const { user, logout } = useAuth()

    const userId = user?.userId ?? null


    const [todos, setTodos] = useState<TodoResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newTodo, setNewTodo] = useState({
        title: "",
        description: "",
        dueDate: "",
    })

    useReminder(userId)

    useEffect(() => {
        if (userId) loadTodos()
    }, [userId])

    const loadTodos = async () => {
        if (!userId) return
        try {
            const data = await api.getTodosByUser(userId)
            setTodos(data)
        } catch (error) {
            console.error("Failed to load todos:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return

        try {
            const todoData = {
                title: newTodo.title,
                description: newTodo.description || undefined,
                dueDate: newTodo.dueDate || undefined,
            }
            await api.createTodo(userId, todoData)
            setNewTodo({ title: "", description: "", dueDate: "" })
            setCreateDialogOpen(false)
            loadTodos()
        } catch (error) {
            console.error("Failed to create todo:", error)
        }
    }

    const handleToggleComplete = async (todo: TodoResponse) => {
        try {
            await api.updateTodo(todo.id, {
                title: todo.title,
                description: todo.description,
                dueDate: todo.dueDate,
                completed: !todo.completed,
            })
            loadTodos()
        } catch (error) {
            console.error("Failed to update todo:", error)
        }
    }

    const handleDeleteTodo = async (id: number) => {
        try {
            await api.deleteTodo(id)
            loadTodos()
        } catch (error) {
            console.error("Failed to delete todo:", error)
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const activeTodos = todos.filter((t) => !t.completed)
    const completedTodos = todos.filter((t) => t.completed)

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b border-border bg-card">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <CheckSquare className="h-7 w-7 text-primary" />
                            <div>
                                <h1 className="font-mono text-xl font-bold">Tasking</h1>
                                <p className="text-xs text-muted-foreground">
                                    Welcome back, {user?.username}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4 text-red-500 " />
                                <div className="text-red-500">Logout</div>
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Total Tasks</CardDescription>
                                <CardTitle className="text-3xl font-mono">{todos.length}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Active Tasks</CardDescription>
                                <CardTitle className="text-3xl font-mono text-chart-2">
                                    {activeTodos.length}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Completed</CardDescription>
                                <CardTitle className="text-3xl font-mono text-muted-foreground">
                                    {completedTodos.length}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Create Todo Button */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Your Tasks</h2>
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card/95 backdrop-blur-sm">
                                <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                    <DialogDescription>Add a new task to your list</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateTodo} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="Task title"
                                            value={newTodo.title}
                                            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Task description (optional)"
                                            value={newTodo.description}
                                            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Input
                                            id="dueDate"
                                            type="datetime-local"
                                            value={newTodo.dueDate}
                                            onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCreateDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">Create Task</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Active Todos */}
                    {activeTodos.length > 0 && (
                        <div className="mb-8">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Clock className="h-5 w-5 text-chart-2" />
                                Active Tasks
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {activeTodos.map((todo) => (
                                    <TodoCard
                                        key={todo.id}
                                        todo={todo}
                                        onToggleComplete={handleToggleComplete}
                                        onDelete={handleDeleteTodo}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Todos */}
                    {completedTodos.length > 0 && (
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                                <Check className="h-5 w-5" />
                                Completed Tasks
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {completedTodos.map((todo) => (
                                    <TodoCard
                                        key={todo.id}
                                        todo={todo}
                                        onToggleComplete={handleToggleComplete}
                                        onDelete={handleDeleteTodo}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {todos.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <CheckSquare className="mb-4 h-16 w-16 text-muted-foreground/50" />
                                <h3 className="mb-2 text-xl font-semibold">No tasks yet</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Create your first task to get started
                                </p>
                                <Button onClick={() => setCreateDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Task
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    )
}
