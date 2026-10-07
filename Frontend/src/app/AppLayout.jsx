import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useWatchlist } from '../features/watchlist/hooks/useWatchlist.js';

const AppLayout = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { fetchWatchlist, resetWatchlist } = useWatchlist();

  useEffect(() => {
    if (user) {
      fetchWatchlist();
      return;
    }

    resetWatchlist();
  }, [user, fetchWatchlist, resetWatchlist]);

  const contentSpacing =
    pathname === '/'
      ? ''
      : pathname === '/genres' || pathname === '/search' || pathname === '/favorites' || pathname === '/watchlist' || pathname === '/history' || pathname === '/profile' || pathname === '/admin'
        ? 'pt-16'
        : '';

  return (
    <div>
      <Navbar />
      <div id="main-content" className={contentSpacing}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
