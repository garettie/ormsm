import { lazy, useState, useEffect, useRef, Suspense } from "react";
import { DashboardContent } from "./components/dashboard/DashboardContent";
import { useDashboardData } from "./hooks/useDashboardData";
import { supabase } from "./lib/supabase";
import { localNowAsUTC } from "../../lib/utils";
import { useIncident } from "./hooks/useIncident";
import IncidentControls from "./components/dashboard/IncidentControls";
import IncidentHistory from "./components/dashboard/IncidentHistory";
import type { Incident } from "./types";
import { RefreshCw, Archive, Radio } from "lucide-react";
import { cn } from "../../lib/utils";
import { DataUploadButton } from "./components/dashboard/DataUploadButton";

const DataUploadModal = lazy(() => import("./components/dashboard/DataUpload").then(module => ({ default: module.DataUploadModal })));

export default function CallTreeDashboard() {
  const [view, setView] = useState<"live" | "history">("live");
  const [defaultIncident, setDefaultIncident] = useState<Incident | undefined>();
  const [initialLoading, setInitialLoading] = useState(true);
  const fetchedRef = useRef(false);

  const {
    activeIncident,
    loading: incidentLoading,
    startIncident,
    endIncident,
  } = useIncident();

  useEffect(() => {
    if (fetchedRef.current || incidentLoading) return;
    fetchedRef.current = true;

    const checkDefault = async () => {
      const { data } = await supabase
        .from("incidents")
        .select("*")
        .not("end_time", "is", null)
        .order("start_time", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setDefaultIncident(data);
        setView("history");
      }
      setInitialLoading(false);
    };

    checkDefault();
  }, [incidentLoading]);

  const filterDate = activeIncident?.start_time || localNowAsUTC(new Date(new Date().setHours(0, 0, 0, 0)));

  const [showUpload, setShowUpload] = useState(false);

  const { data, loading, error, refresh } = useDashboardData(filterDate);

  const viewToggle = (
    <button
      onClick={() => {
        const next = view === "live" ? "history" : "live";
        setView(next);
        if (next === "live") setDefaultIncident(undefined);
      }}
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-300 border",
        view === "live"
          ? "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
          : "bg-accent-primary text-white border-accent-primary shadow-sm hover:opacity-90"
      )}
    >
      {view === "live" ? (
        <>
          <Archive className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
        </>
      ) : (
        <>
          <Radio className="w-4 h-4" />
          <span className="hidden sm:inline">Live</span>
        </>
      )}
    </button>
  );

  const refreshControls = (
    <>
      <div className="hidden md:flex flex-col items-end mr-0">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Last Updated</span>
        <span className="text-sm font-mono font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {data.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      
      <button 
        onClick={() => refresh()}
        disabled={loading}
        className={cn(
          "p-2.5 rounded-xl transition-transform duration-300 active:scale-95",
          loading 
            ? "bg-gray-100 text-gray-400" 
            : "bg-white text-gray-600 hover:text-accent-primary hover:bg-accent-light border border-gray-200 hover:border-accent-primary/30 shadow-sm hover:shadow-md"
        )}
        title="Refresh Data"
      >
        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
      </button>
    </>
  );

  if (initialLoading) {
    return null;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  const showHistory = view === "history" || defaultIncident;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {showHistory ? (
        <IncidentHistory
          defaultIncident={defaultIncident}
          onStartNew={async (name, type) => {
            await startIncident(name, type);
            setView("live");
            setDefaultIncident(undefined);
          }}
          rightSlot={viewToggle}
        />
      ) : (
        <>
          <IncidentControls
            activeIncident={activeIncident}
            onStart={startIncident}
            onEnd={endIncident}
            rightSlot={<><DataUploadButton onUpload={() => setShowUpload(true)} />{viewToggle}{refreshControls}</>}
          />

          <DashboardContent
            data={data}
            storageKey={activeIncident ? `incident-filters-${activeIncident.id}` : "live-session-filters"}
            onRefresh={() => refresh({ background: true })}
          />
        </>
      )}
      {showUpload && (
        <Suspense fallback={null}>
          <DataUploadModal onClose={() => setShowUpload(false)} onSuccess={refresh} />
        </Suspense>
      )}
    </div>
  );
}