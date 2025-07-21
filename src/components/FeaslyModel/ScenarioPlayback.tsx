import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  TrendingUp,
  DollarSign,
  BarChart3,
  Zap
} from "lucide-react";
import { useFeaslyCalculation } from "@/hooks/useFeaslyCalculation";
import { cn } from "@/lib/utils";

interface ScenarioPlaybackProps {
  projectId?: string;
}

type MetricType = "netCashflow" | "revenue" | "profit" | "cumulativeBalance";
type ScenarioType = "base" | "optimistic" | "pessimistic" | "custom";
type PlaybackSpeed = 1 | 2 | 4;

const SCENARIO_COLORS = {
  base: "hsl(var(--primary))",
  optimistic: "hsl(var(--success))",
  pessimistic: "hsl(var(--destructive))",
  custom: "hsl(142 71% 55%)"
};

const METRIC_CONFIG = {
  netCashflow: {
    label: "Net Cashflow",
    icon: TrendingUp,
    color: "hsl(var(--primary))",
    format: "currency"
  },
  revenue: {
    label: "Revenue",
    icon: DollarSign,
    color: "hsl(var(--success))",
    format: "currency"
  },
  profit: {
    label: "Profit",
    icon: BarChart3,
    color: "hsl(var(--warning))",
    format: "currency"
  },
  cumulativeBalance: {
    label: "Cumulative Balance",
    icon: Zap,
    color: "hsl(var(--destructive))",
    format: "currency"
  }
};

export default function ScenarioPlayback({ projectId }: ScenarioPlaybackProps) {
  const { t } = useTranslation('feasly.model');
  const { cashflowGrid, hasData } = useFeaslyCalculation(projectId);
  
  // Playback state
  const [currentMonth, setCurrentMonth] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>("base");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("netCashflow");
  const [compareScenarios, setCompareScenarios] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  
  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('feasly-playback-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setPlaybackSpeed(settings.playbackSpeed || 1);
        setSelectedScenario(settings.selectedScenario || "base");
        setSelectedMetric(settings.selectedMetric || "netCashflow");
        setCompareScenarios(settings.compareScenarios || false);
      } catch (error) {
        console.warn('Failed to load playback settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      playbackSpeed,
      selectedScenario,
      selectedMetric,
      compareScenarios
    };
    localStorage.setItem('feasly-playback-settings', JSON.stringify(settings));
  }, [playbackSpeed, selectedScenario, selectedMetric, compareScenarios]);

  // Get timeline data
  const getTimelineData = useCallback(() => {
    if (!hasData || !cashflowGrid) return [];
    
    // Generate 24 months of data based on cashflow grid

    // Generate 24 months of data for demonstration
    const months = Array.from({ length: 24 }, (_, index) => {
      const monthData: any = {
        month: index + 1,
        monthLabel: `Month ${index + 1}`,
      };

      // Generate data for each scenario
      const scenarios: ScenarioType[] = ["base", "optimistic", "pessimistic", "custom"];
      scenarios.forEach(scenario => {
        const multiplier = {
          base: 1,
          optimistic: 1.15,
          pessimistic: 0.85,
          custom: 1.05
        }[scenario];

        // Simulate progressive cashflow over time
        const baseRevenue = 100000 + (index * 8000);
        const baseCosts = 60000 + (index * 4000);
        const baseProfit = baseRevenue - baseCosts;
        
        monthData[`${scenario}_revenue`] = baseRevenue * multiplier;
        monthData[`${scenario}_costs`] = baseCosts * (2 - multiplier + 0.1);
        monthData[`${scenario}_profit`] = baseProfit * multiplier;
        monthData[`${scenario}_netCashflow`] = (baseProfit * multiplier) - (index * 2000);
        monthData[`${scenario}_cumulativeBalance`] = monthData[`${scenario}_netCashflow`] * (index + 1) * 0.7;
      });

      return monthData;
    });

    return months;
  }, [hasData, cashflowGrid]);

  const timelineData = getTimelineData();
  const maxMonths = timelineData.length;

  // Playback controls
  const handlePlay = () => {
    if (currentMonth >= maxMonths - 1) {
      setCurrentMonth(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentMonth(0);
  };

  const handleSkipToEnd = () => {
    setCurrentMonth(maxMonths - 1);
    setIsPlaying(false);
  };

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && currentMonth < maxMonths - 1) {
      const interval = 1000 / playbackSpeed; // Speed adjustment
      intervalRef.current = setInterval(() => {
        setCurrentMonth(prev => {
          if (prev >= maxMonths - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentMonth, maxMonths, playbackSpeed]);

  // Format currency values
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        notation: 'compact',
        compactDisplay: 'short'
      }).format(value);
    }
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get current month data
  const getCurrentMetrics = () => {
    if (!timelineData[currentMonth]) return null;
    
    const data = timelineData[currentMonth];
    const scenario = selectedScenario;
    
    return {
      revenue: data[`${scenario}_revenue`] || 0,
      profit: data[`${scenario}_profit`] || 0,
      netCashflow: data[`${scenario}_netCashflow`] || 0,
      cumulativeBalance: data[`${scenario}_cumulativeBalance`] || 0,
      month: data.month,
      monthLabel: data.monthLabel
    };
  };

  const currentMetrics = getCurrentMetrics();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: `}
              <span className="font-semibold">
                {formatCurrency(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!hasData || !timelineData.length) {
    return (
      <Card className="feasly-chart-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Generate cashflow data to see timeline playback</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="feasly-chart-card">
      <CardHeader>
        <CardTitle className="feasly-title flex items-center gap-2">
          <Play className="h-5 w-5" />
          Scenario Timeline Playback
        </CardTitle>
        <p className="feasly-description">
          Interactive timeline exploration of financial metrics over time
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={currentMonth === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? handlePause : handlePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipToEnd}
              disabled={currentMonth === maxMonths - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Speed:</Label>
            <Select
              value={playbackSpeed.toString()}
              onValueChange={(value) => setPlaybackSpeed(Number(value) as PlaybackSpeed)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Metric:</Label>
            <Select
              value={selectedMetric}
              onValueChange={(value: MetricType) => setSelectedMetric(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(METRIC_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scenario Selector */}
          {!compareScenarios && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Scenario:</Label>
              <Select
                value={selectedScenario}
                onValueChange={(value: ScenarioType) => setSelectedScenario(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                  <SelectItem value="pessimistic">Pessimistic</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compare Scenarios Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="compare-scenarios"
              checked={compareScenarios}
              onCheckedChange={setCompareScenarios}
            />
            <Label htmlFor="compare-scenarios" className="text-sm font-medium">
              Compare Scenarios
            </Label>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Timeline</Label>
            <span className="text-sm text-muted-foreground">
              {currentMetrics?.monthLabel || 'Month 1'} of {maxMonths}
            </span>
          </div>
          <Slider
            value={[currentMonth]}
            onValueChange={([value]) => setCurrentMonth(value)}
            max={maxMonths - 1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Month 1</span>
            <span>Month {Math.ceil(maxMonths / 2)}</span>
            <span>Month {maxMonths}</span>
          </div>
        </div>

        {/* Current Metrics Display */}
        {currentMetrics && (
          <motion.div
            key={currentMonth}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {Object.entries(METRIC_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const value = currentMetrics[key as keyof typeof currentMetrics] as number;
              return (
                <div
                  key={key}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    selectedMetric === key 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4" style={{ color: config.color }} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: config.color }}>
                    {formatCurrency(value)}
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="monthLabel"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Current month indicator */}
              <ReferenceLine 
                x={timelineData[currentMonth]?.monthLabel} 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                strokeDasharray="4 4"
              />

              {compareScenarios ? (
                // Show all scenarios
                Object.entries(SCENARIO_COLORS).map(([scenario, color]) => (
                  <Area
                    key={scenario}
                    type="monotone"
                    dataKey={`${scenario}_${selectedMetric}`}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name={scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                  />
                ))
              ) : (
                // Show single scenario
                <Area
                  type="monotone"
                  dataKey={`${selectedScenario}_${selectedMetric}`}
                  stroke={SCENARIO_COLORS[selectedScenario]}
                  fill={SCENARIO_COLORS[selectedScenario]}
                  fillOpacity={0.2}
                  strokeWidth={3}
                  name={selectedScenario.charAt(0).toUpperCase() + selectedScenario.slice(1)}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}