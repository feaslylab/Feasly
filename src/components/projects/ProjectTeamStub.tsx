// Temporary stub to prevent build errors
// TODO: Implement proper team functionality when database schema is stable

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectTeamProps {
  projectId: string;
}

export const ProjectTeam = ({ projectId }: ProjectTeamProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Team</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Team functionality will be available once database schema is finalized.
        </p>
      </CardContent>
    </Card>
  );
};