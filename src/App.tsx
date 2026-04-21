import { useState } from "react";
import AppShell from "./components/AppShell";
import CallTreeDashboard from "./modules/calltree/CallTreeDashboard";
// @ts-expect-error — JSX module, TS conversion deferred to Phase 4
import RCSADashboard from "./modules/rcsa/RCSADashboard";

type Module = "calltree" | "rcsa";

const isRcsaMode = import.meta.env.VITE_APP_MODE === "rcsa";

function App() {
  const [activeModule, setActiveModule] = useState<Module>(isRcsaMode ? "rcsa" : "calltree");
  const [demoMode, setDemoMode] = useState(false);

  return (
    <AppShell 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
      demoMode={demoMode}
      onDemoModeChange={setDemoMode}
    >
      {!isRcsaMode && (
        <div style={{ display: activeModule === "calltree" ? "block" : "none" }}>
          <CallTreeDashboard />
        </div>
      )}
      <div style={{ display: activeModule === "rcsa" ? "block" : "none" }}>
        <RCSADashboard demoMode={demoMode} />
      </div>
    </AppShell>
  );
}

export default App;
