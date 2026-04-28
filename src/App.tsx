import { useState, Suspense, useEffect } from "react";
import AppShell from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Login } from "./components/Login";
import { supabase } from "./lib/supabase";
import { lazyWithRetry } from "./lib/utils";

const CallTreeDashboard = lazyWithRetry(() =>
  import("./modules/calltree/CallTreeDashboard")
);

const RCSADashboard = lazyWithRetry(() =>
  import("./modules/rcsa/RCSADashboard")
);

type Module = "calltree" | "rcsa";

const isRcsaMode = import.meta.env.VITE_APP_MODE === "rcsa";

function App() {
  const [activeModule, setActiveModule] = useState<Module>(isRcsaMode ? "rcsa" : "calltree");
  const [demoMode, setDemoMode] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <AppShell
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        demoMode={demoMode}
        onDemoModeChange={setDemoMode}
      >
        <Suspense fallback={null}>
          {!isRcsaMode && (
            <div style={{ display: activeModule === "calltree" ? "block" : "none" }}>
              <CallTreeDashboard />
            </div>
          )}
          <div style={{ display: activeModule === "rcsa" ? "block" : "none" }}>
            <RCSADashboard demoMode={demoMode} />
          </div>
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;