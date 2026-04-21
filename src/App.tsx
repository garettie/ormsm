import { useState, lazy, Suspense } from "react";
import AppShell from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";

const CallTreeDashboard = lazy(() =>
  import("./modules/calltree/CallTreeDashboard").then((m) => ({
    default: m.default,
  })),
);

const RCSADashboard = lazy(() =>
  import("./modules/rcsa/RCSADashboard").then((m) => ({
    default: m.default,
  })),
);

type Module = "calltree" | "rcsa";

const isRcsaMode = import.meta.env.VITE_APP_MODE === "rcsa";

function App() {
  const [activeModule, setActiveModule] = useState<Module>(isRcsaMode ? "rcsa" : "calltree");
  const [demoMode, setDemoMode] = useState(false);

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