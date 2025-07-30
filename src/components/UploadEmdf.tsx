import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface UploadEmdfProps {
  onImportComplete?: () => void;
}

export default function UploadEmdf({ onImportComplete }: UploadEmdfProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.emdf') && !file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: "Invalid file type",
        description: "Please select an EMDF or ZIP file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Upload file to storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("emdf_imports")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          metadata: {
            user_id: user.id,
            proj_name: file.name.replace(/\.(emdf|zip)$/i, '')
          }
        });

      if (uploadError) {
        throw uploadError;
      }

      // Trigger the edge function to process the file
      const { error: functionError } = await supabase.functions.invoke('import_emdf', {
        body: {
          name: fileName,
          bucket: 'emdf_imports',
          metadata: {
            user_id: user.id,
            proj_name: file.name.replace(/\.(emdf|zip)$/i, '')
          }
        }
      });

      if (functionError) {
        throw functionError;
      }

      toast({
        title: "Import successful",
        description: "Your EMDF file has been imported successfully. The new project should appear shortly.",
      });

      // Clean up the uploaded file
      await supabase.storage
        .from("emdf_imports")
        .remove([fileName]);

      // Notify parent component
      onImportComplete?.();

    } catch (error) {
      console.error('EMDF import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import EMDF file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        accept=".emdf,.zip"
        onChange={handleFileUpload}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="emdf-upload"
      />
      <Button
        variant="outline"
        disabled={uploading}
        className="w-full"
        asChild
      >
        <label htmlFor="emdf-upload" className="cursor-pointer">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import EMDF
            </>
          )}
        </label>
      </Button>
    </div>
  );
}