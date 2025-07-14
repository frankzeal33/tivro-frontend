"use client"
import { ThemeProvider } from "@/components/theme-provider"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/tenant-header/site-header";
import { AppSidebar } from "@/components/tenant-header/app-side";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import Image from "next/image";

export default function  RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const hydrated = useIsHydrated()

  if (!hydrated) {
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
          <SidebarProvider className="flex flex-col">
            <SiteHeader />
            <div className="flex flex-col flex-1">
              <AppSidebar />
              <SidebarInset>
                <main className="px-4 md:px-6 p-6 pt-[6rem] lg:pt-6">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </div>
      </ThemeProvider>
    </>
  )
}
