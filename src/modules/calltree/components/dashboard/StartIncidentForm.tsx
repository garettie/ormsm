import { useState, useRef } from "react";
import { Plus, CheckCircle2, AlertTriangle, Play, FileSpreadsheet, X, Loader, Clock } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabase";
import type { Contact } from "../../types";

interface StartIncidentFormProps {
  onStart: (name: string, type: "test" | "actual", targetedContacts?: Partial<Contact>[], startTime?: string) => void;
  onCancel: () => void;
}

export function StartIncidentForm({ onStart, onCancel }: StartIncidentFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"test" | "actual">("test");
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Partial<Contact>[] | null>(null);
  const [autoStartTime, setAutoStartTime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setParseError(null);
    setContacts(null);
    setAutoStartTime(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

      // Find header row dynamically (look for "Reciever Name" in first 10 rows)
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

      const parsedContacts: { name: string; number: string; date?: Date }[] = [];
      let earliestDate: Date | null = null;

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

        // Number normalization: -> 639... (Match MasterContacts format)
        let number = rawPhone.replace(/\D/g, ""); // Strip all non-digits
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
            // Handle "2026-04-14 13:02:24.000"
            const d = new Date(rawDateValue.replace(" ", "T"));
            if (!isNaN(d.getTime())) parsedDate = d;
          }

          if (parsedDate) {
            entry.date = parsedDate;
            if (!earliestDate || parsedDate < earliestDate) earliestDate = parsedDate;
          }
          parsedContacts.push(entry);
        }
      });

      if (parsedContacts.length === 0) throw new Error("No valid contacts found in file");

      // Hydrate with MasterContacts - ONLY KEEP MATCHES
      const phoneList = Array.from(new Set(parsedContacts.map(c => c.number)));
      const { data: masterData, error: masterError } = await supabase
        .from("MasterContacts")
        .select("number, department, location, position, level")
        .in("number", phoneList);

      if (masterError) throw masterError;

      const hydrated = parsedContacts
        .map(c => {
          const master = masterData?.find(m => m.number === c.number);
          if (!master) return null; // Drop if not in Master
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

      setContacts(hydrated);
      
      if (earliestDate) {
        // Preserving wall-clock time: format YYYY-MM-DDTHH:mm directly from components
        const pad = (n: number) => String(n).padStart(2, "0");
        const formatted = `${earliestDate.getFullYear()}-${pad(earliestDate.getMonth() + 1)}-${pad(earliestDate.getDate())}T${pad(earliestDate.getHours())}:${pad(earliestDate.getMinutes())}`;
        setAutoStartTime(formatted);
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse file");
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-md animate-in fade-in zoom-in duration-200 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <Plus className="w-5 h-5 text-slate-500" />
          Initialize Event
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Event Name</label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Super Typhoon Test..."
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType("test")}
              className={`p-3 rounded border text-sm font-medium transition-all flex flex-col items-center gap-2 ${type === "test" ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}
            >
              <CheckCircle2 className="w-5 h-5" /> TEST
            </button>
            <button
              onClick={() => setType("actual")}
              className={`p-3 rounded border text-sm font-medium transition-all flex flex-col items-center gap-2 ${type === "actual" ? "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}
            >
              <AlertTriangle className="w-5 h-5" /> ACTUAL
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">SMS Blast Report (Optional)</label>
          {!file ? (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-accent-primary/50 cursor-pointer transition-colors">
              <input ref={fileInputRef} type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="hidden" />
              <FileSpreadsheet className="w-8 h-8 text-gray-300 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-500">Upload .xls to target specific recipients</p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-gray-900 truncate">{file.name}</p>
                  {contacts && <p className="text-[10px] text-gray-500">{contacts.length} recipients matched</p>}
                </div>
              </div>
              <button onClick={() => { setFile(null); setContacts(null); setAutoStartTime(null); }} className="p-1 hover:bg-gray-200 rounded text-gray-500"><X className="w-3 h-3" /></button>
            </div>
          )}
          {parsing && <div className="mt-2 flex items-center gap-2 text-xs text-blue-600"><Loader className="w-3 h-3 animate-spin" /> Parsing & Matching...</div>}
          {parseError && <div className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {parseError}</div>}
          {autoStartTime && (
            <div className="mt-3">
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Start Time (From File)</label>
              <input type="datetime-local" className="w-full border border-gray-300 p-1.5 rounded text-xs focus:ring-1 focus:ring-blue-500" value={autoStartTime} onChange={(e) => setAutoStartTime(e.target.value)} />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4 pt-2 border-t border-gray-100">
          <button
            onClick={() => {
              let isoStart: string | undefined = undefined;
              if (autoStartTime) {
                const [datePart, timePart] = autoStartTime.split("T");
                isoStart = `${datePart}T${timePart}:00.000Z`;
              }
              onStart(name, type, contacts || undefined, isoStart);
            }}
            disabled={!name.trim() || parsing}
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 font-medium flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> Start
          </button>
          <button onClick={onCancel} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
}
