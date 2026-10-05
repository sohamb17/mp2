import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { StatusMessage } from '../components/StatusMessage'
import { useCharacters } from '../context/CharactersContext'
import {
  matchesQuery,
  SORT_OPTIONS,
  sortCharacters,
  type SortKey,
  type SortOrder,
} from '../lib/characters'
import type { DetailNavState } from '../lib/navigation'
import type { Character } from '../types'
import styles from './ListView.module.css'

const NO_CHARACTERS: Character[] = []

function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((option) => option.value === value)
}

export function ListView() {
  const { state, retry } = useCharacters()
  const location = useLocation()
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const sortParam = params.get('sort')
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'name'
  const order: SortOrder = params.get('order') === 'desc' ? 'desc' : 'asc'

  const characters = state.status === 'success' ? state.characters : NO_CHARACTERS
  const results = useMemo(
    () => sortCharacters(characters.filter((c) => matchesQuery(c, query)), sortKey, order),
    [characters, query, sortKey, order],
  )

  function updateParam(key: string, value: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const navState: DetailNavState = {
    ids: results.map((c) => c.id),
    from: location.pathname + location.search,
    fromLabel: 'search',
  }

  return (
    <section>
      <h1 className="page-title">Search the Z-Archive</h1>
      <p className="page-subtitle">Find any fighter by name, race or affiliation, then sort by power.</p>

      <div className={styles.controls}>
        <label className={styles.search}>
          <span className="visually-hidden">Search characters</span>
          <input
            type="search"
            value={query}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Search by name, race or affiliation…"
          />
        </label>
        <label className={styles.field}>
          <span>Sort by</span>
          <select value={sortKey} onChange={(e) => updateParam('sort', e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.field}>
          <span id="order-label">Order</span>
          <div className={styles.order} role="group" aria-labelledby="order-label">
            <button
              type="button"
              className={styles.orderButton}
              aria-pressed={order === 'asc'}
              onClick={() => updateParam('order', '')}
            >
              ↑ Asc
            </button>
            <button
              type="button"
              className={styles.orderButton}
              aria-pressed={order === 'desc'}
              onClick={() => updateParam('order', 'desc')}
            >
              ↓ Desc
            </button>
          </div>
        </div>
      </div>

      {state.status === 'loading' && <StatusMessage loading title="Gathering the Dragon Balls…" />}
      {state.status === 'error' && (
        <StatusMessage title="Couldn't load characters" message={state.message} onRetry={retry} />
      )}
      {state.status === 'success' && (
        <>
          <p className={styles.count} aria-live="polite">
            {results.length} of {characters.length} characters
          </p>
          {results.length === 0 ? (
            <StatusMessage title="No matches" message={`Nothing matches “${query}”.`} />
          ) : (
            <ul className={styles.list}>
              {results.map((c) => (
                <li key={c.id}>
                  <Link to={`/character/${c.id}`} state={navState} className={styles.row}>
                    <img src={c.image} alt="" loading="lazy" className={styles.thumb} />
                    <span className={styles.name}>{c.name}</span>
                    <span className={styles.meta}>
                      {c.race} · {c.affiliation}
                    </span>
                    <span className={`${styles.ki} ${styles.baseKi}`}>
                      <span className={styles.kiLabel}>Ki</span>
                      {c.ki}
                    </span>
                    <span className={`${styles.ki} ${styles.maxKi}`}>
                      <span className={styles.kiLabel}>Max Ki</span>
                      {c.maxKi}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
