import { useCountdown } from '../../hooks/useCountdown';
import './CountdownTimer.css';

export default function CountdownTimer({ endTime, onExpire }) {
  const { formatted, minutes } = useCountdown(endTime, onExpire);

  if (!endTime) return null;

  return (
    <div className={`countdown-timer ${minutes < 1 ? 'countdown-timer--warning' : ''}`}>
      <span className="countdown-timer__icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 6.5V9l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 2h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span>Complete booking in</span>
      <span className="countdown-timer__time">{formatted}</span>
    </div>
  );
}
