import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { describeError, fetchCharacter, isNotFound } from '../api/dragonball'
import { StatusMessage } from '../components/StatusMessage'
import { useCharacters } from '../context/CharactersContext'
import { isDetailNavState } from '../lib/navigation'
import type { CharacterDetail } from '../types'
import styles from './DetailView.module.css'

type DetailResult =
  | { key: string; status: 'success'; character: CharacterDetail }
  | { key: string; status: 'error'; error: unknown }

export function DetailView() {
  const params = useParams()
  const id = Number(params.id)
  const isValidId = Number.isInteger(id) && id > 0
  const location = useLocation()
  const navigate = useNavigate()
  const { state: listState } = useCharacters()
  const navState = isDetailNavState(location.state) ? location.state : null

  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<DetailResult | null>(null)
  const requestKey = `${id}:${attempt}`

  useEffect(() => {
    if (!isValidId) return
    let cancelled = false
    fetchCharacter(id).then(
      (character) => {
        if (!cancelled) setResult({ key: requestKey, status: 'success', character })
      },
      (error: unknown) => {
        if (!cancelled) setResult({ key: requestKey, status: 'error', error })
      },
    )
    return () => {
      cancelled = true
    }
  }, [id, isValidId, requestKey])

  // Character ids have gaps (36, 41, 45–62 don't exist), so cycle through the visible list rather than id ± 1.
  const sequence = useMemo(() => {
    if (navState?.ids.includes(id)) return navState.ids
    return listState.status === 'success' ? listState.characters.map((c) => c.id) : []
  }, [navState, id, listState])

  const index = sequence.indexOf(id)
  const canCycle = index !== -1 && sequence.length > 1

  const goTo = useCallback(
    (offset: number) => {
      if (!canCycle) return
      const nextId = sequence[(index + offset + sequence.length) % sequence.length]
      navigate(`/character/${nextId}`, { replace: true, state: navState })
    },
    [canCycle, sequence, index, navigate, navState],
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') goTo(-1)
      else if (event.key === 'ArrowRight') goTo(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goTo])

  if (!isValidId) {
    return (
      <StatusMessage title="Character not found" message="That URL doesn't match any character.">
        <Link to="/" className="button button-primary">
          Back to search
        </Link>
      </StatusMessage>
    )
  }

  const current = result?.key === requestKey ? result : null
  const backTo = navState?.from ?? '/'
  const backLabel = navState?.fromLabel ?? 'search'

  return (
    <article>
      <nav className={styles.toolbar} aria-label="Character navigation">
        <Link to={backTo} className={styles.back}>
          ← Back to {backLabel}
        </Link>
        <div className={styles.stepper}>
          <button
            type="button"
            className="button"
            onClick={() => goTo(-1)}
            disabled={!canCycle}
            aria-label="Previous character"
          >
            ‹ Prev
          </button>
          {canCycle && (
            <span className={styles.position}>
              {index + 1} / {sequence.length}
            </span>
          )}
          <button
            type="button"
            className="button"
            onClick={() => goTo(1)}
            disabled={!canCycle}
            aria-label="Next character"
          >
            Next ›
          </button>
        </div>
      </nav>

      {!current && <StatusMessage loading title="Powering up…" />}
      {current?.status === 'error' &&
        (isNotFound(current.error) ? (
          <StatusMessage title="Character not found" message={describeError(current.error)} />
        ) : (
          <StatusMessage
            title="Couldn't load this character"
            message={describeError(current.error)}
            onRetry={() => setAttempt((n) => n + 1)}
          />
        ))}
      {current?.status === 'success' && <CharacterProfile character={current.character} />}
    </article>
  )
}

function CharacterProfile({ character }: { character: CharacterDetail }) {
  const planet = character.originPlanet
  return (
    <>
      <div className={styles.hero}>
        <div className={styles.portrait}>
          <img src={character.image} alt={character.name} />
        </div>
        <div>
          <span className="badge" data-affiliation={character.affiliation}>
            {character.affiliation}
          </span>
          <h1 className={styles.name}>{character.name}</h1>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>Race</dt>
              <dd>{character.race}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Gender</dt>
              <dd>{character.gender}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Base Ki</dt>
              <dd className={styles.kiValue}>{character.ki}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Max Ki</dt>
              <dd className={styles.kiValue}>{character.maxKi}</dd>
            </div>
          </dl>
          <h2 className={styles.sectionTitle}>
            Bio <span className={styles.note}>(Spanish, as provided by the API)</span>
          </h2>
          <p lang="es" className={styles.description}>
            {character.description}
          </p>
        </div>
      </div>

      {planet && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Origin planet</h2>
          <div className={styles.planet}>
            <img src={planet.image} alt={planet.name} loading="lazy" />
            <div className={styles.planetBody}>
              <h3 className={styles.planetName}>
                {planet.name}
                {planet.isDestroyed && <span className={styles.destroyed}>Destroyed</span>}
              </h3>
              <p lang="es" className={styles.planetText}>
                {planet.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {character.transformations.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Transformations</h2>
          <ul className={styles.transformations}>
            {character.transformations.map((t) => (
              <li key={t.id} className={styles.transformation}>
                <img src={t.image} alt="" loading="lazy" />
                <span className={styles.transformationName}>{t.name}</span>
                <span className={styles.transformationKi}>Ki {t.ki}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
