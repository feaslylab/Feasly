import { describe, it, expect } from 'vitest';
import { PRESETS, listPresets, getPreset } from '@/lib/presets';

describe('presets', () => {
  const base: any = { 
    equity: { 
      enabled: true, 
      classes: [{ 
        key: 'class_a', 
        seniority: 1,
        pref_rate_pa: 0.06,
        tiers: [{ split_lp: 1.0, split_gp: 0.0 }]
      }] 
    } 
  };

  it('returns list of all presets', () => {
    const presets = listPresets();
    expect(presets).toHaveLength(3);
    expect(presets.map(p => p.id)).toEqual(['conservative', 'base', 'aggressive']);
  });

  it('gets preset by id', () => {
    const conservative = getPreset('conservative');
    expect(conservative?.name).toBe('Conservative (LP-friendly)');
    
    const invalid = getPreset('invalid' as any);
    expect(invalid).toBeUndefined();
  });

  it('returns new objects and does not mutate input', () => {
    const p = PRESETS.find(x => x.id === 'base')!;
    const snap = JSON.parse(JSON.stringify(base));
    const out = p.apply(snap);
    expect(out).not.toBe(snap);
    expect(snap.equity.classes.length).toBe(1);
    expect(snap.equity.classes[0].pref_rate_pa).toBe(0.06); // unchanged
  });

  it('applies expected LP/GP splits for aggressive preset', () => {
    const p = PRESETS.find(x => x.id === 'aggressive')!;
    const out: any = p.apply(base);
    expect(out.equity.classes[0].tiers[0].split_gp).toBeCloseTo(0.25, 5);
    expect(out.equity.classes[0].tiers[0].split_lp).toBeCloseTo(0.75, 5);
  });

  it('applies expected settings for conservative preset', () => {
    const p = PRESETS.find(x => x.id === 'conservative')!;
    const out: any = p.apply(base);
    expect(out.equity.classes[0].pref_rate_pa).toBe(0.10);
    expect(out.equity.classes[0].catchup.enabled).toBe(false);
    expect(out.equity.classes[0].tiers[0].split_gp).toBe(0.10);
  });

  it('applies expected settings for base preset', () => {
    const p = PRESETS.find(x => x.id === 'base')!;
    const out: any = p.apply(base);
    expect(out.equity.classes[0].pref_rate_pa).toBe(0.08);
    expect(out.equity.classes[0].catchup.enabled).toBe(true);
    expect(out.equity.classes[0].tiers[0].split_gp).toBe(0.2);
  });

  it('creates class when none exist', () => {
    const emptyInput = { equity: { enabled: true, classes: [] } };
    const p = PRESETS.find(x => x.id === 'base')!;
    const out: any = p.apply(emptyInput);
    expect(out.equity.classes).toHaveLength(1);
    expect(out.equity.classes[0].key).toBe('class_a');
    expect(out.equity.classes[0].seniority).toBe(1);
  });

  it('ensures equity block exists', () => {
    const noEquity = {};
    const p = PRESETS.find(x => x.id === 'base')!;
    const out: any = p.apply(noEquity);
    expect(out.equity).toBeDefined();
    expect(out.equity.enabled).toBe(true);
    expect(out.equity.classes).toHaveLength(1);
  });
});