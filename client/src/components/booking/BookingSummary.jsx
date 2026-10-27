import Button from '../ui/Button';
import './BookingSummary.css';

export default function BookingSummary({
  movie,
  show,
  selectedSeats,
  onProceed,
  loading,
}) {
  const total = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div className="booking-summary">
      <h3 className="booking-summary__title">Booking summary</h3>

      {movie && (
        <div className="booking-summary__row">
          <span className="booking-summary__label">Movie</span>
          <span className="booking-summary__value">{movie.title}</span>
        </div>
      )}

      {show && (
        <>
          <div className="booking-summary__row">
            <span className="booking-summary__label">Theatre</span>
            <span className="booking-summary__value">{show.theatre?.name || '—'}</span>
          </div>
          <div className="booking-summary__row">
            <span className="booking-summary__label">Showtime</span>
            <span className="booking-summary__value">{show.time || '—'}</span>
          </div>
        </>
      )}

      <div className="booking-summary__divider" />

      <div className="booking-summary__row">
        <span className="booking-summary__label">
          Seats ({selectedSeats.length})
        </span>
        <div className="booking-summary__seats">
          {selectedSeats.length === 0 ? (
            <span className="booking-summary__value">None selected</span>
          ) : (
            selectedSeats.map((s) => (
              <span key={s.id} className="booking-summary__seat-tag">
                {s.label || s.id}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="booking-summary__divider" />

      <div className="booking-summary__row">
        <span className="booking-summary__label booking-summary__total">Total</span>
        <span className="booking-summary__value booking-summary__total">
          ₹{total.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="booking-summary__actions">
        <Button
          block
          disabled={selectedSeats.length === 0 || loading}
          onClick={onProceed}
        >
          {loading ? 'Processing...' : 'Proceed to payment'}
        </Button>
      </div>

      <p className="booking-summary__max-hint">You can select up to 6 seats</p>
    </div>
  );
}
