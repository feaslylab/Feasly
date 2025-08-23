import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageContainer, PageHeader } from "@/components/ui/page-layout";
import { useToast } from "@/hooks/use-toast";
import { useSelectionStore } from "@/state/selectionStore";
import { useProjectAssets } from "@/hooks/useProjectAssets";
import { 
  useConstructionStoreScenario, 
  useSaleStore, 
  useRentalStore
} from "@/hooks/useTableStores";
import KpiGrid from "@/components/KpiGrid";
import { useLiveRecalc }     from '@/hooks/useLiveRecalc';
import ConstructionTable     from '@/components/ConstructionTable';
import SaleTable             from '@/components/SaleTable';
import RentalTable           from '@/components/RentalTable';
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  DollarSign, 
  Calendar,
  BarChart3,
  Activity,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Zap,
  Target,
  Eye,
  Bell,
  ChevronDown,
  ChevronUp,
  Star,
  Edit3,
  Archive,
  ExternalLink,
  FolderOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";

interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
  description?: string;
  currency_code?: string;
  is_pinned?: boolean;
}

interface KPISnapshot {
  npv: number;
  irr: number | null;
  profit: number;
  created_at: string;
}

interface Alert {
  id: string;
  title: string;
  body: string;
  severity: string;
  resolved: boolean;
  created_at: string;
  alert_type: string;
}

function DashboardContent() {
  const { t } = useTranslation(['common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const { projectId, scenarioId } = useSelectionStore();
  const { cash, kpi } = useLiveRecalc();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [kpis, setKpis] = useState<KPISnapshot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                <span>{project.name}</span>
                <Badge>{project.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}