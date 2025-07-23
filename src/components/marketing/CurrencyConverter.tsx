import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";

const currencies = [
  { code: "USD", rate: 1, symbol: "$" },
  { code: "AED", rate: 3.67, symbol: "د.إ" },
  { code: "SAR", rate: 3.75, symbol: "ر.س" },
  { code: "EUR", rate: 0.85, symbol: "€" }
];

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("AED");
  const [amount, setAmount] = useState(1000000);

  const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
  const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
  const convertedAmount = (amount / fromRate) * toRate;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <ArrowRightLeft className="h-5 w-5 text-primary" />
        Real-time Currency Conversion
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground">From</label>
          <select 
            className="w-full mt-1 p-2 border rounded-md"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">To</label>
          <select 
            className="w-full mt-1 p-2 border rounded-md"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-center py-4">
        <motion.div 
          className="text-2xl font-bold"
          key={convertedAmount}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currencies.find(c => c.code === toCurrency)?.symbol}
          {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </motion.div>
        <p className="text-sm text-muted-foreground">
          {currencies.find(c => c.code === fromCurrency)?.symbol}
          {amount.toLocaleString()} {fromCurrency}
        </p>
      </div>
    </div>
  );
}