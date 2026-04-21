import type { FC, ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

type Module = "calltree" | "rcsa";

interface AppShellProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
  demoMode: boolean;
  onDemoModeChange: (val: boolean) => void;
  children: ReactNode;
}

const isRcsaMode = import.meta.env.VITE_APP_MODE === "rcsa";

const allModules: { key: Module; label: string; subtitle: string }[] = [
  { key: "calltree", label: "Call Tree", subtitle: "Emergency Response" },
  { key: "rcsa", label: "RCSA", subtitle: "Risk & Control Self-Assessment" },
];

const modules = isRcsaMode ? allModules.filter(m => m.key === "rcsa") : allModules;

const AppShell: FC<AppShellProps> = ({
  activeModule,
  onModuleChange,
  demoMode,
  onDemoModeChange,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Global header */}
      <header className="sticky top-4 z-50 mb-8 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="glass-panel rounded-2xl px-6 py-4 flex justify-between items-center shadow-premium ring-1 ring-white/50">
          {/* Branding */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-green-600 flex items-center justify-center shadow-glow ring-2 ring-white">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                ORMSM
              </h1>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wide uppercase">
                Operational Risk Management System Module
              </p>
            </div>
          </div>

          {/* Module Switcher */}
          <div className="flex items-center">
            <div className="flex bg-gray-100/80 rounded-xl p-1 gap-0.5">
              {modules.map((mod) => (
                <button
                  key={mod.key}
                  onClick={() => onModuleChange(mod.key)}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                    activeModule === mod.key
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/50",
                  )}
                >
                  <span className="block leading-tight">{mod.label}</span>
                  <span
                    className={cn(
                      "block text-[9px] font-medium tracking-wide uppercase mt-0.5 transition-colors",
                      activeModule === mod.key
                        ? "text-accent-primary"
                        : "text-gray-400",
                    )}
                  >
                    {mod.subtitle}
                  </span>
                  
                  {mod.key === 'rcsa' && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDemoModeChange(!demoMode);
                      }}
                      className={cn(
                        "absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 ring-1 cursor-pointer",
                        demoMode 
                          ? "bg-amber-500 text-white ring-amber-600 shadow-amber-200/50 scale-110" 
                          : "bg-white text-gray-400 ring-gray-200 hover:bg-gray-50"
                      )}
                      title={`Toggle ${demoMode ? 'Live' : 'Demo'} Mode`}
                    >
                      {demoMode ? 'Demo' : 'Live'}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Module content */}
      {children}
    </div>
  );
};

export default AppShell;
