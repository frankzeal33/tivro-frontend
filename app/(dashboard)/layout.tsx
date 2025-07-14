"use client"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/sidebar/app-side"
import { SiteHeader } from "@/components/sidebar/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import ZustandHydration from "@/hooks/ZustandHydration";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/AuthStore";
import Image from "next/image"

export default function  RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const router = useRouter()
  const hydrated = useIsHydrated()
  const userInfo = useAuthStore((state) => state.userInfo)

  useEffect(() => {
    if (hydrated && !userInfo?.access) {
      router.replace("/login")
    }
  }, [hydrated, userInfo, router])

  if (!hydrated || !userInfo?.access) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="flex items-center">
          <Image src={"/next-assets/tivro.png"} width={30} height={70} className="size-6" alt="Tivro"/>
          <h2 className="font-bold text-2xl">IVRO</h2>
        </div>
        <p className="text-sm text-bold mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="[--header-height:calc(theme(spacing.14))]">
          {/* <ZustandHydration> */}
            <SidebarProvider className="flex flex-col">
              <SiteHeader />
              <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset>
                  <main className="w-full px-6 pt-[6rem] pb-[3rem]">
                    {children}
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          {/* </ZustandHydration> */}
        </div>
      </ThemeProvider>
    </>
  )
}
