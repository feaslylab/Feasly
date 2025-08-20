import { useEngine } from '@/lib/engine/EngineContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, BarChart3, DollarSign, Building2 } from 'lucide-react';
import { fmtCurrency, fmtPct } from '@/lib/formatters';
import { useMemo } from 'react';

type FilterType = 'all' | 'revenue' | 'cost' | 'financing';

interface TimelineRow {
  id: string;
  label: string;
  type: 'revenue' | 'cost' | 'financing';
  values: number[];
  currency: string;
  maxValue: number;
}

function MonthHeader({ periods }: { periods: number }) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="flex">
        <div className="w-48 flex-shrink-0 p-2 border-r bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground">Item</span>
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex" style={{ minWidth: `${periods * 60}px` }}>
            {Array.from({ length: periods }, (_, i) => (
              <div
                key={i}
                className={`w-15 flex-shrink-0 p-2 text-center border-r text-xs font-medium ${
                  (i + 1) % 6 === 0 ? 'bg-muted/30 text-foreground' : 'text-muted-foreground'
                }`}
              >
                M{i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineRowComponent({ row, periods, filter }: { row: TimelineRow; periods: number; filter: FilterType }) {
  if (filter !== 'all' && row.type !== filter) return null;

  const getBarColor = (type: string) => {
    switch (type) {
      case 'revenue': return 'bg-green-500/70';
      case 'cost': return 'bg-red-500/70';
      case 'financing': return 'bg-blue-500/70';
      default: return 'bg-gray-500/70';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'revenue': return 'default';
      case 'cost': return 'destructive';
      case 'financing': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="flex border-b hover:bg-muted/20">
      <div className="w-48 flex-shrink-0 p-3 border-r flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{row.label}</div>
          <Badge variant={getBadgeVariant(row.type)} className="text-xs mt-1">
            {row.type === 'revenue' && <DollarSign className="w-3 h-3 mr-1" />}
            {row.type === 'cost' && <BarChart3 className="w-3 h-3 mr-1" />}
            {row.type === 'financing' && <Building2 className="w-3 h-3 mr-1" />}
            {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
          </Badge>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex" style={{ minWidth: `${periods * 60}px` }}>
          {row.values.map((value, i) => {
            const heightPct = row.maxValue > 0 ? (Math.abs(value) / row.maxValue) * 100 : 0;
            const opacity = Math.max(0.1, Math.min(1, heightPct / 100));
            
            return (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-15 flex-shrink-0 p-1 border-r flex items-end justify-center h-16">
                      {value !== 0 && (
                        <div
                          className={`w-8 ${getBarColor(row.type)} rounded-sm cursor-pointer transition-all hover:opacity-90`}
                          style={{
                            height: `${Math.max(2, heightPct)}%`,
                            opacity
                          }}
                        />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div className="font-medium">{row.label}</div>
                      <div>Month {i + 1}</div>
                      <div className="font-semibold">
                        {row.type === 'revenue' && row.currency === 'pct' 
                          ? fmtPct(value)
                          : fmtCurrency(value, row.currency)
                        }
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">📅 No Timeline Data</h3>
      <p className="text-muted-foreground">
        Add revenue items, costs, or financing to see the project timeline.
      </p>
    </div>
  );
}

export default function TimelinePanel() {
  const { inputs } = useEngine();
  
  const timelineData = useMemo((): TimelineRow[] => {
    const rows: TimelineRow[] = [];
    const periods = inputs?.project?.periods || 60;
    const currency = inputs?.project?.currency || 'AED';

    // Add unit types (revenue)
    if (inputs?.unit_types?.length) {
      inputs.unit_types.forEach((unit) => {
        if (unit.curve?.values) {
          const isRental = unit.curve.meaning === 'occupancy';
          const values = unit.curve.values.slice(0, periods);
          const maxValue = Math.max(...values.map(Math.abs));
          
          rows.push({
            id: `unit-${unit.key}`,
            label: `${unit.key} (${unit.count} units)`,
            type: 'revenue',
            values,
            currency: isRental ? 'pct' : currency,
            maxValue
          });
        }
      });
    }

    // Add cost items
    if (inputs?.cost_items?.length) {
      inputs.cost_items.forEach((cost) => {
        if (cost.phasing && cost.phasing.length > 0) {
          const values = cost.phasing.slice(0, periods);
          const maxValue = Math.max(...values.map(Math.abs));
          
          rows.push({
            id: `cost-${cost.key}`,
            label: cost.key || 'Unnamed Cost',
            type: 'cost',
            values,
            currency,
            maxValue
          });
        }
      });
    }

    // Add financing slices (exclude equity)
    if (inputs?.financing_slices?.length) {
      inputs.financing_slices
        .filter(slice => slice.type !== 'equity')
        .forEach((slice) => {
          // For financing, we'll generate a simple drawdown pattern for demonstration
          // In a real implementation, this would come from the engine's financing calculation
          const startMonth = slice.start_month || 0;
          const tenorMonths = slice.tenor_months || 12;
          const amount = slice.amount || 0;
          
          const values = Array(periods).fill(0);
          if (amount > 0 && startMonth < periods) {
            // Simple linear drawdown over the tenor period
            const monthlyDraw = amount / Math.min(tenorMonths, periods - startMonth);
            for (let i = startMonth; i < Math.min(startMonth + tenorMonths, periods); i++) {
              values[i] = monthlyDraw;
            }
          }
          
          const maxValue = Math.max(...values.map(Math.abs));
          if (maxValue > 0) {
            rows.push({
              id: `financing-${slice.id}`,
              label: slice.label || `${slice.type} Facility`,
              type: 'financing',
              values,
              currency,
              maxValue
            });
          }
        });
    }

    return rows;
  }, [inputs]);

  const periods = inputs?.project?.periods || 60;

  if (timelineData.length === 0) {
    return (
      <div className="space-y-6" data-section="timeline">
        <div>
          <h2 className="text-lg font-semibold">Project Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Interactive Gantt-style visualization of your project's financial timeline
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-section="timeline">
      <div>
        <h2 className="text-lg font-semibold">Project Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Interactive Gantt-style visualization of your project's financial timeline
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Cost
          </TabsTrigger>
          <TabsTrigger value="financing" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Financing
          </TabsTrigger>
        </TabsList>

        {(['all', 'revenue', 'cost', 'financing'] as FilterType[]).map((filter) => (
          <TabsContent key={filter} value={filter} className="space-y-4">
            <div className="border rounded-lg bg-card">
              <MonthHeader periods={periods} />
              <div className="max-h-96 overflow-y-auto">
                {timelineData.map((row) => (
                  <TimelineRowComponent
                    key={row.id}
                    row={row}
                    periods={periods}
                    filter={filter}
                  />
                ))}
                {filter !== 'all' && timelineData.filter(row => row.type === filter).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No {filter} items with timeline data
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}