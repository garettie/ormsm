import { lazy, Suspense, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Loader,
  RefreshCw,
} from "lucide-react";
import { StartIncidentForm } from "./StartIncidentForm";
import { useDashboardData } from "../../hooks/useDashboardData";
import { DashboardContent } from "./DashboardContent";
import {
  formatDateShort,
  formatDuration,
  formatTimeShort,
} from "../../../../lib/utils";
import type { Incident } from "../../types";
import { DataUploadButton } from "./DataUploadButton";

const DataUploadModal = lazy(() => import("./DataUpload").then(module => ({ default: module.DataUploadModal })));

export default function IncidentDetail({
  incident,
  onBack,
  onStartNew,
  rightSlot,
}: {
  incident: Incident;
  onBack: () => void;
  onStartNew?: (name: string, type: "test" | "actual", targetedContacts?: any[], startTime?: string) => void;
  rightSlot?: React.ReactNode;
}) {
  const [showStartForm, setShowStartForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const { data, loading, error, refresh } = useDashboardData(
    incident.start_time,
    incident.end_time ?? undefined,
  );

  const isTest = incident.type === "test";

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Combined: Back + Event Info + Start New — single row */}
      <div
        className={`mb-6 p-4 rounded-lg flex items-center justify-between shadow-sm border-l-4 ${
          isTest ? "bg-blue-50 border-blue-500" : "bg-red-50 border-red-500"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to History
          </button>

          <div className="w-px h-8 bg-gray-200/60 shrink-0" />

          <div className="flex items-center gap-3">
            <div
              className={`p-1.5 rounded-full ${isTest ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}
            >
              {isTest ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2
                className={`text-base font-bold leading-tight ${isTest ? "text-blue-900" : "text-red-900"}`}
              >
                {incident.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateShort(incident.start_time)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeShort(incident.start_time)} –{" "}
                  {incident.end_time ? formatTimeShort(incident.end_time) : "—"}
                </span>
                {incident.end_time && (
                  <span className="font-medium text-gray-400">
                    {formatDuration(incident.start_time, incident.end_time)}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                    isTest
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {incident.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {!showStartForm && (
          <div className="flex items-center gap-3">
            {rightSlot}
            <DataUploadButton onUpload={() => setShowUpload(true)} />
            {onStartNew && (
              <button
                onClick={() => setShowStartForm(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-slate-800 transition-all text-sm shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                Start New Event
              </button>
            )}
            <div className="hidden md:flex flex-col items-end mr-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Last Updated</span>
              <span className="text-sm font-mono font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                {data.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <button
              onClick={() => refresh()}
              disabled={loading}
              className={`p-2.5 rounded-xl transition-transform duration-300 active:scale-95 ${
                loading 
                  ? "bg-gray-100 text-gray-400" 
                  : "bg-white text-gray-600 hover:text-accent-primary hover:bg-accent-light border border-gray-200 hover:border-accent-primary/30 shadow-sm hover:shadow-md"
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading && "animate-spin"}`} />
            </button>
          </div>
        )}
      </div>

      {showStartForm && onStartNew && (
        <div className="mb-6">
          <StartIncidentForm
            onStart={onStartNew}
            onCancel={() => setShowStartForm(false)}
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader size={32} color="#64748b" className="animate-spin" />
          <div className="mt-3 text-sm text-slate-500">
            Loading data...
          </div>
        </div>
      )}

      {!loading && (
        <DashboardContent
          data={data}
          storageKey={`incident-filters-${incident.id}`}
          onRefresh={() => refresh({ background: true })}
        />
      )}
      {showUpload && (
        <Suspense fallback={null}>
          <DataUploadModal onClose={() => setShowUpload(false)} onSuccess={() => refresh()} />
        </Suspense>
      )}
    </div>
  );
}
