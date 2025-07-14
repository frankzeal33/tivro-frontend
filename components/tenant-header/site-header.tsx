"use client"
 
import * as React from "react"
import { ArrowUpRight, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { BiMenuAltRight } from "react-icons/bi";
import Link from "next/link"
import Image from "next/image"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const { setTheme } = useTheme()

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-light">
      <div className="flex h-[4rem] w-full items-center gap-2 px-4">
        <div>
          <div className="flex items-center">
            <Image src={"/next-assets/tivro.png"} width={30} height={90} className="size-6" alt="Tivro"/>
            <h2 className="font-bold text-2xl">IVRO</h2>
          </div>
        </div>
        <div className="w-full sm:ml-auto flex items-center justify-end gap-2" >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full size-[2.5rem] border-0 bg-muted cursor-pointer">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={'/'} className="hidden md:block">
            <Button>Visit website<ArrowUpRight className="size-5"/></Button>
          </Link>

          <Button
            className="h-9 w-9 md:hidden bg-muted"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <BiMenuAltRight className="size-7"/>
          </Button>
        </div>
      </div>
    </header>
  )
}
