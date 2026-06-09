import { useState, useMemo, Fragment } from 'react'
import type { RiskRecord } from '../types'
import { ArrowUpDown, ChevronDown, ChevronUp, Filter, X, Maximize2, Search, Download, Calendar, Clock, AlertCircle } from 'lucide-react'
import { shortDept, getRiskLevel, getRiskLevelSmall, getControlsLabel, getControlsLabelSmall, getImplementationLabel, RISK_LEVELS, RISK_BG, RISK_TEXT, CONTROLS_LABEL_COLORS, IMPLEMENTATION_COLORS, CONTROL_BG } from '../utils/riskLevels'

const CONTROLS_LABELS = ['Strong', 'Satisfactory', 'Needs Improvement', 'Unsatisfactory']

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

interface FilterSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}

function FilterSelect({ value, onChange, options, placeholder }: FilterSelectProps) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-[11px] border border-gray-200 rounded-md pl-2 pr-6 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary bg-white text-gray-700 appearance-none transition-all cursor-pointer hover:border-gray-300"
      >
        <option value="">{placeholder || 'All'}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none transition-transform group-hover:text-gray-600" />
    </div>
  )
}

interface FilterInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function FilterInput({ value, onChange, placeholder }: FilterInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Search...'}
      className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary text-gray-700 transition-all placeholder:text-gray-300 hover:border-gray-300"
    />
  )
}

interface MiniBadgeProps {
  label: string | number;
  color: string;
  bgColor?: string;
  className?: string;
}

interface ScoreBadgeProps {
  label: string | number;
  subLabel?: string | number;
  color: string;
  bgColor?: string;
  width?: string;
  tooltip?: string;
}

function ScoreBadge({ label, subLabel, color, bgColor, width = "", tooltip }: ScoreBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold font-mono ${width} justify-center relative group/tip`}
      style={{
        backgroundColor: bgColor || `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }}
    >
      <span className="opacity-80">{label}</span>
      {subLabel && (
        <>
          <span className="w-px h-2 bg-current opacity-25" />
          <span className="truncate">{subLabel}</span>
        </>
      )}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] font-medium rounded opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

function MiniBadge({ label, color, bgColor, className = "" }: MiniBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${className}`}
      style={{
        backgroundColor: bgColor || `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }}
    >
      {label}
    </span>
  )
}

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) return <span className="text-gray-300">—</span>

  const date = new Date(deadline)
  const now = new Date()
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffTime = d1.getTime() - d2.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  let color = '#80868b'
  let Icon = Calendar
  let relative = ''

  if (diffDays < 0) {
    color = '#d93025'
    Icon = AlertCircle
    relative = `${Math.abs(diffDays)}d overdue`
  } else if (diffDays === 0) {
    color = '#f9ab00'
    Icon = Clock
    relative = 'due today'
  } else if (diffDays <= 30) {
    color = '#f9ab00'
    Icon = Clock
    relative = `due in ${diffDays}d`
  } else {
    relative = `due in ${Math.floor(diffDays / 30)}mo`
  }

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[85px]">
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all duration-200 hover:shadow-sm"
        style={{
          color,
          backgroundColor: `${color}08`,
          borderColor: `${color}25`
        }}
      >
        <Icon className="w-3 h-3 opacity-80" />
        <span className="text-[10px] font-bold font-mono leading-none tracking-tight">{deadline}</span>
      </div>
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider opacity-70">
        {relative}
      </span>
    </div>
  )
}

interface RiskRegisterProps {
  risks: RiskRecord[];
  title?: string;
  onOpenModal?: () => void;
  onClose?: () => void;
}

export default function RiskRegister({ risks, title = "Risk Register", onOpenModal, onClose }: RiskRegisterProps) {
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [colFilters, setColFilters] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'department', direction: 'asc' })

  const setFilter = (key: string, val: string) => {
    setColFilters(prev => ({ ...prev, [key]: val }))
  }

  const clearAllFilters = () => {
    setColFilters({})
    setSearchTerm('')
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const hasActiveFilters = Object.values(colFilters).some(v => v) || searchTerm

  const filteredRisks = useMemo(() => {
    let result = risks.filter((r: RiskRecord) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const searchable = [r.department, r.process_name, r.risk_description, r.possible_causes, r.root_cause, r.event_type].filter(Boolean).join(' ').toLowerCase()
        if (!searchable.includes(q)) return false
      }
      if (colFilters.department && r.department !== colFilters.department) return false
      if (colFilters.process && r.process_name !== colFilters.process) return false
      if (colFilters.description && !r.risk_description?.toLowerCase().includes(colFilters.description.toLowerCase())) return false
      if (colFilters.causes && !r.possible_causes?.toLowerCase().includes(colFilters.causes.toLowerCase())) return false
      if (colFilters.rootCause && r.root_cause !== colFilters.rootCause) return false
      if (colFilters.eventType && r.event_type !== colFilters.eventType) return false
      if (colFilters.likelihood && r.likelihood_score?.toString() !== colFilters.likelihood) return false
      if (colFilters.impact && r.impact_score?.toString() !== colFilters.impact) return false
      if (colFilters.inherent && getRiskLevel(r.inherent_risk_score) !== colFilters.inherent) return false
      if (colFilters.control_design && r.control_design_score?.toString() !== colFilters.control_design) return false
      if (colFilters.control_implementation && r.control_implementation_score?.toString() !== colFilters.control_implementation) return false
      if (colFilters.controls && getControlsLabel(r.controls_rating) !== colFilters.controls) return false
      if (colFilters.residual && getRiskLevel(r.residual_risk_score) !== colFilters.residual) return false
      if (colFilters.treatment && r.risk_treatment !== colFilters.treatment) return false
      if (colFilters.status && r.status !== colFilters.status) return false
      if (colFilters.deadline && !r.action_plan_deadline?.includes(colFilters.deadline)) return false
      return true
    })

    // Sort
    const { key, direction } = sortConfig
    const sortBy = (a: RiskRecord, b: RiskRecord, k: string, dir: 'asc' | 'desc') => {
      let aVal, bVal
      switch (k) {
        case 'department': aVal = a.department; bVal = b.department; break
        case 'process': aVal = a.process_name; bVal = b.process_name; break
        case 'description': aVal = a.risk_description; bVal = b.risk_description; break
        case 'rootCause': aVal = a.root_cause; bVal = b.root_cause; break
        case 'eventType': aVal = a.event_type; bVal = b.event_type; break
        case 'likelihood': aVal = a.likelihood_score; bVal = b.likelihood_score; break
        case 'impact': aVal = a.impact_score; bVal = b.impact_score; break
        case 'inherent': aVal = a.inherent_risk_score; bVal = b.inherent_risk_score; break
        case 'control_design': aVal = a.control_design_score; bVal = b.control_design_score; break
        case 'control_implementation': aVal = a.control_implementation_score; bVal = b.control_implementation_score; break
        case 'controls': aVal = a.controls_rating; bVal = b.controls_rating; break
        case 'residual': aVal = a.residual_risk_score; bVal = b.residual_risk_score; break
        case 'status': aVal = a.status; bVal = b.status; break
        case 'deadline': aVal = a.action_plan_deadline; bVal = b.action_plan_deadline; break
        default: return 0
      }
      if (aVal == null) return 1
      if (bVal == null) return -1
      const c = String(aVal).localeCompare(String(bVal))
      return dir === 'asc' ? c : -c
    }
    result = [...result].sort((a: RiskRecord, b: RiskRecord) => {
      const cmp = sortBy(a, b, key, direction)
      if (cmp !== 0 || key === 'process') return cmp
      return sortBy(a, b, 'process', 'asc')
    })

    return result
  }, [risks, colFilters, searchTerm, sortConfig])

  const deptOptions = useMemo(() => [...new Set(risks.map(r => r.department))].sort(), [risks])
  const processOptions = useMemo(() => [...new Set(risks.map(r => r.process_name).filter(Boolean))].sort(), [risks])
  const eventTypeOptions = useMemo(() => [...new Set(risks.map(r => r.event_type).filter(Boolean))].sort(), [risks])
  const treatmentOptions = useMemo(() => [...new Set(risks.map(r => r.risk_treatment).filter(Boolean))].sort(), [risks])



  const columns: Column[] = [
    { key: 'department', label: 'Department' },
    { key: 'description', label: 'Risk Description' },
    { key: 'inherent', label: 'Inherent', align: 'center' },
    { key: 'controls', label: 'Controls', align: 'center' },
    { key: 'residual', label: 'Residual', align: 'center' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'deadline', label: 'Deadline', align: 'center' },
    { key: 'expand', label: '' },
  ]

  const renderFilterCell = (col: Column) => {
    switch (col.key) {
      case 'department': return <FilterSelect value={colFilters.department || ''} onChange={(v: string) => setFilter('department', v)} options={deptOptions} />
      case 'process': return <FilterSelect value={colFilters.process || ''} onChange={(v: string) => setFilter('process', v)} options={processOptions} />
      case 'description': return <FilterInput value={colFilters.description || ''} onChange={(v: string) => setFilter('description', v)} placeholder="Search..." />
      case 'causes': return <FilterInput value={colFilters.causes || ''} onChange={(v: string) => setFilter('causes', v)} placeholder="Search..." />
      case 'rootCause': return <FilterSelect value={colFilters.rootCause || ''} onChange={(v: string) => setFilter('rootCause', v)} options={['People', 'Process', 'Systems', 'External Events']} />
      case 'eventType': return <FilterSelect value={colFilters.eventType || ''} onChange={(v: string) => setFilter('eventType', v)} options={eventTypeOptions} />
      case 'likelihood': return <FilterSelect value={colFilters.likelihood || ''} onChange={(v: string) => setFilter('likelihood', v)} options={['1', '2', '3', '4']} />
      case 'impact': return <FilterSelect value={colFilters.impact || ''} onChange={(v: string) => setFilter('impact', v)} options={['1', '2', '3', '4']} />
      case 'controlType': return <FilterSelect value={colFilters.controlType || ''} onChange={(v: string) => setFilter('controlType', v)} options={['Preventive', 'Detective', 'Corrective', 'None']} />
      case 'inherent': return <FilterSelect value={colFilters.inherent || ''} onChange={(v: string) => setFilter('inherent', v)} options={RISK_LEVELS} />
      case 'control_design': return <FilterSelect value={colFilters.control_design || ''} onChange={(v: string) => setFilter('control_design', v)} options={['1', '2', '3', '4']} />
      case 'control_implementation': return <FilterSelect value={colFilters.control_implementation || ''} onChange={(v: string) => setFilter('control_implementation', v)} options={['1', '2', '3', '4']} />
      case 'controls': return <FilterSelect value={colFilters.controls || ''} onChange={(v: string) => setFilter('controls', v)} options={CONTROLS_LABELS} />
      case 'residual': return <FilterSelect value={colFilters.residual || ''} onChange={(v: string) => setFilter('residual', v)} options={RISK_LEVELS} />
      case 'treatment': return <FilterSelect value={colFilters.treatment || ''} onChange={(v: string) => setFilter('treatment', v)} options={treatmentOptions} />
      case 'status': return <FilterSelect value={colFilters.status || ''} onChange={(v: string) => setFilter('status', v)} options={['Open', 'In Progress', 'Closed']} />
      case 'deadline': return <FilterInput value={colFilters.deadline || ''} onChange={(v: string) => setFilter('deadline', v)} placeholder="Search..." />
      default: return null
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header — matches Call Tree ResponsesTable */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            {title || 'Risk Register'}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
            {filteredRisks.length}
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search risks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
          <button
            onClick={() => downloadCSV(filteredRisks)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm shrink-0 ${showFilters
                ? 'bg-accent-light text-accent-primary border border-accent-hover'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              title="View full table"
              className="flex items-center px-2 py-1.5 bg-white text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              title="Close"
              className="flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
        <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
          <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200/75">
            <tr className="text-[11px] text-gray-500 uppercase tracking-wider">
              {columns.map((col: Column) => {
                const isSortable = col.key !== 'expand'
                const icon = !isSortable ? null : sortConfig.key !== col.key ? (
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 transition-colors group-hover:text-gray-400" />
                ) : sortConfig.direction === 'asc' ? (
                  <ChevronUp className="w-3.5 h-3.5 text-accent-primary" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-accent-primary" />
                )
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-2.5 font-semibold ${isSortable ? 'cursor-pointer group hover:bg-gray-100/50 transition-colors' : ''} ${col.align === 'center' ? 'text-center' : 'text-left'} first:pl-5 last:pr-5`}
                    onClick={() => isSortable && handleSort(col.key)}
                  >
                    <div className={`flex items-center gap-1.5 ${col.align === 'center' ? 'justify-center' : ''}`}>
                      {col.label}
                      {icon}
                    </div>
                  </th>
                )
              })}
            </tr>
            {showFilters && (
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2">
                    {renderFilterCell(col)}
                  </td>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRisks.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500 text-sm">
                  No risks match the current filters
                </td>
              </tr>
            )}
            {filteredRisks.map((r) => {
              const rowId = r.id ?? null;
              const isExpanded = expandedRow === rowId;
              return (
                <Fragment key={rowId}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : rowId)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group/row"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="text-gray-900 font-bold text-[13px]">{shortDept(r.department)}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight line-clamp-1">{r.process_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top w-full">
                      <div className="flex flex-col gap-2 min-w-[300px] max-w-[600px]">
                        <div className="text-gray-700 text-[13px] leading-relaxed whitespace-normal line-clamp-2 group-hover/row:text-gray-900 transition-colors" title={r.risk_description}>
                          {r.risk_description}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cause:</span>
                          <MiniBadge
                            label={r.root_cause}
                            color={r.root_cause === 'People' ? '#3b82f6' : r.root_cause === 'Process' ? '#22c55e' : r.root_cause === 'Systems' ? '#f59e0b' : '#ef4444'}
                          />
                          <span className="text-gray-200">|</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{r.event_type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-center">
                      <div className="inline-flex flex-col gap-1.5">
                        <ScoreBadge
                          label={getRiskLevel(r.inherent_risk_score).toUpperCase()}
                          subLabel={r.inherent_risk_score}
                          color={RISK_TEXT[getRiskLevel(r.inherent_risk_score)]}
                          bgColor={RISK_BG[getRiskLevel(r.inherent_risk_score)]}
                        />
                        <div className="flex gap-1 justify-center">
                          <ScoreBadge
                            label="L"
                            subLabel={r.likelihood_score}
                            color={RISK_TEXT[getRiskLevelSmall(r.likelihood_score)]}
                            bgColor={RISK_BG[getRiskLevelSmall(r.likelihood_score)]}
                            tooltip="Likelihood"
                          />
                          <ScoreBadge
                            label="I"
                            subLabel={r.impact_score}
                            color={RISK_TEXT[getRiskLevelSmall(r.impact_score)]}
                            bgColor={RISK_BG[getRiskLevelSmall(r.impact_score)]}
                            tooltip="Impact"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-center">
                      <div className="inline-flex flex-col gap-1.5">
                        <ScoreBadge
                          label={getControlsLabel(r.controls_rating).toUpperCase()}
                          subLabel={r.controls_rating}
                          color={CONTROLS_LABEL_COLORS[getControlsLabel(r.controls_rating)]}
                          bgColor={CONTROL_BG[getControlsLabel(r.controls_rating)]}
                        />
                        <div className="flex gap-1 justify-center">
                          <ScoreBadge
                            label="D"
                            subLabel={r.control_design_score}
                            color={CONTROLS_LABEL_COLORS[getControlsLabelSmall(r.control_design_score)]}
                            tooltip="Control Design"
                          />
                          <ScoreBadge
                            label="M"
                            subLabel={r.control_implementation_score}
                            color={IMPLEMENTATION_COLORS[getImplementationLabel(r.control_implementation_score)]}
                            tooltip="Control Implementation"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-center">
                      <div className="inline-flex flex-col items-center">
                        <ScoreBadge
                          label={getRiskLevel(r.residual_risk_score).toUpperCase()}
                          subLabel={r.residual_risk_score}
                          color={RISK_TEXT[getRiskLevel(r.residual_risk_score)]}
                          bgColor={RISK_BG[getRiskLevel(r.residual_risk_score)]}
                        />
                      </div>
                    </td>
                     <td className="px-4 py-4 align-top text-center">
                       <div className="inline-flex flex-col items-center">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border tracking-wider ${r.status === 'Closed'
                             ? 'bg-green-50 text-green-700 border-green-200'
                             : r.status === 'In Progress'
                               ? 'bg-blue-50 text-blue-700 border-blue-200'
                               : 'bg-amber-50 text-amber-700 border-amber-200'
                           }`}>{r.status.toUpperCase()}</span>
                       </div>
                     </td>
                     <td className="px-4 py-4 align-top text-center">
                       <DeadlineBadge deadline={r.action_plan_deadline} />
                     </td>
                     <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-200 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50/80 whitespace-normal">
                      <td colSpan={columns.length} className="px-6 py-5 border-b border-gray-100">
                        <div className="grid grid-cols-[1fr_2fr] gap-x-8 gap-y-6 text-sm">
                          <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Risk Description</div>
                            <div className="text-gray-700 leading-relaxed">{r.risk_description}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Possible Causes</div>
                            <div className="text-gray-700 leading-relaxed">{r.possible_causes || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Control Type</div>
                            <div className="text-gray-700 leading-relaxed font-medium">{r.control_type || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Control Description</div>
                            <div className="text-gray-700 leading-relaxed">{r.control_description || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Treatment</div>
                            <div className="text-gray-700 leading-relaxed font-medium">{r.risk_treatment || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Action Plan</div>
                            <div className="text-gray-700 leading-relaxed">{r.action_plan || '—'}</div>
                            {r.action_plan_deadline && (
                              <div className="mt-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                Deadline: <span className="text-accent-primary">{r.action_plan_deadline}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Table footer with count and download */}
      {filteredRisks.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500 bg-gray-50/30">
          {filteredRisks.length} risks
        </div>
      )}
    </div>
  )
}

function downloadCSV(data: RiskRecord[]) {
  if (!data.length) return
  const headers = ['Department', 'Process', 'Risk Description', 'Possible Causes', 'Root Cause', 'Event Type', 'Likelihood', 'Impact', 'Inherent Risk', 'Control Design', 'Control Implementation', 'Controls Rating', 'Residual Risk', 'Control Type', 'Control Description', 'Risk Treatment', 'Status', 'Action Plan', 'Deadline']
  const rows = data.map((r: RiskRecord) => [
    r.department,
    r.process_name,
    r.risk_description,
    r.possible_causes,
    r.root_cause,
    r.event_type,
    r.likelihood_score,
    r.impact_score,
    r.inherent_risk_score,
    r.control_design_score,
    r.control_implementation_score,
    r.controls_rating,
    r.residual_risk_score,
    r.control_type,
    r.control_description,
    r.risk_treatment,
    r.status,
    r.action_plan,
    r.action_plan_deadline
  ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `risk-register-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
