import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// Simple coordinate mapping for UAE cities
const cityCoordinates: Record<string, [number, number]> = {
  'Dubai': [55.2708, 25.2048],
  'Abu Dhabi': [54.3773, 24.4539],
  'Sharjah': [55.4033, 25.3573],
  'Ajman': [55.5136, 25.4052],
  'Ras Al Khaimah': [55.9432, 25.7893],
  'Fujairah': [56.3267, 25.1164],
  'Umm Al Quwain': [55.7796, 25.5648]
};

interface Project {
  id: string;
  name: string;
  totalGFA: number;
  constructionCost: number;
  estimatedRevenue: number;
  irr: number;
  roi: number;
  profitMargin: number;
  netProfit: number;
  status: string;
  currency: string;
  createdAt: Date;
  scenario: string;
  country?: string;
  city?: string;
}

interface GeographicMapProps {
  projects: Project[];
  formatCurrency: (amount: number) => string;
  onProjectClick: (project: Project) => void;
}

export const GeographicMap = ({ projects, formatCurrency, onProjectClick }: GeographicMapProps) => {
  const { isRTL } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Group projects by location
  const projectsByLocation = projects.reduce((acc, project) => {
    if (project.city && project.country) {
      const key = `${project.city}, ${project.country}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(project);
    }
    return acc;
  }, {} as Record<string, Project[]>);

  const getIRRColor = (irr: number) => {
    if (irr >= 20) return 'bg-green-500';
    if (irr >= 15) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLocationStats = (locationProjects: Project[]) => {
    const avgIRR = locationProjects.reduce((sum, p) => sum + p.irr, 0) / locationProjects.length;
    const totalProjects = locationProjects.length;
    const totalInvestment = locationProjects.reduce((sum, p) => sum + p.constructionCost, 0);
    return { avgIRR, totalProjects, totalInvestment };
  };

  // Simple SVG map visualization for UAE
  const renderSimpleMap = () => {
    const mapWidth = 400;
    const mapHeight = 300;
    const padding = 20;
    
    // UAE approximate boundaries
    const uaeBounds = {
      minLat: 22.5,
      maxLat: 26.5,
      minLng: 51.5,
      maxLng: 56.5
    };

    const projectToCoords = (lng: number, lat: number) => {
      const x = padding + ((lng - uaeBounds.minLng) / (uaeBounds.maxLng - uaeBounds.minLng)) * (mapWidth - 2 * padding);
      const y = padding + ((uaeBounds.maxLat - lat) / (uaeBounds.maxLat - uaeBounds.minLat)) * (mapHeight - 2 * padding);
      return [x, y];
    };

    return (
      <div className="relative">
        <svg width={mapWidth} height={mapHeight} className="border rounded-lg bg-slate-50">
          {/* Simple UAE outline */}
          <rect
            x={padding}
            y={padding}
            width={mapWidth - 2 * padding}
            height={mapHeight - 2 * padding}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
            rx="8"
          />
          
          {/* Map markers */}
          {Object.entries(projectsByLocation).map(([location, locationProjects]) => {
            const [city] = location.split(', ');
            const coordinates = cityCoordinates[city];
            
            if (!coordinates) return null;
            
            const [x, y] = projectToCoords(coordinates[0], coordinates[1]);
            const stats = getLocationStats(locationProjects);
            
            return (
              <g key={location}>
                {/* Marker circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={Math.min(8 + locationProjects.length * 2, 20)}
                  className={cn(
                    "cursor-pointer transition-all hover:opacity-80",
                    getIRRColor(stats.avgIRR)
                  )}
                  onClick={() => setSelectedProject(locationProjects[0])}
                />
                
                {/* City label */}
                <text
                  x={x}
                  y={y - 25}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {city}
                </text>
                
                {/* Project count */}
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                >
                  {locationProjects.length}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>IRR ≥ 20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>IRR 15-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>IRR &lt; 15%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Visualization */}
            <div className="space-y-4">
              {renderSimpleMap()}
              <p className="text-xs text-muted-foreground">
                Click markers to view project details. Circle size indicates project count.
              </p>
            </div>
            
            {/* Location Statistics */}
            <div className="space-y-4">
              <h4 className="font-medium">Location Performance</h4>
              <div className="space-y-3">
                {Object.entries(projectsByLocation).map(([location, locationProjects]) => {
                  const stats = getLocationStats(locationProjects);
                  
                  return (
                    <div key={location} className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                         onClick={() => onProjectClick(locationProjects[0])}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location}</span>
                        </div>
                        <Badge className={cn("text-xs", 
                          stats.avgIRR >= 20 ? 'bg-green-100 text-green-800' :
                          stats.avgIRR >= 15 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {stats.avgIRR.toFixed(1)}% IRR
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="block">Projects</span>
                          <span className="font-medium text-foreground">{stats.totalProjects}</span>
                        </div>
                        <div>
                          <span className="block">Total Investment</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(stats.totalInvestment)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {locationProjects.map(project => (
                            <Badge key={project.id} variant="outline" className="text-xs">
                              {project.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Project Details Modal would be triggered here */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={() => setSelectedProject(null)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedProject.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">IRR</span>
                  <div className="font-medium">{selectedProject.irr.toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">ROI</span>
                  <div className="font-medium">{selectedProject.roi.toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Profit</span>
                  <div className="font-medium">{formatCurrency(selectedProject.netProfit)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="font-medium">{selectedProject.status}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  onProjectClick(selectedProject);
                }}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                View Full Details
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};