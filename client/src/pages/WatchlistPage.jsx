import { useState, useEffect } from 'react';
import favoriteService from '../services/favoriteService';
import MovieGrid from '../components/movie/MovieGrid';
import './WatchlistPage.css';

export default function WatchlistPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    favoriteService
      .getFavorites()
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data || [];
        const movies = list.map((item) => item.movieId).filter(Boolean);
        setFavorites(movies);
      })
      .catch((err) => {
        console.error('Failed to load watchlist:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="watchlist-page">
      <div className="watchlist-container">
        <h1 className="watchlist-title">My Watchlist</h1>
        <p className="watchlist-desc">
          Movies you've saved to keep track of upcoming showtimes.
        </p>

        <MovieGrid
          movies={favorites}
          loading={loading}
          emptyTitle="Your watchlist is empty"
          emptyMessage="Browse movies and click '+ Add to Watchlist' to save titles here."
        />
      </div>
    </div>
  );
}
