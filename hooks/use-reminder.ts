import { useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
export function useReminder(userId: number | null) {
    const { user } = useAuth()

    useEffect(() => {
        if (!userId || !user?.email) return

        if (Notification.permission !== "granted") {
            Notification.requestPermission()
        }

        const interval = setInterval(async () => {
            try {
                const todos = await api.getTodosByUser(userId)

                for (const todo of todos) {
                    const reminders = await api.getRemindersByTodo(todo.id)

                    for (const rem of reminders) {
                        const now = new Date()
                        const remindAt = new Date(rem.remindAt)

                        if (!rem.triggered && remindAt <= now) {
                            if (rem.type === "DESKTOP_NOTIFICATION") {
                                new Notification("Reminder", { body: `Task: ${todo.title}` })
                            }

                            if (rem.type === "EMAIL") {
                                await fetch(
                                    `${API_BASE_URL}/api/push-subscriptions/${userId}/send-email?subject=Task Reminder&message=${encodeURIComponent(
                                        `Reminder for task: ${todo.title}`
                                    )}`,
                                    { method: "POST" }
                                )
                            }




                            await api.updateReminder(rem.id, {
                                remindAt: rem.remindAt,
                                type: rem.type,
                                todoId: rem.todoId
                            })
                        }
                    }
                }
            } catch (err) {
                console.error("Reminder poller error:", err)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [userId, user?.email])
}
