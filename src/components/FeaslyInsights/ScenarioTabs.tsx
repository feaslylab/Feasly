import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScenarioTabsProps {
  activeScenario: string;
  setActiveScenario: (scenario: string) => void;
  children: React.ReactNode;
}

export default function ScenarioTabs({ activeScenario, setActiveScenario, children }: ScenarioTabsProps) {
  return (
    <Tabs value={activeScenario} onValueChange={setActiveScenario} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Charts Overview</TabsTrigger>
        <TabsTrigger value="geographic">Geographic View</TabsTrigger>
        <TabsTrigger value="insights">AI Insights</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}