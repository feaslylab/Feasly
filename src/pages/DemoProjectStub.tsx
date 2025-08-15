// Stub for DemoProject page to prevent build errors
// TODO: Implement proper functionality when database schema is stable

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoProject() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Demo Project</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Demo project functionality will be available once database schema is finalized.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}