import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { StatusMessage } from '../components/StatusMessage'
import { useCharacters } from '../context/CharactersContext'
import { countBy, type FilterField } from '../lib/characters'
import type { DetailNavState } from '../lib/navigation'
import type { Character } from '../types'
import styles from './GalleryView.module.css'

const NO_CHARACTERS: Character[] = []

const FILTERS: { field: FilterField; label: string }[] = [
  { field: 'race', label: 'Race' },
  { field: 'affiliation', label: 'Affiliation' },
]

export function GalleryView() {
  const { state, retry } = useCharacters()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const characters = state.status === 'success' ? state.characters : NO_CHARACTERS

  const filtered = useMemo(() => {
    const active = FILTERS.map(({ field }) => ({ field, values: params.getAll(field) })).filter(
      ({ values }) => values.length > 0,
    )
    return characters.filter((c) => active.every(({ field, values }) => values.includes(c[field])))
  }, [characters, params])

  const hasFilters = FILTERS.some(({ field }) => params.has(field))

  function toggle(field: FilterField, value: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const current = next.getAll(field)
        next.delete(field)
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
        for (const v of updated) next.append(field, v)
        return next
      },
      { replace: true },
    )
  }

  const navState: DetailNavState = {
    ids: filtered.map((c) => c.id),
    from: location.pathname + location.search,
    fromLabel: 'gallery',
  }

  return (
    <section>
      <h1 className="page-title">Fighter Gallery</h1>
      <p className="page-subtitle">
        Pick any races and affiliations. Within a group any match counts; across groups all must match.
      </p>

      {state.status === 'loading' && <StatusMessage loading title="Gathering the Dragon Balls…" />}
      {state.status === 'error' && (
        <StatusMessage title="Couldn't load characters" message={state.message} onRetry={retry} />
      )}
      {state.status === 'success' && (
        <div className={styles.layout}>
          <aside className={styles.filters} aria-label="Filters">
            {FILTERS.map(({ field, label }) => {
              const selected = params.getAll(field)
              return (
                <fieldset key={field} className={styles.group}>
                  <legend className={styles.legend}>{label}</legend>
                  <div className={styles.chips}>
                    {countBy(characters, field).map(([value, count]) => (
                      <button
                        key={value}
                        type="button"
                        className={styles.chip}
                        aria-pressed={selected.includes(value)}
                        onClick={() => toggle(field, value)}
                      >
                        {value}
                        <span className={styles.chipCount}>{count}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )
            })}
            <button
              type="button"
              className="button"
              onClick={() => setParams({}, { replace: true })}
              disabled={!hasFilters}
            >
              Clear filters
            </button>
          </aside>

          <div>
            <p className={styles.count} aria-live="polite">
              Showing {filtered.length} of {characters.length}
            </p>
            {filtered.length === 0 ? (
              <StatusMessage title="No fighters match" message="Try removing a filter." />
            ) : (
              <ul className={styles.grid}>
                {filtered.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/character/${c.id}`}
                      state={navState}
                      className={styles.card}
                      data-affiliation={c.affiliation}
                    >
                      <div className={styles.imageWrap}>
                        <img src={c.image} alt="" loading="lazy" className={styles.image} />
                      </div>
                      <div className={styles.cardBody}>
                        <h2 className={styles.cardName}>{c.name}</h2>
                        <p className={styles.cardMeta}>{c.race}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
