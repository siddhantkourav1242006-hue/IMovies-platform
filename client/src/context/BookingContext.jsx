import { createContext, useState, useCallback, useReducer } from 'react';

export const BookingContext = createContext(null);

const initialState = {
  movie: null,
  show: null,
  selectedSeats: [],
  timerActive: false,
  timerEnd: null,
};

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_MOVIE':
      return { ...state, movie: action.payload };
    case 'SET_SHOW':
      return { ...state, show: action.payload };
    case 'SELECT_SEAT':
      if (state.selectedSeats.length >= 6) return state;
      if (state.selectedSeats.find((s) => s.id === action.payload.id)) return state;
      return { ...state, selectedSeats: [...state.selectedSeats, action.payload] };
    case 'DESELECT_SEAT':
      return {
        ...state,
        selectedSeats: state.selectedSeats.filter((s) => s.id !== action.payload),
      };
    case 'CLEAR_SEATS':
      return { ...state, selectedSeats: [] };
    case 'START_TIMER':
      return { ...state, timerActive: true, timerEnd: Date.now() + 5 * 60 * 1000 };
    case 'STOP_TIMER':
      return { ...state, timerActive: false, timerEnd: null };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const setMovie = useCallback((movie) => dispatch({ type: 'SET_MOVIE', payload: movie }), []);
  const setShow = useCallback((show) => dispatch({ type: 'SET_SHOW', payload: show }), []);
  const selectSeat = useCallback((seat) => dispatch({ type: 'SELECT_SEAT', payload: seat }), []);
  const deselectSeat = useCallback((seatId) => dispatch({ type: 'DESELECT_SEAT', payload: seatId }), []);
  const clearSeats = useCallback(() => dispatch({ type: 'CLEAR_SEATS' }), []);
  const startTimer = useCallback(() => dispatch({ type: 'START_TIMER' }), []);
  const stopTimer = useCallback(() => dispatch({ type: 'STOP_TIMER' }), []);
  const resetBooking = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        setMovie,
        setShow,
        selectSeat,
        deselectSeat,
        clearSeats,
        startTimer,
        stopTimer,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}
