import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedTableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function EnhancedTable({ children, className }: EnhancedTableProps) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className={cn("w-full text-sm", className)}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn("bg-muted/30 border-b border-border/40", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-border/30", className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, hover = true }: TableRowProps) {
  return (
    <tr className={cn(
      "transition-colors duration-150",
      hover && "hover:bg-muted/20",
      className
    )}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className, align = 'left' }: TableHeaderCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <th className={cn(
      "px-3 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground",
      alignClass,
      className
    )}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, align = 'left' }: TableCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <td className={cn(
      "px-3 py-3 text-sm",
      alignClass,
      className
    )}>
      {children}
    </td>
  );
}

// Specialized cells for common use cases
export function TableNumericCell({ children, className, ...props }: TableCellProps) {
  return (
    <TableCell 
      className={cn("font-mono", className)} 
      align="right"
      {...props}
    >
      {children}
    </TableCell>
  );
}

export function TableActionCell({ children, className, ...props }: TableCellProps) {
  return (
    <TableCell 
      className={cn("w-32", className)} 
      align="right"
      {...props}
    >
      <div className="flex items-center justify-end gap-1">
        {children}
      </div>
    </TableCell>
  );
}

export function TableEmptyState({ 
  icon, 
  title, 
  description, 
  action,
  colSpan = 8 
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  colSpan?: number;
}) {
  return (
    <TableRow hover={false}>
      <td colSpan={colSpan} className="py-12 text-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="opacity-50">
            {icon}
          </div>
          <div className="space-y-1">
            <p className="font-medium">{title}</p>
            {description && <p className="text-xs">{description}</p>}
          </div>
          {action}
        </div>
      </td>
    </TableRow>
  );
}