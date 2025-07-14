"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "../ui/button"
import { ArrowUpRight } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-[4rem] h-[calc(100svh-4rem] md:hidden"
      {...props}
    >
      <SidebarContent className="bg-light">
        <SidebarGroup {...props}>
          <SidebarGroupContent>
            <SidebarMenu>
              <Link href={'/'}>
                <Button className="w-full">Visit website<ArrowUpRight className="size-5"/></Button>
              </Link>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
