import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus } from "lucide-react";

interface VersionSelectorProps {
  availableVersions: string[];
  selectedVersion?: string;
  currentVersionLabel?: string;
  isLoading?: boolean;
  onVersionSelect: (version: string | undefined) => void;
  onCalculateWithVersion: (versionLabel: string) => void;
}

export function VersionSelector({
  availableVersions,
  selectedVersion,
  currentVersionLabel,
  isLoading,
  onVersionSelect,
  onCalculateWithVersion,
}: VersionSelectorProps) {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState("");

  const handleCreateVersion = () => {
    if (newVersionLabel.trim()) {
      onCalculateWithVersion(newVersionLabel.trim());
      setNewVersionLabel("");
      setIsCreateDialogOpen(false);
    }
  };

  const displayVersions = availableVersions.length > 0 ? availableVersions : [];
  const latestVersion = displayVersions[0]; // Assuming first is latest

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="version-select" className="text-sm font-medium">
          Forecast Version:
        </Label>
      </div>

      <Select
        value={selectedVersion || "latest"}
        onValueChange={(value) => onVersionSelect(value === "latest" ? undefined : value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select version..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">
            <div className="flex items-center gap-2">
              <span>Latest</span>
              {latestVersion && (
                <Badge variant="secondary" className="text-xs">
                  {latestVersion}
                </Badge>
              )}
            </div>
          </SelectItem>
          {displayVersions.map((version) => (
            <SelectItem key={version} value={version}>
              <div className="flex items-center gap-2">
                <span>{version}</span>
                {version === currentVersionLabel && (
                  <Badge variant="outline" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Version
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Forecast Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version-label">Version Label</Label>
              <Input
                id="version-label"
                placeholder="e.g., v2.0, Q1-2024, Updated-Baseline"
                value={newVersionLabel}
                onChange={(e) => setNewVersionLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateVersion();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateVersion}
              disabled={!newVersionLabel.trim()}
            >
              Generate Forecast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentVersionLabel && (
        <Badge variant="default" className="ml-2">
          Current: {currentVersionLabel}
        </Badge>
      )}
    </div>
  );
}