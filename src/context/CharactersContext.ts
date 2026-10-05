import { createContext, useContext } from 'react'
import type { Character } from '../types'

export type CharactersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; characters: Character[] }

export interface CharactersContextValue {
  state: CharactersState
  retry: () => void
}

export const CharactersContext = createContext<CharactersContextValue | null>(null)

export function useCharacters(): CharactersContextValue {
  const value = useContext(CharactersContext)
  if (!value) throw new Error('useCharacters must be used inside CharactersProvider')
  return value
}
