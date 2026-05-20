import { useState, useRef, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Plus, X, Pencil, FileSpreadsheet, Loader, MessageCircle, BarChart3 } from "lucide-react";
import { parseSmsBlastFile } from "../../lib/xlsx";
import { supabase } from "../../../../lib/supabase";
import type { Incident, Contact, PollOption } from "../../types";

/** Format a Date to YYYY-MM-DD for date inputs (Wall Clock) */
function formatDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Format a Date to HH:MM for time inputs (Wall Clock) */
function formatTimeInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface RegisterIncidentFormProps {
  editingIncident: Incident | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function RegisterIncidentForm({
  editingIncident,
  onSaved,
  onCancel,
}: RegisterIncidentFormProps) {
  const [formData, setFormData] = useState(() => ({
    name: editingIncident?.name ?? "",
    type: (editingIncident?.type ?? "test") as "test" | "actual",
    notificationCategory: (editingIncident?.notification_category ?? "emergency") as "emergency" | "broadcast" | "poll",
    startDate: editingIncident ? formatDateInput(new Date(editingIncident.start_time.replace("Z", "").split("+")[0])) : "",
    startTime: editingIncident ? formatTimeInput(new Date(editingIncident.start_time.replace("Z", "").split("+")[0])) : "",
    endDate: editingIncident ? formatDateInput(new Date((editingIncident.end_time || new Date().toISOString()).replace("Z", "").split("+")[0])) : "",
    endTime: editingIncident ? formatTimeInput(new Date((editingIncident.end_time || new Date().toISOString()).replace("Z", "").split("+")[0])) : "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [pollOptions, setPollOptions] = useState<PollOption[]>(() =>
    editingIncident?.poll_options && editingIncident.poll_options.length > 0
      ? editingIncident.poll_options
      : [{ code: "1", label: "" }, { code: "2", label: "" }],
  );
  
  const [saveError, setSaveError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [targetedContacts, setTargetedContacts] = useState<Partial<Contact>[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPollOption = useCallback(() => {
    setPollOptions((prev) => [
      ...prev,
      { code: String(prev.length + 1), label: "" },
    ]);
  }, []);

  const removePollOption = useCallback((index: number) => {
    setPollOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((opt, i) => ({ ...opt, code: String(i + 1) }));
    });
  }, []);

  const updatePollLabel = useCallback((index: number, label: string) => {
    setPollOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, label } : opt)),
    );
  }, []);

  const handleCategoryChange = useCallback((cat: "emergency" | "broadcast" | "poll") => {
    setFormData((prev) => ({ ...prev, notificationCategory: cat }));
    if (cat !== "poll") {
      setPollOptions([{ code: "1", label: "" }, { code: "2", label: "" }]);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setParseError(null);
    setTargetedContacts(null);

    try {
      const { contacts: hydrated, earliestDate: earliest } = await parseSmsBlastFile(selectedFile);

      setTargetedContacts(hydrated);
      
      if (earliest) {
        setFormData(prev => ({
          ...prev,
          startDate: formatDateInput(earliest!),
          startTime: formatTimeInput(earliest!)
        }));
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse file");
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canSubmit =
    !!formData.name &&
    !!formData.startDate &&
    !!formData.startTime &&
    !!formData.endDate &&
    !!formData.endTime &&
    (formData.notificationCategory !== "poll" || pollOptions.filter((o) => o.label.trim().length > 0).length >= 2);

  const handleSave = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSaveError(null);

    const startISO = `${formData.startDate}T${formData.startTime}:00Z`;
    const endISO = `${formData.endDate}T${formData.endTime}:00Z`;

    const isTargeted = !!targetedContacts && targetedContacts.length > 0;

    const payload: Record<string, unknown> = {
      name: formData.name,
      type: formData.type,
      notification_category: formData.notificationCategory,
      start_time: startISO,
      end_time: endISO,
      is_targeted: isTargeted,
    };

    if (formData.notificationCategory === "poll") {
      const valid = pollOptions.filter((o) => o.label.trim().length > 0);
      payload.poll_options = valid.length > 0 ? valid : null;
    } else {
      payload.poll_options = null;
    }

    let error;
    let incident;

    if (editingIncident) {
      const { data, error: updateError } = await supabase
        .from("incidents")
        .update(payload)
        .eq("id", editingIncident.id)
        .select()
        .single();
      error = updateError;
      incident = data;
    } else {
      const { data, error: insertError } = await supabase
        .from("incidents")
        .insert(payload)
        .select()
        .single();
      error = insertError;
      incident = data;
    }

    if (error) {
      console.error("Error saving event:", error);
      setSaveError("Failed to save event. Please try again.");
    } else if (isTargeted && incident) {
      const eventContacts = targetedContacts.map((c) => ({
        incident_id: incident.id,
        name: c.name || "Unknown",
        number: c.number || "",
        department: c.department || "Unknown",
        location: c.location || "Unknown",
        position: c.position || "Unknown",
        level: c.level || "Unknown",
      }));

      const { error: contactError } = await supabase
        .from("event_contacts")
        .insert(eventContacts);

      if (contactError) {
        console.error("Error inserting event contacts:", contactError);
        setSaveError("Event saved, but failed to add targeted contacts. Please edit the event to retry.");
      } else {
        onSaved();
      }
    } else {
      onSaved();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          {editingIncident ? (
            <>
              <Pencil className="w-5 h-5 text-slate-500" />
              Edit Event
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-slate-500" />
              Register Past Event
            </>
          )}
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
            Event Name
          </label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Call Tree Test"
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateField("type", "test")}
              className={`p-3 rounded border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                formData.type === "test"
                  ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              TEST
            </button>
            <button
              onClick={() => updateField("type", "actual")}
              className={`p-3 rounded border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                formData.type === "actual"
                  ? "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              ACTUAL
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Category</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleCategoryChange("emergency")}
              className={`p-3 rounded border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                formData.notificationCategory === "emergency"
                  ? "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              EMERGENCY
            </button>
            <button
              onClick={() => handleCategoryChange("broadcast")}
              className={`p-3 rounded border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                formData.notificationCategory === "broadcast"
                  ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              BROADCAST
            </button>
            <button
              onClick={() => handleCategoryChange("poll")}
              className={`p-3 rounded border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                formData.notificationCategory === "poll"
                  ? "bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              POLL
            </button>
          </div>
        </div>

        {formData.notificationCategory === "poll" && (
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Poll Options</label>
            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {opt.code}
                  </span>
                  <input
                    type="text"
                    placeholder={`Option ${opt.code}`}
                    value={opt.label}
                    onChange={(e) => updatePollLabel(i, e.target.value)}
                    className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => removePollOption(i)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 10 && (
              <button
                onClick={addPollOption}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">SMS Blast Report (Optional)</label>
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-100 rounded-lg p-4 text-center hover:border-accent-primary/50 cursor-pointer transition-colors"
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".xls,.xlsx" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <FileSpreadsheet className="w-6 h-6 text-gray-300 mx-auto mb-1" />
              <p className="text-[10px] font-medium text-gray-500">Upload .xls to auto-fill time & target specific recipients</p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] font-semibold text-gray-900 truncate">{file.name}</p>
                  {targetedContacts && (
                    <p className="text-[9px] text-gray-500">{targetedContacts.length} recipients matched</p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setTargetedContacts(null); }}
                className="p-1 hover:bg-gray-200 rounded text-gray-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {parsing && (
            <div className="mt-2 flex items-center gap-2 text-[10px] text-blue-600">
              <Loader className="w-3 h-3 animate-spin" />
              Parsing & Matching...
            </div>
          )}

          {parseError && (
            <div className="mt-2 text-[10px] text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {parseError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Start Date & Time
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
              />
              <input
                type="time"
                className="w-28 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={formData.startTime}
                onChange={(e) => updateField("startTime", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              End Date & Time
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={formData.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
              />
              <input
                type="time"
                className="w-28 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={formData.endTime}
                onChange={(e) => updateField("endTime", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={submitting || !canSubmit}
          className="bg-slate-900 text-white px-5 py-2 rounded hover:bg-slate-800 font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : editingIncident ? (
            <Pencil className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {editingIncident ? "Save Changes" : "Register Event"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-medium text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
    </div>
  );
}
