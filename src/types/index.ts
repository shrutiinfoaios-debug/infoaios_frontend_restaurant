export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface UserDetails {
  _id: string;
  username?: string;
  email?: string;
  restaurantName?: string;
}

export interface CallLog {
  _id: string;
  userRestaurantId: string;
  callerName: string;
  callerNumber: string;
  callDuration: string;
  callConversation: string;
  callType: string;
  purpose: string;
  calledAt: string;
  createdAt: string;
  status: string;
  restaurantDetails: {
    _id: string;
    restaurantName: string;
    restaurantAddress: string;
  }[];
  audioUrl?: string;
}

export interface Booking {
  tableNumber: string;
  id: string;
  customer: string;
  phone: string;
  datetime: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingTime?: string;
  bookingId?: number;
}

export interface BookingApiData {
  _id: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  noOfPerson: number;
  status: string;
  bookingTime: string;
  tableNo: string;
}

export interface Order {
  id: string;
  orderId?: string | number;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'preparing' | 'ready' | 'delivered' | 'cancelled';
  datetime: string;
}

export interface Feedback {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  date: string;
  status: 'new' | 'resolved';
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  image?: string;
}

export interface MenuItemApi {
  _id: string;
  categoryId: string;
  itemName: string;
  price?: number;
  status: string;
  createdBy: string | null;
  createdAt: string;
}

export interface MenuCategory {
  _id: string;
  userRestaurantId: string;
  categoryName: string;
  status: string;
  createdBy: string | null;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  email: string;
  phone: string;
  rating: number;
  openingHours: OpeningHours[];
}

export interface OpeningHours {
  day: string;
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  open: string;
  close: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface OrderItemApi {
  name?: string;
  itemName?: string;
  quantity?: number;
  qty?: string;
  price?: number | string;
}

export interface OrderApiResponse {
  _id: string;
  orderId?: string | number;
  customerName: string;
  items?: OrderItemApi[];
  orderedItems?: OrderItemApi[];
  totalAmount?: number;
  totalBill?: string;
  status: string;
  createdAt: string;
}

export interface BookingApiResponse {
  _id: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  noOfPerson: number;
  status: string;
}

export interface FeedbackApiResponse {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'expired' | 'cancelled';
  renewalDate: string;
  plan: string;
  price: number;
}
