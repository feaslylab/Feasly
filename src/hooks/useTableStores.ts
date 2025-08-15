import { makeTableStore } from './makeTableStore';
import { Database } from '@/integrations/supabase/types';
import { ConstructionItem, SaleLine, RentalLine } from '@/lib/feasly-engine';

// Database types
type ConstructionItemDB = Database['public']['Tables']['construction_item']['Row'];
type SaleDB = Database['public']['Tables']['revenue_sale']['Row'];
type RentalDB = Database['public']['Tables']['revenue_rental']['Row'];

// Create table stores
export const useConstructionStoreScenario = makeTableStore<ConstructionItemDB>("construction_item");
export const useSaleStore = makeTableStore<SaleDB>("revenue_sale");
export const useRentalStore = makeTableStore<RentalDB>("revenue_rental");

// Helper functions to convert between database and engine types
export function constructionItemFromDB(dbItem: ConstructionItemDB): ConstructionItem {
  return {
    baseCost: dbItem.base_cost,
    startPeriod: dbItem.start_period,
    endPeriod: dbItem.end_period,
    escalationRate: dbItem.escalation_rate,
    retentionPercent: dbItem.retention_percent,
    retentionReleaseLag: dbItem.retention_release_lag,
  };
}

export function saleLineFromDB(dbItem: SaleDB): SaleLine {
  return {
    units: dbItem.units,
    pricePerUnit: dbItem.price_per_unit,
    startPeriod: dbItem.start_period,
    endPeriod: dbItem.end_period,
    escalation: dbItem.escalation,
  };
}

export function rentalLineFromDB(dbItem: RentalDB): RentalLine {
  return {
    rooms: dbItem.rooms,
    adr: dbItem.adr,
    occupancyRate: dbItem.occupancy_rate,
    startPeriod: dbItem.start_period,
    endPeriod: dbItem.end_period,
    annualEscalation: dbItem.annual_escalation,
  };
}

// Convert engine types to database insert format (only include fields not handled by store)
export function constructionItemToDB(item: ConstructionItem) {
  return {
    base_cost: item.baseCost,
    start_period: item.startPeriod,
    end_period: item.endPeriod,
    escalation_rate: item.escalationRate,
    retention_percent: item.retentionPercent,
    retention_release_lag: item.retentionReleaseLag,
  };
}

export function saleLineToDB(item: SaleLine) {
  return {
    units: item.units,
    price_per_unit: item.pricePerUnit,
    start_period: item.startPeriod,
    end_period: item.endPeriod,
    escalation: item.escalation,
  };
}

export function rentalLineToDB(item: RentalLine) {
  return {
    rooms: item.rooms,
    adr: item.adr,
    occupancy_rate: item.occupancyRate,
    start_period: item.startPeriod,
    end_period: item.endPeriod,
    annual_escalation: item.annualEscalation,
  };
}