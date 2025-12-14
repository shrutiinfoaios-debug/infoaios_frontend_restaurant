import { useState, useMemo, useEffect } from 'react';
import { mockMenuItems } from '@/lib/mockData';
import { MenuItem, MenuCategory, MenuItemApi } from '@/types';
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
import { Switch } from '@/components/ui/switch';
import { SelectFilter } from '@/components/ui/select-filter';
import { ResponsiveTableContainer, ResponsiveCard } from '@/components/ui/responsive-table';
import { ViewModal } from '@/components/modals/ViewModal';
import { DeleteModal } from '@/components/modals/DeleteModal';
import { FormModal } from '@/components/modals/FormModal';
import { Search, Plus, Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, FolderOpen, ArrowLeft } from 'lucide-react';
import { GiCookingPot } from 'react-icons/gi';

import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Menus = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [categoryItemCounts, setCategoryItemCounts] = useState<{[key: string]: {total: number, available: number}}>({});
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [menuItemsApi, setMenuItemsApi] = useState<MenuItemApi[]>([]);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'price' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewModal, setViewModal] = useState<{ open: boolean; data: MenuItem | null }>({ open: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; data: MenuItem | null }>({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryStatus, setNewCategoryStatus] = useState('true');
  const [menuForm, setMenuForm] = useState({ name: '', category: '', category_id: '', price: 0, available: true });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      setUserDetails(JSON.parse(storedUserDetails));
    }
  }, []);

  useEffect(() => {
    if (userDetails) {
      fetchCategories();
    }
  }, [userDetails]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortField, sortDirection, selectedCategory]);



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

        // Fetch item counts for each category
        const counts: {[key: string]: {total: number, available: number}} = {};
        for (const category of response.data) {
          try {
            const itemBody = new URLSearchParams({
              restaurant_id: userDetails._id,
              category_id: category._id,
            });

            const itemResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/menuitem/menuitem_list`, itemBody, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `JWT ${token}`,
              },
            });

            const items = itemResponse.data[0]?.menulist || [];
            counts[category._id] = {
              total: items.length,
              available: items.filter((item: MenuItemApi) => item.status === 'true').length,
            };
          } catch (itemError) {
            console.error(`Failed to fetch items for category ${category.categoryName}:`, itemError);
            counts[category._id] = { total: 0, available: 0 };
          }
        }
        setCategoryItemCounts(counts);
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

  // Extract unique categories from menu items (for fallback if API fails)
  const uniqueCategories = useMemo(() => {
    return [...new Set(menuItems.map(item => item.category))];
  }, [menuItems]);

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    ...categories.map(cat => ({ label: cat.categoryName, value: cat.categoryName })),
  ];

  const filteredAndSortedItems = useMemo(() => {
    const items = selectedCategory ? menuItemsApi.map(apiItem => ({
      id: apiItem._id,
      name: apiItem.itemName,
      category: selectedCategory.categoryName,
      price: apiItem.price || 0,
      available: apiItem.status === 'true',
    })) : menuItems;

    const result = items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? true : categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'price') {
          comparison = a.price - b.price;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [menuItems, menuItemsApi, searchTerm, categoryFilter, sortField, sortDirection, selectedCategory]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, endIndex);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const handleSort = (field: 'name' | 'price') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'price') => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-2 text-primary" /> : 
      <ArrowDown className="h-4 w-4 ml-2 text-primary" />;
  };

  const toggleAvailability = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token && userDetails) {
        const apiItem = menuItemsApi.find(item => item._id === id);
        const mockItem = menuItems.find(item => item.id === id);

        if (apiItem || mockItem) {
          // Determine current availability based on item type
          let isCurrentlyAvailable = false;
          if (apiItem) {
            isCurrentlyAvailable = apiItem.status === 'true';
          } else if (mockItem) {
            isCurrentlyAvailable = mockItem.available;
          }
          const newStatus = isCurrentlyAvailable ? 'false' : 'true';

          const body = new URLSearchParams({
            itemId: id,
            status: newStatus,
          });

          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/menuitem/update_menuitem_status`, body, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `JWT ${token}`,
            },
          });

          // Update local state
          if (selectedCategory && apiItem) {
            setMenuItemsApi(menuItemsApi.map((item) =>
              item._id === id ? { ...item, status: newStatus } : item
            ));
          } else if (mockItem) {
            setMenuItems(menuItems.map((item) =>
              item.id === id ? { ...item, available: newStatus === 'true' } : item
            ));
          }

          toast({
            title: "Availability updated",
            description: `Menu item is now ${newStatus === 'true' ? 'available' : 'unavailable'}.`,
          });
        }
      }
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update item availability',
      });
    }
  };

  const handleView = (item: MenuItem) => {
    setViewModal({ open: true, data: item });
  };

  const handleAdd = async () => {
    if (menuForm.name.trim() && selectedCategory) {
      try {
        const token = localStorage.getItem('authToken');
        if (token && userDetails) {
          const body = new URLSearchParams({
            userRestaurantId: userDetails._id,
            itemName: menuForm.name.trim(),
            status: menuForm.available ? 'true' : 'false',
            price: menuForm.price.toString(),
            created_by: userDetails._id,
            categoryId: selectedCategory._id,
          });

          console.log('Sending request with body:', Object.fromEntries(body));
          console.log('Token:', token);
          console.log('User details:', userDetails);

          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/menuitem/create_menuitem`, body, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `JWT ${token}`,
            },
          });

          // Add the new item to the list if we're not in a selected category view
          if (!selectedCategory) {
            const newItem: MenuItem = {
              id: response.data._id,
              name: response.data.itemName,
              category: categories.find(cat => cat._id === menuForm.category_id)?.categoryName || '',
              price: response.data.price || 0,
              available: response.data.status === 'true',
            };
            setMenuItems([newItem, ...menuItems]);
          } else {
          // Refresh the menu items for the selected category and update counts
          fetchMenuItems(selectedCategory._id);
          // Update category item counts after adding new item
          setCategoryItemCounts(prev => ({
            ...prev,
            [selectedCategory._id]: {
              total: (prev[selectedCategory._id]?.total || 0) + 1,
              available: menuForm.available ? (prev[selectedCategory._id]?.available || 0) + 1 : (prev[selectedCategory._id]?.available || 0)
            }
          }));
          }

          toast({
            title: "Menu item added",
            description: "New menu item has been successfully created.",
          });
          setAddModal(false);
          setMenuForm({ name: '', category: '', category_id: '', price: 0, available: true });
        }
      } catch (error) {
        console.error('Failed to add menu item:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to add menu item',
        });
      }
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const token = localStorage.getItem('authToken');
        if (token && userDetails) {
          const body = new URLSearchParams({
            userRestaurantId: userDetails._id,
            categoryName: newCategoryName.trim(),
            status: newCategoryStatus,
            created_by: userDetails._id,
          });

          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/menucategory/create_menucategory`, body, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `JWT ${token}`,
            },
          });

          // Add the new category to the list
          const newCategory = response.data;
          setCategories([...categories, newCategory]);
          // Initialize item count for new category
          setCategoryItemCounts(prev => ({
            ...prev,
            [newCategory._id]: { total: 0, available: 0 }
          }));
          toast({
            title: "Category added",
            description: "New category has been successfully created.",
          });
          setAddCategoryModal(false);
          setNewCategoryName('');
          setNewCategoryStatus('true');
        }
      } catch (error) {
        console.error('Failed to add category:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to add category',
        });
      }
    }
  };

  const handleCategoryClick = (category: MenuCategory) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setCategoryFilter('all');
    setSortField(null);
    setSortDirection('asc');
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
        setMenuItemsApi(response.data[0]?.menulist || []);
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

  const handleEdit = (item: MenuItem) => {
    const category = categories.find(cat => cat.categoryName === item.category);
    setMenuForm({
      name: item.name,
      category: item.category,
      category_id: category?._id || '',
      price: item.price,
      available: item.available,
    });
    setEditModal({ open: true, data: item });
  };

  const handleSaveEdit = () => {
    if (editModal.data) {
      setMenuItems(menuItems.map(i => 
        i.id === editModal.data!.id 
          ? { ...i, ...menuForm }
          : i
      ));
      toast({
        title: "Menu item updated",
        description: "The menu item has been successfully updated.",
      });
      setEditModal({ open: false, data: null });
    }
  };

  const handleDelete = () => {
    if (deleteModal.id) {
      setMenuItems(menuItems.filter(i => i.id !== deleteModal.id));
      toast({
        title: "Menu item deleted",
        description: "The menu item has been successfully deleted.",
      });
      setDeleteModal({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            {selectedCategory ? `${selectedCategory.categoryName} Menu Items` : 'Menu Categories'}
          </h1>
          <p className="text-muted-foreground">
            {selectedCategory ? `Manage items in ${selectedCategory.categoryName} category` : 'Select a category to view menu items'}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedCategory ? (
            <>
              <Button
                onClick={() => setSelectedCategory(null)}
                variant="outline"
                className="group relative overflow-hidden rounded-xl border-primary/50 hover:border-primary hover:bg-primary/5 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-semibold">Back to Categories</span>
              </Button>
              <Button
                onClick={() => setAddModal(true)}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/95 hover:to-accent/90 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10 font-semibold">Add Menu Item</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setAddCategoryModal(true)}
              variant="outline"
              className="group relative overflow-hidden rounded-xl border-accent/50 hover:border-accent hover:bg-accent/5 transition-all duration-300"
            >
              <FolderOpen className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">Add Category</span>
            </Button>
          )}
        </div>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingCategories ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No categories found
            </div>
          ) : (
            categories.map((category) => (
              <Card
                key={category._id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:bg-primary/5 border-0 bg-gradient-to-br from-card via-card to-muted/20"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {category.categoryName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {categoryItemCounts[category._id]?.total || 0} items
                      </p>
                    </div>
                    <div>
                      <GiCookingPot className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline" className="smooth-transition hover-scale">
                      {categoryItemCounts[category._id]?.available || 0} available
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Click to view items
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
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
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead 
                  className="font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {getSortIcon('price')}
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Availability</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingMenuItems ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading menu items...
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No menu items found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors animate-fade-in">
                    <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="smooth-transition hover-scale">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => toggleAvailability(item.id)}
                          className="smooth-transition"
                        />
                        <span className={`text-sm font-medium smooth-transition ${
                          item.available ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(item)}
                          className="group relative hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-125 transition-transform duration-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="group relative hover:bg-warning/10 hover:text-warning transition-all duration-300 hover:scale-110"
                        >
                          <Edit className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteModal({ open: true, id: item.id })}
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
        mobileCards={filteredAndSortedItems.map((item) => (
          <ResponsiveCard key={item.id}>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="font-semibold text-lg">{item.name}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.available}
                    onCheckedChange={() => toggleAvailability(item.id)}
                    className="smooth-transition"
                  />
                  <span className={`text-sm font-medium ${
                    item.available ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-border/50">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleView(item)}
                className="group flex-1 hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all duration-300"
              >
                <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEdit(item)}
                className="group flex-1 hover:bg-warning/5 hover:border-warning/50 hover:text-warning transition-all duration-300"
              >
                <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDeleteModal({ open: true, id: item.id })}
                className="group hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
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
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (totalPages <= 7) {
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
                } else {
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
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
                }
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {viewModal.data && (
        <ViewModal
          open={viewModal.open}
          onOpenChange={(open) => setViewModal({ open, data: null })}
          title="Menu Item Details"
          data={{
            Name: viewModal.data.name,
            Category: viewModal.data.category,
            Price: `$${viewModal.data.price.toFixed(2)}`,
            Available: viewModal.data.available,
          }}
        />
      )}

      <FormModal
        open={addModal}
        onOpenChange={setAddModal}
        title="Add New Menu Item"
        onSubmit={handleAdd}
        submitLabel="Create Item"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              className="h-11 rounded-xl"
              placeholder="Enter item name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={selectedCategory?.categoryName || ''}
              className="h-11 rounded-xl"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={menuForm.price}
              onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) })}
              className="h-11 rounded-xl"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={menuForm.available}
              onCheckedChange={(checked) => setMenuForm({ ...menuForm, available: checked })}
            />
            <Label>Available for customers</Label>
          </div>
        </div>
      </FormModal>

      {editModal.data && (
        <FormModal
          open={editModal.open}
          onOpenChange={(open) => setEditModal({ open, data: null })}
          title="Edit Menu Item"
          onSubmit={handleSaveEdit}
          submitLabel="Save Changes"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Item Name</Label>
              <Input
                id="edit-name"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <SelectFilter
              value={menuForm.category_id}
              onValueChange={(value) => {
                const selectedCategory = categories.find(cat => cat._id === value);
                setMenuForm({
                  ...menuForm,
                  category_id: value,
                  category: selectedCategory?.categoryName || ''
                });
              }}
              options={categories.map(cat => ({ label: cat.categoryName, value: cat._id }))}
              className="w-full"
            />
          </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                value={menuForm.price}
                onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={menuForm.available}
                onCheckedChange={(checked) => setMenuForm({ ...menuForm, available: checked })}
              />
              <Label>Available for customers</Label>
            </div>
          </div>
        </FormModal>
      )}

          <DeleteModal
            open={deleteModal.open}
            onOpenChange={(open) => setDeleteModal({ open, id: null })}
            onConfirm={handleDelete}
            title="Delete Menu Item"
            description="Are you sure you want to delete this menu item? This action cannot be undone."
          />
        </>
      )}

      <FormModal
        open={addCategoryModal}
        onOpenChange={setAddCategoryModal}
        title="Add New Category"
        onSubmit={handleAddCategory}
        submitLabel="Create Category"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="Enter category name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-status">Status</Label>
            <SelectFilter
              value={newCategoryStatus}
              onValueChange={setNewCategoryStatus}
              options={[
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]}
              className="w-full"
              placeholder="Select status"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Menus;
