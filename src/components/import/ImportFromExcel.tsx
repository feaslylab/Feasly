import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

interface ImportFromExcelProps {
  trigger?: React.ReactNode;
}

export const ImportFromExcel = ({ trigger }: ImportFromExcelProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not authenticated");

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        throw new Error("Please select a valid Excel (.xlsx) file");
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      setUploadProgress(10);

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `import_${user.id}_${timestamp}_${file.name}`;

      setUploadProgress(30);

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(60);

      // Call Edge Function to process the file
      const { data: processData, error: processError } = await supabase.functions
        .invoke('process-excel-import', {
          body: {
            fileName: fileName,
            userId: user.id,
            originalName: file.name
          }
        });

      if (processError) {
        throw new Error(`Processing failed: ${processError.message}`);
      }

      setUploadProgress(100);

      return processData;
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Project "${data.projectName}" has been created with ${data.assetCount} assets.`,
      });
      setOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);
      
      // Redirect to the newly created project
      if (data.projectId) {
        navigate(`/projects/${data.projectId}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import.",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate(selectedFile);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Upload className="w-4 h-4" />
      Import from Excel
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) file to automatically create a project with assets and scenarios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">Select Excel File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              disabled={importMutation.isPending}
              className="cursor-pointer"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{selectedFile.name}</span>
                <span>({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {importMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              File Format Requirements
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Excel file (.xlsx format)</li>
              <li>• First sheet should contain project information</li>
              <li>• Subsequent sheets should contain asset data</li>
              <li>• Include columns: Asset Name, Type, GFA, Construction Cost, etc.</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={importMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || importMutation.isPending}
            >
              {importMutation.isPending ? "Processing..." : "Import Project"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};