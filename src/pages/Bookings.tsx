
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import TableLayout from './TableLayout';


import { useState, useMemo, useEffect } from 'react';
import { Booking, BookingApiData } from '@/types';
import axios from 'axios';

interface TableType {
  id: string;
  name: string;
  status: string;
  noOfTables: string;
}


const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'datetime' | 'partySize' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [viewModal, setViewModal] = useState<{ open: boolean; data: Booking | null }>({ open: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; data: Booking | null }>({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [bookingForm, setBookingForm] = useState({
    customer: '',
    phone: '',
    partySize: 2,
    status: 'pending' as Booking['status'],
    bookingTime: '',
    tableNumber: ''
  });
  const [userDetails, setUserDetails] = useState<{ _id: string; noOfTables?: number; tableTypes?: TableType[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  // New state to toggle between Booking Table view (true) and Select Table view (false)
  const [showBookingTable, setShowBookingTable] = useState(false);
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(new Set(paginatedBookings.map(booking => booking.id)));
    } else {
      setSelectedBookings(new Set());
    }
  };

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    const newSelected = new Set(selectedBookings);
    if (checked) {
      newSelected.add(bookingId);
    } else {
      newSelected.delete(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      const parsedDetails = JSON.parse(storedUserDetails);
      // The keys in tableTypes might be malformed (e.g., "'id'"). This cleans them up.
      if (parsedDetails.tableTypes && Array.isArray(parsedDetails.tableTypes)) {
        parsedDetails.tableTypes = parsedDetails.tableTypes.map((type: Record<string, string>) => {
          const newType: { [key: string]: string } = {};
          for (const key in type) {
            newType[key.replace(/'/g, '')] = type[key];
          }
          return newType;
        });
      }
      setUserDetails(parsedDetails);
    }
  }, []);

  useEffect(() => {
    if (userDetails) {
      fetchBookings();
    }
  }, [userDetails]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userDetails) {
        fetchBookings();
      }
    }, 5000); // 10 seconds

    return () => clearInterval(interval);
  }, [userDetails]);

  const fetchBookings = async () => {
  if (bookings.length === 0) {
      setIsLoading(false);
    }
        try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/booking/booking_list?restaurantId=${userDetails._id}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        const mappedBookings: Booking[] = response.data.map((booking: BookingApiData) => ({
          id: booking._id,
          customer: booking.customerName,
          phone: booking.customerPhone,
          datetime: booking.createdAt,
          partySize: booking.noOfPerson,
          status: booking.status === 'true' ? 'confirmed' : 'pending',
          bookingTime: booking.bookingTime,
          tableNumber: booking.tableNo,
        }));
        setBookings(mappedBookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load bookings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const filteredAndSortedBookings = useMemo(() => {
    const result = bookings.filter((booking) => {
      const matchesSearch =
        booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;
        if (sortField === 'datetime') {
          comparison = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        } else if (sortField === 'partySize') {
          comparison = a.partySize - b.partySize;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [bookings, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = filteredAndSortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: 'datetime' | 'partySize') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: 'datetime' | 'partySize') => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-2 text-primary" /> : 
      <ArrowDown className="h-4 w-4 ml-2 text-primary" />;
  };

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" | "success" | "warning" => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleView = async (booking: Booking) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authorization Error',
        description: 'Authentication token is missing. Please login again.',
      });
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/booking/view_booking/${booking.id}`, 
        null,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        }
      );
      const data = response.data;
      setViewModal({ 
        open: true, 
        data: {
          customer: data.customerName,
          phone: data.customerPhone,
          datetime: data.createdAt,
          partySize: data.noOfPerson,
          status: data.status === 'true' ? 'confirmed' : 'pending',
          bookingTime: data.bookingTime,
          tableNumber: data.tableNo,
          bookingId: data.bookingId, // This comes from the API for view modal
          id: booking.id // Use the original booking's ID
        }
      });
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load booking details',
      });
    }
  };

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const body = new URLSearchParams({
          userRestaurantId: userDetails._id,
          created_by: userDetails._id,
          status: bookingForm.status === 'confirmed' ? 'true' : 'false',
          tableNumber: bookingForm.tableNumber,
          customerPhone: bookingForm.phone,
          customerName: bookingForm.customer,
          noOfPerson: bookingForm.partySize.toString(),
          bookingTime: bookingForm.bookingTime,
        });

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/booking/create_booking`, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });

        const newBooking: Booking = {
          id: response.data._id,
          customer: response.data.customerName,
          phone: response.data.customerPhone,
          datetime: response.data.createdAt,
          partySize: response.data.noOfPerson,
          status: response.data.status === 'true' ? 'confirmed' : 'pending' as Booking['status'],
          tableNumber: bookingForm.tableNumber,
          bookingTime: bookingForm.bookingTime
        };

        setBookings([newBooking, ...bookings]);
        toast({
          title: "Booking created",
          description: "New booking has been successfully created.",
        });
        setAddModal(false);
        setBookingForm({
          customer: '',
          phone: '',
          partySize: 2,
          status: 'pending',
          bookingTime: '',
          tableNumber: ''
        });
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create booking',
      });
    }
  };

  const handleManualAdd = () => {
    setBookingForm({
      customer: '',
      phone: '',
      partySize: 2,
      status: 'pending',
      bookingTime: '',
      tableNumber: ''
    });
    setAddModal(true);
  };

  const handleTableClick = (tableNumber: number) => {
    setBookingForm({
      ...bookingForm,
      tableNumber: tableNumber.toString()
    });
    setAddModal(true);
  };

  const handleEdit = (booking: Booking) => {
    setBookingForm({
      customer: booking.customer || '',
      phone: booking.phone || '',
      partySize: booking.partySize || 2,
      status: booking.status,
      bookingTime: booking.bookingTime || new Date(booking.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      tableNumber: booking.tableNumber || '',
    });
    setEditModal({ open: true, data: booking });
  };

  const handleSaveEdit = async () => {
    if (!editModal.data) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authorization Error',
        description: 'Authentication token is missing. Please login again.',
      });
      return;
    }
    try {
      const body = new URLSearchParams({
        customerName: bookingForm.customer,
        customerPhone: bookingForm.phone,
        bookingTime: bookingForm.bookingTime,
        noOfPerson: bookingForm.partySize.toString(),
        tableNo: bookingForm.tableNumber,
        status: bookingForm.status === 'confirmed' ? 'true' : 'false',
      });
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/booking/update_booking/${editModal.data.id}`,
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        }
      );
      const updated = response.data;
      const updatedBooking: Booking = {
        id: updated._id || editModal.data.id,
        customer: updated.customerName || bookingForm.customer,
        phone: updated.customerPhone || bookingForm.phone,
        datetime: updated.createdAt || new Date().toISOString(),
        partySize: updated.noOfPerson || bookingForm.partySize,
        status: updated.status === 'true' ? 'confirmed' : 'pending',
        tableNumber: updated.tableNo || bookingForm.tableNumber,
        bookingTime: updated.bookingTime || bookingForm.bookingTime,
      };
      setBookings(bookings.map(b => b.id === editModal.data!.id ? updatedBooking : b));
      toast({
        title: "Booking updated",
        description: "The booking has been successfully updated.",
      });
      setEditModal({ open: false, data: null });
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update booking',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authorization Error',
        description: 'Authentication token is missing. Please login again.',
      });
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/booking/delete_booking/${deleteModal.id}`, 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        }
      );
      setBookings(bookings.filter(b => b.id !== deleteModal.id));
      toast({
        title: "Booking deleted",
        description: "The booking has been successfully deleted.",
      });
      setDeleteModal({ open: false, id: null });
    } catch (error) {
      console.error('Failed to delete booking:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete booking',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Bookings</h1>
          <p className="text-muted-foreground">Manage table reservations</p>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={() => setShowBookingTable(!showBookingTable)}>
            {showBookingTable ? "Select Table" : "List Booking"}
          </Button>
        </div>
      </div>

      {showBookingTable ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer or phone..."
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
                    <TableHead className="font-semibold">
                      <Checkbox
                        checked={paginatedBookings.length > 0 && paginatedBookings.every(booking => selectedBookings.has(booking.id))}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead
                      className="font-semibold cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('datetime')}
                    >
                      <div className="flex items-center">
                        Date & Time
                        {getSortIcon('datetime')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-semibold cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('partySize')}
                    >
                      <div className="flex items-center">
                        Party Size
                        {getSortIcon('partySize')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading bookings...
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors animate-fade-in">
                        <TableCell>
                          <Checkbox
                            checked={selectedBookings.has(booking.id)}
                            onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{booking.customer}</TableCell>
                        <TableCell className="text-muted-foreground">{booking.phone}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(booking.datetime).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{booking.partySize} guests</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusColor(booking.status)}
                            className="smooth-transition hover-scale capitalize"
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(booking)}
                              className="group relative hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110"
                            >
                              <Eye className="h-4 w-4 group-hover:scale-125 transition-transform duration-300" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(booking)}
                              className="group relative hover:bg-warning/10 hover:text-warning transition-all duration-300 hover:scale-110"
                            >
                              <Edit className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteModal({ open: true, id: booking.id })}
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
            mobileCards={isLoading ? (
              <ResponsiveCard>
                <div className="text-center py-8 text-muted-foreground">
                  Loading bookings...
                </div>
              </ResponsiveCard>
            ) : paginatedBookings.length === 0 ? (
              <ResponsiveCard>
                <div className="text-center py-8 text-muted-foreground">
                  No bookings found
                </div>
              </ResponsiveCard>
            ) : (
              paginatedBookings.map((booking) => (
                <ResponsiveCard key={booking.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedBookings.has(booking.id)}
                        onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                      />
                      <div className="space-y-2 flex-1">
                        <div className="font-semibold text-lg">{booking.customer}</div>
                        <div className="text-sm text-muted-foreground">{booking.phone}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(booking.datetime).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(booking.status)} className="capitalize">
                            {booking.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {booking.partySize} guests
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(booking)}
                      className="group flex-1 hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(booking)}
                      className="group flex-1 hover:bg-warning/5 hover:border-warning/50 hover:text-warning transition-all duration-300"
                    >
                      <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteModal({ open: true, id: booking.id })}
                      className="group hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    </Button>
                  </div>
                </ResponsiveCard>
              ))
            )}
          />

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {totalPages <= 5 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))
                  ) : (
                    <>
                      {currentPage <= 3 ? (
                        <>
                          {[1, 2, 3, 4].map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(totalPages)}
                              className="cursor-pointer"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      ) : currentPage >= totalPages - 2 ? (
                        <>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(1)}
                              className="cursor-pointer"
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          {[totalPages - 3, totalPages - 2, totalPages - 1, totalPages].map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                        </>
                      ) : (
                        <>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(1)}
                              className="cursor-pointer"
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          {[currentPage - 1, currentPage, currentPage + 1].map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(totalPages)}
                              className="cursor-pointer"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                    </>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select Table</h2>
          {userDetails?.tableTypes && userDetails.tableTypes.length > 0 ? (
            <div  className="space-y-8">
              {userDetails.tableTypes.map((type) => (
                <div key={type.id || type.name}>
                  <h3 className="text-lg font-medium mb-4">{type.name}</h3>
                <TableLayout
                    numberOfTables={parseInt(type.noOfTables, 10)}
                    onTableClick={(tableNumber) => {
                      // You might want to pass table type info as well
                      handleTableClick(tableNumber);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground animate-pulse">
              {isLoading
                ? 'Loading table information...'
                : 'No table types found for this restaurant.'}
            </div>
          )}
        </div>
      )}


      {viewModal.data && (
        <ViewModal
          open={viewModal.open}
          onOpenChange={(open) => setViewModal({ open, data: null })}
          title="Booking Details"
          data={{
            Customer: viewModal.data.customer,
            Phone: viewModal.data.phone,
            'Date & Time': new Date(viewModal.data.datetime).toLocaleString(),
            'Booking Time': viewModal.data.bookingTime,
            'Party Size': `${viewModal.data.partySize} guests`,
            Status: viewModal.data.status,
            'Table Number': viewModal.data.tableNumber,
            'Booking ID': viewModal.data.bookingId,
          }}
        />
      )}

      <FormModal
        open={addModal}
        onOpenChange={setAddModal}
        title="Create New Booking"
        onSubmit={handleAdd}
        submitLabel="Create Booking"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name</Label>
            <Input
              id="customer"
              value={bookingForm.customer}
              onChange={(e) => setBookingForm({ ...bookingForm, customer: e.target.value })}
              className="h-11 rounded-xl"
              placeholder="Enter customer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={bookingForm.phone}
              onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
              className="h-11 rounded-xl"
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partySize">Party Size</Label>
            <Input
              id="partySize"
              type="number"
              value={bookingForm.partySize}
              onChange={(e) => setBookingForm({ ...bookingForm, partySize: parseInt(e.target.value) })}
              className="h-11 rounded-xl"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bookingTime">Booking Time</Label>
            <Input
              id="bookingTime"
              type="time"
              value={bookingForm.bookingTime}
              onChange={(e) => setBookingForm({ ...bookingForm, bookingTime: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tableNumber">Table Number</Label>
            <Input
              id="tableNumber"
              value={bookingForm.tableNumber}
              onChange={(e) => setBookingForm({ ...bookingForm, tableNumber: e.target.value })}
              className="h-11 rounded-xl"
              placeholder="Enter table number"
              disabled={true}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <SelectFilter
              value={bookingForm.status}
              onValueChange={(value) => setBookingForm({ ...bookingForm, status: value as Booking['status'] })}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              className="w-full"
            />
          </div>
        </div>
      </FormModal>

{editModal.data && (
        <FormModal
          open={editModal.open}
          onOpenChange={(open) => setEditModal({ open, data: null })}
          title="Edit Booking"
          onSubmit={handleSaveEdit}
          submitLabel="Save Changes"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customer">Customer Name</Label>
              <Input
                id="edit-customer"
                value={bookingForm.customer}
                onChange={(e) => setBookingForm({ ...bookingForm, customer: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-partySize">Party Size</Label>
              <Input
                id="edit-partySize"
                type="number"
                value={bookingForm.partySize}
                onChange={(e) => setBookingForm({ ...bookingForm, partySize: parseInt(e.target.value) })}
                className="h-11 rounded-xl"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bookingTime">Booking Time</Label>
              <Input
                id="edit-bookingTime"
                type="time"
                value={bookingForm.bookingTime}
                onChange={(e) => setBookingForm({ ...bookingForm, bookingTime: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tableNumber">Table Number</Label>
              <Input
                id="edit-tableNumber"
                value={bookingForm.tableNumber}
                className="h-11 rounded-xl"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <SelectFilter
                value={bookingForm.status}
                onValueChange={(value) => setBookingForm({ ...bookingForm, status: value as Booking['status'] })}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Confirmed', value: 'confirmed' },
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
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
      />
    </div>
  );
};

export default Bookings;
