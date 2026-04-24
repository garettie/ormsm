import RiskRegister from './RiskRegister'
import type { RiskRecord } from '../types'

interface RiskRegisterModalProps {
  risks: RiskRecord[];
  onClose: () => void;
}

export default function RiskRegisterModal({ risks, onClose }: RiskRegisterModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backdropFilter: 'blur(4px)',
      }}
      className="animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden"
      >
        <RiskRegister
          risks={risks}
          title="Risk Register"
          onClose={onClose}
        />
      </div>
    </div>
  )
}
