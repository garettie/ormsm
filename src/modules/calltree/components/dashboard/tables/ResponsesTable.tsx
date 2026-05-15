import { useState, useMemo, useCallback, useDeferredValue, memo, type FC } from "react";
import {
  Download,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  User,
  Keyboard,
  HelpCircle,
  PhoneForwarded,
} from "lucide-react";
import type { ProcessedContact } from "../../../types";
import { Badge, STATUS_COLORS } from "../../../../../components/Badge";
import { downloadCSV } from "../../../lib/csv";
import { formatDateTime, formatPhoneNumber } from "../../../../../lib/utils";

// --- Types ---

type SortDirection = "asc" | "desc";
type SortKey = keyof ProcessedContact;
type SortConfig = { key: SortKey | null; direction: SortDirection };

interface ResponsesTableProps {
  data: ProcessedContact[];
  statusColors?: Record<string, { bg: string; text: string; border: string }>;
}

// Column definitions rendered by SortableHeader
const COLUMNS: { label: string; sortKey: SortKey; align?: "left" | "right" }[] = [
  { label: "Name", sortKey: "name", align: "left" },
  { label: "Status", sortKey: "status", align: "left" },
  { label: "Message", sortKey: "rawResponse", align: "left" },
  { label: "Position", sortKey: "position", align: "left" },
  { label: "Department", sortKey: "department", align: "left" },
  { label: "Location", sortKey: "location", align: "left" },
  { label: "Level", sortKey: "level", align: "left" },
  { label: "Phone", sortKey: "cleanNumber", align: "right" },
  { label: "Time", sortKey: "responseTime", align: "right" },
];

// Searchable field keys
const SEARCH_FIELDS: (keyof ProcessedContact)[] = [
  "name",
  "status",
  "rawResponse",
  "department",
  "position",
  "cleanNumber",
];

// --- SortableHeader ---

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentSort: SortConfig;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}

const SortableHeader: FC<SortableHeaderProps> = memo(({
  label,
  sortKey,
  currentSort,
  onSort,
  align = "left",
}) => {
  const isActive = currentSort.key === sortKey;
  const icon = !isActive ? (
    <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 transition-colors group-hover:text-gray-400" />
  ) : currentSort.direction === "asc" ? (
    <ArrowUp className="w-3.5 h-3.5 text-gray-700" />
  ) : (
    <ArrowDown className="w-3.5 h-3.5 text-gray-700" />
  );

  return (
    <th
      className={`px-2.5 py-2.5 font-semibold cursor-pointer group hover:bg-gray-100/50 transition-colors select-none first:pl-4 last:pr-4 ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : "justify-start"}`}>
        <span className={isActive ? "text-gray-800" : "text-gray-500"}>{label}</span>
        {icon}
      </div>
    </th>
  );
});

// --- StatusBadge ---

const StatusBadge: FC<{ status: string; statusColors?: Record<string, { bg: string; text: string; border: string }> }> = memo(({ status, statusColors }) => {
  if (statusColors?.[status]) {
    return <Badge label={status} variant="compact" colors={statusColors[status]} />;
  }
  const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (colors) return <Badge label={status} variant="compact" colors={colors} />;
  return <Badge label={status} variant="compact" />;
});

// --- MatchTypeIndicator ---
const MatchTypeIndicator: FC<{ type?: "phone" | "name" | "manual" | "alt-phone" }> = memo(({
  type,
}) => {
  if (!type) return null;

  let Icon = HelpCircle;
  let title = "Unknown Match";
  let colorClass = "text-gray-400";

  switch (type) {
    case "phone":
      Icon = Phone;
      title = "Matched by Phone Number";
      colorClass = "text-blue-500";
      break;
    case "name":
      Icon = User;
      title = "Matched by Name";
      colorClass = "text-purple-500";
      break;
    case "manual":
      Icon = Keyboard;
      title = "Manually Entered";
      colorClass = "text-amber-500";
      break;
    case "alt-phone":
      Icon = PhoneForwarded;
      title = "Matched by Alternate Number";
      colorClass = "text-teal-500";
      break;
  }

  return (
    <div className="group/tooltip relative ml-2 inline-flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors cursor-help">
      <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block px-2.5 py-1.5 bg-gray-900 text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap z-50">
        {title}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900" />
      </div>
    </div>
  );
});

// --- Main Component ---

export const ResponsesTable: FC<ResponsesTableProps> = ({ data, statusColors }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const filteredData = useMemo(() => {
    if (!deferredSearch) return data;
    const q = deferredSearch.toLowerCase();
    return data.filter((c) =>
      SEARCH_FIELDS.some((f) =>
        (c[f]?.toString().toLowerCase() ?? "").includes(q),
      ),
    );
  }, [data, deferredSearch]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      if (key === "responseTime") {
        return (
          dir *
          (new Date(a.responseTime || 0).getTime() -
            new Date(b.responseTime || 0).getTime())
        );
      }
      const va = (a[key] ?? "").toString().toLowerCase();
      const vb = (b[key] ?? "").toString().toLowerCase();
      return va < vb ? -dir : va > vb ? dir : 0;
    });
  }, [filteredData, sortConfig]);

  const requestSort = useCallback((key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleDownload = () => {
    const csvData = sortedData.map((c) => ({
      name: c.name,
      status: c.status,
      position: c.position,
      department: c.department,
      location: c.location,
      datetime: c.responseTime,
      number: c.cleanNumber,
      matchType: c.matchType,
    }));
    downloadCSV(csvData, "responses.csv");
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/30">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Responses</h3>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">0</span>
        </div>
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium text-sm">No responses yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Responses
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
            {sortedData.length}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200/75">
            <tr className="text-[11px] text-gray-500 uppercase tracking-wider">
              {COLUMNS.map((col) => (
                <SortableHeader
                  key={col.sortKey}
                  label={col.label}
                  sortKey={col.sortKey}
                  currentSort={sortConfig}
                  onSort={requestSort}
                  align={col.align}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/75">
            {sortedData.map((row) => (
              <tr
                key={row.id || row.number}
                className="hover:bg-gray-50/50 transition-colors group/row"
              >
                <td className="px-2.5 py-2.5 align-middle first:pl-4">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 text-[13px]">{row.name}</span>
                    {row.status !== "No Response" && (
                      <MatchTypeIndicator type={row.matchType} />
                    )}
                  </div>
                </td>
                <td className="px-2.5 py-2.5 align-middle">
                  <StatusBadge status={row.status} statusColors={statusColors} />
                </td>
                <td className="px-2.5 py-2.5 align-middle max-w-[200px]">
                  <span className="text-[13px] text-gray-600 truncate block" title={row.rawResponse || ""}>
                    {row.rawResponse || "-"}
                  </span>
                </td>
                <td className="px-2.5 py-2.5 align-middle">
                  <span className="text-[13px] text-gray-700">{row.position || "-"}</span>
                </td>
                <td className="px-2.5 py-2.5 align-middle">
                  <span className="text-[13px] font-medium text-gray-800">{row.department}</span>
                </td>
                <td className="px-2.5 py-2.5 align-middle">
                  <span className="text-[13px] text-gray-700">{row.location}</span>
                </td>
                <td className="px-2.5 py-2.5 align-middle">
                  <span className="text-[13px] text-gray-700 capitalize">{row.level || "-"}</span>
                </td>
                <td className="px-2.5 py-2.5 align-middle text-right">
                  <div className="font-mono text-[13px] font-medium text-gray-600 tracking-tight flex justify-end">
                    {formatPhoneNumber(row.cleanNumber)}
                  </div>
                </td>
                <td className="px-2.5 py-2.5 align-middle text-right last:pr-4">
                  <div className="font-mono text-[13px] text-gray-500 tracking-tight flex justify-end">
                    {formatDateTime(row.responseTime) || "-"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium text-sm">No records found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};
