import EditableNumber from './EditableNumber';
import { useRentalStore } from '@/hooks/useTableStores';
import { useSelectionStore } from '@/state/selectionStore';

export default function RentalTable() {
  const { projectId, scenarioId } = useSelectionStore();
  const { items, update } = useRentalStore(projectId!, scenarioId!);

  if(!items.length) return null;
  
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th>ADR (AED)</th>
          <th>Rooms</th>
          <th>Occupancy %</th>
          <th>Start</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>
        {items.map(row=>(
          <tr key={row.id}>
            <td>
              <EditableNumber
                value={row.adr}
                onChange={v=>update!(row.id,{ adr:v })}
              />
            </td>
            <td>
              <EditableNumber
                value={row.rooms}
                onChange={v=>update!(row.id,{ rooms:v })}
              />
            </td>
            <td>
              <EditableNumber
                value={row.occupancy_rate}
                onChange={v=>update!(row.id,{ occupancy_rate:v })}
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