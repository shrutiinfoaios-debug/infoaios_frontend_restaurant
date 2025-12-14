import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Phone,
  PhoneMissed,
  PhoneCall
} from 'lucide-react';
import { mockRestaurant } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIRobotAnimation } from '@/components/AIRobotAnimation';

import customerSupportImg from '@/assets/customer-support-ai.png';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Order, Booking, Feedback, OrderApiResponse, BookingApiResponse, FeedbackApiResponse, OrderItemApi, CallLog } from '@/types';

const Dashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      setUserDetails(JSON.parse(storedUserDetails));
    }
  }, []);

  useEffect(() => {
    if (userDetails) {
      fetchDashboardData();
    }
  }, [userDetails]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        // Fetch orders
        const ordersResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/order/order_list?restaurant_id=${userDetails._id}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        const formattedOrders: Order[] = ordersResponse.data.map((order: OrderApiResponse) => ({
          id: order._id,
          orderId: order.orderId,
          customer: order.customerName,
          items: order.items || order.orderedItems?.map((item: OrderItemApi) => ({
            name: item.name || item.itemName || '',
            qty: item.quantity || parseInt(item.qty || '1'),
            price: parseFloat(item.price?.toString() || '0'),
          })) || [],
          total: order.totalAmount || parseFloat(order.totalBill || '0') || 0,
          status: order.status === 'true' ? 'preparing' : order.status.toLowerCase(),
          datetime: order.createdAt,
        }));
        setOrders(formattedOrders);

        // Fetch bookings
        const bookingsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/booking/booking_list?restaurantId=${userDetails._id}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        const formattedBookings: Booking[] = bookingsResponse.data.map((booking: BookingApiResponse) => ({
          id: booking._id,
          customer: booking.customerName,
          phone: booking.customerPhone,
          datetime: booking.createdAt,
          partySize: booking.noOfPerson,
          status: booking.status === 'true' ? 'confirmed' : 'pending',
        }));
        setBookings(formattedBookings);

      
        // Fetch call logs
        const callLogsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/calllog/calllog_list?restaurant_id=${userDetails._id}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        // Assuming callLogsResponse.data is an array of CallLog objects
        // and each log has createdAt and status properties.
        // No formatting needed if API response matches CallLog type.
        setCallLogs(callLogsResponse.data);

      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const restaurant = userDetails ? {
    name: userDetails.restaurantName,
    email: userDetails.email,
    phone: userDetails.phoneNumber,
    ownerName: userDetails.username,
    rating: mockRestaurant.rating,
    openingHours: mockRestaurant.openingHours
  } : mockRestaurant;

  // Calculate KPI values dynamically
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const callLogsToday = callLogs.filter(log => log.calledAt && log.calledAt.startsWith(today)).length;
  const missedCallsToday = callLogs.filter(log => log.purpose === 'incomplete' && log.calledAt && log.calledAt.startsWith(today)).length;
  const attendedCallsTotal = callLogs.filter(log => log.purpose === 'complete').length;
  const tableBookingsTotal = bookings.length;

  // Generate chart data from actual orders and bookings over 12 months
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
      const monthIndex = (currentMonth - 11 + index + 12) % 12;
      const year = currentMonth - 11 + index < 0 ? currentYear - 1 : currentYear;
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = new Date(year, monthIndex + 1, 0);

      const ordersInMonth = orders.filter(order => {
        const orderDate = new Date(order.datetime);
        return orderDate >= monthStart && orderDate <= monthEnd;
      }).length;

      const bookingsInMonth = bookings.filter(booking => {
        const bookingDate = new Date(booking.datetime);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      }).length;

      return {
        month,
        orders: ordersInMonth
      };
    });
  };

  const chartData = generateChartData();

  const kpis = [
    {
      title: 'Call Logs today',
      value: callLogsToday.toLocaleString(),
      change: '', // No change data available
      icon: Phone,
      trend: 'up',
      color: 'text-chart-1'
    },
    {
      title: 'Missed Call Conversation today',
      value: missedCallsToday.toString(),
      change: '', // No change data available
      icon: PhoneMissed,
      trend: 'down',
      color: 'text-chart-4'
    },
    {
      title: 'Attended general calls total',
      value: attendedCallsTotal.toLocaleString(),
      change: '', // No change data available
      icon: PhoneCall,
      trend: 'up',
      color: 'text-chart-3'
    },
    {
      title: 'Total table bookings',
      value: tableBookingsTotal.toString(),
      change: '', // No change data available
      icon: Calendar,
      trend: 'up',
      color: 'text-chart-2'
    },
  ];

  const openingHoursDisplay = restaurant.openingHours
    .filter(day => day.isOpen)
    .map(day => day.day.substring(0, 3))
    .join(', ');

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in max-w-full overflow-x-hidden">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's your restaurant overview.</p>
      </div>

      {/* Restaurant Info - Full Width */}
      <div className="premium-card overflow-hidden border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="p-5 sm:p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-accent/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col gap-6 relative z-10">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {restaurant.name}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base md:text-lg break-all">{restaurant.email}</p>
              </div>
              
              <div className="flex flex-wrap gap-3 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-background/60 to-background/40 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-border/30">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-warning fill-warning" />
                  <div>
                    <span className="font-bold text-xl sm:text-2xl text-foreground">{restaurant.rating}</span>
                    <span className="text-muted-foreground ml-2 text-xs sm:text-sm">Rating</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-background/60 to-background/40 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-border/30">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <div>
                    <span className="text-foreground font-medium text-xs sm:text-sm md:text-base">Open: {openingHoursDisplay}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg">
                  {restaurant.phone}
                </Badge>
                <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg">
                  Owner: {restaurant.ownerName}
                </Badge>
             
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:gap-6 md:gap-8 grid-cols-2 lg:grid-cols-4 stagger-animation">
        {kpis.map((kpi, index) => (
          <div 
            key={kpi.title} 
            className="group relative premium-card hover:scale-105 cursor-pointer transition-all duration-500 border-border/50 shadow-lg hover:shadow-2xl overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>

            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {kpi.title}
              </CardTitle>
              <div className="relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-primary transition-all duration-300" />
                {/* Pulse ring on hover */}
                <div className="absolute inset-0 rounded-xl bg-primary/20 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-0 transition-all duration-500"></div>
              </div>
            </CardHeader>
            
            <CardContent className="relative p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500">
                {kpi.value}
              </div>
              {kpi.change && (
                <div className="flex items-center gap-2 mt-1 sm:mt-2">
                  <span className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full ${
                    kpi.trend === 'up' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {kpi.change}
                  </span>
                  <span className="text-muted-foreground font-normal text-[10px] sm:text-xs">vs last month</span>
                </div>
              )}
            </CardContent>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="premium-card border-border/50 shadow-xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Last 12 Months Overview
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track your restaurant's growth over time</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[300px]">
            <ResponsiveContainer width="100%" height={300} className="sm:h-[350px]">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis
                    dataKey="month"
                    className="text-xs sm:text-sm"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    className="text-xs sm:text-sm"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      boxShadow: 'var(--shadow-lg)',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Orders"
                    dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </div>

      {/* AI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 md:gap-8">
        {/* AI Robot Section */}
        <div className="premium-card overflow-hidden border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 col-span-1 md:col-span-1 xl:col-span-1">
          <div className="p-5 sm:p-6 md:p-8 h-full flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <div className="relative z-10 space-y-4 w-full">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AI Assistant
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Powered by Advanced AI
                </p>
              </div>
              <div className="flex items-center justify-center h-48 sm:h-56">
                <AIRobotAnimation />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Your intelligent restaurant management companion
                </p>
              </div>
            </div>
          </div>
        </div>





        {/* AI Customer Support */}
        <div className="premium-card overflow-hidden border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 col-span-1 md:col-span-1 xl:col-span-1">
          <div className="p-5 sm:p-6 md:p-8 h-full flex flex-col relative">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 via-transparent to-primary/5"></div>
            <div className="relative z-10 space-y-4 flex flex-col h-full">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-chart-2 to-primary bg-clip-text text-transparent">
                    AI Customer Support
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Restaurant Dashboard Assistant
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center relative py-4">
                <div className="relative w-full max-w-xs">
                  {/* Main Image - Center Focus */}
                  <div className="relative z-10 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                    <img
                      src={customerSupportImg}
                      alt="AI Customer Support Representative"
                      className="relative w-full h-auto rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>

                  {/* Status Badge - Top Right */}
                  <div className="absolute -top-2 -right-2 z-20">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                      <span className="font-medium">AI Active</span>
                    </div>
                  </div>

                  {/* Live Call Badge - Bottom Left */}
                  <div className="absolute -bottom-2 -left-2 z-20">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span className="font-medium">Live Call</span>
                    </div>
                  </div>

                  {/* Small Chat Bubbles - Corners only, avoiding badges */}
                  {/* Top Left Corner (away from badges) */}
                  <div className="absolute -top-6 -left-6 z-[15]">
                    <div className="animate-bubble-loop">
                      <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg rounded-tl-none shadow-lg border border-gray-100 max-w-[140px]">
                        <p className="text-[10px] text-gray-800 font-medium leading-tight">Hi! I'd like to book a table for 4 people at 7 PM tonight</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Right Corner (away from badges) */}
                  <div className="absolute -bottom-6 -right-6 z-[15]">
                    <div className="animate-bubble-loop-right" style={{ animationDelay: '3s' }}>
                      <div className="bg-gradient-to-br from-green-500 to-green-600 px-2.5 py-1.5 rounded-lg rounded-br-none shadow-lg max-w-[140px]">
                        <p className="text-[10px] text-white font-medium leading-tight">Yes! We have 12 delicious vegetarian dishes. Let me share the menu! 🥗</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span>Processing orders</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taking calls • Managing bookings • AI-powered responses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
