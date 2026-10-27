import './SeatLegend.css';

export default function SeatLegend() {
  return (
    <div className="seat-legend">
      <div className="seat-legend__item">
        <div className="seat-legend__swatch seat-legend__swatch--available" />
        <span>Available</span>
      </div>
      <div className="seat-legend__item">
        <div className="seat-legend__swatch seat-legend__swatch--selected" />
        <span>Selected</span>
      </div>
      <div className="seat-legend__item">
        <div className="seat-legend__swatch seat-legend__swatch--booked" />
        <span>Booked</span>
      </div>
      <div className="seat-legend__item">
        <div className="seat-legend__swatch seat-legend__swatch--locked" />
        <span>Locked</span>
      </div>
    </div>
  );
}
