import type { ReactNode, CSSProperties } from 'react'

interface SectionCardProps {
  title: string;
  children: ReactNode;
  style?: CSSProperties;
  action?: ReactNode;
}

export default function SectionCard({ title, children, style, action }: SectionCardProps) {
  return (
    <div className="glass-card flex flex-col" style={style}>
      <div className="px-6 pt-5 pb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6 flex-1">
        {children}
      </div>
    </div>
  )
}
