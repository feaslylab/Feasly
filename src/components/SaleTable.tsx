import EditableNumber from './EditableNumber';
import { useSaleStore } from '@/hooks/useTableStores';
import { useSelectionStore } from '@/state/selectionStore';

export default function SaleTable() {
  const { projectId, scenarioId } = useSelectionStore();
  const { items, update } = useSaleStore(projectId!, scenarioId!);

  if(!items.length) return null;
  
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th>Price per Unit (AED)</th>
          <th>Units</th>
          <th>Start</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>
        {items.map(row=>(
          <tr key={row.id}>
            <td>
              <EditableNumber
                value={row.price_per_unit}
                onChange={v=>update!(row.id,{ price_per_unit:v })}
              />
            </td>
            <td>
              <EditableNumber
                value={row.units}
                onChange={v=>update!(row.id,{ units:v })}
              />
            </td>
            <td>{row.start_period}</td>
            <td>{row.end_period}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}