import { useMemo } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ProjectSchema } from "@/schemas/inputs";

export default function ProjectSection() {
  const { inputs, setInputs } = useEngine();

  const project = useMemo(() => ({
    start_date: inputs?.project?.start_date ?? new Date().toISOString().slice(0, 10),
    periods: Number(inputs?.project?.periods ?? 60),
    periodicity: (inputs?.project?.periodicity as "monthly"|"quarterly"|"yearly") ?? "monthly",
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
    <Card className="p-4 space-y-4" data-section="project">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Basic Configuration</h3>
        <p className="text-xs text-muted-foreground">Set your project's timeline and cadence</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={project.start_date}
            onChange={(e) => patch({ start_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Periods</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={project.periods}
            onChange={(e) => patch({ periods: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Periodicity</Label>
          <Select value={project.periodicity} onValueChange={(v) => patch({ periodicity: v as any })}>
            <SelectTrigger><SelectValue placeholder="monthly" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
