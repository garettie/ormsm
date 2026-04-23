import { useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, Plus, X, Pencil, FileSpreadsheet, Loader, Clock } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabase";
import type { Incident, Contact } from "../../types";

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
    startDate: editingIncident ? formatDateInput(new Date(editingIncident.start_time)) : "",
    startTime: editingIncident ? formatTimeInput(new Date(editingIncident.start_time)) : "",
    endDate: editingIncident ? formatDateInput(new Date(editingIncident.end_time ?? Date.now())) : "",
    endTime: editingIncident ? formatTimeInput(new Date(editingIncident.end_time ?? Date.now())) : "",
  }));
  const [submitting, setSubmitting] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [targetedContacts, setTargetedContacts] = useState<Partial<Contact>[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setParseError(null);
    setTargetedContacts(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

      let headerIdx = -1;
      for (let i = 0; i < Math.min(raw.length, 10); i++) {
        const row = raw[i] as string[];
        if (row && row.includes("Reciever Name")) {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx === -1) throw new Error("Could not find header row with 'Reciever Name'");
      
      const headers = raw[headerIdx] as string[];
      const rows = raw.slice(headerIdx + 1);

      const nameIdx = headers.indexOf("Reciever Name");
      const phoneIdx = headers.indexOf("Reciever Contact No");
      const dateIdx = headers.indexOf("Create Datetime");

      if (nameIdx === -1 || phoneIdx === -1 || dateIdx === -1) {
        throw new Error("Missing required columns in file");
      }

      const parsed: { name: string; number: string; date?: Date }[] = [];
      let earliest: Date | null = null;

      rows.forEach((row) => {
        const rawName = String(row[nameIdx] || "").trim();
        const rawPhone = String(row[phoneIdx] || "").trim();
        const rawDateValue = row[dateIdx];

        if (!rawName && !rawPhone) return;

        // Proper Case: CAPS LOCK -> Title Case
        const formattedName = rawName
          .toLowerCase()
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          .replace(" - ", " ");

        let number = rawPhone.replace(/\D/g, "");
        if (number.startsWith("09")) {
          number = "63" + number.slice(1);
        } else if (number.startsWith("9") && number.length === 10) {
          number = "63" + number;
        }

        if (number.length >= 10) {
          const entry: any = { name: formattedName, number };
          
          let parsedDate: Date | null = null;
          if (rawDateValue instanceof Date) {
            parsedDate = rawDateValue;
          } else if (typeof rawDateValue === "string") {
            const d = new Date(rawDateValue.replace(" ", "T"));
            if (!isNaN(d.getTime())) parsedDate = d;
          }

          if (parsedDate) {
            entry.date = parsedDate;
            if (!earliest || parsedDate < earliest) earliest = parsedDate;
          }
          parsed.push(entry);
        }
      });

      if (parsed.length === 0) throw new Error("No valid contacts found in file");

      const phoneList = Array.from(new Set(parsed.map(c => c.number)));
      const { data: masterData, error: masterError } = await supabase
        .from("MasterContacts")
        .select("number, department, location, position, level")
        .in("number", phoneList);

      if (masterError) throw masterError;

      const hydrated = parsed
        .map(c => {
          const master = masterData?.find(m => m.number === c.number);
          if (!master) return null;
          return {
            ...c,
            department: master.department,
            location: master.location,
            position: master.position,
            level: master.level
          };
        })
        .filter((c): c is Partial<Contact> => c !== null);

      if (hydrated.length === 0) throw new Error("None of the contacts match the Master Contacts list");

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
    !!formData.endTime;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const startISO = `${formData.startDate}T${formData.startTime}:00Z`;
    const endISO = `${formData.endDate}T${formData.endTime}:00Z`;

    const isTargeted = !!targetedContacts && targetedContacts.length > 0;

    const payload = {
      name: formData.name,
      type: formData.type,
      start_time: startISO,
      end_time: endISO,
      is_targeted: isTargeted,
    };

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
    } else if (isTargeted && incident) {
      // Bulk insert event contacts
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

      if (contactError) console.error("Error inserting event contacts:", contactError);
      onSaved();
    } else {
      onSaved();
    }
    setSubmitting(false);
  };

  return (
    <div className="glass-card p-6 mb-6 animate-in fade-in zoom-in duration-200">
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
      <p className="text-sm text-gray-500 mb-4">
        {editingIncident
          ? "Update the details of this past event."
          : "Retroactively register an event that happened before the incident system was in place. Responses within the time window will be scoped to this event."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateField("type", "test")}
              className={`p-2 rounded border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.type === "test"
                  ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              TEST
            </button>
            <button
              onClick={() => updateField("type", "actual")}
              className={`p-2 rounded border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.type === "actual"
                  ? "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              ACTUAL
            </button>
          </div>
        </div>

        <div className="md:col-span-2 pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
            SMS Blast Report (Optional)
          </label>
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
  );
}
