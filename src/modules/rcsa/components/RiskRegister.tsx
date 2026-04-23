import { useState, useMemo, Fragment } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpDown, ChevronDown, ChevronUp, Filter, X, Maximize2, Search, Download } from 'lucide-react'
import { shortDept, getRiskLevel, getControlsLabel, RISK_LEVELS, RISK_BG, RISK_TEXT, RISK_COLORS, CONTROLS_LABEL_COLORS } from '../utils/riskLevels'
import RiskBadge from './RiskBadge'
import type { RiskRecord, RiskLevel, RootCause, ControlType, RiskTreatment, RiskStatus } from '../types'

const CONTROLS_LABELS = ['Strong', 'Satisfactory', 'Needs Improvement', 'Unsatisfactory']

interface FilterSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}

function FilterSelect({ value, onChange, options, placeholder }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-accent-primary bg-white text-gray-700"
    >
      <option value="">{placeholder || 'All'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
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
      className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-accent-primary text-gray-700"
    />
  )
}

interface RiskRegisterProps {
  risks: any[];
  title?: string;
  onOpenModal?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export default function RiskRegister({ risks, title = "Risk Register", onOpenModal, onClose, isModal }: RiskRegisterProps) {
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
    let result = risks.filter((r: any) => {
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
      if (colFilters.control_design && r.control_design?.toString() !== colFilters.control_design) return false
      if (colFilters.control_implementation && r.control_implementation?.toString() !== colFilters.control_implementation) return false
      if (colFilters.controls && getControlsLabel(r.controls_rating) !== colFilters.controls) return false
      if (colFilters.residual && getRiskLevel(r.residual_risk_score) !== colFilters.residual) return false
      if (colFilters.treatment && r.risk_treatment !== colFilters.treatment) return false
      if (colFilters.status && r.status !== colFilters.status) return false
      return true
    })

    // Sort
    const { key, direction } = sortConfig
    result = [...result].sort((a: any, b: any) => {
      let aVal, bVal
      switch (key) {
        case 'department': aVal = a.department; bVal = b.department; break
        case 'process': aVal = a.process_name; bVal = b.process_name; break
        case 'description': aVal = a.risk_description; bVal = b.risk_description; break
        case 'rootCause': aVal = a.root_cause; bVal = b.root_cause; break
        case 'eventType': aVal = a.event_type; bVal = b.event_type; break
        case 'likelihood': aVal = a.likelihood_score; bVal = b.likelihood_score; break
        case 'impact': aVal = a.impact_score; bVal = b.impact_score; break
        case 'inherent': aVal = a.inherent_risk_score; bVal = b.inherent_risk_score; break
        case 'control_design': aVal = a.control_design; bVal = b.control_design; break
        case 'control_implementation': aVal = a.control_implementation; bVal = b.control_implementation; break
        case 'controls': aVal = a.controls_rating; bVal = b.controls_rating; break
        case 'residual': aVal = a.residual_risk_score; bVal = b.residual_risk_score; break
        case 'status': aVal = a.status; bVal = b.status; break
        default: return 0
      }
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal))
      return direction === 'asc' ? cmp : -cmp
    })

    return result
  }, [risks, colFilters, searchTerm, sortConfig])

  const deptOptions = useMemo(() => [...new Set(risks.map(r => r.department))].sort(), [risks])
  const processOptions = useMemo(() => [...new Set(risks.map(r => r.process_name).filter(Boolean))].sort(), [risks])
  const eventTypeOptions = useMemo(() => [...new Set(risks.map(r => r.event_type).filter(Boolean))].sort(), [risks])
  const treatmentOptions = useMemo(() => [...new Set(risks.map(r => r.risk_treatment).filter(Boolean))].sort(), [risks])



  const columns = [
    { key: 'department', label: 'Department' },
    { key: 'process', label: 'Process' },
    { key: 'description', label: 'Risk Description' },
    { key: 'rootCause', label: 'Root Cause' },
    { key: 'eventType', label: 'Event Type' },
    { key: 'likelihood', label: 'Likelihood' },
    { key: 'impact', label: 'Impact' },
    { key: 'inherent', label: 'Inherent' },
    { key: 'control_design', label: 'Design' },
    { key: 'control_implementation', label: 'Implementation' },
    { key: 'controls', label: 'Controls Rating' },
    { key: 'residual', label: 'Residual' },
    { key: 'status', label: 'Status' },
    { key: 'expand', label: '' },
  ]

  const renderFilterCell = (col: any) => {
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
      default: return null
    }
  }

  return (
    <div className="glass-card flex flex-col overflow-hidden">
      {/* Header — matches Call Tree ResponsesTable */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">
            {title || 'Risk Register'} ({filteredRisks.length})
          </h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            <button
              onClick={() => downloadCSV(filteredRisks)}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${showFilters
                  ? 'bg-accent-light text-accent-primary border border-accent-hover'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
            {onOpenModal && (
              <button
                onClick={onOpenModal}
                title="View full table"
                className="flex items-center px-2 py-1.5 bg-white text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                title="Close"
                className="flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search bar — matches Call Tree */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search risks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              {columns.map(col => {
                const isSortable = col.key !== 'expand'
                const icon = !isSortable ? null : sortConfig.key !== col.key ? (
                  <ArrowUpDown className="w-4 h-4 text-gray-300" />
                ) : sortConfig.direction === 'asc' ? (
                  <ChevronUp className="w-4 h-4 text-accent-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-accent-primary" />
                )
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-3 font-medium ${isSortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                    onClick={() => isSortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
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
            {filteredRisks.map((r, idx) => {
              const isExpanded = expandedRow === r.id
              return (
                <Fragment key={r.id}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">{shortDept(r.department)}</td>
                    <td className="px-4 py-3 text-gray-500">{r.process_name}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[250px] overflow-hidden text-ellipsis" title={r.risk_description}>{r.risk_description}</td>
                    <td className="px-4 py-3 text-gray-500">{r.root_cause}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[180px] overflow-hidden text-ellipsis" title={r.event_type}>{r.event_type}</td>
                    <td className="px-4 py-3 text-gray-500 font-medium text-center">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: RISK_BG[getRiskLevel(r.likelihood_score)],
                          color: RISK_TEXT[getRiskLevel(r.likelihood_score)],
                          borderColor: `${RISK_COLORS[getRiskLevel(r.likelihood_score)]}40`,
                        }}
                      >{getRiskLevel(r.likelihood_score)} ({r.likelihood_score})</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-medium text-center">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: RISK_BG[getRiskLevel(r.impact_score)],
                          color: RISK_TEXT[getRiskLevel(r.impact_score)],
                          borderColor: `${RISK_COLORS[getRiskLevel(r.impact_score)]}40`,
                        }}
                      >{getRiskLevel(r.impact_score)} ({r.impact_score})</span>
                    </td>
                    <td className="px-4 py-3"><RiskBadge score={r.inherent_risk_score} /></td>
                    <td className="px-4 py-3 text-gray-500 font-medium text-center">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${CONTROLS_LABEL_COLORS[getControlsLabel(r.control_design)]}18`,
                          color: CONTROLS_LABEL_COLORS[getControlsLabel(r.control_design)],
                          borderColor: `${CONTROLS_LABEL_COLORS[getControlsLabel(r.control_design)]}40`,
                        }}
                      >{getControlsLabel(r.control_design)} ({r.control_design})</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-medium text-center">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${CONTROLS_LABEL_COLORS[getControlsLabel(r.control_implementation)]}18`,
                          color: CONTROLS_LABEL_COLORS[getControlsLabel(r.control_implementation)],
                          borderColor: `${CONTROLS_LABEL_COLORS[getControlsLabel(r.control_implementation)]}40`,
                        }}
                      >{getControlsLabel(r.control_implementation)} ({r.control_implementation})</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${CONTROLS_LABEL_COLORS[getControlsLabel(r.controls_rating)]}18`,
                          color: CONTROLS_LABEL_COLORS[getControlsLabel(r.controls_rating)],
                          borderColor: `${CONTROLS_LABEL_COLORS[getControlsLabel(r.controls_rating)]}40`,
                        }}
                      >{getControlsLabel(r.controls_rating)}</span>
                    </td>
                    <td className="px-4 py-3"><RiskBadge score={r.residual_risk_score} /></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${r.status === 'Closed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : r.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{r.status}</span>
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

function downloadCSV(data: any[]) {
  if (!data.length) return
  const headers = ['Department', 'Process', 'Risk Description', 'Possible Causes', 'Root Cause', 'Event Type', 'Likelihood', 'Impact', 'Inherent Risk', 'Control Design', 'Control Implementation', 'Controls Rating', 'Residual Risk', 'Control Type', 'Control Description', 'Risk Treatment', 'Status', 'Action Plan', 'Deadline']
  const rows = data.map((r: any) => [
    r.department,
    r.process_name,
    r.risk_description,
    r.possible_causes,
    r.root_cause,
    r.event_type,
    r.likelihood_score,
    r.impact_score,
    r.inherent_risk_score,
    r.control_design,
    r.control_implementation,
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
