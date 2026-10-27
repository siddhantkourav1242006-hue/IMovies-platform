import { useCallback } from 'react';
import './SeatMap.css';

export default function SeatMap({ layout, selectedSeats, onSelect, onDeselect, maxSeats = 6 }) {
  const handleSeatClick = useCallback(
    (seat) => {
      if (seat.status === 'booked' || seat.status === 'locked') return;

      const isSelected = selectedSeats.some((s) => s.id === seat.id);
      if (isSelected) {
        onDeselect(seat.id);
      } else {
        if (selectedSeats.length < maxSeats) {
          onSelect(seat);
        }
      }
    },
    [selectedSeats, onSelect, onDeselect, maxSeats]
  );

  if (!layout || !layout.rows) return null;

  return (
    <div className="seat-map">
      {/* Screen */}
      <div className="seat-map__screen">
        <svg width="100%" height="30" viewBox="0 0 400 30" preserveAspectRatio="none">
          <path
            d="M 20 25 Q 200 0 380 25"
            stroke="var(--border)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        <p className="seat-map__screen-label">Screen</p>
      </div>

      {/* Seat grid */}
      <div className="seat-map__rows">
        {layout.rows.map((row) => (
          <div className="seat-map__row" key={row.label}>
            <span className="seat-map__row-label">{row.label}</span>
            <div className="seat-map__seats">
              {row.seats.map((seat, idx) => {
                if (seat.type === 'gap') {
                  return <div key={`gap-${idx}`} className="seat-map__gap" />;
                }

                const isSelected = selectedSeats.some((s) => s.id === seat.id);
                let seatClass = 'seat';
                if (isSelected) seatClass += ' seat--selected';
                else if (seat.status === 'booked') seatClass += ' seat--booked';
                else if (seat.status === 'locked') seatClass += ' seat--locked';

                return (
                  <button
                    key={seat.id}
                    className={seatClass}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status === 'booked'}
                    aria-label={`Seat ${row.label}${seat.number}, ${seat.status === 'booked' ? 'booked' : isSelected ? 'selected' : 'available'}, ${seat.category} — ₹${seat.price}`}
                    title={`${row.label}${seat.number}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
