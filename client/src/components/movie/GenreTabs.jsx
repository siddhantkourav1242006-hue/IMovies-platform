import './GenreTabs.css';

const DEFAULT_GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-fi', 'Thriller'];

export default function GenreTabs({ genres = DEFAULT_GENRES, active, onChange }) {
  return (
    <div className="genre-tabs" role="tablist">
      {genres.map((genre) => (
        <button
          key={genre}
          className={`genre-tab ${active === genre ? 'genre-tab--active' : ''}`}
          onClick={() => onChange(genre)}
          role="tab"
          aria-selected={active === genre}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
