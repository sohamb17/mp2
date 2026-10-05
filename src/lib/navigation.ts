export interface DetailNavState {
  ids: number[]
  from: string
  fromLabel: string
}

export function isDetailNavState(value: unknown): value is DetailNavState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<DetailNavState>
  return (
    Array.isArray(candidate.ids) &&
    typeof candidate.from === 'string' &&
    typeof candidate.fromLabel === 'string'
  )
}
