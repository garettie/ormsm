import { Upload } from "lucide-react";

export function DataUploadButton({ onUpload }: { onUpload: () => void }) {
  return (
    <button
      onClick={onUpload}
      className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-3.5 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      <Upload className="w-4 h-4" />
      <span className="hidden sm:inline">Upload Data</span>
    </button>
  );
}
