import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useSaleStore } from '@/hooks/useTableStores';
import { useSelectionStore } from '@/state/selectionStore';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { PresenceDots } from '@/components/collaboration/PresenceDots';
import { CommentButton } from '@/components/collaboration/CommentButton';

export default function SaleTable() {
  const { projectId, scenarioId } = useSelectionStore();
  const { items, save, reload }   = useSaleStore(projectId!, scenarioId);
  const [editing, setEditing]     = useState<string|null>(null);
  const [draft  , setDraft  ]     = useState<Record<string,string>>({});

  if (!projectId || !scenarioId) return null;

  return (
    <div className="rounded-xl border p-4 dark:bg-muted/40">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Sale Lines</span>
        {projectId && (
          <>
            <PresenceDots className="ml-1" />
            <CommentButton
              targetId={`sale_table:${scenarioId}`}
              targetLabel="Sale Revenue"
            />
          </>
        )}
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-muted-foreground">
          <th className="text-left">Units</th>
          <th>Price/Unit</th><th>Start</th><th>End</th><th>Esc %</th>
        </tr></thead>
        <tbody>
          {items.map(row=>(
            <tr key={row.id} className={`border-t ${editing === row.id ? 'ring-2 ring-primary/40' : ''}`}>
              {['units','price_per_unit','start_period','end_period','escalation']
               .map(col=>(
                <td key={col} className="py-1">
                  {editing===row.id
                    ? <Input
                        defaultValue={String(row[col as keyof typeof row] ?? '')}
                        onChange={e=>setDraft(d=>({...d,[col]:e.target.value}))}
                        className="h-7"
                      />
                    : <>{col==='escalation'
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
  if ('units' in d)           o.units           = +d.units;
  if ('price_per_unit' in d)  o.price_per_unit  = +d.price_per_unit;
  if ('start_period' in d)    o.start_period    = +d.start_period;
  if ('end_period' in d)      o.end_period      = +d.end_period;
  if ('escalation' in d)      o.escalation      = +d.escalation/100;
  return o;
}