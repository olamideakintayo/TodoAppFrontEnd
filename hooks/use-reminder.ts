import { useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const triggeredReminders = new Set<number>()

export function useReminder() {
    const { user, isAuthenticated } = useAuth()

    useEffect(() => {
        // Gracefully handle missing user or email
        if (!isAuthenticated || !user?.email) {
            console.log("Reminder hook inactive: no authenticated user")
            return
        }

        //  Resolve userId safely (from context or localStorage)
        const userId =
            typeof user.userId === "number"
                ? user.userId
                : Number(localStorage.getItem("userId"))

        if (!userId || isNaN(userId)) {
            console.warn("No valid userId found, skipping reminders")
            return
        }

        // Request desktop notification permission if needed
        if (Notification.permission === "default") {
            Notification.requestPermission().then((result) => {
                console.log("Notification permission:", result)
            })
        }

        console.log("Reminder watcher active for userId:", userId)

        const interval = setInterval(async () => {
            try {
                const todos = await api.getTodosByUser(userId)
                if (!todos?.length) return

                for (const todo of todos) {
                    const reminders = await api.getRemindersByTodo(todo.id)
                    if (!reminders?.length) continue

                    for (const reminder of reminders) {
                        const now = new Date()
                        const remindAt = new Date(reminder.remindAt)

                        const shouldTrigger =
                            !triggeredReminders.has(reminder.id) && remindAt <= now

                        if (shouldTrigger) {
                            triggeredReminders.add(reminder.id)

                            // ✅ Desktop notification
                            if (
                                reminder.type === "DESKTOP_NOTIFICATION" ||
                                reminder.type === "BOTH"
                            ) {
                                new Notification("Task Reminder", {
                                    body: `Task: ${todo.title}`,
                                })
                            }


                            if (
                                reminder.type === "EMAIL" ||
                                reminder.type === "BOTH"
                            ) {
                                await api.sendEmail(
                                    userId,
                                    "Task Reminder",
                                    `Reminder for task: ${todo.title}`,
                                )
                            }

                            // ✅ Mark reminder as triggered or updated
                            if (reminder.type === "EMAIL" || reminder.type === "DESKTOP_NOTIFICATION") {
                                await api.updateReminder(reminder.id, {
                                    remindAt: reminder.remindAt,
                                    type: reminder.type,
                                })
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Reminder poller error:", err)
            }
        }, 60_000)

        return () => {
            clearInterval(interval)
            console.log("Reminder watcher stopped for userId:", userId)
        }
    }, [user?.userId, isAuthenticated, user?.email])
}
