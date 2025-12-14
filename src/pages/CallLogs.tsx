import { useState, useMemo, useEffect } from 'react';
import { CallLog } from '@/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { ResponsiveTableContainer, ResponsiveCard } from '@/components/ui/responsive-table';
import { ViewModal } from '@/components/modals/ViewModal';
import { FormModal } from '@/components/modals/FormModal';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Plus, Eye, ArrowUpDown, ArrowUp, ArrowDown, Phone, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CallLogs = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'duration' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewModal, setViewModal] = useState<{ open: boolean; data: Record<string, unknown> | null; audioUrl?: string }>({ open: false, data: null, audioUrl: undefined });
  const [addModal, setAddModal] = useState(false);
  const [formData, setFormData] = useState({
    callerName: '',
    callerNumber: '',
    callDuration: '',
    callConversation: '',
    callType: 'incoming',
    purpose: 'c0mplete',
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
      fetchCallLogs();
    }
  }, [userDetails]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userDetails) {
        fetchCallLogs();
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [userDetails]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection]);

  const fetchCallLogs = async () => {
    // Only show the main loader on the initial fetch when there are no logs.
    if (callLogs.length === 0) {
      setIsLoading(false);
    }
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/calllog/calllog_list?restaurant_id=${userDetails._id}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`
          }
        });
        setCallLogs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch call logs:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load call logs',
      });
    } finally {
      // Ensure the loader is turned off after any fetch.
      setIsLoading(false);
    }
  };

  const filteredAndSortedLogs = useMemo(() => {
    const result = callLogs.filter(
      (log) =>
        (log.callerName && log.callerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.callerNumber && log.callerNumber.includes(searchTerm)) ||
        (log.callConversation && log.callConversation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.callType && log.callType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.purpose && log.purpose.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = new Date(a.calledAt).getTime() - new Date(b.calledAt).getTime();
        } else if (sortField === 'duration') {
          comparison = parseInt(a.callDuration) - parseInt(b.callDuration);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [callLogs, searchTerm, sortField, sortDirection]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedLogs.slice(startIndex, endIndex);
  }, [filteredAndSortedLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedLogs.length / itemsPerPage);

  const handleSort = (field: 'date' | 'duration') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: 'date' | 'duration') => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-2 text-primary" /> : 
      <ArrowDown className="h-4 w-4 ml-2 text-primary" />;
  };

  const formatDuration = (callDuration: string) => {
    const seconds = parseInt(callDuration);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleView = (log: CallLog) => {
    setViewModal({
      open: true,
      data: {
        'Caller Name': log.callerName,
        'Caller Number': log.callerNumber,
        'Call Conversation': log.callConversation,
        'Date & Time': new Date(log.calledAt).toLocaleString(),
        'Call Duration': formatDuration(log.callDuration),
        'Call Type': log.callType,
        'Purpose': log.purpose,
        'Restaurant': log.restaurantDetails[0]?.restaurantName || '0',
      } });
  };

  const handleAdd = () => {
    setFormData({
      callerName: '',
      callerNumber: '',
      callDuration: '',
      callConversation: '',
      callType: 'incoming',
      purpose: 'c0mplete',
    });
    setAddModal(true);
  };



  const handleAddSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !userDetails) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Authentication required.',
        });
        return;
      }

      const body = new URLSearchParams({
        callerName: formData.callerName,
        callerNumber: formData.callerNumber,
        callDuration: formData.callDuration,
        callConversation: formData.callConversation,
        callType: formData.callType,
        purpose: formData.purpose,
        userRestaurantId: userDetails._id,
      });

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/calllog/create_calllog`, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
      });

      setAddModal(false);
      fetchCallLogs();
      toast({
        title: 'Success',
        description: 'Call log added successfully.',
      });
    } catch (error) {
      console.error('Failed to add call log:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add call log.',
      });
    }
  };



  const handleListen = (log: CallLog) => {
    if (log.audioUrl) {
      // Open modal with audio player
      setViewModal({
        open: true,
        data: {
          'Caller Name': log.callerName,
          'Caller Number': log.callerNumber,
          'Call Conversation': log.callConversation,
          'Date & Time': new Date(log.calledAt).toLocaleString(),
          'Call Duration': formatDuration(log.callDuration),
          'Call Type': log.callType,
          'Purpose': log.purpose,
          'Restaurant': log.restaurantDetails[0]?.restaurantName || '0',
        },
        audioUrl: log.audioUrl
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'No audio available',
        description: 'This call does not have an audio recording.',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Call Logs
            </h1>
            <Badge variant="success" className="animate-pulse">Live</Badge>
          </div>
          <p className="text-muted-foreground">Manage customer call records</p>
        </div>

      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by caller name, number, conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 rounded-xl border-border/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      <ResponsiveTableContainer
        desktopTable={
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Caller Name</TableHead>
                <TableHead>Caller Number</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date & Time
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center">
                    Call Duration
                    {getSortIcon('duration')}
                  </div>
                </TableHead>
                <TableHead>Call Type</TableHead>
                <TableHead>Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading call logs...
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No call logs found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-semibold text-foreground">
                      {log.callerName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {log.callerNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.calledAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{formatDuration(log.callDuration)}</span>
                                      <Play className="h-4 w-4 mr-2 ml-2 group-hover:scale-110 transition-transform duration-300" />

                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      <Badge variant={log.callType === 'incoming' ? 'success' : 'outline'}>
                        {log.callType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.purpose === 'c0mplete' ? 'success' : 'outline'}>
                        {log.purpose}
                      </Badge>
                    </TableCell>
                   
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        }
        mobileCards={paginatedLogs.map((log) => (
          <ResponsiveCard key={log._id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-semibold text-lg text-foreground">
                    {log.callerName}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {log.callerNumber}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Call Duration: </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{formatDuration(log.callDuration)}</span>
                    {log.audioUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleListen(log)}
                        className="h-6 w-6 hover:bg-accent/10 hover:text-accent"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Date: </span>
                  <span className="text-foreground">{new Date(log.calledAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Type: </span>
                  <Badge variant={log.callType === 'incoming' ? 'success' : 'outline'}>
                    {log.callType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Purpose: </span>
                  <Badge variant={log.purpose === 'c0mplete' ? 'success' : 'outline'}>
                    {log.purpose}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-border/50">
           
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleListen(log)}
                className="group flex-1 hover:bg-accent/5 hover:border-accent/50 hover:text-accent transition-all duration-300"
              >
                <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Play
              </Button>
            </div>
          </ResponsiveCard>
        ))}
      />

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* View Modal */}
      {viewModal.data && (
        <ViewModal
          open={viewModal.open}
          onOpenChange={(open) => setViewModal({ open, data: null, audioUrl: undefined })}
          title="Call Log Details"
          data={viewModal.data}
          audioUrl={viewModal.audioUrl}
        />
      )}

      {/* Add Modal */}
      <FormModal
        open={addModal}
        onOpenChange={setAddModal}
        title="Add Call Log"
        description="Enter the details for the new call log."
        onSubmit={handleAddSubmit}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="callerName">Caller Name</Label>
            <Input
              id="callerName"
              value={formData.callerName}
              onChange={(e) => setFormData({ ...formData, callerName: e.target.value })}
              placeholder="Enter caller name"
            />
          </div>
          <div>
            <Label htmlFor="callerNumber">Caller Number</Label>
            <Input
              id="callerNumber"
              value={formData.callerNumber}
              onChange={(e) => setFormData({ ...formData, callerNumber: e.target.value })}
              placeholder="Enter caller number"
            />
          </div>
          <div>
            <Label htmlFor="callDuration">Call Duration (seconds)</Label>
            <Input
              id="callDuration"
              value={formData.callDuration}
              onChange={(e) => setFormData({ ...formData, callDuration: e.target.value })}
              placeholder="Enter call duration in seconds"
            />
          </div>
          <div>
            <Label htmlFor="callConversation">Call Conversation</Label>
            <Input
              id="callConversation"
              value={formData.callConversation}
              onChange={(e) => setFormData({ ...formData, callConversation: e.target.value })}
              placeholder="Enter call conversation"
            />
          </div>
          <div>
            <Label htmlFor="callType">Call Type</Label>
            <Select value={formData.callType} onValueChange={(value) => setFormData({ ...formData, callType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select call type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c0mplete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>



    </div>
  );
};

export default CallLogs;
