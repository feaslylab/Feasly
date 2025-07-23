import { motion } from "framer-motion";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import { useEffect, useState } from "react";

const chartData = [
  { label: "Revenue", value: 85, color: "bg-primary" },
  { label: "Costs", value: 60, color: "bg-accent" },
  { label: "Profit", value: 92, color: "bg-success" }
];

export function AnimatedChart() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Live Financial Model</h3>
        <TrendingUp className="h-4 w-4 text-success ml-auto" />
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: animate ? 1 : 0 }}
                transition={{ delay: index * 0.2 + 0.5 }}
                className="font-medium"
              >
                {item.value}%
              </motion.span>
            </div>
            <div className="bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${item.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: animate ? `${item.value}%` : 0 }}
                transition={{ 
                  duration: 1,
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <motion.div
        className="mt-6 p-3 bg-muted/50 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 10 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">ROI: 34.2%</span>
        </div>
      </motion.div>
    </div>
  );
}