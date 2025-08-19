import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, TrendingUp, Building2, MapPin, Database, CalendarDays, ArrowUpDown } from 'lucide-react';
import { BENCHMARK_DATA, GCC_LOCATIONS, ASSET_TYPES, type BenchmarkData } from '@/data/benchmarkData';

interface BenchmarkCardProps {
  title: string;
  value: string;
  location: string;
  source: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

function BenchmarkCard({ title, value, location, source, icon: Icon, trend }: BenchmarkCardProps) {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {location}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      {source}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data source: {source}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className={`p-2 rounded-lg bg-muted/50 ${trendColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InsightsDashboard() {
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'metric' | 'lastUpdated'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get key benchmark metrics for cards
  const keyMetrics = useMemo(() => {
    const constructionCost = BENCHMARK_DATA.find(d => d.category === 'construction' && d.location === 'Riyadh');
    const salePrice = BENCHMARK_DATA.find(d => d.category === 'sales' && d.location === 'Dubai');
    const monthlyRent = BENCHMARK_DATA.find(d => d.category === 'rent' && d.location === 'Dubai');
    const grossIRR = BENCHMARK_DATA.find(d => d.category === 'returns' && d.location === 'Dubai');

    return {
      constructionCost,
      salePrice,
      monthlyRent,
      grossIRR
    };
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = BENCHMARK_DATA;

    if (locationFilter !== 'all') {
      filtered = filtered.filter(item => item.location === locationFilter);
    }

    if (assetTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.assetType === assetTypeFilter);
    }

    // Sort data
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'metric') {
        compareValue = a.metric.localeCompare(b.metric);
      } else {
        compareValue = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [locationFilter, assetTypeFilter, sortBy, sortOrder]);

  const toggleSort = (column: 'metric' | 'lastUpdated') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!BENCHMARK_DATA.length) {
    return (
      <div className="flex items-center justify-center h-96" data-section="insights">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <LineChart className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No Benchmark Data Available</h3>
            <p className="text-muted-foreground">
              Feasly Insights helps you ground assumptions in market reality. 
              Benchmark data will appear here once loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-section="insights">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LineChart className="h-8 w-8" />
            Feasly Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            GCC real estate benchmarks and market intelligence
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Key Market Indicators
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BenchmarkCard
            title="Avg. Construction Cost"
            value={keyMetrics.constructionCost?.value || 'N/A'}
            location={keyMetrics.constructionCost?.location || 'N/A'}
            source={keyMetrics.constructionCost?.source || 'N/A'}
            icon={Building2}
            trend="up"
          />
          <BenchmarkCard
            title="Avg. Residential Sale Price"
            value={keyMetrics.salePrice?.value || 'N/A'}
            location={keyMetrics.salePrice?.location || 'N/A'}
            source={keyMetrics.salePrice?.source || 'N/A'}
            icon={TrendingUp}
            trend="up"
          />
          <BenchmarkCard
            title="Avg. Rent per Month"
            value={keyMetrics.monthlyRent?.value || 'N/A'}
            location={keyMetrics.monthlyRent?.location || 'N/A'}
            source={keyMetrics.monthlyRent?.source || 'N/A'}
            icon={Building2}
            trend="neutral"
          />
          <BenchmarkCard
            title="Avg. Gross IRR"
            value={keyMetrics.grossIRR?.value || 'N/A'}
            location={keyMetrics.grossIRR?.location || 'N/A'}
            source={keyMetrics.grossIRR?.source || 'N/A'}
            icon={TrendingUp}
            trend="up"
          />
        </div>
      </section>

      {/* Benchmark Data Table */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Benchmark Database
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">All Locations</SelectItem>
                {GCC_LOCATIONS.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">All Types</SelectItem>
                {ASSET_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSort('metric')}
                        className="font-medium p-0 h-auto"
                      >
                        Metric
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Asset Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSort('lastUpdated')}
                        className="font-medium p-0 h-auto"
                      >
                        Last Updated
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.metric}</TableCell>
                      <TableCell className="font-mono">{item.value}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.assetType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {item.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(item.lastUpdated)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No benchmark data matches your current filters.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}