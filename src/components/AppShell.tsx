import type { FC, ReactNode } from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

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
      <header className="sticky top-0 sm:top-4 z-50 mb-4 sm:mb-8 mx-auto max-w-[1600px] px-0 sm:px-6 lg:px-8 transition-transform duration-300">
        <div className="glass-panel rounded-none sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-premium ring-1 ring-white/50">
          {/* Branding */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-accent-primary to-green-600 flex items-center justify-center shadow-glow ring-2 ring-white shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-none">
                ORMSM
              </h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400 font-medium mt-0.5 tracking-wide uppercase">
                Risk Management System
              </p>
            </div>
          </div>

          {/* Module Switcher */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center sm:flex-initial">
            <div className="flex bg-gray-100/80 rounded-lg sm:rounded-xl p-1 gap-0.5 w-full sm:w-auto">
              {modules.map((mod) => (
                <button
                  key={mod.key}
                  onClick={() => onModuleChange(mod.key)}
                  className={cn(
                    "relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 flex-1 sm:flex-none",
                    activeModule === mod.key
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/50",
                  )}
                >
                  <span className="block leading-tight">{mod.label}</span>
                  <span
                    className={cn(
                      "hidden sm:block text-[9px] font-medium tracking-wide uppercase mt-0.5 transition-colors",
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
                        "absolute -top-1.5 -right-1 px-1 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold uppercase tracking-wider shadow-sm transition-colors duration-300 ring-1 cursor-pointer",
                        demoMode 
                          ? "bg-amber-500 text-white ring-amber-600 shadow-amber-200/50" 
                          : "bg-white text-gray-400 ring-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {demoMode ? 'Demo' : 'Live'}
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Module content */}
      {children}
    </div>
  );
};

export default AppShell;
