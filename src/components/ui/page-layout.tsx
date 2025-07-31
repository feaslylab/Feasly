import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'full' | 'narrow';
}

export function PageContainer({ children, className = '', size = 'default' }: PageContainerProps) {
  const maxWidthClass = {
    default: 'max-w-[1440px]',
    full: 'max-w-full',
    narrow: 'max-w-4xl'
  }[size];

  return (
    <div className={`mx-auto ${maxWidthClass} px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, className = '' }: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1 mb-8 ${className}`}>
      <h1 className="text-h1 font-bold text-foreground">{title}</h1>
      {description && (
        <p className="text-body text-muted-foreground">{description}</p>
      )}
    </div>
  );
}