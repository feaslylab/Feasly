import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Download 
} from 'lucide-react';
import { ImportResult, GridColumn } from '../grids/types';

interface CSVImportModalProps<T> {
  open: boolean;
  onClose: () => void;
  onImport: (items: T[]) => void;
  columns: GridColumn<T>[];
}

export function CSVImportModal<T extends { id: string }>({
  open,
  onClose,
  onImport,
  columns
}: CSVImportModalProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [parseResult, setParseResult] = useState<ImportResult<T> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvData(content);
        processCSV(content);
      };
      reader.readAsText(selectedFile);
    }
  }, []);

  // Handle manual CSV input
  const handleManualInput = useCallback((value: string) => {
    setCsvData(value);
    if (value.trim()) {
      processCSV(value);
    } else {
      setParseResult(null);
    }
  }, []);

  // Process CSV data
  const processCSV = useCallback((content: string) => {
    setIsProcessing(true);
    
    try {
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        setParseResult({
          success: false,
          items: [],
          errors: ['CSV must contain at least a header row and one data row'],
          warnings: []
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dataRows = lines.slice(1);

      // Map CSV headers to column keys
      const columnMap = new Map<number, keyof T>();
      const unmappedHeaders: string[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      headers.forEach((header, index) => {
        const column = columns.find(col => 
          col.title.toLowerCase() === header.toLowerCase() ||
          String(col.key).toLowerCase() === header.toLowerCase()
        );
        
        if (column) {
          columnMap.set(index, column.key);
        } else {
          unmappedHeaders.push(header);
        }
      });

      if (unmappedHeaders.length > 0) {
        warnings.push(`Unmapped columns: ${unmappedHeaders.join(', ')}`);
      }

      // Parse data rows
      const items: T[] = [];
      dataRows.forEach((row, rowIndex) => {
        try {
          const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
          const item: any = { id: generateId() };

          columnMap.forEach((columnKey, csvIndex) => {
            const value = values[csvIndex];
            const column = columns.find(col => col.key === columnKey);
            
            if (column && value !== undefined) {
              try {
                switch (column.type) {
                  case 'number':
                  case 'percent':
                  case 'currency':
                    item[columnKey] = parseFloat(value) || 0;
                    break;
                  case 'select':
                    if (column.options?.some(opt => opt.value === value)) {
                      item[columnKey] = value;
                    } else {
                      warnings.push(`Row ${rowIndex + 2}: Invalid option "${value}" for ${column.title}`);
                      item[columnKey] = column.options?.[0]?.value || '';
                    }
                    break;
                  default:
                    item[columnKey] = value;
                }
              } catch (error) {
                warnings.push(`Row ${rowIndex + 2}: Failed to parse "${value}" for ${column.title}`);
              }
            }
          });

          // Set defaults for missing required fields
          columns.forEach(column => {
            if (column.required && !(column.key in item)) {
              switch (column.type) {
                case 'number':
                case 'percent':
                case 'currency':
                  item[column.key] = 0;
                  break;
                default:
                  item[column.key] = '';
              }
              warnings.push(`Row ${rowIndex + 2}: Missing required field "${column.title}", using default`);
            }
          });

          items.push(item as T);
        } catch (error) {
          errors.push(`Row ${rowIndex + 2}: Failed to parse row - ${error}`);
        }
      });

      setParseResult({
        success: errors.length === 0,
        items,
        errors,
        warnings
      });

    } catch (error) {
      setParseResult({
        success: false,
        items: [],
        errors: [`Failed to parse CSV: ${error}`],
        warnings: []
      });
    } finally {
      setIsProcessing(false);
    }
  }, [columns]);

  // Handle import confirmation
  const handleConfirmImport = useCallback(() => {
    if (parseResult?.success && parseResult.items.length > 0) {
      onImport(parseResult.items);
      onClose();
    }
  }, [parseResult, onImport, onClose]);

  // Generate sample CSV
  const generateSampleCSV = useCallback(() => {
    const headers = columns.map(col => col.title).join(',');
    const sampleRow = columns.map(col => {
      switch (col.type) {
        case 'number':
        case 'currency':
          return '1000';
        case 'percent':
          return '5.0';
        case 'select':
          return col.options?.[0]?.value || 'option1';
        default:
          return 'Sample Value';
      }
    }).join(',');
    
    return [headers, sampleRow].join('\n');
  }, [columns]);

  // Download sample template
  const downloadTemplate = useCallback(() => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feasly-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [generateSampleCSV]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data from CSV
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Data</TabsTrigger>
            <TabsTrigger value="template">Download Template</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <Label 
                htmlFor="csv-upload" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="font-medium">Click to upload CSV file</div>
                  <div className="text-sm text-muted-foreground">
                    Supports .csv and .txt files
                  </div>
                </div>
              </Label>
            </div>
            
            {file && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  File loaded: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <div>
              <Label htmlFor="csv-input">Paste CSV Data</Label>
              <textarea
                id="csv-input"
                className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                placeholder="Paste your CSV data here..."
                value={csvData}
                onChange={(e) => handleManualInput(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="text-center space-y-4">
              <div>
                <h4 className="font-medium mb-2">Download Import Template</h4>
                <p className="text-sm text-muted-foreground">
                  Get a pre-formatted CSV template with the correct column headers
                </p>
              </div>
              
              <Button onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              
              <div className="bg-muted p-4 rounded-lg text-left">
                <h5 className="font-medium mb-2">Expected Columns:</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {columns.map(col => (
                    <div key={String(col.key)} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {col.type}
                      </Badge>
                      <span>{col.title}</span>
                      {col.required && <span className="text-destructive">*</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Parse Results */}
        {parseResult && (
          <div className="space-y-4">
            {parseResult.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully parsed {parseResult.items.length} rows
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to parse CSV data
                </AlertDescription>
              </Alert>
            )}

            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <div>
                <h5 className="font-medium text-destructive mb-2">Errors:</h5>
                <ScrollArea className="h-24 border rounded p-2">
                  {parseResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-destructive">
                      {error}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <div>
                <h5 className="font-medium text-warning mb-2">Warnings:</h5>
                <ScrollArea className="h-24 border rounded p-2">
                  {parseResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-warning">
                      {warning}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {/* Preview */}
            {parseResult.items.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Preview (first 5 rows):</h5>
                <ScrollArea className="h-32 border rounded">
                  <div className="p-2 space-y-1 text-sm font-mono">
                    {parseResult.items.slice(0, 5).map((item, index) => (
                      <div key={index} className="truncate">
                        {JSON.stringify(item)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <Button 
            onClick={handleConfirmImport}
            disabled={!parseResult?.success || parseResult.items.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Import ${parseResult?.items.length || 0} Items`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}