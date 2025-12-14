import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockRestaurant } from '@/lib/mockData';
import { Restaurant, OpeningHours, Subscription } from '@/types';
import { Loader2, CreditCard, Calendar, AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

interface TableType {
  id: string;
  name: string;
  status: boolean;
  noOfTables: number;
}

interface ApiTableType {
  _id: string;
  typeName: string;
}

interface ApiTableTypeResponse {
  id?: string;
  _id?: string;
  name: string;
  status: string | boolean;
  noOfTables: string | number;
}

const Settings = () => {
  const [restaurant, setRestaurant] = useState<Restaurant>(mockRestaurant);
  const [profileData, setProfileData] = useState({
    _id: '',
    username: '',
    email: '',
    phoneNumber: '',
    restaurantName: '',
    restaurantAddress: '',
    noOfTables: 0,
    tableTypes: [] as TableType[]
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [availableTableTypes, setAvailableTableTypes] = useState<ApiTableType[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/user_profile`, {}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `JWT ${token}`
            }
          });
          setProfileData({
            _id: response.data._id || '',
            username: response.data.username || '',
            email: response.data.email || '',
            phoneNumber: response.data.phoneNumber || '',
            restaurantName: response.data.restaurantName || '',
            restaurantAddress: response.data.restaurantAddress || '',
            noOfTables: response.data.noOfTables || 0,
            tableTypes: (response.data.tableTypes || []).map((t: ApiTableTypeResponse) => ({
              id: t.id || t._id,
              name: t.name,
              status: String(t.status) === 'true',
              noOfTables: parseInt(String(t.noOfTables), 10) || 0
            }))
          });
          // Update restaurant state with API data
          setRestaurant(prev => ({
            ...prev,
            ownerName: response.data.username,
            ownerEmail: response.data.email,
            name: response.data.restaurantName,
            email: response.data.email,
            phone: response.data.phoneNumber
          }));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data.',
        });
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  useEffect(() => {
    const fetchTableTypes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tabletype/tabletype_list`, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `JWT ${token}`
            }
          });
          setAvailableTableTypes(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch table types:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load table types.',
        });
      }
    };
    fetchTableTypes();
  }, [toast]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // Mock subscription data - replace with actual API call
        const mockSubscription: Subscription = {
          id: 'sub_123',
          status: 'active',
          renewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          plan: 'Premium Plan',
          price: 29.99
        };
        setSubscription(mockSubscription);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load subscription data.',
        });
      } finally {
        setIsSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [toast]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const totalTables = profileData.tableTypes.reduce((sum, type) => sum + (Number(type.noOfTables) || 0), 0);

    try {
      const token = localStorage.getItem('authToken');
      if (token && profileData._id) {
        const formData = new URLSearchParams();
        formData.append('username', profileData.username);
        formData.append('email', profileData.email);
        formData.append('phoneNumber', profileData.phoneNumber);
        formData.append('restaurantName', profileData.restaurantName);
        formData.append('restaurantAddress', profileData.restaurantAddress);
        formData.append('noOfTables', totalTables.toString());

        profileData.tableTypes.forEach((table, index) => {
          formData.append(`tableTypes[${index}][id]`, table.id);
          formData.append(`tableTypes[${index}][name]`, table.name);
          formData.append(`tableTypes[${index}][noOfTables]`, String(table.noOfTables));
          formData.append(`tableTypes[${index}][status]`, String(table.status));
        });

        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/update_user_profile/${profileData._id}`, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`
          }
        });

        toast({
          title: 'Profile Updated',
          description: 'Your restaurant profile has been updated successfully.',
        });
        setProfileData(prev => ({
          ...prev,
          noOfTables: totalTables
        }));
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Profile Update Failed',
        description: axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to update profile.' : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'New password and confirm password do not match.',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const formData = new URLSearchParams();
        formData.append('old_password', currentPassword);
        formData.append('new_password', newPassword);

        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/change_password`, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`
          }
        });

        toast({
          title: 'Password Changed',
          description: 'Your password has been changed successfully.',
        });

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to change password.' : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpeningHoursUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Opening Hours Updated',
      description: 'Restaurant opening hours have been updated.',
    });
    
    setIsLoading(false);
  };

  const updateOpeningHours = (dayIndex: number, field: keyof OpeningHours, value: unknown) => {
    const newHours = [...restaurant.openingHours];
    newHours[dayIndex] = { ...newHours[dayIndex], [field]: value };
    setRestaurant({ ...restaurant, openingHours: newHours });
  };

  const getDaysUntilRenewal = (renewalDate: string) => {
    const now = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddTableType = () => {
    setProfileData(prev => ({
      ...prev,
      tableTypes: [...prev.tableTypes, { id: '', name: '', noOfTables: 0, status: true }]
    }));
  };

  const handleRemoveTableType = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      tableTypes: prev.tableTypes.filter((_, i) => i !== index)
    }));
  };

  const handleTableTypeChange = (index: number, field: keyof TableType, value: string | number | boolean) => {
    const newTableTypes = [...profileData.tableTypes];
    const tableTypeToUpdate = { ...newTableTypes[index], [field]: value };
    
    if (field === 'id') {
      tableTypeToUpdate.name = availableTableTypes.find(t => t._id === value)?.typeName || '';
    }
    newTableTypes[index] = tableTypeToUpdate;
    setProfileData(prev => ({ ...prev, tableTypes: newTableTypes }));
  };

  const handlePayNow = async () => {
    setIsLoading(true);
    try {
      // Mock payment processing - replace with actual payment API
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Payment Successful',
        description: 'Your subscription has been renewed successfully.',
      });
      // Refresh subscription data
      const updatedSubscription: Subscription = {
        ...subscription!,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };
      setSubscription(updatedSubscription);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'Failed to process payment. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-full overflow-x-hidden">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your restaurant settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6 w-full">
        <div className="overflow-x-auto scrollbar-thin">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto inline-flex min-w-full sm:min-w-0">
            <TabsTrigger 
              value="profile" 
              className="rounded-xl px-3 sm:px-6 py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
            >
              <span className="hidden sm:inline">Restaurant Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="hours" 
              className="rounded-xl px-3 sm:px-6 py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
            >
              <span className="hidden sm:inline">Opening Hours</span>
              <span className="sm:hidden">Hours</span>
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="rounded-xl px-3 sm:px-6 py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
            >
              <span className="hidden sm:inline">Change Password</span>
              <span className="sm:hidden">Password</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-xl px-3 sm:px-6 py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
            >
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notify</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="rounded-xl px-3 sm:px-6 py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
            >
              <span className="hidden sm:inline">Subscription</span>
              <span className="sm:hidden">Sub</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="animate-fade-in">
          <Card className="premium-card border-border/50 shadow-xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Restaurant Profile
              </CardTitle>
              <CardDescription className="text-sm md:text-base">Update your restaurant information</CardDescription>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading profile...</span>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName" className="text-sm font-medium text-foreground">Restaurant Name</Label>
                      <Input
                        id="restaurantName"
                        value={profileData.restaurantName}
                        onChange={(e) => setProfileData({ ...profileData, restaurantName: e.target.value })}
                        className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="restaurantAddress" className="text-sm font-medium text-foreground">Restaurant Address</Label>
                      <Input
                        id="restaurantAddress"
                        value={profileData.restaurantAddress}
                        onChange={(e) => setProfileData({ ...profileData, restaurantAddress: e.target.value })}
                        className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold text-foreground">Table Types</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddTableType} className="rounded-lg gap-2">
                        <PlusCircle className="h-4 w-4" /> Add Type
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {profileData.tableTypes.map((tableType, index) => {
                        const selectedIds = profileData.tableTypes
                          .filter((t) => t.id && t.id !== tableType.id)
                          .map((t) => t.id);

                        const filteredOptions = availableTableTypes.filter(
                          (option) => !selectedIds.includes(option._id)
                        );

                        return (<div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] gap-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                          <div className="space-y-2">
                            <Label htmlFor={`table-type-${index}`} className="text-xs font-medium text-muted-foreground">Type</Label>
                            <Select
                              value={tableType.id}
                              onValueChange={(value) => handleTableTypeChange(index, 'id', value)}
                            >
                              <SelectTrigger className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground" disabled={filteredOptions.length === 0 && !tableType.id}>
                                <SelectValue placeholder="Select a table type" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredOptions.map((type) => (
                                  <SelectItem key={type._id} value={type._id}>{type.typeName}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`table-count-${index}`} className="text-xs font-medium text-muted-foreground">No. of Tables</Label>
                            <Input
                              id={`table-count-${index}`}
                              type="number"
                              min="0"
                              value={tableType.noOfTables}
                              onChange={(e) => handleTableTypeChange(index, 'noOfTables', parseInt(e.target.value, 10) || 0)}
                              className="h-11 w-28 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveTableType(index)}
                              className="text-destructive hover:bg-destructive/10 rounded-full">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>);
                      })}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="animate-fade-in">
          <Card className="premium-card border-border/50 shadow-xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Opening Hours
              </CardTitle>
              <CardDescription className="text-sm md:text-base">Set your restaurant's operating hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOpeningHoursUpdate} className="space-y-4">
                {restaurant.openingHours.map((day, index) => (
                  <div 
                    key={day.day} 
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-4 border-b border-border/40 last:border-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-full sm:w-28 font-medium text-foreground">{day.day}</div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <Switch
                        checked={day.isOpen}
                        onCheckedChange={(checked) => updateOpeningHours(index, 'isOpen', checked)}
                      />
                      {day.isOpen && (
                        <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
                          <Input
                            type="time"
                            value={day.slots[0]?.open || '09:00'}
                            onChange={(e) => {
                              const newSlots = [...day.slots];
                              newSlots[0] = { ...newSlots[0], open: e.target.value };
                              updateOpeningHours(index, 'slots', newSlots);
                            }}
                            className="w-full sm:w-32 h-10 rounded-xl border-border/50 bg-background text-foreground"
                          />
                          <span className="text-muted-foreground text-sm">to</span>
                          <Input
                            type="time"
                            value={day.slots[0]?.close || '22:00'}
                            onChange={(e) => {
                              const newSlots = [...day.slots];
                              newSlots[0] = { ...newSlots[0], close: e.target.value };
                              updateOpeningHours(index, 'slots', newSlots);
                            }}
                            className="w-full sm:w-32 h-10 rounded-xl border-border/50 bg-background text-foreground"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Hours
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="animate-fade-in">
          <Card className="premium-card border-border/50 shadow-xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Change Password
              </CardTitle>
              <CardDescription className="text-sm md:text-base">Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300 bg-background text-foreground"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="animate-fade-in">
          <Card className="premium-card border-border/50 shadow-xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-sm md:text-base">Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/40 via-muted/30 to-muted/20 border border-border/40 hover:border-primary/30 transition-all duration-300">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-foreground">Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Receive email updates for new bookings</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/40 via-muted/30 to-muted/20 border border-border/40 hover:border-primary/30 transition-all duration-300">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-foreground">SMS Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get SMS alerts for urgent matters</p>
                </div>
                <Switch />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/40 via-muted/30 to-muted/20 border border-border/40 hover:border-primary/30 transition-all duration-300">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-foreground">Order Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Notify when new orders are placed</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Send Test Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="animate-fade-in">
          <Card className="premium-card border-border/50 shadow-xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Subscription Management
              </CardTitle>
              <CardDescription className="text-sm md:text-base">Manage your subscription plan and billing</CardDescription>
            </CardHeader>
            <CardContent>
              {isSubscriptionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading subscription...</span>
                </div>
              ) : subscription ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/40 via-muted/30 to-muted/20 border border-border/40">
                        <CreditCard className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Plan</p>
                          <p className="text-lg font-semibold text-primary">{subscription.plan}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/40 via-muted/30 to-muted/20 border border-border/40">
                        <Calendar className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Renewal Date</p>
                          <p className="text-lg font-semibold text-foreground">
                            {new Date(subscription.renewalDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/40 via-muted/30 to-muted/20 border border-border/40">
                        <div className={`h-3 w-3 rounded-full ${
                          subscription.status === 'active' ? 'bg-green-500' :
                          subscription.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">Status</p>
                          <p className={`text-lg font-semibold capitalize ${
                            subscription.status === 'active' ? 'text-green-600' :
                            subscription.status === 'expired' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {subscription.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/40 via-muted/30 to-muted/20 border border-border/40">
                        <div className="text-2xl font-bold text-primary">$</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Monthly Price</p>
                          <p className="text-lg font-semibold text-foreground">${subscription.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {subscription.status === 'active' && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-blue-25 to-blue-10 border border-blue-200 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 dark:border-blue-700">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Days until renewal: {getDaysUntilRenewal(subscription.renewalDate)}
                          </p>
                          {getDaysUntilRenewal(subscription.renewalDate) <= 10 && (
                            <div className="mt-3 flex items-center gap-3">
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                              <p className="text-sm text-amber-800 dark:text-amber-200">
                                Your subscription renews soon. Renew now to avoid interruption.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {subscription.status === 'active' && getDaysUntilRenewal(subscription.renewalDate) <= 10 && (
                    <Button
                      onClick={handlePayNow}
                      disabled={isLoading}
                      className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now - ${subscription.price}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No subscription data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
