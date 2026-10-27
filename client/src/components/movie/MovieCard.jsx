import { useNavigate } from 'react-router-dom';
import './MovieCard.css';

// Deterministic color + shape from movie title
const POSTER_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#1b262c',
  '#2c3333', '#2b2d42', '#3d405b', '#264653',
  '#212529', '#343a40', '#1d3557', '#2d3436',
];

const SHAPES = ['circle', 'triangle', 'diamond', 'hexagon', 'square-rotated', 'cross'];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function PosterShape({ shape, size = 80 }) {
  switch (shape) {
    case 'circle':
      return (
        <svg className="poster-shape" width={size} height={size} viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" fill="white" />
        </svg>
      );
    case 'triangle':
      return (
        <svg className="poster-shape" width={size} height={size} viewBox="0 0 80 80">
          <polygon points="40,12 68,64 12,64" fill="white" />
        </svg>
      );
    case 'diamond':
      return (
        <svg className="poster-shape" width={size} height={size} viewBox="0 0 80 80">
          <polygon points="40,8 72,40 40,72 8,40" fill="white" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg className="poster-shape" width={size} height={size} viewBox="0 0 80 80">
          <polygon points="40,8 68,22 68,58 40,72 12,58 12,22" fill="white" />
        </svg>
      );
    case 'square-rotated':
      return (
        <svg className="poster-shape" width={size} height={size} viewBox="0 0 80 80">
          <rect x="20" y="20" width="40" height="40" fill="white" transform="rotate(45 40 40)" />
        </svg>
      );
    case 'cross':
      return (
        <svg className="poster-shape" width={size} height={size} viewBox="0 0 80 80">
          <rect x="30" y="10" width="20" height="60" fill="white" rx="2" />
          <rect x="10" y="30" width="60" height="20" fill="white" rx="2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const hash = hashCode(movie.title || 'movie');
  const bgColor = POSTER_COLORS[hash % POSTER_COLORS.length];
  const shape = SHAPES[hash % SHAPES.length];

  const handleClick = () => {
    navigate(`/movies/${movie.slug}`);
  };

  const handleBook = (e) => {
    e.stopPropagation();
    navigate(`/movies/${movie.slug}`);
  };

  return (
    <div className="movie-card" onClick={handleClick} tabIndex={0} role="link" aria-label={`View ${movie.title}`}>
      <div className="movie-card__poster">
        <div className="movie-card__poster-inner" style={{ backgroundColor: bgColor }}>
          <PosterShape shape={shape} />
          <span className="movie-card__poster-title">{movie.title}</span>
        </div>
      </div>
      <div className="movie-card__info">
        <h3 className="movie-card__title">{movie.title}</h3>
        <div className="movie-card__meta">
          {movie.language && <span>{movie.language}</span>}
          {movie.duration && <span>{movie.duration} min</span>}
          {movie.rating && (
            <span className="movie-card__rating">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1l1.545 3.13L11 4.635 8.5 7.07l.59 3.43L6 8.885 2.91 10.5l.59-3.43L1 4.635l3.455-.505L6 1z" />
              </svg>
              {movie.rating}
            </span>
          )}
        </div>
      </div>
      <div className="movie-card__actions">
        <button className="movie-card__book-btn" onClick={handleBook}>
          Book
        </button>
      </div>
    </div>
  );
}
