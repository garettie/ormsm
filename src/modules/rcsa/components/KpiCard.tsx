import type { ReactNode, ElementType } from 'react'

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
  icon: ElementType;
  borderColor?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export default function KpiCard({ label, value, sub, accentColor, icon: Icon, borderColor, children, onClick }: KpiCardProps) {
  const bc = borderColor || accentColor || '#e2e8f0'

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 flex flex-col justify-between h-full relative overflow-hidden group transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''
      }`}
    >
      {/* Background Gradient Mesh */}
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-transform duration-500 group-hover:scale-150"
        style={{ backgroundColor: bc }}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg ring-1 ring-gray-100/50 shadow-sm bg-gray-50">
          <Icon size={18} color={accentColor} strokeWidth={2} />
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-end">
        <div className="flex justify-between items-end mb-1">
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </div>
          {children && (
            <div className="flex-shrink-0 mb-0.5">
              {children}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {label}
          </h3>
          {sub && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
              {sub}
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-100 transition-all duration-300"
        style={{ backgroundColor: bc }}
      />
    </div>
  )
}
