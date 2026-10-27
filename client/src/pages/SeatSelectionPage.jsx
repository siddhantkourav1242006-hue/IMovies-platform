import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import showService from '../services/showService';
import seatService from '../services/seatService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useBooking } from '../hooks/useBooking';
import SeatMap from '../components/booking/SeatMap';
import SeatLegend from '../components/booking/SeatLegend';
import BookingSummary from '../components/booking/BookingSummary';
import CountdownTimer from '../components/booking/CountdownTimer';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import './SeatSelectionPage.css';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const { setMovie, setShow } = useBooking();

  const [show, setShowState] = useState(null);
  const [movie, setMovieState] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lockLoading, setLockLoading] = useState(false);

  // 5-min hold countdown end timestamp
  const [holdEndTime, setHoldEndTime] = useState(null);

  // Fetch show details and initial seats
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      showService.getById(showId),
      seatService.getSeatMap(showId),
    ])
      .then(([showRes, seatsRes]) => {
        if (!isMounted) return;
        const sData = showRes.data?.data || showRes.data;
        setShowState(sData);
        setMovieState(sData.movieId);
        setMovie(sData.movieId);
        setShow(sData);

        const rawSeats = seatsRes.data?.data || [];
        setSeats(rawSeats);
      })
      .catch((err) => {
        console.error('Failed to load show/seats:', err);
        if (isMounted) setError('Unable to load seat layout. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showId, setMovie, setShow]);

  // Join Socket.io room for real-time seat lock broadcasts
  useEffect(() => {
    if (!socket || !showId) return;

    socket.emit('join:show', showId);

    const handleSeatsLocked = (payload) => {
      if (payload.showId === showId) {
        setSeats((prev) =>
          prev.map((seat) => {
            const isTarget = payload.seats?.some(
              (s) => s.row === seat.row && s.number === seat.number
            );
            if (isTarget && payload.lockedBy !== user?._id) {
              return { ...seat, status: 'locked' };
            }
            return seat;
          })
        );
      }
    };

    const handleSeatsUnlocked = (payload) => {
      if (payload.showId === showId) {
        setSeats((prev) =>
          prev.map((seat) => {
            const isTarget = payload.seats?.some(
              (s) => s.row === seat.row && s.number === seat.number
            );
            if (isTarget) {
              return { ...seat, status: 'available' };
            }
            return seat;
          })
        );
      }
    };

    const handleSeatsBooked = (payload) => {
      if (payload.showId === showId) {
        setSeats((prev) =>
          prev.map((seat) => {
            const isTarget = payload.seats?.some(
              (s) => s.row === seat.row && s.number === seat.number
            );
            if (isTarget) {
              return { ...seat, status: 'booked' };
            }
            return seat;
          })
        );
      }
    };

    socket.on('seats:locked', handleSeatsLocked);
    socket.on('seats:unlocked', handleSeatsUnlocked);
    socket.on('seats:booked', handleSeatsBooked);

    return () => {
      socket.emit('leave:show', showId);
      socket.off('seats:locked', handleSeatsLocked);
      socket.off('seats:unlocked', handleSeatsUnlocked);
      socket.off('seats:booked', handleSeatsBooked);
    };
  }, [socket, showId, user]);

  // Transform backend seat flat list to SeatMap layout { rows: [...] }
  const seatLayout = useMemo(() => {
    if (!seats || seats.length === 0) return null;

    const rowMap = {};
    const pricing = show?.pricing || { standard: 250, premium: 350, vip: 500 };

    seats.forEach((s) => {
      if (!rowMap[s.row]) rowMap[s.row] = [];
      const price = pricing[s.type] || pricing.standard;
      rowMap[s.row].push({
        id: `${s.row}${s.number}`,
        row: s.row,
        number: s.number,
        type: s.type,
        category: s.type,
        price,
        status: s.status,
        rawId: s._id,
      });
    });

    const sortedRows = Object.keys(rowMap).sort().reverse();

    return {
      rows: sortedRows.map((label) => ({
        label,
        seats: rowMap[label].sort((a, b) => a.number - b.number),
      })),
    };
  }, [seats, show]);

  // Handle seat selection with 5-minute hold start
  const handleSelectSeat = useCallback((seat) => {
    if (!holdEndTime) {
      setHoldEndTime(Date.now() + 5 * 60 * 1000);
    }
    setSelectedSeats((prev) => [
      ...prev,
      {
        ...seat,
        label: `${seat.row}${seat.number}`,
      },
    ]);
  }, [holdEndTime]);

  const handleDeselectSeat = useCallback((seatId) => {
    setSelectedSeats((prev) => {
      const updated = prev.filter((s) => s.id !== seatId);
      if (updated.length === 0) {
        setHoldEndTime(null);
      }
      return updated;
    });
  }, []);

  const handleTimerExpire = useCallback(() => {
    alert('Your seat hold has expired. Please select your seats again.');
    setSelectedSeats([]);
    setHoldEndTime(null);
  }, []);

  // Proceed to checkout: lock seats on backend & route to /checkout
  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) return;

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/booking/${showId}`));
      return;
    }

    try {
      setLockLoading(true);
      const seatsToLock = selectedSeats.map((s) => ({
        row: s.row,
        number: s.number,
      }));

      await seatService.lockSeats(showId, seatsToLock);

      // Store selection in session storage for checkout step
      sessionStorage.setItem('currentBooking', JSON.stringify({
        showId,
        show,
        movie,
        selectedSeats,
        totalAmount: selectedSeats.reduce((sum, s) => sum + s.price, 0),
      }));

      navigate('/checkout');
    } catch (err) {
      console.error('Lock seats failed:', err);
      alert(err.response?.data?.message || 'Some seats could not be held. Please choose other seats.');
    } finally {
      setLockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="seat-page-container" style={{ padding: '48px 24px' }}>
        <Skeleton variant="title" width="280px" style={{ marginBottom: 24 }} />
        <Skeleton variant="card" height="380px" />
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="seat-page-container" style={{ padding: '64px 24px' }}>
        <ErrorState
          message={error || 'Show details could not be loaded.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="seat-selection-page">
      <div className="seat-page-header">
        <div className="seat-page-container">
          <div className="header-meta">
            <h1 className="show-movie-title">{movie?.title}</h1>
            <p className="show-theatre-line">
              {show.theatreId?.name || 'Cinema'} • Screen: {show.screenName} • {show.time}
            </p>
          </div>

          {holdEndTime && (
            <CountdownTimer endTime={holdEndTime} onExpire={handleTimerExpire} />
          )}
        </div>
      </div>

      <div className="seat-page-container seat-layout-split">
        {/* Left: Seat Map */}
        <div className="seat-map-panel">
          <SeatMap
            layout={seatLayout}
            selectedSeats={selectedSeats}
            onSelect={handleSelectSeat}
            onDeselect={handleDeselectSeat}
            maxSeats={6}
          />

          <SeatLegend />
        </div>

        {/* Right: Booking Summary */}
        <div className="booking-summary-panel">
          <BookingSummary
            movie={movie}
            show={{
              theatre: show.theatreId,
              time: show.time,
            }}
            selectedSeats={selectedSeats}
            onProceed={handleProceedToPayment}
            loading={lockLoading}
          />
        </div>
      </div>
    </div>
  );
}
