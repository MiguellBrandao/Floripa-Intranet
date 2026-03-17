import { PlatformLayoutHeader } from "@/components/platform-layout-header"
import { PlatformSidebar } from "@/components/platform-sidebar"
import { SuperAdminSessionGuard } from "@/components/super-admin-session-guard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SuperAdminSessionGuard>
      <SidebarProvider>
        <PlatformSidebar />
        <SidebarInset className="bg-[linear-gradient(180deg,_#f5f1e5_0%,_#ede6d5_100%)]">
          <PlatformLayoutHeader />
          <div className="flex flex-1 flex-col p-4 pt-0 md:p-6 md:pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SuperAdminSessionGuard>
  )
}
