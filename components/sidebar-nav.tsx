"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Settings,
  FileText,
  Target,
  Mail,
  Phone,
  Building2,
  Home,
  UserPlus,
  Calendar,
  DollarSign,
} from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "#",
    icon: Home,
    badge: null,
  },
  {
    title: "Leads",
    href: "#",
    icon: Users,
    badge: "23",
  },
  {
    title: "Oportunidades",
    href: "#",
    icon: Target,
    badge: "8",
  },
  {
    title: "Novo Lead",
    href: "#",
    icon: UserPlus,
    badge: null,
  },
  {
    title: "Agenda",
    href: "#",
    icon: Calendar,
    badge: "3",
  },
  {
    title: "Pipeline",
    href: "#",
    icon: DollarSign,
    badge: null,
  },
  {
    title: "Email Marketing",
    href: "#",
    icon: Mail,
    badge: null,
  },
  {
    title: "Chamadas",
    href: "#",
    icon: Phone,
    badge: "2",
  },
  {
    title: "Relatórios",
    href: "#",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "Analytics",
    href: "#",
    icon: FileText,
    badge: null,
  },
  {
    title: "Configurações",
    href: "#",
    icon: Settings,
    badge: null,
  },
]

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">CRM Pro</span>
              <span className="text-xs text-muted-foreground">v2.0</span>
            </div>
          </div>
          <div className="space-y-1">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                variant={item.title === "Dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <a href={item.href} className="flex items-center gap-2">
                  <item.icon className="size-4" />
                  {item.title}
                  {item.badge && (
                    <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
