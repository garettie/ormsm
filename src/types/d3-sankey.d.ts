declare module 'd3-sankey' {
  import { HierarchyRectangularNode, Link } from 'd3'

  export interface SankeyNode<N extends object = object, L extends object = object> {
    sourceLinks: Link<N, SankeyNode<N, L>>[]
    targetLinks: Link<N, SankeyNode<N, L>>[]
    depth?: number
    height?: number
    index?: number
    layer?: string[]
    sx?: number
    sy?: number
    tx?: number
    ty?: number
    value?: number
    width?: number
    x0?: number
    x1?: number
    y0?: number
    y1?: number
    name?: string
  }

  export interface SankeyLink<N extends object = object, L extends object = object> {
    source: SankeyNode<N, L> | N
    target: SankeyNode<N, L> | N
    width?: number
    y0?: number
    y1?: number
    value?: number
    index?: number
  }

  export interface SankeyGraph<N extends object = object, L extends object = object> {
    nodes: Array<N & SankeyNode<N, L>>
    links: Array<L & SankeyLink<N, L>>
  }

  export interface SankeyLayout<N extends object = object, L extends object = object> {
    <N extends object = object, L extends object = object>(): SankeyLayout<N, L>
    nodeId<T>(accessor: (node: T) => string | number | undefined): SankeyLayout<N, L>
    nodeWidth(width: number): SankeyLayout<N, L>
    nodePadding(padding: number): SankeyLayout<N, L>
    nodeAlign(align: (node: SankeyNode<N, L>, numNodes: number, index: number) => number): SankeyLayout<N, L>
    extent(extent: [[number, number], [number, number]]): SankeyLayout<N, L>
    (graph: { nodes: N[]; links: L[] }): SankeyGraph<N, L>
  }

  export function sankey<N extends object = object, L extends object = object>(): SankeyLayout<N, L>
  export function sankeyJustify<N extends object = object, L extends object = object>(node: SankeyNode<N, L>, numNodes: number, index: number): number
  export function sankeyLeft<N extends object = object, L extends object = object>(node: SankeyNode<N, L>, numNodes: number, index: number): number
  export function sankeyRight<N extends object = object, L extends object = object>(node: SankeyNode<N, L>, numNodes: number, index: number): number
  export function sankeyCenter<N extends object = object, L extends object = object>(node: SankeyNode<N, L>, numNodes: number, index: number): number
  export function sankeyLinkHorizontal(): Link<HierarchyRectangularNode<object>, HierarchyRectangularNode<object>>
}