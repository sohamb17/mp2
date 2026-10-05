import { Link } from 'react-router'
import { StatusMessage } from '../components/StatusMessage'

export function NotFound() {
  return (
    <StatusMessage title="Page not found" message="This page seems to have been wished away by Shenron.">
      <Link to="/" className="button button-primary">
        Back to search
      </Link>
    </StatusMessage>
  )
}
