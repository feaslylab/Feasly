import { useMemo } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSectionContainer } from '../SectionContainer';
import { Building2 } from 'lucide-react';
import { ProjectSchema } from "@/schemas/inputs";

export default function ProjectSection() {
  const { inputs, setInputs } = useEngine();

  const project = useMemo(() => ({
    start_date: inputs?.project?.start_date ?? new Date().toISOString().slice(0, 10),
    periods: Number(inputs?.project?.periods ?? 60),
    periodicity: (inputs?.project?.periodicity as "monthly"|"quarterly"|"yearly") ?? "monthly",
    project_type: (inputs?.project?.project_type as any) ?? "Residential",
    developer_name: inputs?.project?.developer_name ?? "",
    project_location: inputs?.project?.project_location ?? "",
    currency: inputs?.project?.currency ?? "AED",
    duration_months: Number(inputs?.project?.duration_months ?? 36),
    masterplan_mode: Boolean(inputs?.project?.masterplan_mode ?? false),
  }), [inputs]);

  const patch = (p: Partial<typeof project>) => {
    // validate lightly; we don’t block typing
    const next = { ...project, ...p };
    const parsed = ProjectSchema.safeParse({
      ...next,
      periods: Number(next.periods),
    });
    setInputs((prev: any) => ({
      ...prev,
      project: { ...(prev?.project ?? {}), ...next, periods: Number(next.periods) || 0 },
      // keep other top-level keys as-is
    }));
    return parsed.success;
  };

  return (
    <FormSectionContainer
      title="Project Configuration"
      description="Define your project's basic parameters and timeline"
      icon={<Building2 className="h-5 w-5" />}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>Project Type</Label>
          <Select value={project.project_type} onValueChange={(v) => patch({ project_type: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-background border border-border z-dropdown">
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Hospitality">Hospitality</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
              <SelectItem value="Master Plan">Master Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Developer Name</Label>
          <Input
            type="text"
            placeholder="Enter developer name"
            value={project.developer_name}
            onChange={(e) => patch({ developer_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Project Location</Label>
          <Input
            type="text"
            placeholder="Enter project location"
            value={project.project_location}
            onChange={(e) => patch({ project_location: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={project.currency} onValueChange={(v) => patch({ currency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-background border border-border z-dropdown">
              <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
              <SelectItem value="USD">USD (US Dollar)</SelectItem>
              <SelectItem value="EUR">EUR (Euro)</SelectItem>
              <SelectItem value="GBP">GBP (British Pound)</SelectItem>
              <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Duration (Months)</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={project.duration_months}
            onChange={(e) => patch({ duration_months: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={project.start_date}
            onChange={(e) => patch({ start_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Periodicity</Label>
          <Select value={project.periodicity} onValueChange={(v) => patch({ periodicity: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-background border border-border z-dropdown">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormSectionContainer>
  );
}
