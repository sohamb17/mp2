import { Link, NavLink, Outlet } from 'react-router'
import styles from './Layout.module.css'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
}

export function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.ball} aria-hidden="true" />
          <span className={styles.brandText}>Dragon Ball Codex</span>
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <NavLink to="/" end className={navClass}>
            Search
          </NavLink>
          <NavLink to="/gallery" className={navClass}>
            Gallery
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        Data from{' '}
        <a href="https://web.dragonball-api.com/" target="_blank" rel="noreferrer">
          Dragon Ball API
        </a>
      </footer>
    </div>
  )
}
