import { useEffect } from "react"
import { api } from "@/lib/api"

export function useReminderPoller(userId: number | null) {
    useEffect(() => {
        if (!userId) return

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

                            await api.updateReminder(rem.id, {
                                remindAt: rem.remindAt,
                                type: rem.type,
                                todoId: rem.todoId,
                            })
                        }
                    }
                }
            } catch (err) {
                console.error("Reminder poller error:", err)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [userId])
}
