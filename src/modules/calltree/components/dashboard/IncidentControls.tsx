import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  Square,
  History,
} from "lucide-react";
import type { Incident, Contact, PollOption } from "../../types";
import { StartIncidentForm } from "./StartIncidentForm";
import { cn } from "../../../../lib/utils";

interface IncidentControlsProps {
  activeIncident: Incident | null;
  onStart: (name: string, type: "test" | "actual", targetedContacts?: Partial<Contact>[], startTime?: string, notificationCategory?: "emergency" | "broadcast" | "poll", pollOptions?: PollOption[]) => void;
  onEnd: () => void;
  rightSlot?: React.ReactNode;
}

function HoldButton({ onComplete }: { onComplete: () => void }) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const HOLD_DURATION = 1000;

  const reset = useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const startHold = useCallback(() => {
    setIsHolding(true);
    startTimeRef.current = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress < 100) {
        timerRef.current = setTimeout(updateProgress, 16);
      } else {
        onComplete();
        reset();
      }
    };
    
    timerRef.current = setTimeout(updateProgress, 16);
  }, [onComplete, reset]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={reset}
      onMouseLeave={reset}
      onTouchStart={startHold}
      onTouchEnd={reset}
      className={cn(
        "relative overflow-hidden flex items-center justify-center gap-2 bg-white border border-gray-300 px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold transition-all shrink-0 select-none",
        isHolding ? "scale-95 border-red-200" : "hover:bg-gray-50 active:scale-95"
      )}
    >
      {/* Progress Background */}
      <div 
        className="absolute inset-0 bg-red-500/10 origin-left transition-opacity duration-200"
        style={{ width: `${progress}%`, opacity: isHolding ? 1 : 0 }}
      />
      
      <div className={cn(
        "flex items-center gap-2 transition-colors duration-200",
        isHolding ? "text-red-700" : "text-red-600"
      )}>
        <Square className={cn("w-4 h-4 fill-current transition-transform duration-200", isHolding && "scale-110")} />
        <span>{isHolding ? "Hold to End..." : "End Event"}</span>
      </div>
    </button>
  );
}

export default function IncidentControls({
  activeIncident,
  onStart,
  onEnd,
  rightSlot,
}: IncidentControlsProps) {
  const [showModal, setShowModal] = useState(false);

  if (activeIncident) {
    const isTest = activeIncident.type === "test";

    return (
      <div
        className={`mb-6 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border ${
          isTest 
            ? "bg-blue-50/50 border-blue-200 text-blue-900" 
            : "bg-red-50/50 border-red-200 text-red-900"
        } backdrop-blur-sm`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isTest ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
            }`}
          >
            {isTest ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {isTest ? "ACTIVE CALL TREE" : "ACTUAL INCIDENT IN PROGRESS"}
            </h2>
            <p className="text-sm font-medium opacity-70 flex items-center gap-2 mt-0.5">
              <History className="w-4 h-4" />
              Started: {new Date(activeIncident.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — "{activeIncident.name}"
            </p>
          </div>
        </div>

        <HoldButton onComplete={onEnd} />
      </div>
    );
  }

  return (
    <div className="mb-6">
      {!showModal ? (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium shadow hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start New Event</span>
          </button>
          {rightSlot && (
            <div className="flex items-center gap-3">
              {rightSlot}
            </div>
          )}
        </div>
      ) : (
        <div>
          <StartIncidentForm
            onStart={(name, type, targetedContacts, startTime, notificationCategory) => {
              onStart(name, type, targetedContacts, startTime, notificationCategory);
              setShowModal(false);
            }}
            onCancel={() => setShowModal(false)}
          />
        </div>
      )}
    </div>
  );
}
