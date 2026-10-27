import { createContext, useState, useCallback } from 'react';

export const CityContext = createContext(null);

const DEFAULT_CITY = 'Mumbai';

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
];

export function CityProvider({ children }) {
  const [city, setCity] = useState(() => {
    return localStorage.getItem('city') || DEFAULT_CITY;
  });

  const changeCity = useCallback((newCity) => {
    setCity(newCity);
    localStorage.setItem('city', newCity);
  }, []);

  return (
    <CityContext.Provider value={{ city, cities: CITIES, changeCity }}>
      {children}
    </CityContext.Provider>
  );
}
