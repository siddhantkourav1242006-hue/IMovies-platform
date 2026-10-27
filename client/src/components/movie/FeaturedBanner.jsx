import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import './FeaturedBanner.css';

const POSTER_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#1b262c',
  '#2c3333', '#2b2d42', '#3d405b', '#264653',
];

export default function FeaturedBanner({ movie, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="featured-banner featured-banner--loading">
        <div className="featured-banner__inner">
          <div className="featured-banner__content">
            <Skeleton variant="text" width="80px" style={{ marginBottom: 16 }} />
            <Skeleton variant="title" width="300px" height="40px" style={{ marginBottom: 12 }} />
            <Skeleton variant="text" width="200px" style={{ marginBottom: 12 }} />
            <Skeleton variant="text" width="400px" style={{ marginBottom: 8 }} />
            <Skeleton variant="text" width="360px" style={{ marginBottom: 24 }} />
            <Skeleton variant="rect" width="200px" height="40px" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const bgColor = POSTER_COLORS[(movie.title || '').length % POSTER_COLORS.length];

  return (
    <section className="featured-banner">
      <div className="featured-banner__inner">
        <div className="featured-banner__content">
          <span className="featured-banner__tag">Featured</span>
          <h1 className="featured-banner__title">{movie.title}</h1>
          <div className="featured-banner__meta">
            {movie.rating && <span>{movie.rating} rating</span>}
            {movie.duration && <span>{movie.duration} min</span>}
            {movie.language && <span>{movie.language}</span>}
          </div>
          {movie.synopsis && (
            <p className="featured-banner__synopsis">{movie.synopsis}</p>
          )}
          <div className="featured-banner__actions">
            <Button onClick={() => navigate(`/movies/${movie.slug}`)}>
              Book tickets
            </Button>
            <Button variant="ghost" style={{ color: 'rgba(255,255,255,0.7)' }} onClick={() => navigate('/movies')}>
              Browse all movies
            </Button>
          </div>
        </div>
        <div className="featured-banner__poster">
          <div className="featured-banner__poster-inner" style={{ backgroundColor: bgColor }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <polygon points="40,8 68,22 68,58 40,72 12,58 12,22" fill="white" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
