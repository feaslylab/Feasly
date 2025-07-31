import { useEffect } from 'react';
import { useFeaslyCalc }  from './useFeaslyCalc';
import { useSelectionStore } from '@/state/selectionStore';
import { useConstructionStoreScenario,
         useSaleStore,
         useRentalStore           } from '@/hooks/useTableStores';
import { useKpiStore } from '@/hooks/useKpiStore';
import debounce from 'lodash.debounce';

export function useLiveRecalc() {
  const { projectId, scenarioId } = useSelectionStore();
  const { items: cItems } = useConstructionStoreScenario(projectId!, scenarioId);
  const { items: sItems } = useSaleStore(projectId!, scenarioId);
  const { items: rItems } = useRentalStore(projectId!, scenarioId);
  const { saveKPIs             } = useKpiStore(projectId!, scenarioId);

  // -- run engine whenever any line changes --------------------
  const { cash, kpi } = useFeaslyCalc(
    cItems.map(i => ({          // db → engine dto
      baseCost: i.base_cost,
      startPeriod: i.start_period,
      endPeriod:   i.end_period,
      escalationRate: i.escalation_rate,
      retentionPercent: i.retention_percent,
      retentionReleaseLag: i.retention_release_lag,
    })),
    60,
    0.10,
    sItems.map(i => ({
      units:i.units, pricePerUnit:i.price_per_unit,
      startPeriod:i.start_period, endPeriod:i.end_period,
      escalation:i.escalation,
    })),
    rItems.map(i => ({
      rooms:i.rooms, adr:i.adr, occupancyRate:i.occupancy_rate,
      startPeriod:i.start_period, endPeriod:i.end_period,
      annualEscalation:i.annual_escalation,
    })),
    undefined                // ← pass loan facility if/when ready
  );

  // -- persist KPI snapshot (debounced 500 ms) -----------------
  //   Supabase "insert … on conflict do update" to avoid row spam
  /*eslint-disable react-hooks/exhaustive-deps*/
  useEffect(() => {
    if (!projectId || !kpi) return;
    debouncedSave({
      project_id : projectId,
      scenario_id: scenarioId,
      npv        : kpi.npv,
      irr        : kpi.projectIRR,
      profit     : kpi.profit,
    });
  }, [kpi?.npv, kpi?.projectIRR, kpi?.profit]);
  /*eslint-enable*/

  // debounced upsert
  /* istanbul ignore next */
  const debouncedSave = debounce(async (row) => {
    await saveKPIs(row);      // hook already handles upsert
  }, 500);

  return { cash, kpi };
}