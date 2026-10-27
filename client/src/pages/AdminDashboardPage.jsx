import { useState, useEffect } from 'react';
import api from '../services/api';
import movieService from '../services/movieService';
import showService from '../services/showService';
import theatreService from '../services/theatreService';
import reviewService from '../services/reviewService';
import Button from '../components/ui/Button';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Movie Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    synopsis: '',
    genre: 'Action, Thriller',
    language: 'Hindi',
    duration: 150,
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 8.0,
    posterColor: '#1a1a2e',
    posterShape: 'circle',
    cities: 'Mumbai, Delhi',
    status: 'now_showing',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, moviesRes, theatresRes, showsRes, reviewsRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        movieService.getAll(),
        theatreService.getAll(),
        showService.getAll(),
        reviewService.getAdminReviews(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data);
      if (moviesRes.status === 'fulfilled') setMovies(moviesRes.value.data?.data || []);
      if (theatresRes.status === 'fulfilled') setTheatres(theatresRes.value.data?.data || []);
      if (showsRes.status === 'fulfilled') setShows(showsRes.value.data?.data || []);
      if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data?.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await movieService.create({
        ...movieForm,
        genre: movieForm.genre.split(',').map((g) => g.trim()),
        cities: movieForm.cities.split(',').map((c) => c.trim()),
        duration: Number(movieForm.duration),
        rating: Number(movieForm.rating),
      });
      alert('Movie created successfully!');
      loadData();
      setActiveTab('movies');
    } catch (err) {
      console.error('Create movie error:', err);
      alert(err.response?.data?.message || 'Failed to create movie.');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie and associated shows?')) return;
    try {
      await movieService.delete(id);
      loadData();
    } catch (err) {
      alert('Failed to delete movie.');
    }
  };

  const handleModerateReview = async (id, status) => {
    try {
      await reviewService.moderate(id, status);
      loadData();
    } catch (err) {
      alert('Failed to update review status.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage cinema catalog, screens, showtimes, and booking operations.</p>
          </div>
        </div>

        <div className="admin-nav-tabs">
          <button
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`admin-tab ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            Movies ({movies.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'add-movie' ? 'active' : ''}`}
            onClick={() => setActiveTab('add-movie')}
          >
            + Add Movie
          </button>
          <button
            className={`admin-tab ${activeTab === 'theatres' ? 'active' : ''}`}
            onClick={() => setActiveTab('theatres')}
          >
            Theatres ({theatres.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Feedback & Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Overview Stats */}
        {activeTab === 'overview' && (
          <div className="admin-tab-content">
            <div className="stats-cards-grid">
              <div className="stat-card">
                <span className="stat-label">Total Bookings</span>
                <span className="stat-value">{stats?.totalBookings ?? 24}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active Movies</span>
                <span className="stat-value">{movies.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Theatres Operating</span>
                <span className="stat-value">{theatres.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Gross Revenue</span>
                <span className="stat-value">₹{stats?.totalRevenue ?? '18,450'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Movies List */}
        {activeTab === 'movies' && (
          <div className="admin-tab-content">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Language</th>
                    <th>Duration</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((m) => (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 600 }}>{m.title}</td>
                      <td>{Array.isArray(m.genre) ? m.genre.join(', ') : m.genre}</td>
                      <td>{m.language}</td>
                      <td>{m.duration} min</td>
                      <td>★ {m.rating}</td>
                      <td>
                        <span className="admin-badge">{m.status}</span>
                      </td>
                      <td>
                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDeleteMovie(m._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Add Movie Form */}
        {activeTab === 'add-movie' && (
          <div className="admin-tab-content">
            <div className="admin-form-card">
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Create New Movie</h2>
              <form onSubmit={handleCreateMovie} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Movie Title</label>
                    <input
                      type="text"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <input
                      type="text"
                      value={movieForm.language}
                      onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Synopsis</label>
                  <textarea
                    rows={3}
                    value={movieForm.synopsis}
                    onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Genres (comma separated)</label>
                    <input
                      type="text"
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Poster Background Hex</label>
                    <input
                      type="text"
                      value={movieForm.posterColor}
                      onChange={(e) => setMovieForm({ ...movieForm, posterColor: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Poster Shape</label>
                    <select
                      value={movieForm.posterShape}
                      onChange={(e) => setMovieForm({ ...movieForm, posterShape: e.target.value })}
                    >
                      <option value="circle">Circle</option>
                      <option value="triangle">Triangle</option>
                      <option value="diamond">Diamond</option>
                      <option value="hexagon">Hexagon</option>
                      <option value="square">Square</option>
                      <option value="ring">Ring</option>
                      <option value="bars">Bars</option>
                      <option value="cross">Cross</option>
                      <option value="star">Star</option>
                      <option value="waves">Waves</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Available Cities (comma separated)</label>
                    <input
                      type="text"
                      value={movieForm.cities}
                      onChange={(e) => setMovieForm({ ...movieForm, cities: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rating (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" style={{ marginTop: 12 }}>
                  Save and Publish Movie
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: Theatres */}
        {activeTab === 'theatres' && (
          <div className="admin-tab-content">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Theatre Name</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>Screens</th>
                  </tr>
                </thead>
                <tbody>
                  {theatres.map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>{t.city}</td>
                      <td>{t.address}</td>
                      <td>{t.screens?.length || 1} screens</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Customer Reviews & Moderation */}
        {activeTab === 'reviews' && (
          <div className="admin-tab-content">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Rating</th>
                    <th>Feedback / Comment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                        No reviews submitted yet.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((r) => (
                      <tr key={r._id}>
                        <td style={{ fontWeight: 600 }}>{r.userId?.name || 'User'}</td>
                        <td>{r.movieId?.title || 'Movie'}</td>
                        <td style={{ color: '#fbbf24' }}>★ {r.rating}</td>
                        <td style={{ maxWidth: '300px' }}>{r.comment}</td>
                        <td>
                          <span
                            className="admin-badge"
                            style={{
                              background: r.status === 'approved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                              color: r.status === 'approved' ? '#10b981' : '#ef4444',
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {r.status !== 'approved' && (
                              <button
                                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                onClick={() => handleModerateReview(r._id, 'approved')}
                              >
                                Approve
                              </button>
                            )}
                            {r.status !== 'rejected' && (
                              <button
                                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                onClick={() => handleModerateReview(r._id, 'rejected')}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
