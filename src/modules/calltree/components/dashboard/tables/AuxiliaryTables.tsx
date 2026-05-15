import { useState, useMemo, useDeferredValue, type FC } from "react";
import { Download, AlertTriangle, Search, Clock, X, Save, Link } from "lucide-react";
import type { ProcessedContact, Response, PollOption } from "../../../types";
import { downloadCSV } from "../../../lib/csv";
import {
  formatDateTime,
  formatPhoneNumber,
  localNowAsUTC,
} from "../../../../../lib/utils";
import { supabase } from "../../../../../lib/supabase";
import { COLORS } from "../../../lib/constants";

// --- Shared class-name tokens ---

const THEAD_ROW = "bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200/75 text-[11px] text-gray-500 uppercase tracking-wider";
const BANNER = "px-5 py-2.5 text-xs font-medium flex items-center gap-2 border-b";

// --- TableCard (shared wrapper) ---

interface TableCardProps {
  title: string;
  badgeCount?: number;
  action: React.ReactNode;
  children: React.ReactNode;
}

const TableCard: FC<TableCardProps> = ({ title, badgeCount, action, children }) => (
  <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm flex flex-col overflow-hidden h-full max-h-[600px]">
    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">{title}</h3>
        {badgeCount !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
            {badgeCount}
          </span>
        )}
      </div>
      {action}
    </div>
    <div className="overflow-x-auto overflow-y-auto flex-1">{children}</div>
  </div>
);

// --- DownloadButton (shared between both tables) ---

const DownloadButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm shrink-0"
  >
    <Download className="w-3.5 h-3.5" />
    Export
  </button>
);

// --- LinkContactModal ---

interface LinkContactModalProps {
  response: Response;
  contacts: ProcessedContact[];
  onClose: () => void;
  onSuccess: () => void;
}

const LinkContactModal: FC<LinkContactModalProps> = ({ response, contacts, onClose, onSuccess }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProcessedContact | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(q) || c.department.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const contactId = selected.cleanNumber;
      if (!contactId) throw new Error(`Contact has no primary number. Name: ${selected.name}`);
      const { error } = await supabase.from("ContactAltNumbers").insert({
        contact_id: String(contactId),
        contact_name: selected.name,
        number: response.contact,
        source_response_id: response.uid ?? null,
      });
      if (error) throw new Error(error.message + (error.details ? ` (${error.details})` : ""));
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const details = (err as Record<string, string>)?.details;
      setErrorMsg(msg + (details ? ` (${details})` : ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Link to Contact</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg">
            {formatPhoneNumber(response.contact)} — {response.contents}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {filtered.length === 0 && (
              <div className="p-4 text-xs text-center text-gray-400">No contacts found.</div>
            )}
            {filtered.map((c) => (
              <button
                key={c.id ?? c.number}
                onClick={() => setSelected(c)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${selected?.id === c.id ? "bg-accent-primary/10 text-accent-primary" : "hover:bg-gray-50"
                  }`}
              >
                <div className="font-medium text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-400">{c.department} · {formatPhoneNumber(c.number)}</div>
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : (
              <>
                <Save className="w-4 h-4" /> Link & Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- UnknownTable ---

export const UnknownTable: FC<{ data: Response[]; contacts: ProcessedContact[]; onLinked: () => void }> = ({ data, contacts, onLinked }) => {
  const [linking, setLinking] = useState<Response | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm flex flex-col overflow-hidden h-full max-h-[600px]">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Unknown Responses</h3>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">0</span>
          </div>
        </div>
        <div className="flex-1 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium text-sm">No responses yet</p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    const csv = data.map((r) => ({
      Phone: r.contact,
      Message: r.contents,
      Time: r.datetime,
    }));
    downloadCSV(csv, "unknown_responses.csv");
  };

  return (
    <>
      <TableCard
        title="Unknown Responses"
        badgeCount={data.length}
        action={<DownloadButton onClick={handleDownload} />}
      >
        <div
          className={`${BANNER} bg-amber-50/80 text-amber-800 border-amber-200/50`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Check these responses manually and link them to employees.
        </div>
        <table className="w-full text-left whitespace-nowrap">
          <thead className={THEAD_ROW}>
            <tr>
              <th className="px-4 py-2.5 font-semibold text-left first:pl-5">Contact</th>
              <th className="px-4 py-2.5 font-semibold text-left w-full">Message</th>
              <th className="px-4 py-2.5 font-semibold text-right">Time</th>
              <th className="px-4 py-2.5 font-semibold text-right last:pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/75">
            {data.map((row, i) => (
              <tr
                key={`${row.contact}-${row.datetime}-${i}`}
                className="hover:bg-gray-50/50 group/row transition-colors"
              >
                <td className="px-4 py-2.5 align-middle first:pl-5">
                  <div className="font-mono text-[13px] font-medium text-gray-600 tracking-tight">
                    {formatPhoneNumber(row.contact)}
                  </div>
                </td>
                <td className="px-4 py-2.5 align-middle max-w-[200px] sm:max-w-[400px]">
                  <div className="text-[13px] text-gray-700 truncate" title={row.contents}>
                    {row.contents}
                  </div>
                </td>
                <td className="px-4 py-2.5 align-middle text-right">
                  <div className="font-mono text-[13px] text-gray-500 tracking-tight flex justify-end">
                    {formatDateTime(row.datetime)}
                  </div>
                </td>
                <td className="px-4 py-2.5 align-middle text-right last:pr-5">
                  <button
                    onClick={() => setLinking(row)}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white font-semibold opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-end gap-1.5 ml-auto"
                  >
                    <Link className="w-3.5 h-3.5" /> Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      {linking && (
        <LinkContactModal
          response={linking}
          contacts={contacts}
          onClose={() => setLinking(null)}
          onSuccess={() => {
            setLinking(null);
            onLinked();
          }}
        />
      )}
    </>
  );
};

// --- ManualResponseModal ---

interface ManualResponseModalProps {
  contact: ProcessedContact;
  onClose: () => void;
  onSuccess: () => void;
  notificationCategory?: "emergency" | "broadcast" | "poll";
  pollOptions?: PollOption[];
}

const ManualResponseModal: FC<ManualResponseModalProps> = ({
  contact,
  onClose,
  onSuccess,
  notificationCategory,
  pollOptions,
}) => {
  const [status, setStatus] = useState(
    notificationCategory === "poll" && pollOptions && pollOptions.length > 0
      ? pollOptions[0].label
      : "Safe",
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map status words to numeric codes for DB insertion
  const STATUS_CODES: Record<string, string> = {
    Safe: "1",
    Slight: "2",
    Moderate: "3",
    Severe: "4",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let contents: string;
      if (notificationCategory === "poll" && pollOptions) {
        const matched = pollOptions.find((o) => o.label === status);
        contents = matched
          ? `${matched.code} - ${message || "Manual Entry"}`
          : `${status} - ${message || "Manual Entry"}`;
      } else if (notificationCategory === "broadcast") {
        contents = `Responded - ${message || "Manual Entry"}`;
      } else {
        contents = `${STATUS_CODES[status] || "1"} - ${message || "Manual Entry"}`;
      }

      // Basic validation
      if (!contact.number) throw new Error("Contact number is missing.");

      // 2. Format Phone Number to 63 prefix (no +)
      let formattedContact = contact.number.replace(/[^0-9]/g, "");
      if (formattedContact.startsWith("09")) {
        formattedContact = "63" + formattedContact.slice(1);
      } else if (
        formattedContact.startsWith("9") &&
        formattedContact.length === 10
      ) {
        formattedContact = "63" + formattedContact;
      }

      // [CHANGE] Generate a unique ID for manual entries to avoid collision with SMS UIDs (which are integers)
      // Format: "m-<timestamp>-<random>"
      const manuallyGeneratedUid = `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const { error } = await supabase.from("Responses").insert({
        uid: manuallyGeneratedUid,
        contact: formattedContact,
        contents: contents,
        datetime: localNowAsUTC(),
      });

      if (error) throw error;
      onSuccess();
    } catch (err: unknown) {
      console.error("Failed to add response:", err);
      // Detailed error for debugging RLS/Schema issues
      const message = err instanceof Error ? err.message : "Unknown error";
      const details = (err as Record<string, string>)?.details;
      const hint = (err as Record<string, string>)?.hint;
      const detailedError =
        message +
        (details ? ` (${details})` : "") +
        (hint ? ` [Hint: ${hint}]` : "");
      setErrorMsg(detailedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Add Response</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Contact
            </label>
            <div className="font-medium text-gray-900">{contact.name}</div>
            <div className="text-xs text-gray-500 font-mono">
              {formatPhoneNumber(contact.number)}
            </div>
          </div>

          {notificationCategory === "poll" && pollOptions ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Poll Option
              </label>
              <div className="grid grid-cols-2 gap-2">
                {pollOptions.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setStatus(opt.label)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      status === opt.label
                        ? "ring-2 ring-offset-1 bg-purple-500 text-white border-transparent"
                        : "hover:bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    {opt.code}. {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : notificationCategory !== "broadcast" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Safe", "Slight", "Moderate", "Severe"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${status === s
                        ? "ring-2 ring-offset-1"
                        : "hover:bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                    style={{
                      backgroundColor:
                        status === s
                          ? COLORS[s as keyof typeof COLORS]
                          : undefined,
                      color: status === s ? "#fff" : undefined,
                      borderColor: status === s ? "transparent" : undefined,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Message / Source (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={notificationCategory === "broadcast" ? "e.g. Acknowledged via Viber" : "e.g. Replied via Viber"}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all resize-none h-20"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 wrap-break-words">
              Error: {errorMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Response
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- PendingTable ---

const PENDING_SEARCH_FIELDS: (keyof ProcessedContact)[] = [
  "name",
  "department",
  "position",
  "number",
];

export const PendingTable: FC<{
  data: ProcessedContact[];
  onResponseAdded?: () => void;
  notificationCategory?: "emergency" | "broadcast" | "poll";
  pollOptions?: PollOption[];
}> = ({ data, onResponseAdded, notificationCategory, pollOptions }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedContact, setSelectedContact] =
    useState<ProcessedContact | null>(null);

  const filteredData = useMemo(() => {
    if (!deferredSearch) return data;
    const q = deferredSearch.toLowerCase();
    return data.filter((c) =>
      PENDING_SEARCH_FIELDS.some((f) =>
        (c[f]?.toString().toLowerCase() ?? "").includes(q),
      ),
    );
  }, [data, deferredSearch]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm flex flex-col overflow-hidden h-full max-h-[600px]">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/30">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Pending Responses
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">0</span>
        </div>
        <div className="flex-1 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium text-sm">No responses yet</p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    const csv = filteredData.map((c) => ({
      Name: c.name,
      Dept: c.department,
      Position: c.position,
      Phone: c.number,
    }));
    downloadCSV(csv, "pending_responses.csv");
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm flex flex-col overflow-hidden h-full max-h-[600px]">
        {/* Header + Search */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Pending Responses
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
              {filteredData.length}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search pending..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>
            <DownloadButton onClick={handleDownload} />
          </div>
        </div>

        {/* Accent Banner */}
        <div className={`${BANNER} bg-blue-50/80 text-blue-800 border-blue-200/50`}>
          <Clock className="w-4 h-4 text-blue-500" />
          Awaiting response from these contacts.
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className={THEAD_ROW}>
              <tr>
                <th className="px-4 py-2.5 font-semibold text-left first:pl-5">Employee</th>
                <th className="px-4 py-2.5 font-semibold text-left">Position</th>
                <th className="px-4 py-2.5 font-semibold text-left">Department</th>
                <th className="px-4 py-2.5 font-semibold text-right last:pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/75">
              {filteredData.map((row) => (
                <tr
                  key={row.id || row.number}
                  className="hover:bg-gray-50/50 group/row transition-colors"
                >
                  <td className="px-4 py-2.5 align-middle first:pl-5">
                    <div className="font-semibold text-gray-900 text-[13px] truncate">{row.name}</div>
                    <div className="font-mono text-[11px] font-medium text-gray-500 mt-0.5 tracking-tight">
                      {formatPhoneNumber(row.number)}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 align-middle">
                    <span className="text-[13px] text-gray-700 break-words">{row.position || "-"}</span>
                  </td>
                  <td className="px-4 py-2.5 align-middle">
                    <span className="text-[13px] font-medium text-gray-800">{row.department}</span>
                  </td>
                  <td className="px-4 py-2.5 align-middle text-right last:pr-5">
                    <button
                      onClick={() => setSelectedContact(row)}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white font-semibold opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center gap-1.5 ml-auto whitespace-nowrap"
                    >
                      + Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium text-sm">No pending contacts found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </div>

      {selectedContact && (
        <ManualResponseModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onSuccess={() => {
            setSelectedContact(null);
            onResponseAdded?.();
          }}
          notificationCategory={notificationCategory}
          pollOptions={pollOptions}
        />
      )}
    </>
  );
};
