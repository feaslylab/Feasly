import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Search,
  GripVertical,
  Copy,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { LineItemBase, GridConfig, GridState, ValidationResult, BulkAction } from './types';
import { BulkActionsBar } from './BulkActionsBar';
import { CSVImportModal } from '../import/CSVImportModal';

interface LineItemGridProps<T extends LineItemBase> {
  data: T[];
  config: GridConfig<T>;
  onChange: (data: T[]) => void;
  onValidate?: (item: T) => ValidationResult;
  className?: string;
  placeholder?: string;
  maxHeight?: number;
}

export function LineItemGrid<T extends LineItemBase>({
  data,
  config,
  onChange,
  onValidate,
  className,
  placeholder = "No items added yet",
  maxHeight = 600
}: LineItemGridProps<T>) {
  const [state, setState] = useState<GridState<T>>({
    items: data,
    selectedIds: new Set(),
    editingId: null,
    sortColumn: null,
    sortDirection: 'asc',
    filter: '',
    errors: {}
  });
  
  const [showImportModal, setShowImportModal] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Sync external data changes
  useEffect(() => {
    setState(prev => ({ ...prev, items: data }));
  }, [data]);

  // Virtualizer for performance with large datasets
  const virtualizer = useVirtualizer({
    count: state.items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Row height
    enabled: config.virtualized && state.items.length > 100
  });

  // Filter and sort items
  const processedItems = React.useMemo(() => {
    let filtered = state.items;
    
    // Apply filter
    if (state.filter) {
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(state.filter.toLowerCase())
        )
      );
    }
    
    // Apply sort
    if (state.sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[state.sortColumn!];
        const bVal = b[state.sortColumn!];
        const modifier = state.sortDirection === 'asc' ? 1 : -1;
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * modifier;
        }
        
        return String(aVal).localeCompare(String(bVal)) * modifier;
      });
    }
    
    return filtered;
  }, [state.items, state.filter, state.sortColumn, state.sortDirection]);

  // Handle adding new item
  const handleAdd = useCallback(() => {
    const newItem = createEmptyItem<T>();
    const newItems = [...state.items, newItem];
    setState(prev => ({ ...prev, items: newItems, editingId: newItem.id }));
    onChange(newItems);
  }, [state.items, onChange]);

  // Handle deleting items
  const handleDelete = useCallback((ids: string[]) => {
    const newItems = state.items.filter(item => !ids.includes(item.id));
    setState(prev => ({ 
      ...prev, 
      items: newItems, 
      selectedIds: new Set(),
      editingId: prev.editingId && ids.includes(prev.editingId) ? null : prev.editingId
    }));
    onChange(newItems);
  }, [state.items, onChange]);

  // Handle duplicating items
  const handleDuplicate = useCallback((ids: string[]) => {
    const toDuplicate = state.items.filter(item => ids.includes(item.id));
    const duplicated = toDuplicate.map(item => ({
      ...item,
      id: generateId(),
      description: `${item.description} (Copy)` as any
    }));
    const newItems = [...state.items, ...duplicated];
    setState(prev => ({ ...prev, items: newItems, selectedIds: new Set() }));
    onChange(newItems);
  }, [state.items, onChange]);

  // Handle drag and drop reordering
  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination || !config.allowReorder) return;
    
    const items = Array.from(state.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setState(prev => ({ ...prev, items }));
    onChange(items);
  }, [state.items, config.allowReorder, onChange]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: BulkAction) => {
    switch (action.type) {
      case 'delete':
        handleDelete(action.ids);
        break;
      case 'duplicate':
        handleDuplicate(action.ids);
        break;
      case 'move_phase':
        // Implementation depends on item type
        break;
      case 'adjust_escalation':
        const newItems = state.items.map(item => 
          action.ids.includes(item.id) && 'escalation_percent' in item
            ? { ...item, escalation_percent: Math.max(0, Math.min(100, 
                ((item as any).escalation_percent || 0) + action.adjustment)) }
            : item
        );
        setState(prev => ({ ...prev, items: newItems }));
        onChange(newItems);
        break;
    }
  }, [state.items, handleDelete, handleDuplicate, onChange]);

  // Handle CSV import
  const handleImportSuccess = useCallback((importedItems: T[]) => {
    const newItems = [...state.items, ...importedItems];
    setState(prev => ({ ...prev, items: newItems }));
    onChange(newItems);
    setShowImportModal(false);
  }, [state.items, onChange]);

  // Handle CSV export
  const handleExport = useCallback(() => {
    const itemsToExport = state.selectedIds.size > 0 
      ? state.items.filter(item => state.selectedIds.has(item.id))
      : state.items;
    
    const csv = convertToCSV(itemsToExport, config.columns);
    downloadCSV(csv, 'feasly-export.csv');
  }, [state.items, state.selectedIds, config.columns]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (config.allowAdd) handleAdd();
            break;
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            if (config.allowDelete && state.selectedIds.size > 0) {
              handleDelete(Array.from(state.selectedIds));
            }
            break;
          case 'd':
            e.preventDefault();
            if (state.selectedIds.size > 0) {
              handleDuplicate(Array.from(state.selectedIds));
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config.allowAdd, config.allowDelete, state.selectedIds, handleAdd, handleDelete, handleDuplicate]);

  // Render empty state
  if (state.items.length === 0) {
    return (
      <div className={cn("border rounded-lg p-8 text-center", className)}>
        <div className="text-muted-foreground mb-4">{placeholder}</div>
        {config.allowAdd && (
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Item
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Filter items..."
              value={state.filter}
              onChange={(e) => setState(prev => ({ ...prev, filter: e.target.value }))}
              className="pl-9 w-64"
            />
          </div>
          <Badge variant="outline">
            {processedItems.length} of {state.items.length} items
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {config.allowImport && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowImportModal(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          )}
          
          {config.allowExport && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          
          {config.allowAdd && (
            <Button 
              size="sm" 
              onClick={handleAdd}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {state.selectedIds.size > 0 && config.allowBulkEdit && (
        <BulkActionsBar
          selectedCount={state.selectedIds.size}
          onAction={handleBulkAction}
          onClearSelection={() => setState(prev => ({ ...prev, selectedIds: new Set() }))}
        />
      )}

      {/* Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 border-b">
          <div className="flex items-center px-4 py-3 gap-2">
            {config.allowBulkEdit && (
              <Checkbox
                checked={state.selectedIds.size === state.items.length && state.items.length > 0}
                onCheckedChange={(checked) => {
                  setState(prev => ({
                    ...prev,
                    selectedIds: checked ? new Set(state.items.map(item => item.id)) : new Set()
                  }));
                }}
                className="mr-2"
              />
            )}
            {config.allowReorder && (
              <div className="w-6" />
            )}
            {config.columns.map((column) => (
              <div
                key={String(column.key)}
                className={cn(
                  "font-medium text-sm cursor-pointer hover:text-primary",
                  column.width ? `w-${column.width}` : "flex-1"
                )}
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    sortColumn: column.key,
                    sortDirection: prev.sortColumn === column.key && prev.sortDirection === 'asc' ? 'desc' : 'asc'
                  }));
                }}
              >
                {column.title}
                {state.sortColumn === column.key && (
                  <span className="ml-1">
                    {state.sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            ))}
            <div className="w-20 text-center">Actions</div>
          </div>
        </div>

        {/* Body */}
        <ScrollArea className="h-full" style={{ maxHeight }}>
          <div ref={parentRef}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="grid">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {config.virtualized ? (
                      // Virtualized rows for performance
                      <div
                        style={{
                          height: `${virtualizer.getTotalSize()}px`,
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        {virtualizer.getVirtualItems().map((virtualItem) => {
                          const item = processedItems[virtualItem.index];
                          return (
                            <GridRow
                              key={item.id}
                              item={item}
                              index={virtualItem.index}
                              config={config}
                              state={state}
                              onStateChange={setState}
                              onValidate={onValidate}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      // Regular rows
                      processedItems.map((item, index) => (
                        <GridRow
                          key={item.id}
                          item={item}
                          index={index}
                          config={config}
                          state={state}
                          onStateChange={setState}
                          onValidate={onValidate}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </ScrollArea>
      </div>

      {/* Import Modal */}
      {showImportModal && config.allowImport && (
        <CSVImportModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportSuccess}
          columns={config.columns}
        />
      )}
    </div>
  );
}

// Individual grid row component
interface GridRowProps<T extends LineItemBase> {
  item: T;
  index: number;
  config: GridConfig<T>;
  state: GridState<T>;
  onStateChange: React.Dispatch<React.SetStateAction<GridState<T>>>;
  onValidate?: (item: T) => ValidationResult;
  style?: React.CSSProperties;
}

function GridRow<T extends LineItemBase>({
  item,
  index,
  config,
  state,
  onStateChange,
  onValidate,
  style
}: GridRowProps<T>) {
  const isSelected = state.selectedIds.has(item.id);
  const isEditing = state.editingId === item.id;
  const validation = onValidate?.(item);
  const hasErrors = validation && !validation.isValid;
  const hasWarnings = validation && Object.keys(validation.warnings).length > 0;

  return (
    <Draggable 
      draggableId={item.id} 
      index={index} 
      isDragDisabled={!config.allowReorder}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{ ...provided.draggableProps.style, ...style }}
          className={cn(
            "flex items-center px-4 py-3 gap-2 border-b hover:bg-muted/50 transition-colors",
            isSelected && "bg-primary/5",
            snapshot.isDragging && "bg-background shadow-lg",
            hasErrors && "bg-destructive/5 border-destructive/20",
            hasWarnings && "bg-warning/5 border-warning/20"
          )}
        >
          {/* Selection checkbox */}
          {config.allowBulkEdit && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onStateChange(prev => {
                  const newSelected = new Set(prev.selectedIds);
                  if (checked) {
                    newSelected.add(item.id);
                  } else {
                    newSelected.delete(item.id);
                  }
                  return { ...prev, selectedIds: newSelected };
                });
              }}
              className="mr-2"
            />
          )}

          {/* Drag handle */}
          {config.allowReorder && (
            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {/* Columns */}
          {config.columns.map((column) => (
            <GridCell
              key={String(column.key)}
              item={item}
              column={column}
              isEditing={isEditing}
              onEdit={(newValue) => {
                onStateChange(prev => ({
                  ...prev,
                  items: prev.items.map(i => 
                    i.id === item.id ? { ...i, [column.key]: newValue } : i
                  )
                }));
              }}
              error={validation?.errors[String(column.key)]}
              warning={validation?.warnings[String(column.key)]}
            />
          ))}

          {/* Actions */}
          <div className="flex items-center gap-1 w-20 justify-center">
            {hasErrors && <AlertTriangle className="h-4 w-4 text-destructive" />}
            {hasWarnings && <AlertTriangle className="h-4 w-4 text-warning" />}
            {!hasErrors && !hasWarnings && validation?.isValid && (
              <CheckCircle className="h-4 w-4 text-success" />
            )}
            {config.allowDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStateChange(prev => ({ ...prev, selectedIds: new Set([item.id]) }))}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// Helper functions
function createEmptyItem<T extends LineItemBase>(): T {
  return {
    id: generateId(),
    description: '',
    start_month: 0,
    end_month: 0,
    escalation_percent: 0,
  } as T;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function convertToCSV<T>(items: T[], columns: any[]): string {
  const headers = columns.map(col => col.title).join(',');
  const rows = items.map(item => 
    columns.map(col => String(item[col.key] || '')).join(',')
  );
  return [headers, ...rows].join('\n');
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Individual cell component
interface GridCellProps<T> {
  item: T;
  column: any;
  isEditing: boolean;
  onEdit: (value: any) => void;
  error?: string;
  warning?: string;
}

function GridCell<T>({ item, column, isEditing, onEdit, error, warning }: GridCellProps<T>) {
  const value = item[column.key];
  
  if (column.readonly || !isEditing) {
    return (
      <div className={cn(
        "text-sm truncate",
        column.width ? `w-${column.width}` : "flex-1",
        error && "text-destructive",
        warning && "text-warning"
      )}>
        {column.format ? column.format(value) : String(value || '')}
      </div>
    );
  }

  switch (column.type) {
    case 'select':
      return (
        <Select value={String(value || '')} onValueChange={onEdit}>
          <SelectTrigger className={cn("h-8", column.width ? `w-${column.width}` : "flex-1")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {column.options?.map((option: any) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    
    case 'number':
    case 'percent':
    case 'currency':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onEdit(parseFloat(e.target.value) || 0)}
          className={cn("h-8", column.width ? `w-${column.width}` : "flex-1")}
          min="0"
          step={column.type === 'percent' ? "0.1" : "any"}
        />
      );
    
    default:
      return (
        <Input
          value={String(value || '')}
          onChange={(e) => onEdit(e.target.value)}
          className={cn("h-8", column.width ? `w-${column.width}` : "flex-1")}
        />
      );
  }
}