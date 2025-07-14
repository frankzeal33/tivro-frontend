"use client"
import {
  ChartNoAxesColumnIncreasing,
  BadgeCheck,
  Users,
  MessageCircleMore,
  CircleUserRound,
  CreditCard,
  CircleHelp,
  LogOut
} from "lucide-react"

import { NavBar } from "@/components/sidebar/nav-bar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { axiosClient } from "@/GlobalApi"
import { toast } from "react-toastify"
import { Loading } from "../Loading"
import { Button } from "../ui/button"
import { useAuthStore } from "@/store/AuthStore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Skeleton from "../Skeleton"
import LightSkeleton from "../LightSkeleton"


const data = { 
  navHeader: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: ChartNoAxesColumnIncreasing,
    },
    {
      title: "Certificates",
      url: "/dashboard/certificates",
      icon: BadgeCheck,
    },
    {
      title: "Tenant/Management",
      url: "/dashboard/tenant-management",
      icon: Users,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: MessageCircleMore,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: CircleUserRound,
    },
    {
      title: "Subscription Plans",
      url: "/dashboard/subscriptions",
      icon: CreditCard,
    },
  ],

  navFooter: [
    {
      title: "Logout",
      url: "#",
      icon: LogOut,
    },
  ],
}

type upgradeType = {
  tokens_used: number; 
  tokens_total: number; 
  usage_percentage: number;
}

type overviewType = {
  Number_of_verification: number;
  Total_verification_requested: number;
  completed_verification: number;
  plan: string
  status: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const [loadingUpgrade, setLoadingUpgrade] = useState(false)
  const [subData, setSubData] = useState<overviewType>({
    Number_of_verification: 0,
    Total_verification_requested: 0,
    completed_verification: 0,
    status: "",
    plan: ""
  })
  const [Upgrade, setUpgrade] = useState<upgradeType>({
    tokens_used: 0, 
    tokens_total: 0, 
    usage_percentage: 0
  })
  const router = useRouter();
  const clearUserInfo = useAuthStore((state) => state.clearUserInfo);

  const getUpgrade = async () => {

    try {

      setLoadingUpgrade(true)
      const [upgradeRes, subRes] = await Promise.all([
        axiosClient.get("/upgrade/usage/"),
        axiosClient.get("/dashboard/")
      ])
      setUpgrade(upgradeRes.data)
      setSubData(subRes.data || {})
      
    } catch (error) {

    } finally {
      setLoadingUpgrade(false)
    }

  }

  useEffect(() => {
    getUpgrade()
  }, [])

  const handleLogout = () => {
    clearUserInfo()
    localStorage.removeItem("auth-store");
    router.replace("/login");
  }

  return (
    <Sidebar
      className="top-[4rem] h-[calc(100%-4rem)]"
      {...props}
    >
      <SidebarContent className="bg-light">
        <NavBar items={data.navHeader} />
        <NavBar items={data.navFooter} className="mt-auto" onLogout={handleLogout} />
        {loadingUpgrade ? (
          <LightSkeleton/>
        ) : (
          (Object.keys(subData).length === 0 ||
            (
              subData.Number_of_verification === 0 &&
              subData.Total_verification_requested === 0 &&
              subData.completed_verification === 0
            )
          ) ? (
            // Card for users with no verification activity
            <Card className="mx-3 bg-muted border-0">
              <CardHeader>
                <CardTitle className="text-sm">Plan Usage</CardTitle>
                <CardDescription className="text-xs">You have not subscribe to a plan yet. Kindly purchase a plan.</CardDescription>
              </CardHeader>
              <CardContent>
              <Progress value={0}/>
              <h2 className="text-primary mt-2">
                <Link href="/dashboard/subscriptions">Purchase Plan</Link>
              </h2>
              </CardContent>
            </Card>
          ) : (
            // Card for users with verification activity
            <Card className="mx-3 bg-muted border-0">
              <CardHeader>
                <CardTitle className="text-sm">Plan Usage</CardTitle>
                <CardDescription className="text-xs">You have used {Upgrade?.usage_percentage ? Upgrade?.usage_percentage : "0"}% of your available space. Need more?</CardDescription>
              </CardHeader>
              <CardContent>
              <Progress value={Upgrade?.usage_percentage}/>
              <h2 className="text-primary mt-2">
                <Link href="/dashboard/subscriptions">Upgrade Plan</Link>
              </h2>
              </CardContent>
            </Card>
          )
        )}

        <Separator className="my-4 mx-3 max-w-[210px]" />

        <div className="mx-3 mb-4 text-xs space-y-2">
          <p>V. 1.0</p>
          <p>©{new Date().getFullYear()} Product of Urello Technologies Limited - 1787613</p>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
