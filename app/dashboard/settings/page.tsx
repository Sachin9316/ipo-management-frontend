"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminEmailForm } from "@/components/admin-email-form"

const settingsSchema = z.object({
    currency: z.string(),
    notifications: z.boolean(),
    theme: z.string(),
})

export default function SettingsPage() {
    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            currency: "INR",
            notifications: true,
            theme: "light",
        },
    })

    function onSubmit(data: z.infer<typeof settingsSchema>) {
        toast.success("Settings updated successfully")
        console.log(data)
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and set e-mail preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure the dashboard behavior.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Currency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Currencies</SelectLabel>
                                                    <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                                                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            This is the currency that will be used in the dashboard.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="notifications"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Email Notifications</FormLabel>
                                            <FormDescription>
                                                Receive emails when a new IPO is listed.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Update settings</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <AdminEmailForm />
        </div>
    )
}
