import './EmptyState.css';

export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 20h32" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="30" r="2" fill="currentColor" />
        </svg>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
      {action && action}
    </div>
  );
}
