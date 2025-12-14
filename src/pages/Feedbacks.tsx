import { useState, useMemo, useEffect } from 'react';
import { mockFeedbacks } from '@/lib/mockData';
import { Feedback } from '@/types';
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
import { Search, Star, Eye, CheckCircle, XCircle, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface UserDetails {
  _id: string;
  // Add other user properties here if needed
}

const Feedbacks = () => {
  // Added isVisible to Feedback interface local extension
  interface FeedbackWithVisibility extends Feedback {
    isVisible: boolean;
  }

  const [feedbacks, setFeedbacks] = useState<FeedbackWithVisibility[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'rating' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewModal, setViewModal] = useState<{ open: boolean; data: Feedback | null }>({ open: false, data: null });
  const [editModal, setEditModal] = useState<{ open: boolean; data: Feedback | null }>({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [editForm, setEditForm] = useState<{ customer: string; rating: number; comment: string; status: 'new' | 'resolved' }>({
    customer: '',
    rating: 5,
    comment: '',
    status: 'new'
  });
  const { toast } = useToast();

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      setUserDetails(JSON.parse(storedUserDetails));
    }
  }, []);

  useEffect(() => {
    if (userDetails) {
      fetchFeedbacks();
    }
  }, [userDetails]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, ratingFilter]);



  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/feedback/feedback_list?restaurantId=${userDetails?._id}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });
        const formattedFeedbacks: FeedbackWithVisibility[] = response.data.map((feedback: {
          _id: string;
          userRestaurantId: string;
          orderId: string | null;
          rating: number;
          comment: string;
          createdBy: string;
          createdAt: string;
          isVisible?: boolean;
          restaurantDetails: { _id: string; restaurantName: string; restaurantAddress: string }[];
        }) => ({
          id: feedback._id,
          customer: feedback.createdBy, // Using createdBy as customer identifier
          rating: feedback.rating,
          comment: feedback.comment,
          date: feedback.createdAt,
          status: 'new', // Default status since not provided in API
          isVisible: feedback.isVisible !== undefined ? feedback.isVisible : true, // fallback to true if not provided
        }));
        setFeedbacks(formattedFeedbacks);
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load feedbacks',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Resolved', value: 'resolved' },
  ];

  const ratingOptions = [
    { label: 'All Ratings', value: 'all' },
    { label: '5 Stars', value: '5' },
    { label: '4 Stars', value: '4' },
    { label: '3 Stars', value: '3' },
    { label: '2 Stars', value: '2' },
    { label: '1 Star', value: '1' },
  ];

  const filteredAndSortedFeedbacks = useMemo(() => {
    const result = feedbacks.filter((feedback) => {
      const matchesSearch = feedback.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || feedback.rating === parseInt(ratingFilter);
      return matchesSearch && matchesStatus && matchesRating;
    });

    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'rating') {
          comparison = a.rating - b.rating;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [feedbacks, searchTerm, statusFilter, ratingFilter, sortField, sortDirection]);

  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedFeedbacks.slice(startIndex, endIndex);
  }, [filteredAndSortedFeedbacks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedFeedbacks.length / itemsPerPage);

  const handleSort = (field: 'date' | 'rating') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: 'date' | 'rating') => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-2 text-primary" /> : 
      <ArrowDown className="h-4 w-4 ml-2 text-primary" />;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-warning fill-warning' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const handleView = (feedback: Feedback) => {
    setViewModal({ open: true, data: feedback });
  };

  const handleToggleVisibility = async (feedbackId: string, currentVisibility: boolean) => {
    const userDetailsString = localStorage.getItem('userDetails');
    const token = localStorage.getItem('authToken');
    if (!userDetailsString || !token) {
      toast({
        variant: 'destructive',
        title: 'Authorization Error',
        description: 'User details or token missing, please login again.',
      });
      return;
    }

    const newVisibility = !currentVisibility;

    try {
      const params = new URLSearchParams();
      params.append('isVisible', String(newVisibility));

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/feedback/hide_show_feedback/${feedbackId}`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
      });

      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === feedbackId ? { ...f, isVisible: newVisibility } : f
        )
      );

      toast({
        title: 'Success',
        description: `Feedback visibility set to ${newVisibility}`,
      });
    } catch (error) {
      console.error('Failed to update visibility:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update feedback visibility',
      });
    }
  };
  
  const handleEdit = (feedback: Feedback) => {
    setEditForm({
      customer: feedback.customer,
      rating: feedback.rating,
      comment: feedback.comment,
      status: feedback.status,
    });
    setEditModal({ open: true, data: feedback });
  };

  const handleSaveEdit = () => {
    if (editModal.data) {
      setFeedbacks(feedbacks.map(f => 
        f.id === editModal.data!.id 
          ? { ...f, customer: editForm.customer, rating: editForm.rating, comment: editForm.comment, status: editForm.status as 'new' | 'resolved' }
          : f
      ));
      toast({
        title: "Feedback updated",
        description: "The feedback has been successfully updated.",
      });
      setEditModal({ open: false, data: null });
    }
  };



  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Feedbacks</h1>
          <p className="text-muted-foreground">Customer reviews and ratings</p>
        </div>
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
          className="w-full sm:w-[180px]"
        />
        <SelectFilter
          value={ratingFilter}
          onValueChange={setRatingFilter}
          options={ratingOptions}
          placeholder="Filter by rating"
          className="w-full sm:w-[180px]"
        />
      </div>

      <ResponsiveTableContainer
        desktopTable={
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center">
                    Rating
                    {getSortIcon('rating')}
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Comment</TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading feedbacks...
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No feedbacks found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id} className="hover:bg-muted/30 transition-colors animate-fade-in">
                    <TableCell className="font-semibold text-foreground">{feedback.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 smooth-transition hover-scale">
                        {renderStars(feedback.rating)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">
                      {feedback.comment}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(feedback.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={feedback.status === 'new' ? 'default' : 'secondary'}
                        className="smooth-transition hover-scale"
                      >
                        {feedback.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleView(feedback)}
                          className="group relative hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-125 transition-transform duration-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleVisibility(feedback.id, feedback.isVisible)}
                          className={`group relative transition-all duration-300 hover:scale-110 ${feedback.isVisible ? 'hover:bg-success/10 hover:text-success' : 'hover:bg-destructive/10 hover:text-destructive'}`}
                          title={feedback.isVisible ? 'Hide Feedback' : 'Show Feedback'}
                        > 
                          {feedback.isVisible ? <CheckCircle className="h-4 w-4 text-success group-hover:scale-125 transition-transform duration-300" /> : <XCircle className="h-4 w-4 text-destructive group-hover:scale-125 transition-transform duration-300" />}
                        </Button> 
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        }
        mobileCards={paginatedFeedbacks.map((feedback) => (
          <ResponsiveCard key={feedback.id}>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="font-semibold text-lg">{feedback.customer}</div>
                <div className="flex items-center gap-1">
                  {renderStars(feedback.rating)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{feedback.comment}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={feedback.status === 'new' ? 'default' : 'secondary'}>
                    {feedback.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(feedback.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-border/50">

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleView(feedback)}
                className="group flex-1 hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all duration-300"
              >
                <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleVisibility(feedback.id, feedback.isVisible)}
                className={`group flex-1 transition-all duration-300 ${feedback.isVisible ? 'hover:bg-success/5 hover:border-success/50 hover:text-success' : 'hover:bg-destructive/5 hover:border-destructive/50 hover:text-destructive'}`}
                title={feedback.isVisible ? 'Hide Feedback' : 'Show Feedback'}
              >
                {feedback.isVisible ? <CheckCircle className="h-4 w-4 mr-2 text-success group-hover:scale-110 transition-transform duration-300" /> : <XCircle className="h-4 w-4 mr-2 text-destructive group-hover:scale-110 transition-transform duration-300" />}
                {feedback.isVisible ? 'Hide' : 'Show'} 
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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = Math.max(1, currentPage - 2) + i;
              if (page > totalPages) return null;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
          title="Feedback Details"
                   data={{
            Customer: viewModal.data.customer,
            Rating: `${viewModal.data.rating} stars`,
            Comment: viewModal.data.comment,
            Date: new Date(viewModal.data.date).toLocaleDateString(),
            Status: viewModal.data.status,
          }}

        />
      )}

      {editModal.data && (
        <FormModal
          open={editModal.open}
          onOpenChange={(open) => setEditModal({ open, data: null })}
          title="Edit Feedback"
          onSubmit={handleSaveEdit}
          submitLabel="Save Changes"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                value={editForm.customer}
                onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <SelectFilter
                value={editForm.rating.toString()}
                onValueChange={(value) => setEditForm({ ...editForm, rating: parseInt(value) })}
                options={[
                  { label: '5 Stars', value: '5' },
                  { label: '4 Stars', value: '4' },
                  { label: '3 Stars', value: '3' },
                  { label: '2 Stars', value: '2' },
                  { label: '1 Star', value: '1' },
                ]}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={editForm.comment}
                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <SelectFilter
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as 'new' | 'resolved' })}
                options={[
                  { label: 'New', value: 'new' },
                  { label: 'Resolved', value: 'resolved' },
                ]}
                className="w-full"
              />
            </div>
          </div>
        </FormModal>
      )}

     
    </div>
  );
};

export default Feedbacks;
