import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-columns">
          <div className="footer-column brand-column">
            <div className="footer-logo">
              I<span className="logo-dot">●</span>Movies
            </div>
            <p className="footer-desc">
              Calm, content-first cinema ticketing. Browse now-showing titles, pick live seats, and receive verified digital tickets in under a minute.
            </p>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Cinemas</h4>
            <ul className="footer-links">
              <li><Link to="/movies">PVR ICON</Link></li>
              <li><Link to="/movies">INOX Megaplex</Link></li>
              <li><Link to="/movies">Cinepolis IMAX</Link></li>
              <li><Link to="/movies">Miraj Cinemas</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><Link to="/my-tickets">My Tickets</Link></li>
              <li><a href="#help">Ticket Cancellation</a></li>
              <li><a href="#reschedule">Reschedule Policy</a></li>
              <li><a href="#contact">Contact Support</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#security">Security & Data</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} IMovies Entertainment Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
