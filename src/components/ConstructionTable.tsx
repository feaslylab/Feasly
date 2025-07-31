import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useConstructionStoreScenario } from '@/hooks/useTableStores';
import { useSelectionStore } from '@/state/selectionStore';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';

export default function ConstructionTable() {
  const { projectId, scenarioId } = useSelectionStore();
  const { items, save, reload }   = useConstructionStoreScenario(projectId!, scenarioId);
  const [editing, setEditing]     = useState<string|null>(null);
  const [draft  , setDraft  ]     = useState<Record<string,string>>({});

  if (!projectId || !scenarioId) return null;

  return (
    <div className="rounded-xl border p-4 dark:bg-muted/40">
      <h3 className="mb-2 font-semibold">Construction Lines</h3>
      <table className="w-full text-sm">
        <thead><tr className="text-muted-foreground">
          <th className="text-left">Base Cost</th>
          <th>Start</th><th>End</th><th>Esc %</th>
        </tr></thead>
        <tbody>
          {items.map(row=>(
            <tr key={row.id} className="border-t">
              {['base_cost','start_period','end_period','escalation_rate']
               .map(col=>(
                <td key={col} className="py-1">
                  {editing===row.id
                    ? <Input
                        defaultValue={String(row[col as keyof typeof row] ?? '')}
                        onChange={e=>setDraft(d=>({...d,[col]:e.target.value}))}
                        className="h-7"
                      />
                    : <>{col==='escalation_rate'
                          ? (Number(row[col])*100).toFixed(1)+' %'
                          : row[col as keyof typeof row].toLocaleString()}</>}
                </td>
              ))}
              <td>
                {editing===row.id
                  ? <Button size="sm" onClick={async()=>{
                      await save({ ...row, ...transform(draft) });
                      setEditing(null); setDraft({}); reload();
                    }}>Save</Button>
                  : <Button variant="ghost" size="icon"
                      onClick={()=>setEditing(row.id)}>
                      <Pencil size={14}/>
                    </Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* util */ function transform(d:Record<string,string>) {
  const o:Record<string,any> = {};
  if ('base_cost' in d)       o.base_cost        = +d.base_cost;
  if ('start_period' in d)    o.start_period     = +d.start_period;
  if ('end_period' in d)      o.end_period       = +d.end_period;
  if ('escalation_rate' in d) o.escalation_rate  = +d.escalation_rate/100;
  return o;
}