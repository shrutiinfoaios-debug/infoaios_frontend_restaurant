import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Phone,
  Calendar,
  ShoppingBag,
  MessageSquare,
  Menu as MenuIcon,
  Settings,
  UtensilsCrossed,
  X,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Call Logs', url: '/call-logs', icon: Phone },
  { title: 'Bookings', url: '/bookings', icon: Calendar },
  { title: 'Orders', url: '/orders', icon: ShoppingBag },
  { title: 'Feedbacks', url: '/feedbacks', icon: MessageSquare },
  { title: 'Menus', url: '/menus', icon: MenuIcon },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  const [userDetails, setUserDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      setUserDetails(JSON.parse(storedUserDetails));
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const filteredItems = menuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-gradient-to-b from-sidebar-background via-sidebar-background to-sidebar-background/95 backdrop-blur-xl">
        {/* Logo Section */}
        <div className="p-5 border-b border-sidebar-border/30 relative">
          <button
            onClick={toggleSidebar}
            className="md:hidden absolute top-4 right-4 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <NavLink to="/dashboard" className="cursor-pointer">
              <div className={cn(
                "rounded-2xl flex items-center justify-center flex-shrink-0 relative group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300",
                collapsed ? "w-8 h-8" : "w-11 h-11"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent animate-gradient-shift"></div>
                <div className="absolute inset-[2px] bg-sidebar-background rounded-xl"></div>
                <span className="text-white relative z-10 group-hover:scale-110 transition-transform duration-300 font-bold text-lg">
                                      {userDetails?.restaurantName?.charAt(0).toUpperCase() || 'R'}

                </span>
              </div>
            </NavLink>
            {!collapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                 <NavLink to="/dashboard" className="cursor-pointer">
                <h2 className="text-base font-bold bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/70 bg-clip-text text-transparent">
                  {userDetails?.restaurantName || 'Restaurant Admin'}
                </h2>
               
                  <p className="text-xs text-sidebar-foreground/50 font-medium hover:text-sidebar-foreground transition-colors"> Management Portal</p>
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <SidebarGroup className="px-3 py-6">
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] font-bold uppercase tracking-widest px-4 mb-3">
              Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      className={cn(
                        "h-12 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                        active 
                          ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border-l-4 border-primary shadow-lg hover:shadow-xl" 
                          : "hover:bg-sidebar-accent/40 border-l-4 border-transparent hover:border-sidebar-border/50"
                      )}
                    >
                      <NavLink 
                        to={item.url} 
                        className={cn(
                          "flex items-center transition-all duration-300",
                          collapsed ? "justify-center" : "gap-4 px-4"
                        )}
                      >
                        <div className={cn(
                          "rounded-xl transition-all duration-300",
                          collapsed ? "" : "p-2",
                          active 
                            ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-inner" 
                            : "group-hover:bg-sidebar-accent/30"
                        )}>
                          <item.icon className={cn(
                            "h-5 w-5 transition-all duration-300",
                            active 
                              ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                              : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground group-hover:scale-110"
                          )} />
                        </div>
                        {!collapsed && (
                          <span className={cn(
                            "font-semibold text-sm transition-all duration-300 tracking-wide",
                            active 
                              ? "text-primary" 
                              : "text-sidebar-foreground/80 group-hover:text-sidebar-foreground"
                          )}>
                            {item.title}
                          </span>
                        )}
                        {active && !collapsed && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></div>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
