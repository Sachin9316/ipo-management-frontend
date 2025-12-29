"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import moment from "moment"
import { CalendarDays, AlertCircle } from "lucide-react"

interface ActivityFeedProps {
    ipos: any[]
}

export function ActivityFeed({ ipos }: ActivityFeedProps) {
    const today = moment();
    const threeDaysFromNow = moment().add(3, 'days');

    const events = ipos.flatMap(ipo => {
        const evts = [];
        const name = ipo.companyName;

        const open = moment(ipo.open_date);
        const close = moment(ipo.close_date);
        const list = moment(ipo.listing_date);

        if (open.isBetween(today, threeDaysFromNow, 'day', '[]')) {
            evts.push({ type: 'Opening', date: open, name, color: 'text-blue-600' });
        }
        if (close.isSame(today, 'day')) {
            evts.push({ type: 'Closing Today', date: close, name, color: 'text-red-600' });
        } else if (close.isBetween(today, threeDaysFromNow, 'day', ']')) {
            evts.push({ type: 'Closing Soon', date: close, name, color: 'text-orange-600' });
        }
        if (list.isBetween(today, threeDaysFromNow, 'day', '[]')) {
            evts.push({ type: 'Listing', date: list, name, color: 'text-green-600' });
        }
        return evts;
    }).sort((a, b) => a.date.diff(b.date));

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Upcoming Activity</CardTitle>
                <CardDescription>
                    Events in the next 3 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.length === 0 && <div className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="h-4 w-4" /> No upcoming events.</div>}
                    {events.slice(0, 5).map((evt, idx) => (
                        <div key={idx} className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
                            <div className={`w-2 h-2 rounded-full ${evt.color === 'text-red-600' ? 'bg-red-600' : evt.color === 'text-blue-600' ? 'bg-blue-600' : evt.color === 'text-green-600' ? 'bg-green-600' : 'bg-orange-400'}`} />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {evt.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {evt.type} • {evt.date.format('dddd, DD MMM')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
