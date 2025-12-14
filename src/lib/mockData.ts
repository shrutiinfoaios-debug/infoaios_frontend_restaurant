import { User, CallLog, Booking, Order, Feedback, MenuItem, Restaurant, Notification } from '@/types';

// Mock user data
export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@restaurant.com',
  role: 'admin',
};

// Mock restaurant data
export const mockRestaurant: Restaurant = {
  id: '1',
  name: 'The Gourmet Kitchen',
  ownerName: 'John Doe',
  ownerEmail: 'john@restaurant.com',
  email: 'contact@gourmetkitchen.com',
  phone: '+1 (555) 123-4567',
  rating: 4.8,
  openingHours: [
    { day: 'Monday', isOpen: true, slots: [{ open: '11:00', close: '22:00' }] },
    { day: 'Tuesday', isOpen: true, slots: [{ open: '11:00', close: '22:00' }] },
    { day: 'Wednesday', isOpen: true, slots: [{ open: '11:00', close: '22:00' }] },
    { day: 'Thursday', isOpen: true, slots: [{ open: '11:00', close: '23:00' }] },
    { day: 'Friday', isOpen: true, slots: [{ open: '11:00', close: '23:00' }] },
    { day: 'Saturday', isOpen: true, slots: [{ open: '10:00', close: '23:00' }] },
    { day: 'Sunday', isOpen: true, slots: [{ open: '10:00', close: '21:00' }] },
  ],
};

// Mock call logs
export const mockCallLogs: CallLog[] = [
  {
    _id: '1',
    userRestaurantId: 'rest1',
    callerNumber: '+1234567890',
    receiverNumber: '+0987654321',
    duration: '300',
    callType: 'incoming',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    restaurantDetails: [
      {
        _id: 'rest1',
        restaurantName: 'The Golden Spoon',
        restaurantAddress: '123 Main St, City, State 12345',
      },
    ],
  },
  {
    _id: '2',
    userRestaurantId: 'rest1',
    callerNumber: '+1234567891',
    receiverNumber: '+0987654322',
    duration: '180',
    callType: 'outgoing',
    status: 'completed',
    createdAt: '2024-01-15T11:00:00Z',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    restaurantDetails: [
      {
        _id: 'rest1',
        restaurantName: 'The Golden Spoon',
        restaurantAddress: '123 Main St, City, State 12345',
      },
    ],
  },
 
];

// Mock bookings
export const mockBookings: Booking[] = [
  {
    id: '1',
    customer: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    datetime: '2025-11-12T19:00:00',
    partySize: 4,
    status: 'confirmed',
    tableNumber: '',
  },
  {
    id: '2',
    customer: 'Mike Chen',
    phone: '+1 (555) 345-6789',
    datetime: '2025-11-10T20:00:00',
    partySize: 2,
    status: 'pending',
    tableNumber: '',
  },
  {
    id: '3',
    customer: 'Emily Davis',
    phone: '+1 (555) 456-7890',
    datetime: '2025-11-15T18:30:00',
    partySize: 6,
    status: 'confirmed',
    tableNumber: '',
  },
];

// Mock orders
export const mockOrders: Order[] = [
  {
    id: '1',
    customer: 'Sarah Johnson',
    items: [
      { name: 'Grilled Salmon', qty: 2, price: 28.99 },
      { name: 'Caesar Salad', qty: 2, price: 12.99 },
    ],
    total: 83.96,
    status: 'delivered',
    datetime: '2025-11-09T19:30:00',
  },
  {
    id: '2',
    customer: 'Mike Chen',
    items: [
      { name: 'Ribeye Steak', qty: 1, price: 42.99 },
      { name: 'Red Wine', qty: 1, price: 18.99 },
    ],
    total: 61.98,
    status: 'preparing',
    datetime: '2025-11-10T18:15:00',
  },
];

// Mock feedbacks
export const mockFeedbacks: Feedback[] = [
  {
    id: '1',
    customer: 'Sarah Johnson',
    rating: 5,
    comment: 'Excellent food and service! The salmon was cooked to perfection.',
    date: '2025-11-09T20:00:00',
    status: 'new',
  },
  {
    id: '2',
    customer: 'Mike Chen',
    rating: 4,
    comment: 'Great ambiance, but wait time was a bit long.',
    date: '2025-11-08T21:30:00',
    status: 'resolved',
  },
];

// Mock menu items
export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Grilled Salmon',
    category: 'Main Course',
    price: 28.99,
    available: true,
  },
  {
    id: '2',
    name: 'Ribeye Steak',
    category: 'Main Course',
    price: 42.99,
    available: true,
  },
  {
    id: '3',
    name: 'Caesar Salad',
    category: 'Appetizer',
    price: 12.99,
    available: true,
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    category: 'Dessert',
    price: 9.99,
    available: false,
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Booking',
    message: 'Sarah Johnson booked a table for 4 on Nov 12',
    timestamp: '2025-11-09T14:30:00',
    read: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'New Feedback',
    message: 'You received a 5-star review from Sarah Johnson',
    timestamp: '2025-11-09T20:00:00',
    read: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Order Completed',
    message: 'Order #1 has been delivered',
    timestamp: '2025-11-09T19:45:00',
    read: true,
    type: 'success',
  },
];

// Mock chart data
export const mockChartData = [
  { month: 'Jan', users: 120, orders: 85 },
  { month: 'Feb', users: 150, orders: 102 },
  { month: 'Mar', users: 180, orders: 128 },
  { month: 'Apr', users: 165, orders: 115 },
  { month: 'May', users: 210, orders: 145 },
  { month: 'Jun', users: 240, orders: 178 },
  { month: 'Jul', users: 285, orders: 210 },
  { month: 'Aug', users: 310, orders: 235 },
  { month: 'Sep', users: 275, orders: 198 },
  { month: 'Oct', users: 320, orders: 258 },
  { month: 'Nov', users: 295, orders: 220 },
  { month: 'Dec', users: 350, orders: 280 },
];
