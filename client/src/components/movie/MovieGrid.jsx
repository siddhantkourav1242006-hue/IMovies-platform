import MovieCard from './MovieCard';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import './MovieGrid.css';

export default function MovieGrid({ movies, loading, emptyTitle, emptyMessage }) {
  if (loading) {
    return (
      <div className="movie-grid--loading">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="movie-grid__skeleton-card">
            <Skeleton variant="card" />
            <Skeleton variant="title" />
            <Skeleton variant="text" width="80%" />
          </div>
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No movies found'}
        message={emptyMessage || 'Try adjusting your filters or check back later.'}
      />
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie._id || movie.slug} movie={movie} />
      ))}
    </div>
  );
}
