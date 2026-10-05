import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { describeError, fetchCharacters } from '../api/dragonball'
import { CharactersContext, type CharactersState } from './CharactersContext'

export function CharactersProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CharactersState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchCharacters().then(
      (characters) => {
        if (!cancelled) setState({ status: 'success', characters })
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: describeError(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo(() => ({ state, retry }), [state, retry])

  return <CharactersContext value={value}>{children}</CharactersContext>
}
