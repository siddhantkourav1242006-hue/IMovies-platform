import Button from './Button';
import './ErrorState.css';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state__icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 16v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="24" cy="32" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <h3 className="error-state__title">{title}</h3>
      {message && <p className="error-state__message">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
