import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavBar({
  items,
  onLogout,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
  onLogout?: () => void
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {

  const pathname = usePathname()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                {item.title === "Logout" && onLogout ? (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-5 font-semibold text-left hover:bg-primary group"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </button>
                ) : (
                  <Link
                    href={item.url}
                    className={`px-4 py-5 font-semibold ${pathname === item.url && 'bg-primary group'}`}
                  >
                    <item.icon className={`${pathname === item.url && 'text-primary-foreground group-hover:text-black'}`} />
                    <span className={`${pathname === item.url && 'text-primary-foreground group-hover:text-black'}`}>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
