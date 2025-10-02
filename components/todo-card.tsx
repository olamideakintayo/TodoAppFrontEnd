"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trash2, Check, Circle, Bell } from "lucide-react"
import type { TodoResponse } from "@/lib/api"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { useRouter } from "next/navigation"

interface TodoCardProps {
  todo: TodoResponse
  onToggleComplete: (todo: TodoResponse) => void
  onDelete: (id: number) => void
}

export function TodoCard({ todo, onToggleComplete, onDelete }: TodoCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(todo.id)
  }

  const getDueDateInfo = () => {
    if (!todo.dueDate) return null

    const dueDate = new Date(todo.dueDate)
    const isOverdue = isPast(dueDate) && !todo.completed

    let label = format(dueDate, "MMM d, yyyy")
    let variant: "default" | "secondary" | "destructive" = "secondary"

    if (isToday(dueDate)) {
      label = "Today"
      variant = "default"
    } else if (isTomorrow(dueDate)) {
      label = "Tomorrow"
      variant = "default"
    } else if (isOverdue) {
      label = "Overdue"
      variant = "destructive"
    }

    return { label, variant, isOverdue }
  }

  const dueDateInfo = getDueDateInfo()

  return (
    <Card className={`transition-all hover:shadow-md ${todo.completed ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => onToggleComplete(todo)}
              className="mt-1 flex-shrink-0 transition-colors hover:text-chart-2"
            >
              {todo.completed ? (
                <Check className="h-5 w-5 text-chart-2" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <CardTitle className={`text-base ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.title}
              </CardTitle>
              {todo.description && <CardDescription className="mt-1 line-clamp-2">{todo.description}</CardDescription>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {dueDateInfo && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Badge variant={dueDateInfo.variant} className="text-xs">
              {dueDateInfo.label}
            </Badge>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => router.push(`/todos/${todo.id}`)}
          >
            <Bell className="mr-2 h-3 w-3" />
            Reminders
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
