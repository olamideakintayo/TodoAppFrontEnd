"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { api } from "@/lib/api"

interface SendEmailDialogProps {
    userId: number
    open: boolean
    onClose: () => void
}

export default function SendEmailDialog({ userId, open, onClose }: SendEmailDialogProps) {
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!email || !subject || !message) {
            toast.error("Please fill all fields")
            return
        }

        try {
            setLoading(true)
            await api.sendEmail(userId, email, subject, message)
            toast.success("✅ Email reminder sent successfully!")
            setEmail("")
            setSubject("")
            setMessage("")
            onClose()
        } catch (err) {
            console.error(err)
            toast.error("❌ Failed to send email reminder")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Email Reminder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Recipient Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    <Textarea
                        placeholder="Your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSend} disabled={loading}>
                        {loading ? "Sending..." : "Send Email"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
