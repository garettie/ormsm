export default function LegendRow({ items }) {
  return (
    <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 mt-3">
      {items.map(({ label, color }) => (
        <span key={label} className="text-[11px] font-semibold" style={{ color }}>
          {label}
        </span>
      ))}
    </div>
  )
}
