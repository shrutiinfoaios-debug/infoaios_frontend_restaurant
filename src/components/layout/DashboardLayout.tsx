import { ReactNode, useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import { AIRobotAnimation } from '@/components/AIRobotAnimation';
import { Button } from '@/components/ui/button';
import { PhoneCall  } from "lucide-react";



interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <Header />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden max-w-full">
            <div className="max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* AI Chat Button */}
   
      <div className="fixed bottom-10 right-6 z-50 group">
  <Button
    variant="outline"
    className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center
               bg-gradient-to-br from-primary to-accent
               hover:from-primary/90 hover:to-accent/90
               transition-all duration-300 ease-in-out
               transform group-hover:scale-110 animate-pulse"
    style={{ animationDuration: '2s' }}
    aria-label="Open AI Chat"
  >
    {/* 3D Voice AI Icon */}
    <PhoneCall 
      className="w-8 h-8 text-white drop-shadow-[0_4px_10px_rgba(255,255,255,0.7)]
                 transform transition-all duration-300 group-hover:scale-125
                 group-hover:rotate-6"
    />
    
    {/* Outer 3D Glow Ring */}
    <span className="absolute inset-0 rounded-full
                     bg-gradient-to-br from-white/20 to-transparent
                     blur-xl opacity-80 group-hover:opacity-100
                     transition-all duration-500">
    </span>
  </Button>
</div>
    

      
    </SidebarProvider>
  );
};
