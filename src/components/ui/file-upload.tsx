"use client";
import { useRef, useState } from "react";
import { uploadFile, type UploadType } from "@/lib/storage";
import { Loader2, Upload, CheckCircle, X, FileText, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  type: UploadType;
  accept?: string;
  label?: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  className?: string;
}

function FileIcon({ type }: { type: UploadType }) {
  if (type === "image" || type === "avatar") return <Image size={20} className="text-brand" />;
  if (type === "video") return <Video size={20} className="text-brand" />;
  return <FileText size={20} className="text-brand" />;
}

const ACCEPT: Record<UploadType, string> = {
  cv: ".pdf,.doc,.docx",
  "cover-letter": ".pdf,.doc,.docx",
  certificate: ".pdf,.jpg,.png",
  image: ".jpg,.jpeg,.png,.webp,.gif",
  video: ".mp4,.mov,.webm",
  avatar: ".jpg,.jpeg,.png,.webp",
};

const LABELS: Record<UploadType, string> = {
  cv: "PDF, DOC up to 10MB",
  "cover-letter": "PDF, DOC up to 10MB",
  certificate: "PDF or image up to 10MB",
  image: "JPG, PNG, WebP up to 5MB",
  video: "MP4, MOV up to 50MB (~1 min)",
  avatar: "JPG, PNG up to 2MB",
};

export function FileUpload({ type, label, currentUrl, onUploaded, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true); setError(""); setSuccess(false);
    try {
      const result = await uploadFile(file, type);
      if (result) {
        onUploaded(result.url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !loading && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
          "hover:border-brand/50 hover:bg-accent/50",
          success ? "border-green-500/50 bg-green-500/5" : "border-border bg-secondary/30",
          loading && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[type]}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-2">
          {loading ? (
            <Loader2 size={24} className="animate-spin text-brand" />
          ) : success ? (
            <CheckCircle size={24} className="text-green-500" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-accent border border-brand/20 flex items-center justify-center">
              <FileIcon type={type} />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {loading ? "Uploading..." : success ? "Uploaded!" : "Drop file here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{LABELS[type]}</p>
          </div>
        </div>

        {/* Current file preview */}
        {currentUrl && !loading && (
          <div className="mt-3 pt-3 border-t border-border">
            {type === "image" || type === "avatar" ? (
              <img src={currentUrl} alt="Current" className="w-16 h-16 rounded-lg object-cover mx-auto border border-border" />
            ) : type === "video" ? (
              <video src={currentUrl} className="w-full max-h-24 rounded-lg" />
            ) : (
              <a href={currentUrl} target="_blank" rel="noreferrer"
                className="text-xs text-brand hover:underline flex items-center justify-center gap-1">
                <FileText size={12} /> View current file
              </a>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <X size={12} /> {error}
        </div>
      )}
    </div>
  );
}
