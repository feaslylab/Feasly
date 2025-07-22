import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { FileText, Download, History } from "lucide-react";

interface ExportRecord {
  id: string;
  project_id: string;
  user_id: string;
  scenario_id: string;
  export_type: 'pdf' | 'excel';
  filename: string;
  exported_at: string;
  created_at: string;
  scenarios: {
    name: string;
  };
}

interface ExportHistoryProps {
  projectId: string;
}

export const ExportHistory = ({ projectId }: ExportHistoryProps) => {
  const { data: exportHistory, isLoading } = useQuery({
    queryKey: ["export-history", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("export_history")
        .select(`
          *,
          scenarios!inner(name)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ExportRecord[];
    },
    enabled: !!projectId,
  });

  const getExportTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'excel':
        return <FileText className="w-4 h-4 text-green-600" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getExportTypeBadge = (type: string) => {
    switch (type) {
      case 'pdf':
        return <Badge variant="destructive">PDF</Badge>;
      case 'excel':
        return <Badge variant="default">Excel</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exportHistory || exportHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Exports Yet</h3>
            <p className="text-muted-foreground">
              Export data will appear here once you download PDF or Excel files.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Export History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Scenario</th>
                <th className="text-left p-3 font-medium">File Name</th>
                <th className="text-left p-3 font-medium">User</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((record) => (
                <tr key={record.id} className="border-b hover:bg-muted/50">
                   <td className="p-3">
                    <div className="text-sm">
                      {formatDate(record.exported_at || record.created_at)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getExportTypeIcon(record.export_type)}
                      {getExportTypeBadge(record.export_type)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{record.scenarios.name}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-sm break-all">
                      {record.filename}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-muted-foreground">
                      User
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};