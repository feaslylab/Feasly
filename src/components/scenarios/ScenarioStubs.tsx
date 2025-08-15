// Temporary stub components for scenario functionality
// These replace the problematic scenario components until database schema is stable

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditScenarioValuesFormProps {
  asset: any;
  scenarioId: string;
  onOverrideChange?: (fieldName: string, value: number) => void;
}

export const EditScenarioValuesForm = ({ asset, scenarioId }: EditScenarioValuesFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Values</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Scenario override functionality will be available once database schema is finalized.
        </p>
        <div className="text-xs text-muted-foreground mt-2">
          Asset: {asset?.name || 'Unknown'} | Scenario: {scenarioId}
        </div>
      </CardContent>
    </Card>
  );
};

interface ScenarioSelectorProps {
  projectId: string;
  onScenarioChange?: (scenario: any) => void;
}

export const ScenarioSelector = ({ projectId }: ScenarioSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Scenario selection functionality will be available once database schema is finalized.
        </p>
        <div className="text-xs text-muted-foreground mt-2">
          Project: {projectId}
        </div>
      </CardContent>
    </Card>
  );
};