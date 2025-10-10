import { toast } from "@/components/ui/use-toast"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

export interface LoginRequest {
    usernameOrEmail: string
    password: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
}

export interface TodoRequest {
    title: string
    description?: string
    dueDate?: string
}

export interface ReminderRequest {
    remindAt: string
    type: "EMAIL" | "DESKTOP_NOTIFICATION"
}

export interface LoginResponse {
    message: string
    token: string
    userId: number
    username: string
    email: string
    createdAt?: string
}

export interface UserResponse {
    id: number
    username: string
    email: string
    createdAt: string
}

export interface TodoResponse {
    id: number
    title: string
    description: string
    dueDate: string | null
    completed: boolean
    createdAt: string
    updatedAt: string
}

export interface ReminderResponse {
    id: number
    remindAt: string
    type: FrontendReminderType
    todoId: number
}

export type FrontendReminderType = "EMAIL" | "DESKTOP_NOTIFICATION" | "BOTH"

export type CreateReminderRequest = {
    remindAt: string
    type: FrontendReminderType
}

class ApiClient {
    private getAuthHeader(): HeadersInit {
        const token = localStorage.getItem("token")
        return token ? {Authorization: `Bearer ${token}`} : {}
    }

    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Login failed")
        return response.json()
    }

    async register(data: RegisterRequest): Promise<UserResponse> {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Registration failed")
        return response.json()
    }

    async getTodosByUser(userId: number): Promise<TodoResponse[]> {
        const response = await fetch(`${API_BASE_URL}/api/todos/user/${userId}`, {
            headers: this.getAuthHeader(),
        })
        if (response.status === 404) return []
        if (!response.ok) throw new Error(`Failed to fetch todos (${response.status})`)
        return response.json()
    }

    async getTodoById(id: number): Promise<TodoResponse> {
        const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
            headers: this.getAuthHeader(),
        })
        if (!response.ok) throw new Error("Failed to fetch todo")
        return response.json()
    }

    async createTodo(userId: number, data: TodoRequest): Promise<TodoResponse> {
        const response = await fetch(`${API_BASE_URL}/api/todos/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Failed to create todo")
        return response.json()
    }

    async updateTodo(
        id: number,
        data: {
            title: string
            description: string
            dueDate: string | null
            completed: boolean
        }
    ): Promise<TodoResponse> {
        const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Failed to update todo")
        return response.json()
    }

    async deleteTodo(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeader(),
        })
        if (!response.ok) throw new Error("Failed to delete todo")
    }

    async sendEmail(userId: number, subject: string,  message: string): Promise<void> {
        const url =
            `${API_BASE_URL}/api/push-subscriptions/${userId}/send-email` +
            `?subject=${encodeURIComponent(subject)}` +
            `&message=${encodeURIComponent(message)}`

        const response = await fetch(url, {
            method: "POST",
            headers: {
                ...this.getAuthHeader(),
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to send email notification (${response.status})`)
        }
    }


    async getRemindersByTodo(todoId: number): Promise<ReminderResponse[]> {
        const response = await fetch(`${API_BASE_URL}/api/reminders/todo/${todoId}`, {
            headers: this.getAuthHeader(),
        })
        if (!response.ok) throw new Error("Failed to fetch reminders")
        return response.json()
    }


async createReminder(todoId: number, data?: CreateReminderRequest): Promise<ReminderResponse[]> {
    if (!data || !data.type || !data.remindAt) {
    throw new Error("Invalid reminder request: missing type or remindAt")
}

const remindAtISO = new Date(data.remindAt).toISOString()
const remindersToCreate: ReminderRequest[] =
    data.type === "BOTH"
        ? [
            { remindAt: remindAtISO, type: "EMAIL" },
            { remindAt: remindAtISO, type: "DESKTOP_NOTIFICATION" },
        ]
        : [{ remindAt: remindAtISO, type: data.type }]

const results: ReminderResponse[] = []
const userId = Number(localStorage.getItem("userId"))

for (const reminder of remindersToCreate) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reminders/${todoId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify(reminder),
        })

        if (response.status === 409) {
            toast({
                title: "Duplicate Reminder ⚠️",
                description: `A reminder already exists for this todo at ${new Date(reminder.remindAt).toLocaleString()}.`,
                variant: "destructive",
            })
            console.warn(`Duplicate reminder detected for todo ${todoId}`)
            continue
        }

        if (!response.ok) {
            const errText = await response.text()
            console.error("Backend error:", errText)
            toast({
                title: "Error",
                description: "Failed to create reminder. Please try again.",
                variant: "destructive",
            })
            throw new Error("Failed to create reminder")
        }

        const createdReminder = await response.json()
        results.push(createdReminder)

        // ✅ Show success toast
        toast({
            title: "Reminder Created 🎉",
            description: `Your ${reminder.type
                .toLowerCase()
                .replace("_", " ")} reminder has been set for ${new Date(
                reminder.remindAt
            ).toLocaleString()}.`,
        })

        // ✅ Send email if type is EMAIL
        if (reminder.type === "EMAIL") {
            await this.sendEmail(
                userId,
                "Reminder Notification",
                `Reminder set for todoId: ${todoId} at ${reminder.remindAt}`
            )
        }
    } catch (error) {
        console.error("createReminder error:", error)
        toast({
            title: "Error",
            description: "Something went wrong while creating the reminder.",
            variant: "destructive",
        })
    }
}

return results
}




async updateReminder(id: number, data: ReminderRequest): Promise<ReminderResponse> {
        const response = await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Failed to update reminder")
        return response.json()
    }

    async deleteReminder(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeader(),
        })
        if (!response.ok) throw new Error("Failed to delete reminder")
    }

    async getUserById(id: number): Promise<UserResponse> {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            headers: this.getAuthHeader(),
        })
        if (!response.ok) throw new Error("Failed to fetch user")
        return response.json()
    }
}

export const api = new ApiClient()
