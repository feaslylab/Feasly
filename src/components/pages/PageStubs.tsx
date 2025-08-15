// Stub components for pages that reference scenario functionality
// These replace problematic database queries until schema is stable

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProjectDetailsStub = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Project details functionality will be available once database schema is finalized.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const DemoProjectStub = () => {
  return (
    <div className="space-y-6">
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
};