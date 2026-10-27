import './ShowtimeList.css';

export default function ShowtimeList({ theatres, selectedShowId, onSelect }) {
  if (!theatres || theatres.length === 0) {
    return (
      <div className="showtime-list">
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-lg) 0', textAlign: 'center' }}>
          No shows available for this date.
        </p>
      </div>
    );
  }

  return (
    <div className="showtime-list">
      {theatres.map((theatre) => (
        <div key={theatre._id} className="showtime-theatre">
          <h4 className="showtime-theatre__name">{theatre.name}</h4>
          <p className="showtime-theatre__address">{theatre.address}</p>
          <div className="showtime-theatre__times">
            {theatre.shows.map((show) => (
              <button
                key={show._id}
                className={`showtime-btn ${
                  selectedShowId === show._id ? 'showtime-btn--selected' : ''
                } ${show.soldOut ? 'showtime-btn--sold-out' : ''}`}
                onClick={() => !show.soldOut && onSelect(show)}
                disabled={show.soldOut}
              >
                {show.time}
                <span className="showtime-btn__price">₹{show.price}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
