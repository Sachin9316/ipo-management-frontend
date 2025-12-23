"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { selectCurrentUser, logOut } from "@/lib/features/auth/authSlice"
import {
    Settings,
    LayoutDashboard,
    Briefcase,
    Database,
    Users,
    TrendingUp,
    Activity,
    Link as LinkIcon,
    ChevronRight,
    Plus,
    Command,
    LogOut,
    Sparkles,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Menu items.
const items = [
    {
        title: "Overview", // Group label
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: LayoutDashboard,
            },
        ]
    },
    {
        title: "Management", // Group label
        items: [
            {
                title: "IPO Management",
                icon: Database,
                isActive: true,
                items: [
                    {
                        title: "Add New IPO",
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
                icon: Sparkles,
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
                title: "GMP Manager",
                url: "/dashboard/gmp",
                icon: TrendingUp,
            },
            {
                title: "Subscriptions",
                url: "/dashboard/subscription",
                icon: Briefcase,
            },
        ]
    },
    {
        title: "Tools & Settings", // Group label
        items: [
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
                title: "Users",
                url: "/dashboard/users",
                icon: Users,
            },
            {
                title: "Settings",
                url: "/dashboard/settings",
                icon: Settings,
            },
        ]
    }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const user = useAppSelector(selectCurrentUser)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    const handleLogout = () => {
        dispatch(logOut())
        localStorage.clear()
        router.push("/login")
    }

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-border/50 bg-background/95 backdrop-blur-sm">
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="max-w-[320px] sm:max-w-lg rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                            Log out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                            <Link href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white border border-border/10 shadow-sm">
                                    <img src="/logo.png" alt="Bluestock" className="size-6 object-contain" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-foreground">IPO Wizard</span>
                                    <span className="truncate text-xs text-muted-foreground">Admin Portal</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {items.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    // Handle Nested Items
                                    if (item.items) {
                                        return (
                                            <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton tooltip={item.title} className="hover:bg-sidebar-accent/50 text-foreground/80 hover:text-foreground">
                                                            {item.icon && <item.icon className="text-muted-foreground group-hover/collapsible:text-foreground transition-colors" />}
                                                            <span>{item.title}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.items.map((subItem) => {
                                                                const isSubActive = pathname === subItem.url
                                                                return (
                                                                    <SidebarMenuSubItem key={subItem.title}>
                                                                        <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                                            <Link href={subItem.url} className={isSubActive ? "font-medium text-primary" : "text-muted-foreground"}>
                                                                                {subItem.icon && <subItem.icon />}
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

                                    // Handle Single Items
                                    const isActive = pathname === item.url
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className={`
                                                    transition-all duration-200
                                                    ${isActive
                                                        ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary"
                                                        : "text-foreground/80 hover:bg-sidebar-accent/50 hover:text-foreground"
                                                    }
                                                `}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg border border-border">
                                        <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                                            {user?.name?.slice(0, 2).toUpperCase() || "CN"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name || "User"}</span>
                                        <span className="truncate text-xs text-muted-foreground">{user?.email || "user@example.com"}</span>
                                    </div>
                                    <ChevronRight className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <Link href="/dashboard/profile" className="flex items-center gap-2 px-1 py-1.5 text-left text-sm hover:bg-accent transition-colors rounded-sm cursor-pointer">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
                                            <AvatarFallback className="rounded-lg">{user?.name?.slice(0, 2).toUpperCase() || "CN"}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.name || "User"}</span>
                                            <span className="truncate text-xs text-muted-foreground">{user?.email || "user@example.com"}</span>
                                        </div>
                                    </Link>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/profile" className="cursor-pointer">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Profile Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setShowLogoutDialog(true)}
                                    className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
