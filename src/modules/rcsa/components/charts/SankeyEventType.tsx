import { useMemo, useState, useRef, useEffect } from 'react'
import { sankey as d3Sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey'
import { getRiskLevel, RC_COLOR_MAP, RISK_COLORS } from '../../utils/riskLevels'
import type { RiskRecord, RiskLevel } from '../../types'

const EVENT_ABBR: Record<string, string> = {
  'Execution delivery and process management': 'Exec. & Process Mgmt',
  'Business disruption and system failures': 'Bus. Disruption & Systems',
  'External fraud': 'External Fraud',
  'Employment practices and workplace safety': 'Employment & Safety',
  'Internal fraud': 'Internal Fraud',
  'Damage to physical assets': 'Damage to Phys. Assets',
  'Clients products and business practices': 'Client Prod. & Practices',
}

function abbreviate(name: string) {
  return EVENT_ABBR[name] || name
}

interface SankeyNode {
  idx: number;
  name: string;
  fullName: string;
  layer: number;
  color: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  value?: number;
}

interface SankeyLink {
  source: number | SankeyNode;
  target: number | SankeyNode;
  value: number;
  color: string;
  width?: number;
}

function buildGraph(risks: RiskRecord[]) {
  const nodeMap = new Map<string, SankeyNode>()
  const linkMap = new Map<string, SankeyLink>()

  let nodeIdx = 0
  function getNode(name: string, layer: number, color: string) {
    const key = `${layer}::${name}`
    if (!nodeMap.has(key)) {
      nodeMap.set(key, { idx: nodeIdx++, name, fullName: name, layer, color })
    }
    return nodeMap.get(key)!
  }

  // Column 3: Risk Levels (ALWAYS INCLUDE ALL)
  const RISK_LEVELS: RiskLevel[] = ['Minor', 'Moderate', 'Major', 'Critical']
  RISK_LEVELS.forEach(lvl => getNode(lvl, 2, RISK_COLORS[lvl] || '#94a3b8'))

  risks.forEach((r) => {
    const rc = r.root_cause
    const et = r.event_type
    const level = getRiskLevel(r.residual_risk_score)
    if (!rc || !et) return

    const rcNode = getNode(rc, 0, RC_COLOR_MAP[rc] || '#94a3b8')
    const etNode = getNode(et, 1, '#94a3b8')
    const lvlNode = getNode(level, 2, RISK_COLORS[level] || '#94a3b8')

    const linkA = `${rcNode.idx}->${etNode.idx}`
    if (!linkMap.has(linkA)) {
      linkMap.set(linkA, { source: rcNode.idx, target: etNode.idx, value: 0, color: rcNode.color })
    }
    linkMap.get(linkA)!.value++

    const linkB = `${etNode.idx}->${lvlNode.idx}`
    if (!linkMap.has(linkB)) {
      linkMap.set(linkB, { source: etNode.idx, target: lvlNode.idx, value: 0, color: lvlNode.color })
    }
    linkMap.get(linkB)!.value++
  })

  const nodes = Array.from(nodeMap.values()).map((n) => ({
    name: n.name,
    fullName: n.fullName,
    layer: n.layer,
    color: n.color,
  }))

  const links = Array.from(linkMap.values())

  return { nodes, links }
}

const MARGIN = { top: 6, right: 14, bottom: 6, left: 14 }
const SVG_W = 700
const SVG_H = 340
const NODE_W = 12
const NODE_PAD = 14

interface SankeyEventTypeProps {
  risks: RiskRecord[];
  onNodeClick?: (layer: number, name: string) => void;
}

export default function SankeyEventType({ risks, onNodeClick }: SankeyEventTypeProps) {
  const [tooltip, setTooltip] = useState<{ text: string; value: number } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    setContainerWidth(containerRef.current.offsetWidth)
    return () => observer.disconnect()
  }, [])

  const layout = useMemo(() => {
    const { nodes, links } = buildGraph(risks)
    if (!nodes.length) return null

    const generator = d3Sankey<SankeyNode, SankeyLink>()
      .nodeId((d: any) => d.idx)
      .nodeWidth(NODE_W)
      .nodePadding(NODE_PAD)
      .nodeAlign(sankeyJustify)
      .extent([
        [MARGIN.left, MARGIN.top],
        [SVG_W - MARGIN.right, SVG_H - MARGIN.bottom],
      ])

    const graph = generator({ 
      nodes: nodes.map((n, i) => ({ ...n, idx: i })), 
      links: links.map((l) => ({ ...l })) 
    })
    return graph as any
  }, [risks])

  if (!layout || !layout.nodes || !layout.nodes.length) {
    return (
      <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
        No data to display
      </div>
    )
  }

  const linkPath = sankeyLinkHorizontal() as any

  return (
    <div style={{ position: 'relative' }} ref={containerRef} onMouseMove={(e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }}>
      {/* Column headers */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 14px',
        marginBottom: 4,
      }}>
        {['Root Cause', 'Event Type', 'Residual Risk'].map((label) => (
          <span key={label} style={{
            fontSize: 9,
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Links */}
        {layout.links.map((link: any, i: number) => (
          <path
            key={i}
            d={linkPath(link)}
            fill="none"
            stroke={link.color || '#94a3b8'}
            strokeOpacity={0.28}
            strokeWidth={Math.max(1, link.width)}
          />
        ))}

        {/* Nodes */}
        {layout.nodes.map((node: any, i: number) => {
          const w = node.x1 - node.x0
          const h = node.y1 - node.y0
          const isLeft = node.layer === 0
          const isRight = node.layer === 2
          const isMid = node.layer === 1

          const labelX = isLeft
            ? node.x1 + 6
            : isRight
              ? node.x0 - 6
              : node.x0 + w / 2
          const labelAnchor = isLeft ? 'start' : isRight ? 'end' : 'middle'
          const labelY = node.y0 + h / 2
          const label = isMid ? abbreviate(node.name) : node.name

          return (
            <g
              key={i}
              onClick={() => onNodeClick && onNodeClick(node.layer, node.fullName || node.name)}
              onMouseEnter={() => {
                setTooltip({
                  text: node.fullName || node.name,
                  value: node.value,
                })
              }}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            >
              <rect
                x={node.x0}
                y={node.y0}
                width={w}
                height={h}
                rx={3}
                fill={node.color}
              />
              { (h > 8 || node.layer === 2) && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={labelAnchor}
                  dominantBaseline="central"
                  fontSize={10}
                  fontWeight={600}
                  fill={h > 0 ? "#334155" : "#94a3b8"}
                >
                  {label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && containerWidth > 0 && (() => {
        const flipLeft = mousePos.x > containerWidth * 0.6;
        return (
          <div style={{
            position: 'absolute',
            left: flipLeft ? undefined : mousePos.x + 12,
            right: flipLeft ? containerWidth - mousePos.x + 12 : undefined,
            top: mousePos.y - 10,
            background: '#fff',
            color: '#334155',
            fontSize: 11,
            fontWeight: 500,
            padding: '5px 10px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            border: '1px solid #f1f5f9',
            zIndex: 50,
            transition: 'left 0.08s ease, right 0.08s ease, top 0.08s ease',
          }}>
            {tooltip.text}: <strong>{tooltip.value}</strong>
          </div>
        );
      })()}
    </div>
  )
}
