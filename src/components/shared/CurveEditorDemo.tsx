import { useState } from "react";
import CurveEditor, { CurveData } from "./CurveEditor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CurveEditorDemo() {
  // Example: Sales Distribution Curve
  const [salesCurve, setSalesCurve] = useState<CurveData>({
    meaning: "sell_through",
    values: new Array(36).fill(1/36), // Linear distribution over 36 months
  });

  // Example: Construction Phasing Curve
  const [constructionCurve, setConstructionCurve] = useState<CurveData>({
    meaning: "phasing",
    values: new Array(24).fill(0).map((_, i) => {
      // Ramp up pattern
      if (i < 3) return 0; // No activity first 3 months
      if (i < 6) return 500000; // Slow start
      if (i < 18) return 2000000; // Peak construction
      return 800000; // Wind down
    }),
  });

  // Example: Occupancy Curve
  const [occupancyCurve, setOccupancyCurve] = useState<CurveData>({
    meaning: "occupancy",
    values: new Array(60).fill(0).map((_, i) => {
      if (i < 18) return 0; // No occupancy during construction
      if (i < 24) return 0.3 + (i - 18) * 0.1; // Gradual lease-up
      return 0.85; // Stabilized occupancy
    }),
  });

  // Example: Equity Drawdown Curve
  const [equityDrawdown, setEquityDrawdown] = useState<CurveData>({
    meaning: "drawdown",
    values: new Array(30).fill(0).map((_, i) => {
      if (i === 0) return 5000000; // Initial equity injection
      if (i < 6) return 0;
      if (i < 18) return 1500000; // Regular construction draws
      if (i === 18) return 3000000; // Final equity call
      return 0;
    }),
  });

  return (
    <div className="space-y-6 p-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">CurveEditor Demo</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Interactive timeline/curve editor for phasing costs, revenue, and financing across different meanings.
        </p>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Distribution</TabsTrigger>
          <TabsTrigger value="construction">Construction Costs</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy Curve</TabsTrigger>
          <TabsTrigger value="equity">Equity Drawdown</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <CurveEditor
            id="sales-curve"
            label="Residential Sales"
            totalAmount={100000000}
            curve={salesCurve}
            totalPeriods={36}
            currency="AED"
            onChange={(newValues) => setSalesCurve({ ...salesCurve, values: newValues })}
          />
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Expected Revenue</div>
              <div className="font-semibold">AED 100,000,000</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sales Period</div>
              <div className="font-semibold">36 months</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Curve Type</div>
              <div className="font-semibold">Sell-through %</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="construction" className="space-y-4">
          <CurveEditor
            id="construction-curve"
            label="Construction Costs"
            totalAmount={75000000}
            curve={constructionCurve}
            totalPeriods={24}
            currency="AED"
            onChange={(newValues) => setConstructionCurve({ ...constructionCurve, values: newValues })}
          />
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Total Budget</div>
              <div className="font-semibold">AED 75,000,000</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Construction Period</div>
              <div className="font-semibold">24 months</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Curve Type</div>
              <div className="font-semibold">Cost Phasing</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <CurveEditor
            id="occupancy-curve"
            label="Rental Occupancy"
            totalAmount={1.0}
            curve={occupancyCurve}
            totalPeriods={60}
            currency="%"
            onChange={(newValues) => setOccupancyCurve({ ...occupancyCurve, values: newValues })}
          />
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Target Occupancy</div>
              <div className="font-semibold">85%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Lease-up Period</div>
              <div className="font-semibold">60 months</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Curve Type</div>
              <div className="font-semibold">Occupancy Rate</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="equity" className="space-y-4">
          <CurveEditor
            id="equity-curve"
            label="Equity Capital Calls"
            totalAmount={25000000}
            curve={equityDrawdown}
            totalPeriods={30}
            currency="AED"
            onChange={(newValues) => setEquityDrawdown({ ...equityDrawdown, values: newValues })}
          />
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Total Equity</div>
              <div className="font-semibold">AED 25,000,000</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Drawdown Period</div>
              <div className="font-semibold">30 months</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Curve Type</div>
              <div className="font-semibold">Capital Drawdown</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="p-4">
        <h3 className="text-md font-semibold mb-2">Usage Examples</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Sales Distribution:</strong> Define when units will be sold over the sales period</p>
          <p><strong>Construction Costs:</strong> Phase construction expenses across the build timeline</p>
          <p><strong>Occupancy Curve:</strong> Model rental lease-up and stabilization patterns</p>
          <p><strong>Equity Drawdown:</strong> Schedule capital calls and equity injections</p>
        </div>
      </Card>
    </div>
  );
}