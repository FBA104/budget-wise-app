/**
 * Transactions - view and manage all financial transactions
 */

import { useState } from 'react';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Transactions() {
  // get transaction data and operations from main hook
  const { transactions, deleteTransaction, categories } = useBudgetData();
  const navigate = useNavigate(); // for navigation to add transaction page
  
  // filter states for searching and filtering transactions
  const [searchTerm, setSearchTerm] = useState(''); // search by description or category
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all'); // filter by transaction type
  const [filterCategory, setFilterCategory] = useState('all'); // filter by specific category

  // filter transactions based on search term and selected filters
  const filteredTransactions = transactions.filter(transaction => {
    // check if search term matches description or category (case insensitive)
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    // check if transaction type matches selected filter
    const matchesType = filterType === 'all' || transaction.type === filterType;
    // check if transaction category matches selected filter
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    // transaction must match all active filters
    return matchesSearch && matchesType && matchesCategory;
  });

  // format amount with appropriate prefix and currency
  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`; // + for income, - for expense
  };

  // handle transaction deletion with user confirmation
  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) { // confirm with user
      deleteTransaction(id); // delete from database and update budgets
    }
  };

  // separate categories by type for organized filter dropdown
  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="space-y-6">
      {/* page header with title and add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and track your financial transactions
          </p>
        </div>
        
        {/* navigate to add transaction page */}
        <Button 
          onClick={() => navigate('/add-transaction')} // go to add transaction form
          className="bg-gradient-primary hover:bg-primary-hover"
        >
          <Plus className="w-4 h-4 mr-2" /> {/* plus icon */}
          Add Transaction
        </Button>
      </div>

      {/* Filters section for searching and filtering transactions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* responsive 3-column grid */}
            {/* search input with icon */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> {/* search icon */}
              <Input
                placeholder="Search transactions..."
                value={searchTerm} // controlled input
                onChange={(e) => setSearchTerm(e.target.value)} // update search term
                className="pl-10" // padding for icon
              />
            </div>
            
            {/* transaction type filter */}
            <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem> {/* show everything */}
                <SelectItem value="income">Income</SelectItem> {/* only income */}
                <SelectItem value="expense">Expense</SelectItem> {/* only expenses */}
              </SelectContent>
            </Select>
            
            {/* category filter with grouped options */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem> {/* show all categories */}
                <SelectGroup>
                  <SelectLabel>Expense Categories</SelectLabel>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name} {/* expense category names */}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Income Categories</SelectLabel>
                  {incomeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name} {/* income category names */}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List with filtered results */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            All Transactions ({filteredTransactions.length}) {/* show filtered count */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            // empty state with contextual message
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                  ? 'Try adjusting your filters' // if filters are active
                  : 'Start by adding your first transaction' // if no transactions exist
                }
              </p>
            </div>
          ) : (
            // list of transaction rows
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"> {/* transaction row */}
                  {/* left side - icon and details */}
                  <div className="flex items-center space-x-4">
                    {/* transaction type icon with color coding */}
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10' // green for income, red for expense
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-success" /> // up arrow for income
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" /> // down arrow for expense
                      )}
                    </div>
                    
                    {/* transaction details */}
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p> {/* transaction description */}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category} {/* category badge */}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })} {/* relative date like "2 days ago" */}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* right side - amount and delete button */}
                  <div className="flex items-center space-x-4">
                    {/* formatted amount with color coding */}
                    <span className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive' // green for income, red for expense
                    }`}>
                      {formatAmount(transaction.amount, transaction.type)} {/* +$50.00 or -$50.00 */}
                    </span>
                    
                    {/* delete button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)} // delete with confirmation
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}