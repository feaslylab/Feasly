import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Toolbar } from '@/components/ui/Toolbar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, FolderOpen, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { ds } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

export default function Projects() {
  const { t } = useTranslation('common');
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with real data in Phase 2
  const projects = [
    {
      id: '1',
      name: 'Solar Farm Project Alpha',
      description: 'Large-scale solar installation with 50MW capacity',
      status: 'In Progress',
      owner: 'John Smith',
      created: '2024-01-15',
      lastModified: '2024-01-18',
    },
    {
      id: '2',
      name: 'Wind Energy Initiative',
      description: 'Offshore wind farm development project',
      status: 'Under Review',
      owner: 'Sarah Johnson',
      created: '2024-01-10',
      lastModified: '2024-01-17',
    },
    {
      id: '3',
      name: 'Hydroelectric Expansion',
      description: 'Expansion of existing hydroelectric facility',
      status: 'Draft',
      owner: 'Mike Davis',
      created: '2024-01-08',
      lastModified: '2024-01-15',
    },
  ];

  const hasProjects = projects.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn(ds.container.pad, ds.container.max, 'mx-auto py-6')}>
      <PageHeader
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        actions={
          <Button asChild>
            <Link to={PATHS.projectsNew}>
              <Plus className="h-4 w-4 mr-2" />
              {t('projects.newProject')}
            </Link>
          </Button>
        }
      />

      {!hasProjects ? (
        <SectionCard>
          <EmptyState
            icon={FolderOpen}
            title={t('projects.empty.title')}
            subtitle={t('projects.empty.subtitle')}
            action={
              <Button asChild>
                <Link to={PATHS.projectsNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('projects.empty.action')}
                </Link>
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <SectionCard>
          <Toolbar>
            <Toolbar.Group>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('projects.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="project-search"
                />
              </div>
            </Toolbar.Group>
            <Toolbar.Group align="right">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('projects.filter.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projects.filter.all')}</SelectItem>
                  <SelectItem value="draft">{t('projects.filter.draft')}</SelectItem>
                  <SelectItem value="in-progress">{t('projects.filter.inProgress')}</SelectItem>
                  <SelectItem value="under-review">{t('projects.filter.underReview')}</SelectItem>
                  <SelectItem value="completed">{t('projects.filter.completed')}</SelectItem>
                </SelectContent>
              </Select>
            </Toolbar.Group>
          </Toolbar>

          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={cn(ds.type.body, 'font-semibold text-foreground')}>
                      {project.name}
                    </h3>
                    <span className={cn(
                      ds.type.small,
                      'px-2 py-1 rounded-full font-medium',
                      getStatusColor(project.status)
                    )}>
                      {project.status}
                    </span>
                  </div>
                  <p className={cn(ds.type.small, 'text-muted-foreground mb-3')}>
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className={cn(ds.type.small, 'text-muted-foreground')}>
                        {project.owner}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className={cn(ds.type.small, 'text-muted-foreground')}>
                        {t('projects.lastModified')}: {project.lastModified}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`${PATHS.model}?project=${project.id}`}>
                      {t('projects.open')}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}