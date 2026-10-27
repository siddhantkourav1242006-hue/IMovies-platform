import { useState, useEffect } from 'react';
import movieService from '../services/movieService';
import MovieGrid from '../components/movie/MovieGrid';
import GenreTabs from '../components/movie/GenreTabs';
import './MoviesPage.css';

const LANGUAGES = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('All');
  const [language, setLanguage] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = {};
    if (genre !== 'All') params.genre = genre;
    if (language !== 'All') params.language = language;
    if (search.trim()) params.search = search.trim();

    movieService
      .getAll(params)
      .then((res) => {
        if (isMounted) setMovies(res.data?.data || []);
      })
      .catch((err) => {
        console.error('Failed to load movies:', err);
        if (isMounted) setMovies([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [genre, language, search]);

  return (
    <div className="movies-page">
      <div className="movies-page-container">
        <header className="movies-page-header">
          <h1 className="movies-page-title">All Movies</h1>
          <p className="movies-page-desc">
            Explore now-showing blockbusters and upcoming theatrical releases.
          </p>

          <div className="movies-controls-bar">
            <GenreTabs active={genre} onChange={setGenre} />
            <div className="movies-filter-tools">
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="movies-search-input"
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="movies-lang-select"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l === 'All' ? 'All languages' : l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <MovieGrid
          movies={movies}
          loading={loading}
          emptyTitle="No movies found"
          emptyMessage="No movie matches the current filters. Clear the search or choose another genre."
        />
      </div>
    </div>
  );
}
