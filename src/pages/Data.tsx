/**
 * Data - import/export financial data
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
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  FileText, 
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Data() {
  // get all financial data and import functions from the main hook
  const { 
    transactions, 
    budgets, 
    goals, 
    categories, 
    loading,
    importTransactions,
    importCategories,
    importBudgets,
    importGoals
  } = useBudgetData();
  const { toast } = useToast(); // for showing notifications
  
  // export settings
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv'); // default to CSV
  
  // import states
  const [importFile, setImportFile] = useState<File | null>(null); // selected file to import
  const [importResults, setImportResults] = useState<{
    imported: number; // how many records were successfully imported
    skipped: number; // how many were skipped (duplicates)
    errors: string[]; // any errors that occurred
    dataType: string; // what type of data was imported
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false); // prevent multiple imports

  // main export function - handles different data types and formats
  const exportData = (format: 'csv' | 'json', dataType: 'transactions' | 'budgets' | 'goals' | 'categories' | 'all') => {
    let data: any[] = []; // data to export
    let filename = ''; // filename with date stamp

    // determine what data to export based on type
    switch (dataType) {
      case 'transactions':
        data = transactions;
        filename = `transactions_${new Date().toISOString().split('T')[0]}`; // YYYY-MM-DD format
        break;
      case 'budgets':
        data = budgets;
        filename = `budgets_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'goals':
        data = goals;
        filename = `goals_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'categories':
        data = categories;
        filename = `categories_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'all':
        // special case - export everything as one JSON file
        const allData = {
          transactions,
          budgets,
          goals,
          categories,
          exportedAt: new Date().toISOString(), // timestamp when exported
        };
        filename = `budget_data_${new Date().toISOString().split('T')[0]}`;
        
        // always export all data as JSON (too complex for CSV)
        const jsonContent = JSON.stringify(allData, null, 2); // pretty format with indents
        downloadFile(`${filename}.json`, jsonContent, 'application/json');
        
        toast({
          title: 'Export Successful',
          description: `All data exported successfully as JSON`,
        });
        return; // exit early for 'all' case
    }

    // export single data type in requested format
    if (format === 'csv') {
      const csvContent = convertToCSV(data); // convert array to CSV string
      downloadFile(`${filename}.csv`, csvContent, 'text/csv');
    } else {
      const jsonContent = JSON.stringify(data, null, 2); // pretty JSON format
      downloadFile(`${filename}.json`, jsonContent, 'application/json');
    }

    // show success message
    toast({
      title: 'Export Successful',
      description: `${dataType} data exported successfully as ${format.toUpperCase()}`,
    });
  };

  // convert array of objects to CSV format string
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''; // return empty string if no data
    
    // get column headers from first object
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(','); // create header row
    
    // convert each data row to CSV format
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV (wrap in quotes and double up internal quotes)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value; // return value as-is if no special characters
      }).join(',') // join columns with commas
    );
    
    // combine header and data rows with newlines
    return [csvHeaders, ...csvRows].join('\n');
  };

  // trigger file download in browser
  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType }); // create file blob
    const url = URL.createObjectURL(blob); // create download URL
    const link = document.createElement('a'); // create invisible link element
    link.href = url;
    link.download = filename; // set download filename
    document.body.appendChild(link); // add to DOM temporarily
    link.click(); // trigger download
    document.body.removeChild(link); // clean up DOM
    URL.revokeObjectURL(url); // clean up URL object
  };

  // handle file selection for import
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // get first selected file
    if (file) {
      setImportFile(file); // store file for import processing
    }
  };

  // main import function - processes selected file
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to import.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true); // disable UI while processing
    setImportResults(null); // clear previous results

    try {
      const content = await importFile.text(); // read file content as text
      let data;
      let dataType = '';

      // process file based on extension
      if (importFile.name.endsWith('.json')) {
        data = JSON.parse(content); // parse JSON content
        
        // Check if it's a full data export (contains multiple data types)
        if (data.transactions || data.budgets || data.goals || data.categories) {
          // Handle full data export - import each type separately
          let totalImported = 0;
          let totalSkipped = 0;
          const allErrors: string[] = [];

          // import transactions if present
          if (data.transactions) {
            const result = await importTransactions(data.transactions);
            totalImported += result.imported;
            totalSkipped += result.skipped;
            allErrors.push(...result.errors);
          }

          // import categories if present (do this before budgets since budgets depend on categories)
          if (data.categories) {
            const result = await importCategories(data.categories);
            totalImported += result.imported;
            totalSkipped += result.skipped;
            allErrors.push(...result.errors);
          }

          // import budgets if present
          if (data.budgets) {
            const result = await importBudgets(data.budgets);
            totalImported += result.imported;
            totalSkipped += result.skipped;
            allErrors.push(...result.errors);
          }

          // import goals if present
          if (data.goals) {
            const result = await importGoals(data.goals);
            totalImported += result.imported;
            totalSkipped += result.skipped;
            allErrors.push(...result.errors);
          }

          // set combined results
          setImportResults({
            imported: totalImported,
            skipped: totalSkipped,
            errors: allErrors,
            dataType: 'All Data'
          });
        } else if (Array.isArray(data)) {
          // Single data type array - detect what type it is
          const result = await detectAndImportDataType(data);
          setImportResults({ ...result, dataType: result.dataType });
        } else {
          throw new Error('Invalid JSON format. Expected array or full data export.');
        }
      } else if (importFile.name.endsWith('.csv')) {
        data = parseCSV(content); // parse CSV into array of objects
        const result = await detectAndImportDataType(data); // detect and import
        setImportResults({ ...result, dataType: result.dataType });
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON files.');
      }

      // show success message
      toast({
        title: 'Import Completed',
        description: `Import finished. Check results below.`,
      });
    } catch (error: any) {
      // show error message if import failed
      toast({
        title: 'Import Error',
        description: error.message || 'Failed to import data.',
        variant: 'destructive',
      });
      // set error results
      setImportResults({
        imported: 0,
        skipped: 0,
        errors: [error.message],
        dataType: 'Unknown'
      });
    } finally {
      setIsImporting(false); // re-enable UI
    }
  };

  // auto-detect data type based on object properties and import accordingly
  const detectAndImportDataType = async (data: any[]) => {
    if (data.length === 0) throw new Error('No data to import.');

    const firstItem = data[0]; // examine first item to determine type
    
    // Detect data type based on key properties that each type should have
    if (firstItem.hasOwnProperty('amount') && firstItem.hasOwnProperty('type')) {
      // transactions have amount and type (income/expense)
      return { ...(await importTransactions(data)), dataType: 'Transactions' };
    } else if (firstItem.hasOwnProperty('name') && firstItem.hasOwnProperty('type') && (firstItem.type === 'income' || firstItem.type === 'expense')) {
      // categories have name and type (income/expense)
      return { ...(await importCategories(data)), dataType: 'Categories' };
    } else if (firstItem.hasOwnProperty('category') && firstItem.hasOwnProperty('limit')) {
      // budgets have category and limit properties
      return { ...(await importBudgets(data)), dataType: 'Budgets' };
    } else if (firstItem.hasOwnProperty('title') && firstItem.hasOwnProperty('targetAmount')) {
      // goals have title and targetAmount properties
      return { ...(await importGoals(data)), dataType: 'Goals' };
    } else {
      throw new Error('Could not detect data type. Please ensure your file has the correct format.');
    }
  };

  // parse CSV content into array of objects
  const parseCSV = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim()); // split by lines, remove empty ones
    if (lines.length < 2) throw new Error('CSV file must have at least a header row and one data row.');
    
    const headers = lines[0].split(',').map(h => h.trim()); // first line is headers
    const data = lines.slice(1).map(line => { // remaining lines are data
      const values = line.split(',').map(v => v.trim()); // split by commas
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || ''; // map each value to its header
      });
      return row; // return object for this row
    });
    
    return data; // return array of objects
  };

  // show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]"> {/* centered loading container */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div> {/* spinner */}
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* page header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
        <p className="text-muted-foreground">
          Export and import your financial data
        </p>
      </div>

      {/* main content grid - export and import sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" /> {/* download icon */}
              <span>Export Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* format selector */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel compatible)</SelectItem> {/* good for spreadsheets */}
                  <SelectItem value="json">JSON (Complete data)</SelectItem> {/* preserves all data types */}
                </SelectContent>
              </Select>
            </div>

            {/* export buttons section */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Select data to export:</p>
              
              <div className="grid grid-cols-1 gap-2">
                {/* individual data type export buttons */}
                <Button
                  variant="outline"
                  onClick={() => exportData(exportFormat, 'transactions')} // export only transactions
                  className="justify-start"
                  disabled={transactions.length === 0} // disable if no data
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Transactions ({transactions.length}) {/* show count */}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => exportData(exportFormat, 'budgets')} // export only budgets
                  className="justify-start"
                  disabled={budgets.length === 0} // disable if no data
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Budgets ({budgets.length}) {/* show count */}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => exportData(exportFormat, 'goals')} // export only goals
                  className="justify-start"
                  disabled={goals.length === 0} // disable if no data
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Goals ({goals.length}) {/* show count */}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => exportData(exportFormat, 'categories')} // export only categories
                  className="justify-start"
                  disabled={categories.length === 0} // disable if no data
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Categories ({categories.length}) {/* show count */}
                </Button>
                
                {/* export all data button - always uses JSON */}
                <Button
                  onClick={() => exportData('json', 'all')} // export everything as JSON
                  className="justify-start bg-gradient-primary hover:bg-primary-hover"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Export All Data {/* includes all data types in one file */}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Import Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border-2 border-dashed border-border rounded-lg">
              <div className="text-center space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                <div>
                  <Label htmlFor="import-file" className="cursor-pointer text-sm font-medium">
                    Choose file to import
                  </Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports CSV and JSON files
                </p>
              </div>
            </div>

            {importFile && (
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-muted-foreground">{importFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(importFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>

            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-warning">Important:</p>
                  <p className="text-muted-foreground mt-1">
                    Importing data will add new records to your existing data. 
                    Duplicates will be automatically skipped based on matching criteria.
                    Make sure to backup your data before importing.
                  </p>
                </div>
              </div>
            </div>

            {/* Import Results */}
            {importResults && (
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {importResults.errors.length === 0 ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-warning" />
                    )}
                    <span>Import Results - {importResults.dataType}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <div className="text-2xl font-bold text-success">{importResults.imported}</div>
                      <div className="text-sm text-muted-foreground">Imported</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">{importResults.skipped}</div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                  </div>
                  
                  {importResults.errors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-warning">Errors encountered:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <p key={index} className="text-xs text-muted-foreground bg-destructive/10 p-2 rounded">
                            {error}
                          </p>
                        ))}
                        {importResults.errors.length > 5 && (
                          <p className="text-xs text-muted-foreground italic">
                            ... and {importResults.errors.length - 5} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Current Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{transactions.length}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">{budgets.length}</div>
              <div className="text-sm text-muted-foreground">Budgets</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">{goals.length}</div>
              <div className="text-sm text-muted-foreground">Goals</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-accent-foreground">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}