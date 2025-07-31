import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  decimals?: number;
  suffix?: string;
  threshold?: {
    good: number;
    warning: number;
  };
  reverseThreshold?: boolean; // For metrics where lower is better
  description?: string;
}

export function KpiCard({ 
  title, 
  value, 
  format, 
  decimals = 0, 
  suffix = '', 
  threshold, 
  reverseThreshold = false,
  description 
}: KpiCardProps) {
  
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'AED',
        notation: Math.abs(val) > 1000000 ? 'compact' : 'standard',
        maximumFractionDigits: decimals
      }).format(val);
    }
    
    if (format === 'percentage') {
      return `${(val * 100).toFixed(decimals)}%`;
    }
    
    return `${val.toFixed(decimals)}${suffix ? ` ${suffix}` : ''}`;
  };

  const getStatus = () => {
    if (!threshold) return 'neutral';
    
    const { good, warning } = threshold;
    
    if (reverseThreshold) {
      // Lower values are better (e.g., payback period, peak funding)
      if (value <= good) return 'success';
      if (value <= warning) return 'warning';
      return 'destructive';
    } else {
      // Higher values are better (e.g., NPV, IRR)
      if (value >= good) return 'success';
      if (value >= warning) return 'warning';
      return 'destructive';
    }
  };

  const getStatusIcon = () => {
    const status = getStatus();
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'destructive':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    const status = getStatus();
    switch (status) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'destructive':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  const getBadgeVariant = () => {
    const status = getStatus();
    switch (status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'destructive':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="relative hover:shadow-md transition-shadow print:break-inside-avoid">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <Badge variant={getBadgeVariant()} className="h-5 text-xs">
                {getStatus() === 'success' ? 'Good' : 
                 getStatus() === 'warning' ? 'Fair' : 
                 getStatus() === 'destructive' ? 'Poor' : 'N/A'}
              </Badge>
            </div>
          </div>
          
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {formatValue(value)}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}