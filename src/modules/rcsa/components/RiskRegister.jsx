import { useState, useMemo, useEffect, Fragment } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Filter, X, Maximize2, Search } from 'lucide-react'
import { shortDept, getRiskLevel, getControlsLabel, RISK_LEVELS, RISK_BG, RISK_TEXT, CONTROLS_LABEL_COLORS } from '../utils/riskLevels'
import RiskBadge from './RiskBadge'

const PAGE_SIZE = 10

const CONTROLS_LABELS = ['Strong', 'Satisfactory', 'Needs Improvement', 'Unsatisfactory']

function FilterSelect({ value, onChange, options, placeholder }) {
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

function FilterInput({ value, onChange, placeholder }) {
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

export default function RiskRegister({ risks, title = "Risk Register", onOpenModal, onClose, pageSize }) {
  const PAGE = pageSize || PAGE_SIZE
  const [page, setPage] = useState(0)
  const [expandedRow, setExpandedRow] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [colFilters, setColFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  const setFilter = (key, val) => {
    setColFilters(prev => ({ ...prev, [key]: val }))
    setPage(0)
  }

  const clearAllFilters = () => {
    setColFilters({})
    setSearchTerm('')
    setPage(0)
  }

  const hasActiveFilters = Object.values(colFilters).some(v => v) || searchTerm

  useEffect(() => { setPage(0) }, [risks])

  const filteredRisks = useMemo(() => {
    return risks.filter(r => {
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
      if (colFilters.controlType && r.control_type !== colFilters.controlType) return false
      if (colFilters.inherent && getRiskLevel(r.inherent_risk_score) !== colFilters.inherent) return false
      if (colFilters.controls && getControlsLabel(r.controls_rating) !== colFilters.controls) return false
      if (colFilters.residual && getRiskLevel(r.residual_risk_score) !== colFilters.residual) return false
      if (colFilters.treatment && r.risk_treatment !== colFilters.treatment) return false
      if (colFilters.status && r.status !== colFilters.status) return false
      return true
    })
  }, [risks, colFilters, searchTerm])

  const deptOptions = useMemo(() => [...new Set(risks.map(r => r.department))].sort(), [risks])
  const processOptions = useMemo(() => [...new Set(risks.map(r => r.process_name).filter(Boolean))].sort(), [risks])
  const eventTypeOptions = useMemo(() => [...new Set(risks.map(r => r.event_type).filter(Boolean))].sort(), [risks])
  const treatmentOptions = useMemo(() => [...new Set(risks.map(r => r.risk_treatment).filter(Boolean))].sort(), [risks])

  const totalPages = Math.max(1, Math.ceil(filteredRisks.length / PAGE))
  const safePage = Math.min(page, totalPages - 1)
  const start = safePage * PAGE
  const end = Math.min(start + PAGE, filteredRisks.length)
  const pageRisks = filteredRisks.slice(start, end)

  const maxBtns = 5
  let ps = Math.max(0, safePage - Math.floor(maxBtns / 2))
  let pe = Math.min(totalPages, ps + maxBtns)
  if (pe - ps < maxBtns) ps = Math.max(0, pe - maxBtns)
  const pageButtons = []
  for (let i = ps; i < pe; i++) pageButtons.push(i)

  const columns = [
    { key: 'department', label: 'Department' },
    { key: 'process', label: 'Process' },
    { key: 'description', label: 'Risk Description' },
    { key: 'rootCause', label: 'Root Cause' },
    { key: 'eventType', label: 'Event Type' },
    { key: 'inherent', label: 'Inherent' },
    { key: 'controls', label: 'Controls Rating' },
    { key: 'residual', label: 'Residual' },
    { key: 'status', label: 'Status' },
    { key: 'expand', label: '' },
  ]

  const renderFilterCell = (col) => {
    switch (col.key) {
      case 'department': return <FilterSelect value={colFilters.department || ''} onChange={v => setFilter('department', v)} options={deptOptions} />
      case 'process': return <FilterSelect value={colFilters.process || ''} onChange={v => setFilter('process', v)} options={processOptions} />
      case 'description': return <FilterInput value={colFilters.description || ''} onChange={v => setFilter('description', v)} placeholder="Search..." />
      case 'causes': return <FilterInput value={colFilters.causes || ''} onChange={v => setFilter('causes', v)} placeholder="Search..." />
      case 'rootCause': return <FilterSelect value={colFilters.rootCause || ''} onChange={v => setFilter('rootCause', v)} options={['People', 'Process', 'Systems', 'External Events']} />
      case 'eventType': return <FilterSelect value={colFilters.eventType || ''} onChange={v => setFilter('eventType', v)} options={eventTypeOptions} />
      case 'controlType': return <FilterSelect value={colFilters.controlType || ''} onChange={v => setFilter('controlType', v)} options={['Preventive', 'Detective', 'Corrective', 'None']} />
      case 'inherent': return <FilterSelect value={colFilters.inherent || ''} onChange={v => setFilter('inherent', v)} options={RISK_LEVELS} />
      case 'controls': return <FilterSelect value={colFilters.controls || ''} onChange={v => setFilter('controls', v)} options={CONTROLS_LABELS} />
      case 'residual': return <FilterSelect value={colFilters.residual || ''} onChange={v => setFilter('residual', v)} options={RISK_LEVELS} />
      case 'treatment': return <FilterSelect value={colFilters.treatment || ''} onChange={v => setFilter('treatment', v)} options={treatmentOptions} />
      case 'status': return <FilterSelect value={colFilters.status || ''} onChange={v => setFilter('status', v)} options={['Open', 'In Progress', 'Closed']} />
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
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showFilters
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
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 font-medium">{col.label}</th>
              ))}
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
            {pageRisks.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500 text-sm">
                  No risks match the current filters
                </td>
              </tr>
            )}
            {pageRisks.map((r, idx) => {
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
                    <td className="px-4 py-3"><RiskBadge score={r.inherent_risk_score} /></td>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        r.status === 'Closed'
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

      {/* Pagination */}
      {filteredRisks.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
          <span>{start + 1}–{end} of {filteredRisks.length} risks</span>
          <div className="flex items-center gap-1">
            <button
              disabled={safePage === 0}
              onClick={() => setPage(p => p - 1)}
              className={`flex items-center px-2 py-1 rounded-lg border transition-colors ${
                safePage === 0
                  ? 'border-gray-100 text-gray-300 cursor-default'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer'
              }`}
            ><ChevronLeft className="w-4 h-4" /></button>
            {pageButtons.map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                  p === safePage
                    ? 'bg-accent-primary text-white border-accent-primary'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >{p + 1}</button>
            ))}
            <button
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className={`flex items-center px-2 py-1 rounded-lg border transition-colors ${
                safePage >= totalPages - 1
                  ? 'border-gray-100 text-gray-300 cursor-default'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer'
              }`}
            ><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
