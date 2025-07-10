/**
 * Categories - manage transaction categories
 */

import { useState } from 'react';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types/budget';
import { 
  Plus, 
  Edit,
  Trash2,
  Tag,
  DollarSign,
  Briefcase,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  Film,
  Receipt,
  Heart,
  Laptop,
  TrendingUp,
  Home,
  Gamepad2,
  GraduationCap
} from 'lucide-react';

// available icons for categories with user-friendly labels
const iconOptions = [
  { value: 'DollarSign', label: 'Dollar Sign', icon: DollarSign }, // generic money
  { value: 'Briefcase', label: 'Briefcase', icon: Briefcase }, // work/business
  { value: 'Car', label: 'Car', icon: Car }, // transportation
  { value: 'UtensilsCrossed', label: 'Food', icon: UtensilsCrossed }, // dining/groceries
  { value: 'ShoppingBag', label: 'Shopping', icon: ShoppingBag }, // retail purchases
  { value: 'Film', label: 'Entertainment', icon: Film }, // movies/shows
  { value: 'Receipt', label: 'Bills', icon: Receipt }, // utilities/bills
  { value: 'Heart', label: 'Healthcare', icon: Heart }, // medical expenses
  { value: 'Laptop', label: 'Freelance', icon: Laptop }, // work income
  { value: 'TrendingUp', label: 'Investment', icon: TrendingUp }, // investment income
  { value: 'Home', label: 'Home', icon: Home }, // housing costs
  { value: 'Gamepad2', label: 'Gaming', icon: Gamepad2 }, // gaming expenses
  { value: 'GraduationCap', label: 'Education', icon: GraduationCap }, // education costs
  { value: 'Tag', label: 'Other', icon: Tag }, // fallback for misc
];

// available colors for categories (tailwind color palette)
const colorOptions = [
  { value: '#ef4444', label: 'Red' }, // red-500
  { value: '#f97316', label: 'Orange' }, // orange-500
  { value: '#eab308', label: 'Yellow' }, // yellow-500
  { value: '#10b981', label: 'Green' }, // emerald-500
  { value: '#06b6d4', label: 'Cyan' }, // cyan-500
  { value: '#3b82f6', label: 'Blue' }, // blue-500 (default)
  { value: '#8b5cf6', label: 'Purple' }, // violet-500
  { value: '#ec4899', label: 'Pink' }, // pink-500
];

export default function Categories() {
  // get category data and CRUD operations from main hook
  const { categories, addCategory, updateCategory, deleteCategory } = useBudgetData();
  const { toast } = useToast(); // for showing notifications
  
  // dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // controls add category dialog
  const [editingCategory, setEditingCategory] = useState<Category | null>(null); // currently editing category (null = not editing)
  
  // form state with defaults
  const [formData, setFormData] = useState({
    name: '', // category name
    type: 'expense' as 'income' | 'expense', // default to expense (more common)
    color: '#3b82f6', // default blue color
    icon: 'DollarSign', // default generic money icon
  });

  // handle form submission for both create and edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    
    // validate required name field
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'Please enter a category name.',
        variant: 'destructive',
      });
      return;
    }

    // Check if category name already exists (case insensitive)
    const existingCategory = categories.find(c => 
      c.name.toLowerCase() === formData.name.toLowerCase() && 
      c.type === formData.type && // same type (income/expense)
      c.id !== editingCategory?.id // exclude current category when editing
    );
    
    if (existingCategory) {
      toast({
        title: 'Error',
        description: 'A category with this name already exists.',
        variant: 'destructive',
      });
      return;
    }

    // determine if we're editing or creating
    if (editingCategory) {
      // update existing category
      updateCategory(editingCategory.id, {
        name: formData.name,
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
      });
      toast({
        title: 'Success',
        description: 'Category updated successfully!',
      });
      setEditingCategory(null); // exit edit mode
    } else {
      // create new category
      addCategory({
        name: formData.name,
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
      });
      toast({
        title: 'Success',
        description: 'Category created successfully!',
      });
      setIsAddDialogOpen(false); // close add dialog
    }

    // reset form to defaults
    setFormData({
      name: '',
      type: 'expense',
      color: '#3b82f6',
      icon: 'DollarSign',
    });
  };

  // prepare category for editing - populate form with existing data
  const handleEdit = (category: Category) => {
    setEditingCategory(category); // set edit mode
    setFormData({
      name: category.name, // pre-fill current name
      type: category.type, // pre-fill current type
      color: category.color, // pre-fill current color
      icon: category.icon, // pre-fill current icon
    });
  };

  // handle category deletion with protection for default categories
  const handleDelete = (id: string, name: string, isDefault: boolean) => {
    if (isDefault) {
      // prevent deletion of system default categories
      toast({
        title: 'Cannot Delete',
        description: 'Default categories cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }

    // confirm deletion with user
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCategory(id); // delete from database
      toast({
        title: 'Success',
        description: 'Category deleted successfully!',
      });
    }
  };

  // get the icon component from the icon name string
  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : DollarSign; // fallback to default icon
  };

  // separate categories by type for display in two columns
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <div className="space-y-6">
      {/* page header with title and add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">
            Manage your transaction categories
          </p>
        </div>
        
        {/* add category dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover">
              <Plus className="w-4 h-4 mr-2" /> {/* plus icon */}
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a custom category for your transactions.
              </DialogDescription>
            </DialogHeader>
            {/* category creation form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* category name input */}
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Coffee, Gas, Books"
                  value={formData.name} // controlled input
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} // update form state
                  required
                />
              </div>

              {/* category type selector */}
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'income' | 'expense') => 
                    setFormData(prev => ({ ...prev, type: value })) // update type in form state
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem> {/* money going out */}
                    <SelectItem value="income">Income</SelectItem> {/* money coming in */}
                  </SelectContent>
                </Select>
              </div>

              {/* icon selector */}
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))} // update icon in form state
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => {
                      const IconComponent = option.icon; // get icon component
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4" /> {/* show icon preview */}
                            <span>{option.label}</span> {/* show human-readable label */}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* color picker */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color.value ? 'border-foreground' : 'border-border' // highlight selected color
                      }`}
                      style={{ backgroundColor: color.value }} // show actual color
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))} // update color in form state
                      title={color.label} // tooltip with color name
                    />
                  ))}
                </div>
              </div>

              {/* form action buttons */}
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1"> {/* submit form */}
                  Create Category
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)} // close dialog without saving
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid - two columns for expense and income */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Expense Categories ({expenseCategories.length}) {/* show count */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseCategories.map((category) => {
                const IconComponent = getIconComponent(category.icon); // get icon component
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"> {/* category row */}
                    {/* left side - icon and name */}
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }} // light background using category color
                      >
                        <IconComponent 
                          className="w-4 h-4" 
                          style={{ color: category.color }} // icon in category color
                        />
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p> {/* category name */}
                        {category.isDefault && (
                          <p className="text-xs text-muted-foreground">Default category</p> // mark system defaults
                        )}
                      </div>
                    </div>
                    
                    {/* right side - action buttons */}
                    <div className="flex items-center space-x-2">
                      {!category.isDefault && ( // only show edit/delete for custom categories
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)} // edit this category
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id, category.name, category.isDefault || false)} // delete with confirmation
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* empty state for expense categories */}
              {expenseCategories.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-2" /> {/* large tag icon */}
                  <p className="text-muted-foreground">No expense categories yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Income Categories */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Income Categories ({incomeCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incomeCategories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <IconComponent 
                          className="w-4 h-4" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.isDefault && (
                          <p className="text-xs text-muted-foreground">Default category</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!category.isDefault && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id, category.name, category.isDefault || false)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {incomeCategories.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No income categories yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update your category details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Coffee, Gas, Books"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Select 
                value={formData.icon} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color.value ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Category
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}