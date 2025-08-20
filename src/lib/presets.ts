import { ProjectInputs } from "../../packages/feasly-engine/src/types";
import { safeNum } from '@/lib/format';

export type PresetId = 'conservative' | 'base' | 'aggressive';

export type PresetDefinition = {
  id: PresetId;
  name: string;
  description: string;
  apply: (inputs: ProjectInputs) => ProjectInputs; // returns a NEW object
};

function clone<T>(x: T): T {
  // safe, serializable inputs
  return JSON.parse(JSON.stringify(x));
}

function ensureEquityBlock(i: ProjectInputs): ProjectInputs {
  const out = clone(i);
  out.equity = out.equity ?? {
    enabled: true,
    call_order: 'pro_rata_commitment',
    distribution_frequency: 'monthly',
    classes: [],
    investors: [],
  } as any;
  return out;
}

export const PRESETS: PresetDefinition[] = [
  {
    id: 'conservative',
    name: 'Conservative (LP-friendly)',
    description: 'Higher pref, gentler promote, no early catch-up.',
    apply: (inputs) => {
      const out = ensureEquityBlock(inputs);
      const eq = out.equity as any;
      // if no classes, create a single Class A
      if (!eq.classes?.length) {
        eq.classes = [{
          key: 'class_a',
          seniority: 1,
          pref_rate_pa: 0.10,
          pref_compounding: 'simple',
          distribution_frequency: 'monthly',
          catchup: { enabled: false, target_gp_share: 0.20, basis: 'over_roc_and_pref' },
          tiers: [
            { irr_hurdle_pa: 0.08, split_lp: 0.9, split_gp: 0.1, hurdle_basis: 'lp_class_irr' },
            { irr_hurdle_pa: 0.12, split_lp: 0.85, split_gp: 0.15, hurdle_basis: 'lp_class_irr' },
          ],
        }];
      } else {
        eq.classes = eq.classes.map((c: any) => ({
          ...c,
          pref_rate_pa: 0.10,
          pref_compounding: 'simple',
          catchup: { enabled: false, target_gp_share: 0.20, basis: 'over_roc_and_pref' },
          tiers: [
            { irr_hurdle_pa: 0.08, split_lp: 0.90, split_gp: 0.10, hurdle_basis: 'lp_class_irr' },
            { irr_hurdle_pa: 0.12, split_lp: 0.85, split_gp: 0.15, hurdle_basis: 'lp_class_irr' },
          ],
        }));
      }
      return out;
    },
  },
  {
    id: 'base',
    name: 'Base (Market)',
    description: '8% pref, 80/20 promote above hurdle, standard catch-up.',
    apply: (inputs) => {
      const out = ensureEquityBlock(inputs);
      const eq = out.equity as any;
      if (!eq.classes?.length) {
        eq.classes = [{
          key: 'class_a',
          seniority: 1,
          pref_rate_pa: 0.08,
          pref_compounding: 'simple',
          distribution_frequency: 'monthly',
          catchup: { enabled: true, target_gp_share: 0.20, basis: 'over_roc_and_pref' },
          tiers: [
            { irr_hurdle_pa: 0.08, split_lp: 0.8, split_gp: 0.2, hurdle_basis: 'lp_class_irr' },
          ],
        }];
      } else {
        eq.classes = eq.classes.map((c: any) => ({
          ...c,
          pref_rate_pa: 0.08,
          pref_compounding: 'simple',
          catchup: { enabled: true, target_gp_share: 0.20, basis: 'over_roc_and_pref' },
          tiers: [
            { irr_hurdle_pa: 0.08, split_lp: 0.8, split_gp: 0.2, hurdle_basis: 'lp_class_irr' },
          ],
        }));
      }
      return out;
    },
  },
  {
    id: 'aggressive',
    name: 'Aggressive (GP-friendly)',
    description: 'Standard pref, faster catch-up, richer promote ladder.',
    apply: (inputs) => {
      const out = ensureEquityBlock(inputs);
      const eq = out.equity as any;
      if (!eq.classes?.length) {
        eq.classes = [{
          key: 'class_a',
          seniority: 1,
          pref_rate_pa: 0.08,
          pref_compounding: 'simple',
          distribution_frequency: 'monthly',
          catchup: { enabled: true, target_gp_share: 0.30, basis: 'over_roc_and_pref' },
          tiers: [
            { irr_hurdle_pa: 0.08, split_lp: 0.75, split_gp: 0.25, hurdle_basis: 'lp_class_irr' },
            { irr_hurdle_pa: 0.12, split_lp: 0.70, split_gp: 0.30, hurdle_basis: 'lp_class_irr' },
            { irr_hurdle_pa: 0.15, split_lp: 0.65, split_gp: 0.35, hurdle_basis: 'lp_class_irr' },
          ],
        }];
      } else {
        eq.classes = eq.classes.map((c: any) => ({
          ...c,
          pref_rate_pa: 0.08,
          pref_compounding: 'simple',
          catchup: { enabled: true, target_gp_share: 0.30, basis: 'over_roc_and_pref' },
          tiers: [
            { irr_hurdle_pa: 0.08, split_lp: 0.75, split_gp: 0.25, hurdle_basis: 'lp_class_irr' },
            { irr_hurdle_pa: 0.12, split_lp: 0.70, split_gp: 0.30, hurdle_basis: 'lp_class_irr' },
            { irr_hurdle_pa: 0.15, split_lp: 0.65, split_gp: 0.35, hurdle_basis: 'lp_class_irr' },
          ],
        }));
      }
      return out;
    },
  },
];

export function listPresets(): PresetDefinition[] {
  return PRESETS;
}

export function getPreset(id: PresetId): PresetDefinition | undefined {
  return PRESETS.find(p => p.id === id);
}