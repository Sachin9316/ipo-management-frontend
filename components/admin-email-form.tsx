"use client";

import { useAdminPingMutation } from "@/lib/features/auth/authApiSlice";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea component exists
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";

export function AdminEmailForm() {
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sendPing, { isLoading }] = useAdminPingMutation();
    const user = useAppSelector(selectCurrentUser);

    if (user?.role !== "admin") {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendPing({ email, subject, message }).unwrap();
            toast.success("Email sent successfully!");
            setEmail("");
            setSubject("");
            setMessage("");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to send email");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send Email (Admin)</CardTitle>
                <CardDescription>Ping a customer directly via email.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ping-email">Recipient Email</Label>
                        <Input
                            id="ping-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="customer@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ping-subject">Subject</Label>
                        <Input
                            id="ping-subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Important Update"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ping-message">Message</Label>
                        <Textarea
                            id="ping-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Email"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
