import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

export function ExchangeRatesManager() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRates();
  }, []);

  async function fetchRates() {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('from_currency');

    if (error) {
      toast({ title: 'Error loading exchange rates', description: error.message, variant: 'destructive' });
    } else {
      setRates(data || []);
    }
  }

  async function updateRate(index: number, field: keyof ExchangeRate, value: string | number) {
    const updated = [...rates];
    // @ts-ignore
    updated[index][field] = value;
    setRates(updated);
  }

  async function saveRate(rate: ExchangeRate) {
    setIsSaving(true);
    const { error } = await supabase
      .from('exchange_rates')
      .update({
        rate: rate.rate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rate.id);

    if (error) {
      toast({ title: 'Error saving rate', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Rate updated', description: `${rate.from_currency} → ${rate.to_currency}` });
      fetchRates();
    }

    setIsSaving(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Exchange Rate Admin</h1>

      {rates.map((rate, index) => (
        <div
          key={rate.id}
          className="grid grid-cols-5 items-center gap-4 border border-border p-4 rounded-md"
        >
          <div className="font-medium col-span-1">
            {rate.from_currency} → {rate.to_currency}
          </div>

          <Input
            type="number"
            step="0.001"
            value={rate.rate}
            onChange={(e) => updateRate(index, 'rate', parseFloat(e.target.value))}
            className="col-span-1"
          />

          <div className="text-sm text-muted-foreground col-span-2">
            {new Date(rate.updated_at).toLocaleString()}
          </div>

          <Button
            onClick={() => saveRate(rate)}
            disabled={isSaving}
            className="col-span-1"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      ))}
    </div>
  );
}