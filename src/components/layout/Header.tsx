import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, User, Settings, LogOut, Bell, ShoppingCart, CalendarClock, MessageSquare } from 'lucide-react';
import axios from 'axios';

export const Header = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    email: string;
    username: string; _id: string
} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredRoutes, setFilteredRoutes] = useState<{ keywords: string[]; path: string; label: string }[]>([]);

  const [ordersCount, setOrdersCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [feedbacksCount, setFeedbacksCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  const [isCountLoading, setIsCountLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      setUserDetails(JSON.parse(storedUserDetails));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (userDetails) {
      fetchCounts(); // Fetch immediately on mount
      const intervalId = setInterval(fetchCounts, 20000); // Fetch every 20 seconds

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [userDetails]);

  const fetchCounts = async () => {
    if (isCountLoading) return;
    setIsCountLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !userDetails) return;

      const cacheBuster = `_=${new Date().getTime()}`;
      const [ordersRes, bookingsRes, feedbacksRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/order/order_list?restaurant_id=${userDetails._id}&${cacheBuster}`, {
          headers: { 'Authorization': `JWT ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/booking/booking_list?restaurant_id=${userDetails._id}&${cacheBuster}`, {
          headers: { 'Authorization': `JWT ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/feedback/feedback_list?restaurant_id=${userDetails._id}&${cacheBuster}`, {
          headers: { 'Authorization': `JWT ${token}` },
        }),
      ]);

      const newTotalOrders = ordersRes.data.length;
      const newTotalBookings = bookingsRes.data.length;
      const newTotalFeedbacks = feedbacksRes.data.length;

      setTotalOrders(newTotalOrders);
      setTotalBookings(newTotalBookings);
      setTotalFeedbacks(newTotalFeedbacks);

      const lastSeenOrders = parseInt(localStorage.getItem('lastSeenOrdersCount') || '0', 10);
      const lastSeenBookings = parseInt(localStorage.getItem('lastSeenBookingsCount') || '0', 10);
      const lastSeenFeedbacks = parseInt(localStorage.getItem('lastSeenFeedbacksCount') || '0', 10);

      setOrdersCount(Math.max(0, newTotalOrders - lastSeenOrders));
      setBookingsCount(Math.max(0, newTotalBookings - lastSeenBookings));
      setFeedbacksCount(Math.max(0, newTotalFeedbacks - lastSeenFeedbacks));

    } catch (error) {
      console.error('Failed to fetch counts:', error);
    } finally {
      setIsCountLoading(false);
    }
  };

  const fetchProfile = async () => {
    setIsProfileLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/user_profile`, {}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`
          }
        });
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    if (isProfileOpen && !profileData) {
      fetchProfile();
    }
  }, [isProfileOpen, profileData]);

  const routes = [
    { keywords: ['dashboard', 'home', 'main'], path: '/dashboard', label: 'Dashboard' },
    { keywords: ['call', 'logs', 'phone'], path: '/call-logs', label: 'Call Logs' },
    { keywords: ['booking', 'reservation', 'table'], path: '/bookings', label: 'Bookings' },
    { keywords: ['order', 'orders', 'food'], path: '/orders', label: 'Orders' },
    { keywords: ['feedback', 'feedbacks', 'review', 'rating', 'feed'], path: '/feedbacks', label: 'Feedbacks' },
    { keywords: ['menu', 'menus', 'item', 'dish'], path: '/menus', label: 'Menus' },
    { keywords: ['setting', 'settings', 'config', 'profile'], path: '/settings', label: 'Settings' },
  ];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const query = value.toLowerCase().trim();
    if (query) {
      const filtered = routes.filter(route =>
        route.keywords.some(keyword => keyword.includes(query))
      );
      setFilteredRoutes(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredRoutes([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim() && filteredRoutes.length > 0) {
      navigate(filteredRoutes[0].path);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (path: string) => {
    navigate(path);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleNotificationClick = (path: string, type: 'orders' | 'bookings' | 'feedbacks') => {
    navigate(path);
    if (type === 'orders') {
      localStorage.setItem('lastSeenOrdersCount', totalOrders.toString());
      setOrdersCount(0);
    } else if (type === 'bookings') {
      localStorage.setItem('lastSeenBookingsCount', totalBookings.toString());
      setBookingsCount(0);
    } else if (type === 'feedbacks') {
      localStorage.setItem('lastSeenFeedbacksCount', totalFeedbacks.toString());
      setFeedbacksCount(0);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <SidebarTrigger className="hover:bg-muted/50 transition-all duration-300 rounded-xl hover:scale-105" />

        <div className="flex-1 flex items-center gap-4">
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-9 w-full h-10 rounded-2xl border-border/50 focus:border-primary bg-gradient-to-r from-muted/30 to-muted/20 transition-all duration-300 focus:shadow-lg"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/50 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.path}
                    onClick={() => handleSuggestionClick(route.path)}
                    className="px-4 py-2 hover:bg-muted/50 cursor-pointer transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    {route.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105">
                <Bell className="h-5 w-5" />
                {(ordersCount + bookingsCount + feedbacksCount) > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-lg animate-pulse"
                    style={{ animationDuration: '2s' }}
                  >
                    {ordersCount + bookingsCount + feedbacksCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border-border/50 animate-scale-in">
              <DropdownMenuItem
                onClick={() => handleNotificationClick('/orders', 'orders')}
                className="cursor-pointer rounded-xl hover:bg-muted/50 transition-all duration-300 flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Orders
                {ordersCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {ordersCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNotificationClick('/bookings', 'bookings')}
                className="cursor-pointer rounded-xl hover:bg-muted/50 transition-all duration-300 flex items-center gap-2"
              >
                <CalendarClock className="h-4 w-4" />
                Bookings
                {bookingsCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {bookingsCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNotificationClick('/feedbacks', 'feedbacks')}
                className="cursor-pointer rounded-xl hover:bg-muted/50 transition-all duration-300 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Feedbacks
                {feedbacksCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {feedbacksCount}
                  </Badge>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 transition-all duration-300 hover:scale-105">
                <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/50 hover:shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground font-bold text-sm">
                    {userDetails?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border-border/50 animate-scale-in">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1 p-1">
                  <p className="text-sm font-bold text-foreground">{userDetails?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{userDetails?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                onClick={() => setIsProfileOpen(true)}
                className="cursor-pointer rounded-xl hover:bg-muted/50 transition-all duration-300"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer rounded-xl hover:bg-muted/50 transition-all duration-300">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('userDetails');

                  navigate('/login');
                }}
                className="cursor-pointer rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300 focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Profile Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isProfileLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Loading profile...</p>
              </div>
            ) : profileData ? (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground font-bold text-lg">
                      {profileData.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg text-foreground">{profileData.username}</p>
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                    <span className="text-sm text-foreground">{profileData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Restaurant:</span>
                    <span className="text-sm text-foreground">{profileData.restaurantName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Address:</span>
                    <span className="text-sm text-foreground">{profileData.restaurantAddress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Tables:</span>
                    <span className="text-sm text-foreground">{profileData.noOfTables}</span>
                  </div>
                  <div className="pt-4 border-t border-border/30">
                    <Button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full rounded-xl"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Failed to load profile data.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
