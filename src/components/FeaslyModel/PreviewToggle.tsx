import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Edit } from "lucide-react";

interface PreviewToggleProps {
  children: (previewMode: boolean) => React.ReactNode;
}

export function PreviewToggle({ children }: PreviewToggleProps) {
  const { t } = useTranslation('feasly.model');
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="space-y-6">
      {/* Preview Toggle Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {previewMode ? (
                <Eye className="h-5 w-5 text-primary" />
              ) : (
                <Edit className="h-5 w-5 text-primary" />
              )}
              <span>
                {previewMode ? "Preview Mode" : "Edit Mode"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="preview-mode" className="text-sm font-normal">
                {t('feasly.model.preview_toggle')}
              </Label>
              <Switch
                id="preview-mode"
                checked={previewMode}
                onCheckedChange={setPreviewMode}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            {previewMode 
              ? "Viewing read-only summary with insights and results"
              : "Edit project inputs and configurations"
            }
          </p>
        </CardContent>
      </Card>

      {/* Render children with preview mode */}
      {children(previewMode)}
    </div>
  );
}