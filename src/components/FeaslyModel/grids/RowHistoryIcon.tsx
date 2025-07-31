import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RowHistoryIconProps {
  entries: {
    id: string;
    field: string | null;
    before: any;
    after: any;
    user: string;
    ts: number;
    type: string;
  }[];
  className?: string;
}

export function RowHistoryIcon({ entries, className }: RowHistoryIconProps) {
  if (entries.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'text-muted-foreground hover:text-primary transition-colors',
            className
          )}
          aria-label="Row history"
        >
          <Clock size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" className="w-72 p-2">
        <h4 className="font-medium mb-2">Last changes</h4>
        <ul className="space-y-1 text-sm max-h-60 overflow-y-auto">
          {entries.map(e => (
            <li key={e.id} className="flex items-start gap-2">
              <Badge variant={e.type === 'edit' ? 'outline' : 'secondary'}>
                {e.type}
              </Badge>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">
                  {new Date(e.ts).toLocaleString()} · {e.user}
                </div>
                {e.field && (
                  <div>
                    <strong>{e.field}</strong>: 
                    <s className="opacity-70">{String(e.before)}</s> →
                    <span className="ml-1">{String(e.after)}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}