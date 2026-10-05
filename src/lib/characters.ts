import type { Character } from '../types'

export type SortKey = 'name' | 'ki' | 'maxKi' | 'race'
export type SortOrder = 'asc' | 'desc'
export type FilterField = 'race' | 'affiliation'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'ki', label: 'Base Ki' },
  { value: 'maxKi', label: 'Max Ki' },
  { value: 'race', label: 'Race' },
]

const KI_UNITS: Record<string, number> = {
  thousand: 1e3,
  million: 1e6,
  billion: 1e9,
  trillion: 1e12,
  quadrillion: 1e15,
  quintillion: 1e18,
  sextillion: 1e21,
  septillion: 1e24,
  googol: 1e100,
  googolplex: Infinity,
}

// Handles "60.000.000", "280,000,000", "3.2 Billion", "15 septillion"; returns null for "unknown".
export function parseKi(raw: string): number | null {
  const match = /^([\d.,]+)\s*([a-z]*)$/.exec(raw.trim().toLowerCase())
  if (!match) return null
  const [, digits, unit] = match
  if (!unit) return Number(digits.replace(/[.,]/g, ''))
  const multiplier = KI_UNITS[unit]
  if (multiplier === undefined) return null
  return Number(digits.replace(',', '.')) * multiplier
}

export function sortCharacters(
  characters: Character[],
  key: SortKey,
  order: SortOrder,
): Character[] {
  const direction = order === 'asc' ? 1 : -1
  return [...characters].sort((a, b) => {
    if (key === 'ki' || key === 'maxKi') {
      const kiA = parseKi(a[key])
      const kiB = parseKi(b[key])
      if (kiA === null || kiB === null) {
        if (kiA === kiB) return a.name.localeCompare(b.name)
        return kiA === null ? 1 : -1
      }
      if (kiA !== kiB) return (kiA < kiB ? -1 : 1) * direction
      return a.name.localeCompare(b.name)
    }
    return (a[key].localeCompare(b[key]) || a.name.localeCompare(b.name)) * direction
  })
}

export function matchesQuery(character: Character, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [character.name, character.race, character.affiliation].some((field) =>
    field.toLowerCase().includes(needle),
  )
}

export function countBy(characters: Character[], field: FilterField): [string, number][] {
  const counts = new Map<string, number>()
  for (const character of characters) {
    counts.set(character[field], (counts.get(character[field]) ?? 0) + 1)
  }
  return [...counts].sort(([a], [b]) => a.localeCompare(b))
}
