import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, User, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploadCardProps {
  type: 'user' | 'reference';
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onFileRemove: () => void;
  onTemplateSelect?: (templateId: string) => void;
  selectedTemplate?: string;
  templates?: Array<{ id: string; name: string; description: string }>;
}

export function VideoUploadCard({ 
  type, 
  onFileSelect, 
  selectedFile, 
  onFileRemove,
  onTemplateSelect,
  selectedTemplate,
  templates = []
}: VideoUploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isUser = type === 'user';

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isUser ? "bg-blue-100" : "bg-emerald-100"
          )}>
            {isUser ? (
              <User className={cn("w-4 h-4", "text-blue-600")} />
            ) : (
              <Star className={cn("w-4 h-4", "text-emerald-600")} />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 ml-3">
            {isUser ? "Your Video" : "Reference Style Video"}
          </h3>
        </div>

        {selectedFile ? (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-lg aspect-video relative overflow-hidden">
              <video 
                className="w-full h-full object-cover" 
                controls
                src={URL.createObjectURL(selectedFile)}
                data-testid={`video-preview-${type}`}
              />
              <button
                onClick={onFileRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                data-testid={`button-remove-${type}-video`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span data-testid={`text-filename-${type}`}>{selectedFile.name}</span>
              <span data-testid={`text-filesize-${type}`}>{formatFileSize(selectedFile.size)}</span>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragOver 
                  ? isUser 
                    ? "border-primary bg-primary/5" 
                    : "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 hover:border-primary"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              data-testid={`upload-zone-${type}`}
            >
              <div className="mb-4">
                <Upload className="w-10 h-10 text-slate-400 mx-auto" />
              </div>
              <p className="text-slate-600 mb-2">
                {isUser ? "Drop your video here or click to browse" : "Drop influencer's video here"}
              </p>
              <p className="text-sm text-slate-500">
                {isUser ? "Supports MP4, MOV, AVI up to 500MB" : "We'll analyze and match this style"}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                data-testid={`button-choose-file-${type}`}
              >
                Choose File
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              data-testid={`input-file-${type}`}
            />
          </>
        )}

        {!isUser && !selectedFile && templates.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700 mb-3">Or choose a popular style:</p>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onTemplateSelect?.(template.id)}
                  className={cn(
                    "p-3 border rounded-lg transition-colors text-left",
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-primary hover:bg-primary/5"
                  )}
                  data-testid={`button-template-${template.id}`}
                >
                  <div className="text-sm font-medium text-slate-900">{template.name}</div>
                  <div className="text-xs text-slate-500">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
