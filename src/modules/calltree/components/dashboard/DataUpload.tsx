import { useState, useRef } from "react";
import { Upload, X, FileSpreadsheet, MessageSquare, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import JSZip from "jszip";
import { supabase } from "../../../../lib/supabase";

type Tab = "responses" | "employees";
type Status = "idle" | "loading" | "success" | "error";

const HO_DEPTS = [
  "Accounting",
  "Branch Banking Group",
  "Compliance Monitoring Office",
  "Credit",
  "Digital Banking",
  "Human Resource",
  "Information Technology",
  "Internal Audit",
  "Legal",
  "Loans and Assets Management",
  "Marketing",
  "Office of the Executive",
  "Risk Management Office",
  "Security  and Safety Department",
  "Treasury",
];

interface EmployeeRecord {
  id: string;
  name: string;
  position: unknown;
  number: string;
  status: unknown;
  level: unknown;
  department: string;
  location: string;
}

export function DataUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [tab, setTab] = useState<Tab>("responses");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStatus("idle");
    setMessage("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleResponsesFile = async (file: File) => {
    setStatus("loading");
    setProgress(10);

    let raw: Record<string, unknown>[] = [];

    if (file.name.endsWith(".zip")) {
      setProgress(20);
      const zip = await JSZip.loadAsync(file);
      const csvFiles = Object.keys(zip.files).filter((f) => f.endsWith(".csv"));
      if (csvFiles.length === 0) {
        setStatus("error");
        setMessage("No CSV found in zip.");
        return;
      }
      const csvContent = await zip.files[csvFiles[0]].async("string");
      setProgress(40);
      raw = Papa.parse<Record<string, unknown>>(csvContent, { header: true, skipEmptyLines: true }).data;
      setMessage(`Loaded ${raw.length} rows from ${csvFiles[0]}`);
    } else if (file.name.endsWith(".csv")) {
      setProgress(30);
      const text = await file.text();
      setProgress(50);
      raw = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true }).data;
      setMessage(`Loaded ${raw.length} rows from CSV`);
    } else {
      setStatus("error");
      setMessage("Unsupported file type. Use .csv or .zip containing a CSV.");
      return;
    }

    if (raw.length === 0) {
      setStatus("error");
      setMessage("No data found in file.");
      return;
    }

    const requiredCols = ["From Presentation", "Client Submit Time", "Message"];
    const missing = requiredCols.filter((c) => !Object.hasOwn(raw[0], c));
    if (missing.length > 0) {
      setStatus("error");
      setMessage(`Missing columns: ${missing.join(", ")}`);
      return;
    }

    setProgress(60);

    const records = raw.map((row) => {
      const phone = String(row["From Presentation"] || "");
      const dtValue = row["Client Submit Time"];
      const datetime = dtValue != null && dtValue !== "" ? String(dtValue) : null;
      // Normalize to 63 format (no + prefix) to match MasterContacts
      const normalizedPhone = phone.startsWith("+") ? phone.slice(1) : phone;
      const contact = normalizedPhone.startsWith("63") ? normalizedPhone : "63" + normalizedPhone.slice(1);
      return {
        uid: crypto.randomUUID(),
        contact,
        datetime,
        contents: String(row["Message"] || ""),
      };
    });

    setProgress(75);
    const { error } = await supabase.from("Responses").upsert(records);

    setProgress(95);
    if (error) {
      setStatus("error");
      setMessage(`Supabase error: ${error.message}`);
    } else {
      setStatus("success");
      setMessage(`Successfully inserted ${records.length} response records.`);
      if (onSuccess) onSuccess();
    }
    setProgress(100);
  };

  const handleEmployeesFile = async (file: File) => {
    setStatus("loading");
    setProgress(10);

    let workbook: XLSX.WorkBook;
    try {
      const arrayBuffer = await file.arrayBuffer();
      workbook = XLSX.read(arrayBuffer, { type: "array" });
    } catch {
      setStatus("error");
      setMessage("Could not read Excel file. Ensure it's a valid .xls or .xlsx file.");
      return;
    }

    setProgress(20);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    if (raw.length < 5) {
      setStatus("error");
      setMessage("File has fewer than 5 rows. Cannot skip header rows.");
      return;
    }

    const headers = raw[4] as string[];
    const rows = raw.slice(5);

    const colMap: Record<string, string> = {
      "Deparment": "department",
      "Employee ID": "id",
      "Full Name": "name",
      "Position": "position",
      "Contact No": "number",
      "Status": "status",
      "Level": "level",
    };

    const mapped: Record<string, unknown>[] = rows
      .map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          const key = colMap[h];
          if (key) obj[key] = row[i];
        });
        return obj;
      })
      .filter((r) => r && r["id"] !== undefined);

    setProgress(30);

    const cleaned: EmployeeRecord[] = mapped
      .map((row) => {
        const id = String(row["id"] ?? "").replace(/\.0$/, "").trim();
        const status = String(row["status"] ?? "").toLowerCase();
        if (status === "resigned" || status === "terminated") return null;
        
        // Clean phone number: remove all non-digits first, then normalize
        let number = String(row["number"] ?? "")
          .replace(/[^0-9]/g, "")            // Strip ALL non-digits (dots, commas, dashes, etc)
          .replace(/^63/, "")             // Remove existing 63 prefix if present
          .replace(/^0/, "");             // Remove leading 0
        
        // Normalize to 63 format if it's a valid 10-digit number starting with 9
        number = number.startsWith("9") && number.length === 10
          ? "63" + number
          : number;
          
        const name = String(row["name"] ?? "").replace(" - ", " ");
        let department = String(row["department"] ?? "");
        let location = department;
        if (HO_DEPTS.includes(department)) location = "Head Office";
        else department = "Branch";
        return { id, name, position: row["position"], number, status: row["status"], level: row["level"], department, location };
      })
      .filter((r): r is EmployeeRecord => r !== null);

    const deduped = cleaned
      .reverse()
      .reduce<EmployeeRecord[]>((acc, item) => {
        if (!acc.find((a) => a.id === item.id)) acc.push(item);
        return acc;
      }, [])
      .reverse();

    setProgress(50);
    const dupesRemoved = cleaned.length - deduped.length;
    setMessage(`Processing: ${cleaned.length} active employees${dupesRemoved > 0 ? ` (removed ${dupesRemoved} dupes)` : ""}`);

    const { error: upsertError } = await supabase.from("MasterContacts").upsert(deduped, { onConflict: "id" });

    if (upsertError) {
      setStatus("error");
      setMessage(`Upsert error: ${upsertError.message}`);
      return;
    }

    setProgress(70);
    const dbIds: string[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data } = await supabase
        .from("MasterContacts")
        .select("id")
        .range(page * pageSize, (page + 1) * pageSize - 1);
      const batch = (data ?? []).map((r: { id: string }) => r.id);
      dbIds.push(...batch);
      if (batch.length < pageSize) break;
      page++;
    }

    const activeIds = deduped.map((r) => r.id);
    const toDelete = dbIds.filter((id: string) => !activeIds.includes(id));

    if (toDelete.length > 0) {
      await supabase.from("MasterContacts").delete().in("id", toDelete);
    }

    setProgress(100);
    setStatus("success");
    setMessage(`Synced ${deduped.length} employees.${toDelete.length > 0 ? ` Removed ${toDelete.length} stale record(s).` : ""}`);
    if (onSuccess) onSuccess();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("loading");
    setProgress(5);
    setMessage("Processing...");
    try {
      if (tab === "responses") await handleResponsesFile(file);
      else await handleEmployeesFile(file);
    } catch (err) {
      setStatus("error");
      setMessage(String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-accent-primary" />
            Upload Data
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setTab("responses"); reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${tab === "responses" ? "text-accent-primary border-b-2 border-accent-primary" : "text-gray-400 hover:text-gray-600"}`}
          >
            <MessageSquare className="w-4 h-4" />
            Response Data
          </button>
          <button
            onClick={() => { setTab("employees"); reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${tab === "employees" ? "text-accent-primary border-b-2 border-accent-primary" : "text-gray-400 hover:text-gray-600"}`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Employee List
          </button>
        </div>

        <div className="p-6">
          {tab === "responses" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Upload response data from .csv or .zip (containing CSV). Maps to <span className="font-mono text-xs bg-gray-100 px-1 rounded">Responses</span> table.</p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-accent-primary/50 transition-colors">
                <input ref={fileInputRef} type="file" accept=".csv,.zip" onChange={handleFileChange} className="hidden" id="responses-upload" />
                <label htmlFor="responses-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-300" />
                  <span className="text-sm font-medium text-gray-600">Click to select .csv or .zip</span>
                  <span className="text-xs text-gray-400">Requires columns: From Presentation, Client Submit Time, Message</span>
                </label>
              </div>
            </div>
          )}

          {tab === "employees" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Upload Employee List from .xls or .xlsx. Skips first 4 rows. Upserts to <span className="font-mono text-xs bg-gray-100 px-1 rounded">MasterContacts</span> table.</p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-accent-primary/50 transition-colors">
                <input ref={fileInputRef} type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="hidden" id="employees-upload" />
                <label htmlFor="employees-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileSpreadsheet className="w-8 h-8 text-gray-300" />
                  <span className="text-sm font-medium text-gray-600">Click to select .xls or .xlsx</span>
                  <span className="text-xs text-gray-400">Required columns: Department, Employee ID, Full Name, Position, Contact No, Status, Level</span>
                </label>
              </div>
            </div>
          )}

          {(status === "loading" || status === "success" || status === "error") && (
            <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 ${status === "loading" ? "bg-blue-50" : status === "success" ? "bg-green-50" : "bg-red-50"}`}>
              {status === "loading" && <Loader className="w-5 h-5 text-blue-500 shrink-0 animate-spin" />}
              {status === "success" && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
              {status === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
              <div className="flex-1">
                <p className={`text-sm font-medium ${status === "loading" ? "text-blue-700" : status === "success" ? "text-green-700" : "text-red-700"}`}>{message}</p>
                {status === "loading" && progress > 0 && (
                  <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataUploadModal;
