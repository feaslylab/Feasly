import FeaslyModel from "@/components/FeaslyModel/FeaslyModel";
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
      <FeaslyModel />
    </EngineProvider>
  );
}