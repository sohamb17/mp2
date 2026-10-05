import type { ReactNode } from 'react'
import styles from './StatusMessage.module.css'

interface StatusMessageProps {
  title: string
  message?: string
  loading?: boolean
  onRetry?: () => void
  children?: ReactNode
}

export function StatusMessage({ title, message, loading = false, onRetry, children }: StatusMessageProps) {
  return (
    <div className={styles.status} role={loading ? 'status' : 'alert'}>
      {loading && <div className={styles.spinner} aria-hidden="true" />}
      <h2 className={styles.title}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {onRetry && (
        <button type="button" className="button button-primary" onClick={onRetry}>
          Try again
        </button>
      )}
      {children}
    </div>
  )
}
