"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector } from "@/lib/hooks"
import { selectCurrentUser } from "@/lib/features/auth/authSlice"
import {
    Settings,
    LayoutDashboard,
    List,
    Briefcase,
    FileText,
    Database,
    Users,
    TrendingUp,
    Activity,
    Link as LinkIcon,
    ChevronRight,
    Plus,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "IPO Management",
        icon: Database,
        isActive: true,
        items: [
            {
                title: "Add IPO",
                url: "/dashboard/ipos/add",
                icon: Plus,
            },
            {
                title: "Upcoming IPOs",
                url: "/dashboard/ipos/upcoming",
            },
            {
                title: "Open IPOs",
                url: "/dashboard/ipos/open",
            },
            {
                title: "Closed IPOs",
                url: "/dashboard/ipos/closed",
            },
            {
                title: "Listed IPOs",
                url: "/dashboard/ipos/listed",
            },
        ],
    },
    {
        title: "SME IPOs",
        icon: Database,
        isActive: false,
        items: [
            {
                title: "Upcoming SME",
                url: "/dashboard/sme/upcoming",
            },
            {
                title: "Open SME",
                url: "/dashboard/sme/open",
            },
            {
                title: "Closed SME",
                url: "/dashboard/sme/closed",
            },
            {
                title: "Listed SME",
                url: "/dashboard/sme/listed",
            },
        ],
    },
    {
        title: "Subscription",
        url: "/dashboard/subscription",
        icon: Briefcase,
    },
    {
        title: "GMP Management",
        url: "/dashboard/gmp",
        icon: TrendingUp,
    },
    {
        title: "Listing Info",
        url: "/dashboard/listing-info",
        icon: Activity,
    },
    {
        title: "Documents",
        url: "/dashboard/documents",
        icon: LinkIcon,
    },
    {
        title: "User Management",
        url: "/dashboard/users",
        icon: Users,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const user = useAppSelector(selectCurrentUser)

    return (
        <Sidebar {...props} className="border-r border-border">
            <SidebarContent>
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <span className="text-xl font-bold tracking-tight">IPO Admin</span>
                </div>
                <SidebarGroup className="py-4">
                    <SidebarGroupLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-4 mb-2">Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1 px-2">
                            {items.map((item) => {
                                // Nested Items
                                if (item.items) {
                                    return (
                                        <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton tooltip={item.title} size="lg" className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                                                        {item.icon && <item.icon className="h-5 w-5" />}
                                                        <span className="text-base font-medium">{item.title}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem) => {
                                                            const isSubActive = pathname === subItem.url
                                                            return (
                                                                <SidebarMenuSubItem key={subItem.title}>
                                                                    <SidebarMenuSubButton asChild isActive={isSubActive} size="md">
                                                                        <Link href={subItem.url}>
                                                                            {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                                                                            <span>{subItem.title}</span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            )
                                                        })}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    )
                                }

                                // Single Item
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            size="lg"
                                            isActive={isActive}
                                            className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                                        >
                                            <Link href={item.url} className="flex items-center gap-3 px-4 py-3">
                                                <item.icon className="h-5 w-5" />
                                                <span className="text-base font-medium">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-border p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                            <Link href="/dashboard/profile" className="flex items-center gap-3 w-full">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
                                    <AvatarFallback className="rounded-lg">{user?.name?.slice(0, 2).toUpperCase() || "CN"}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user?.name || "User"}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user?.email || "user@example.com"}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
