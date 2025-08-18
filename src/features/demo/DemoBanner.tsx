import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Eye, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useReadOnly } from './DemoReadOnlyProvider';
import { useTranslation } from 'react-i18next';

export function DemoBanner() {
  const { mode } = useReadOnly();
  const { t } = useTranslation('common');

  if (mode === 'normal') return null;

  const isDemo = mode === 'demo';
  const isShare = mode === 'share';

  return (
    <div className="bg-primary/10 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              {isDemo ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <Share2 className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5">
                {isDemo ? 'DEMO MODE' : 'SHARED VIEW'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isDemo ? 'Read-only preview' : 'Shared read-only view'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isDemo && (
              <Button size="sm" asChild>
                <Link to={PATHS.auth}>
                  Sign up to model your own project
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}