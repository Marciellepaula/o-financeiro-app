
import React from 'react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <Sidebar className="hidden md:flex flex-col border-r shadow-sm">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Personal Finance</h1>
          </div>
          <SidebarContent>
            {/* This could be populated with sidebar navigation in the future */}
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
          <header className="h-14 flex items-center px-4 border-b bg-card">
            <div className="flex items-center gap-2">
              {isMobile && (
                <SidebarTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SidebarTrigger>
              )}
              <h2 className="text-lg font-semibold">Finance Dashboard</h2>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
