export default function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white px-3.5 py-2 rounded-lg text-xs font-medium shadow-lg border border-gray-100">
      {label && <div className="text-gray-400 mb-1 text-[11px]">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span style={{ color: p.fill || p.color, fontWeight: 700 }}>{p.name || ''}</span>
          {p.name ? ': ' : ''}
          <strong className="text-gray-700">{p.value}</strong>
        </div>
      ))}
    </div>
  )
}
