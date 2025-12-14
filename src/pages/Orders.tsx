import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockOrders, mockMenuItems } from '@/lib/mockData';
import { Order, MenuItem, MenuCategory } from '@/types';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SelectFilter } from '@/components/ui/select-filter';
import { ResponsiveTableContainer, ResponsiveCard } from '@/components/ui/responsive-table';
import { ViewModal } from '@/components/modals/ViewModal';
import { DeleteModal } from '@/components/modals/DeleteModal';
import { FormModal } from '@/components/modals/FormModal';
import { Search, Plus, Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'total' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewModal, setViewModal] = useState<{ open: boolean; data: Record<string, string> | null }>({ open: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; data: Order | null }>({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [orderForm, setOrderForm] = useState({
    customer: '',
    customerPhone: '',
    tableNumber: '',
    total: 0,
    status: 'preparing' as Order['status']
  });
  const [selectedItems, setSelectedItems] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [currentStep, setCurrentStep] = useState<'select' | 'details' | 'confirm'>('select');
  const [menuModal, setMenuModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempSelectedItems, setTempSelectedItems] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [userDetails, setUserDetails] = useState<{ _id: string } | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      setUserDetails(JSON.parse(storedUserDetails));
    }
  }, []);

  useEffect(() => {
    if (userDetails) {
      fetchCategories();
      fetchOrders();
    }
  }, [userDetails]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userDetails) {
        fetchOrders();
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [userDetails]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchOrders = async () => {
      if (orders.length === 0) {
      setIsLoadingOrders(false);
    }
   
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const body = new URLSearchParams({
          restaurant_id: userDetails._id,
        });

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/order/order_list?restaurant_id=${userDetails._id}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });

        const formattedOrders: Order[] = response.data.map((order: {
          _id: string;
          orderId?: number;
          customerName: string;
          items?: { name: string; quantity: number; price: number }[];
          orderedItems?: { name?: string; itemName?: string; quantity?: number; qty?: string; price?: number; }[];
          totalAmount?: number;
          totalBill?: string;
          status: string;
          createdAt: string;
        }) => ({
          id: order._id,
          orderId: order.orderId,
          customer: order.customerName,
          items: order.items || order.orderedItems?.map((item) => ({
            name: item.name || item.itemName || '',
            qty: item.quantity || parseInt(item.qty || '1'),
            price: parseFloat(item.price?.toString() || '0'),
          })) || [],
          total: order.totalAmount || parseFloat(order.totalBill || '0') || 0,
          status: order.status === 'true' ? 'preparing' : order.status.toLowerCase(),
          datetime: order.createdAt,
        }));

        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load orders',
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const body = new URLSearchParams({
          restaurant_id: userDetails._id,
        });

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/menucategory/menucategory_list`, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load categories',
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Ready', value: 'ready' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const filteredAndSortedOrders = useMemo(() => {
    const result = orders.filter((order) => {
      const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        } else if (sortField === 'total') {
          comparison = a.total - b.total;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [orders, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedOrders.slice(startIndex, endIndex);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  const handleSort = (field: 'date' | 'total') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: 'date' | 'total') => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-2 text-primary" /> : 
      <ArrowDown className="h-4 w-4 ml-2 text-primary" />;
  };

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" | "success" | "warning" => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'preparing':
        return 'warning';
      case 'ready':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleView = async (order: Order) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const body = new URLSearchParams({
          _id: order.id,
        });

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/order/view_order/${order.id}`, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });

        const detailedOrder = response.data;

        // Format the data for the ViewModal
        const modalData = {
          'Order ID': `#${detailedOrder.orderId}`,
          'Customer Name': detailedOrder.customerName,
          'Customer Phone': detailedOrder.customerPhone,
          'Table Number': detailedOrder.tableNumber,
          'Ordered Items': detailedOrder.orderedItems.map((item: unknown) => `${item["'itemName'"]} (Qty: ${item["'qty'"]}, Price: $${item["'price'"]})`).join(', '),
          'Total Bill': `$${detailedOrder.totalBill}`,
          'Status': detailedOrder.status === 'true' ? 'Active' : 'Inactive',
          'Created At': new Date(detailedOrder.createdAt).toLocaleString(),
          
        };

        setViewModal({ open: true, data: modalData });
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load order details',
      });
    }
  };

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const orderedItems = selectedItems.map(selected => ({
          itemName: selected.item.name,
          qty: selected.qty.toString(),
          price: selected.item.price.toString(),
          menuid: selected.item.id,
        }));

        const body = new URLSearchParams({
          userRestaurantId: userDetails._id,
          customerName: orderForm.customer,
          customerPhone: orderForm.customerPhone,
          tableNumber: orderForm.tableNumber,
          totalBill: selectedItems.reduce((sum, selected) => sum + (selected.item.price * selected.qty), 0).toString(),
          status: 'true',
          createdBy: userDetails._id,
        });

        orderedItems.forEach((item, index) => {
          body.append(`orderedItems[${index}]['itemName']`, item.itemName);
          body.append(`orderedItems[${index}]['qty']`, item.qty);
          body.append(`orderedItems[${index}]['price']`, item.price);
          body.append(`orderedItems[${index}]['menuid']`, item.menuid);
        });

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/order/create_order`, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });

        const newOrder: Order = {
          id: response.data._id,
          customer: response.data.customerName,
          items: selectedItems.map(selected => ({
            name: selected.item.name,
            qty: selected.qty,
            price: selected.item.price,
          })),
          total: parseFloat(response.data.totalBill),
          status: 'preparing',
          datetime: response.data.createdAt,
        };

        setOrders([newOrder, ...orders]);
        // Note: fetchOrders() will be called by the interval, no need to call manually here
        toast({
          title: "Order Created",
          description: "New order has been successfully created.",
        });
        setConfirmModal(false);
        setSelectedItems([]);
        setCurrentStep('select');
        setOrderForm({ customer: '', customerPhone: '', tableNumber: '', total: 0, status: 'preparing' });
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create order',
      });
    }
  };

  const handleAddItem = (item: MenuItem) => {
    if (isEditMode) {
      const existingItem = tempSelectedItems.find(selected => selected.item.id === item.id);
      if (existingItem) {
        setTempSelectedItems(tempSelectedItems.map(selected =>
          selected.item.id === item.id
            ? { ...selected, qty: selected.qty + 1 }
            : selected
        ));
      } else {
        setTempSelectedItems([...tempSelectedItems, { item, qty: 1 }]);
      }
    } else {
      const existingItem = selectedItems.find(selected => selected.item.id === item.id);
      if (existingItem) {
        setSelectedItems(selectedItems.map(selected =>
          selected.item.id === item.id
            ? { ...selected, qty: selected.qty + 1 }
            : selected
        ));
      } else {
        setSelectedItems([...selectedItems, { item, qty: 1 }]);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    if (isEditMode) {
      setTempSelectedItems(tempSelectedItems.filter((_, i) => i !== index));
    }
    else
    {
      setSelectedItems(selectedItems.filter((_, i) => i !== index));
    }
  };

  const handleIncreaseQty = (index: number) => {
    if (isEditMode) {
      setTempSelectedItems(tempSelectedItems.map((selected, i) =>
        i === index ? { ...selected, qty: selected.qty + 1 } : selected
      ));
    } else {
      setSelectedItems(selectedItems.map((selected, i) =>
        i === index ? { ...selected, qty: selected.qty + 1 } : selected
      ));
    }
  };

  const handleDecreaseQty = (index: number) => {
    if (isEditMode) {
      setTempSelectedItems(tempSelectedItems.map((selected, i) =>
        i === index
          ? selected.qty > 1
            ? { ...selected, qty: selected.qty - 1 }
            : null
          : selected
      ).filter(Boolean) as { item: MenuItem; qty: number }[]);
    } else {
      setSelectedItems(selectedItems.map((selected, i) =>
        i === index
          ? selected.qty > 1
            ? { ...selected, qty: selected.qty - 1 }
            : null
          : selected
      ).filter(Boolean) as { item: MenuItem; qty: number }[]);
    }
  };

  const handleStartNewOrder = () => {
    setSelectedCategory(null);
    setMenuModal(true);
    setCurrentStep('select');
  };

  const handleCategoryClick = (category: MenuCategory) => {
    setSelectedCategory(category);
    fetchMenuItems(category._id);
  };

  const fetchMenuItems = async (categoryId: string) => {
    setIsLoadingMenuItems(true);
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const body = new URLSearchParams({
          restaurant_id: userDetails._id,
          category_id: categoryId,
        });

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/menuitem/menuitem_list`, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        const items = response.data[0]?.menulist || [];
        setMenuItems(items.map((item: { _id: string; itemName: string; price?: number; status: string }) => ({
          id: item._id,
          name: item.itemName,
          category: selectedCategory?.categoryName || '',
          price: item.price || 0,
          available: item.status === 'true',
        })));
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load menu items',
      });
    } finally {
      setIsLoadingMenuItems(false);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleProceedToDetails = () => {
    setMenuModal(false);
    setAddModal(true);
    setCurrentStep('details');
  };

  const handleProceedToConfirm = () => {
    setAddModal(false);
    setConfirmModal(true);
    setCurrentStep('confirm');
  };

  const handleEdit = async (order: Order) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const body = new URLSearchParams({
          _id: order.id,
        });

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/order/view_order/${order.id}`, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });

        const detailedOrder = response.data;

        setOrderForm({
          customer: detailedOrder.customerName,
          customerPhone: detailedOrder.customerPhone,
          tableNumber: detailedOrder.tableNumber,
          total: parseFloat(detailedOrder.totalBill),
          status: detailedOrder.status === 'true' ? 'preparing' : detailedOrder.status.toLowerCase(),
        });
        const items = detailedOrder.orderedItems.map((item: Record<string, string>) => ({
          item: {
            id: item["'menuid'"],
            name: item["'itemName'"],
            price: parseFloat(item["'price'"]),
            category: '',
            available: true,
          },
          qty: parseInt(item["'qty'"]),
        }));
        setTempSelectedItems(items);
        setEditModal({ open: true, data: order });
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Failed to fetch order details for edit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load order details for editing',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (editModal.data) {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const orderedItems = tempSelectedItems.map(selected => ({
            itemName: selected.item.name,
            qty: selected.qty.toString(),
            price: selected.item.price.toString(),
            menuid: selected.item.id,
          }));

          const body = new URLSearchParams({
            customerName: orderForm.customer,
            customerPhone: orderForm.customerPhone,
            tableNumber: orderForm.tableNumber,
            totalBill: tempSelectedItems.reduce((sum, selected) => sum + (selected.item.price * selected.qty), 0).toString(),
            status: orderForm.status === 'preparing' ? 'true' : orderForm.status,
          });

          orderedItems.forEach((item, index) => {
            body.append(`orderedItems[${index}]['itemName']`, item.itemName);
            body.append(`orderedItems[${index}]['qty']`, item.qty);
            body.append(`orderedItems[${index}]['price']`, item.price);
            body.append(`orderedItems[${index}]['menuid']`, item.menuid);
          });

          const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/order/update_order/${editModal.data.id}`, body, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `JWT ${token}`,
            },
          });

          // Update the local state
          setOrders(orders.map(o =>
            o.id === editModal.data!.id
              ? {
                  ...o,
                  customer: orderForm.customer,
                  items: tempSelectedItems.map(selected => ({
                    name: selected.item.name,
                    qty: selected.qty,
                    price: selected.item.price,
                  })),
                  total: tempSelectedItems.reduce((sum, selected) => sum + (selected.item.price * selected.qty), 0),
                  status: orderForm.status
                }
              : o
          ));

          toast({
            title: "Order Updated",
            description: "The order has been successfully updated.",
          });
          setEditModal({ open: false, data: null });
          setTempSelectedItems([]);
          setIsEditMode(false);
        }
      } catch (error) {
        console.error('Failed to update order:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update order',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (deleteModal.id) {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/order/delete_order/${deleteModal.id}`, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `JWT ${token}`,
            },
          });
          if (response.status === 200) {
            setOrders(orders.filter(o => o.id !== deleteModal.id));
            toast({
              title: "Order deleted",
              description: "The order has been successfully deleted.",
            });
            setDeleteModal({ open: false, id: null });
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to delete order',
            });
          }
        }
      } catch (error) {
        console.error('Failed to delete order:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete order',
        });
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Orders</h1>
            <Badge variant="success" className="animate-pulse">Live</Badge>
          </div>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        <Button
          onClick={handleStartNewOrder}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/95 hover:to-accent/90 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative z-10 font-semibold">New Order</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 rounded-xl border-border/50 focus:border-primary transition-all"
          />
        </div>
        <SelectFilter
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={statusOptions}
          placeholder="Filter by status"
          className="w-full sm:w-[200px]"
        />
      </div>

      <ResponsiveTableContainer
        desktopTable={
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
              
                <TableHead className="font-semibold">Order ID</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Items</TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center">
                    Total
                    {getSortIcon('total')}
                  </div>
                </TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date & Time
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingOrders ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors animate-fade-in">

                    <TableCell className="font-bold text-primary">#{order.orderId || '0'}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className="font-bold text-foreground">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.datetime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(order.status)}
                        className="smooth-transition hover-scale"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(order)}
                          className="group relative hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-125 transition-transform duration-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(order)}
                          className="group relative hover:bg-warning/10 hover:text-warning transition-all duration-300 hover:scale-110"
                        >
                          <Edit className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteModal({ open: true, id: order.id })}
                          className="group relative hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4 group-hover:scale-125 transition-transform duration-300" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        }
        mobileCards={paginatedOrders.map((order) => (
          <ResponsiveCard key={order.id}>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">#{order.orderId}</span>
                  <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
                <div className="font-semibold text-lg">{order.customer}</div>
                <div className="text-sm text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ${order.total.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(order.datetime).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(order)}
                className="group flex-1 hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all duration-300"
              >
                <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(order)}
                className="group flex-1 hover:bg-warning/5 hover:border-warning/50 hover:text-warning transition-all duration-300"
              >
                <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModal({ open: true, id: order.id })}
                className="group hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </div>
          </ResponsiveCard>
        ))}
      />

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {viewModal.data && (
        <ViewModal
          open={viewModal.open}
          onOpenChange={(open) => setViewModal({ open, data: null })}
          title="Order Details"
          data={viewModal.data}
        />
      )}

      <FormModal
        open={addModal}
        onOpenChange={setAddModal}
        title="Order Details"
        onSubmit={handleProceedToConfirm}
        submitLabel="Proceed to Confirm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name</Label>
            <Input
              id="customer"
              value={orderForm.customer}
              onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
              className="h-11 rounded-xl"
              placeholder="Enter customer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              value={orderForm.customerPhone}
              onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
              className="h-11 rounded-xl"
              placeholder="Enter customer phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tableNumber">Table Number</Label>
            <Input
              id="tableNumber"
              value={orderForm.tableNumber}
              onChange={(e) => setOrderForm({ ...orderForm, tableNumber: e.target.value })}
              className="h-11 rounded-xl"
              placeholder="Enter table number"
            />
          </div>
          <div className="space-y-2">
            <Label>Selected Items</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedItems.map((selected, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <span>{selected.item.name} - ${selected.item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecreaseQty(index)}
                        className="h-6 w-6 p-0"
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{selected.qty}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncreaseQty(index)}
                        className="h-6 w-6 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="text-right font-semibold">
              Total: ${selectedItems.reduce((sum, selected) => sum + (selected.item.price * selected.qty), 0).toFixed(2)}
            </div>
          </div>
        </div>
      </FormModal>

      {editModal.data && (
      <FormModal
        open={editModal.open}
        onOpenChange={(open) => {
          setEditModal({ open, data: null });
          setTempSelectedItems([]);
          setIsEditMode(false);
        }}
        title="Edit Order"
        onSubmit={handleSaveEdit}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-customer">Customer Name</Label>
            <Input
              id="edit-customer"
              value={orderForm.customer}
              onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-customerPhone">Customer Phone</Label>
            <Input
              id="edit-customerPhone"
              value={orderForm.customerPhone}
              onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tableNumber">Table Number</Label>
            <Input
              id="edit-tableNumber"
              value={orderForm.tableNumber}
              onChange={(e) => setOrderForm({ ...orderForm, tableNumber: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Selected Items</Label>
            <Button
              onClick={() => {
                setIsEditMode(true);
                setMenuModal(true);
                setSelectedCategory(null);
              }}
              className="mb-2"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Items
            </Button>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {tempSelectedItems.map((selected, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <span>{selected.item.name} - ${selected.item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecreaseQty(index)}
                        className="h-6 w-6 p-0"
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{selected.qty}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncreaseQty(index)}
                        className="h-6 w-6 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="text-right font-semibold">
              Total: ${tempSelectedItems.reduce((sum, selected) => sum + (selected.item.price * selected.qty), 0).toFixed(2)}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <SelectFilter
              value={orderForm.status}
              onValueChange={(value) => setOrderForm({ ...orderForm, status: value as Order['status'] })}
              options={[
                { label: 'Preparing', value: 'preparing' },
                { label: 'Ready', value: 'ready' },
                { label: 'Delivered', value: 'delivered' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              className="w-full"
            />
          </div>
        </div>
      </FormModal>
      )}

      <DeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, id: null })}
        onConfirm={handleDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
      />

      <FormModal
        open={menuModal}
        onOpenChange={(open) => {
          setMenuModal(open);
          if (!open) {
            setIsEditMode(false);
          }
        }}
        title={selectedCategory ? `${selectedCategory.categoryName} Menu Items` : "Select Menu Category"}
        onSubmit={isEditMode ? () => setMenuModal(false) : handleProceedToDetails}
        submitLabel={isEditMode ? "Done Adding Items" : "Proceed to Details"}
      >
        <div className="space-y-4">
          {!selectedCategory ? (
            <div className="space-y-2">
              <Label>Menu Categories</Label>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {isLoadingCategories ? (
                  <div className="text-center py-4 text-muted-foreground">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No categories found</div>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div>
                        <div className="font-medium">{category.categoryName}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.status === 'true' ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToCategories}
                  className="hover:bg-primary/10"
                >
                  ← Back to Categories
                </Button>
                <span className="text-sm text-muted-foreground">Select items from {selectedCategory.categoryName}</span>
              </div>
              <div className="space-y-2">
                <Label>Available Menu Items</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {isLoadingMenuItems ? (
                    <div className="text-center py-4 text-muted-foreground">Loading menu items...</div>
                  ) : menuItems.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="mb-4">No menu items found in this category</div>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/menus')}
                        className="hover:bg-primary/10"
                      >
                        Go to Menus Page
                      </Button>
                    </div>
                  ) : (
                    menuItems.filter(item => item.available).map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">${item.price.toFixed(2)}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddItem(item)}
                          className="hover:bg-primary/10"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {selectedItems.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Items ({selectedItems.length})</Label>
              <div className="space-y-1">
                {selectedItems.map((selected, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{selected.item.name} - ${selected.item.price.toFixed(2)} x{selected.qty}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="text-right font-semibold">
                Total: ${selectedItems.reduce((sum, selected) => sum + (selected.item.price * selected.qty), 0).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </FormModal>

      <FormModal
        open={confirmModal}
        onOpenChange={setConfirmModal}
        title="Confirm Order"
        onSubmit={handleAdd}
        submitLabel="Create Order"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <div className="p-2 bg-muted rounded">{orderForm.customer}</div>
          </div>
          <div className="space-y-2">
            <Label>Customer Phone</Label>
            <div className="p-2 bg-muted rounded">{orderForm.customerPhone}</div>
          </div>
          <div className="space-y-2">
            <Label>Table Number</Label>
            <div className="p-2 bg-muted rounded">{orderForm.tableNumber}</div>
          </div>
          <div className="space-y-2">
            <Label>Selected Items</Label>
            <div className="space-y-1">
              {selectedItems.map((selected, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>{selected.item.name} x{selected.qty}</span>
                  <span>${(selected.item.price * selected.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="text-right font-bold text-lg">
              Total: ${selectedItems.reduce((sum, selected) => sum + (selected.item.price * selected.qty), 0).toFixed(2)}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="p-2 bg-muted rounded">{orderForm.status}</div>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Orders;
