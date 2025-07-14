"use client"
 
import * as React from "react"
import { Bell, Check, ChevronDown, Power, SidebarIcon } from "lucide-react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
 
import { cn } from "@/lib/utils"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import Link from "next/link"
import { BsFillLightningChargeFill } from "react-icons/bs";
import { BiMenuAltRight } from "react-icons/bi";
import { useAuthStore } from "@/store/AuthStore"
import { useRouter } from "next/navigation"
import ReduceTextLength from "@/utils/ReduceTextLength"

const dropdown = [
  {
    value: "profile",
    label: "Profile",
  },
  {
    value: "messages",
    label: "Messages",
  },
  {
    value: "logout",
    label: "logout",
  }
]

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const userInfo = useAuthStore((state) => state.userInfo);
  const clearUserInfo = useAuthStore((state) => state.clearUserInfo);

  const router = useRouter();

  const { setTheme } = useTheme()

  const handleNav = (route: string) => {
    if(route === "profile"){
      router.push("/dashboard/profile");
    } else if(route === "messages"){
      router.push("/dashboard/messages");
    } else {
      clearUserInfo()
      localStorage.removeItem("auth-store");
      router.replace("/login");
    }
  }

  return (
    <header className="flex fixed top-0 z-50 w-full items-center border-b bg-light">
      <div className="flex h-[4rem] w-full items-center gap-2 px-4">
        <div>
          <div className="flex items-center">
            <BsFillLightningChargeFill size={26} className="text-primary"/>
            <h2 className="font-bold text-2xl text-primary">Tivro</h2>
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

          <div className="hidden md:flex">
            <Link href={'/dashboard/messages'}>
              <Button variant="secondary" className="size-[2.5rem] rounded-full relative cursor-pointer">
                <Bell size={28}/>
                <div className="size-2 bg-red-500 rounded-full absolute top-0 right-1"/>
              </Button>
            </Link>
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="hidden md:flex">
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[190px] h-[2.5rem] justify-between rounded-full cursor-pointer border-0 bg-muted"
              > 
                <Avatar className="-mx-2">
                  <AvatarImage src={userInfo?.profile_image} alt="TV"/>
                </Avatar>
                {ReduceTextLength(`${userInfo?.first_name} ${userInfo?.last_name}`, 15)}
                <ChevronDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {dropdown.map((item) => (
                      <button className="w-full" type="button" onClick={() => handleNav(item.value)} key={item.value}>
                        <CommandItem
                            value={item.value}
                            onSelect={(currentValue) => {
                              setValue(currentValue === value ? "" : currentValue)
                              setOpen(false)
                            }}
                          >
                            {item.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                value === item.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                      </button>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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
