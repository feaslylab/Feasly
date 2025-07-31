import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CashFlowTableProps {
  cashflow: number[];
  isLoading?: boolean;
}

export function CashFlowTable({ cashflow, isLoading }: CashFlowTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate cumulative cashflow
  const cumulativeCashflow = cashflow.reduce((acc, curr, index) => {
    const cumulative = index === 0 ? curr : acc[index - 1] + curr;
    acc.push(cumulative);
    return acc;
  }, [] as number[]);

  const rowVirtualizer = useVirtualizer({
    count: cashflow.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 5,
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    });
  };

  const getRowClassName = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center border rounded-md">
        <div className="text-muted-foreground">Loading cash flow data...</div>
      </div>
    );
  }

  if (cashflow.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center border rounded-md">
        <div className="text-muted-foreground">No cash flow data available</div>
      </div>
    );
  }

  return (
    <div className="border rounded-md" aria-describedby="cashflow-table-description">
      <div className="sticky top-0 z-10 bg-background border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24" scope="col">Month</TableHead>
              <TableHead className="text-right" scope="col">Monthly Flow</TableHead>
              <TableHead className="text-right" scope="col">Cumulative</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>
      
      <ScrollArea className="h-80" ref={parentRef} tabIndex={0}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const index = virtualItem.index;
            const monthlyFlow = cashflow[index];
            const cumulative = cumulativeCashflow[index];
            
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Table>
                  <TableBody>
                    <TableRow className="border-b">
                      <TableCell className="w-24 font-medium">
                        M{index + 1}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${getRowClassName(monthlyFlow)}`}>
                        {formatCurrency(monthlyFlow)}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${getRowClassName(cumulative)}`}>
                        {formatCurrency(cumulative)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}