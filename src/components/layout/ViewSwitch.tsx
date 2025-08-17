import { useViewMode, ViewMode } from '@/lib/view-mode';

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'lite', label: 'Lite' },
  { value: 'standard', label: 'Standard' },
  { value: 'giga', label: 'Giga' },
];

export default function ViewSwitch() {
  const { mode, setMode } = useViewMode();
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">View</span>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as ViewMode)}
        className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground"
        aria-label="Change view mode"
      >
        {OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}