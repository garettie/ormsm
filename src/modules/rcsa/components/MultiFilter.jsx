import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'

export default function MultiFilter({ 
  label, options, selected, onChange, 
  formatLabel = (s) => s, width,
  bgMap = null, textMap = null, colorMap = null
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = val => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen(o => !o)}
        className={`min-h-9.5 w-full bg-white/80 backdrop-blur-sm border rounded-lg px-2 py-1 cursor-pointer flex items-center justify-between transition-all duration-200 shadow-sm hover:shadow-md ${
          open
            ? 'border-accent-primary ring-2 ring-accent-primary/20'
            : 'border-gray-200 hover:border-accent-primary/50'
        }`}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0
            ? <span className="text-gray-400 text-sm px-1">{label}</span>
            : selected.map(s => (
              <span
                key={s}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary"
              >
                {formatLabel(s)}
                <X
                  className="ml-1 w-3 h-3 cursor-pointer hover:text-accent-primary/80"
                  onClick={e => { e.stopPropagation(); toggle(s) }}
                />
              </span>
            ))
          }
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden py-1 flex flex-col" style={{ minWidth: 220 }}>
          <div className="px-3 py-2 border-b border-gray-100">
            <input
              type="text"
              className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-accent-primary"
              placeholder="Search..."
              autoFocus
              value={searchTerm}
              onClick={e => e.stopPropagation()}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">No options found</div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt}
                  onClick={() => toggle(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center hover:bg-gray-50 ${
                    selected.includes(opt) ? 'bg-accent-light/50 text-accent-primary font-medium' : ''
                  }`}
                >
                  <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center transition-colors ${
                    selected.includes(opt) ? 'bg-accent-primary border-accent-primary' : 'border-gray-300'
                  }`}>
                    {selected.includes(opt) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
