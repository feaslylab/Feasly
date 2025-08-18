import { FeaslyModelV2 } from "@/components/FeaslyModel/FeaslyModelV2";
import { EngineProvider } from "@/lib/engine/EngineContext";
import { useState } from "react";

export default function FeaslyModelPage() {
  // Mock form state for now - in real implementation this would come from the form
  const [formState] = useState({
    project: { 
      start_date: "2025-01-01", 
      periods: 60 
    },
    unit_types: [],
    cost_items: [],
    debt: []
  });

  return (
    <EngineProvider formState={formState}>
      <FeaslyModelV2 
        projectId="default"
        onSubmit={async (data) => {
          console.log('Model submitted:', data);
        }}
        onSaveDraft={() => {
          console.log('Draft saved');
        }}
      />
    </EngineProvider>
  );
}