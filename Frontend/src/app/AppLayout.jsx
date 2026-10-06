import { useLocation, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

const AppLayout = () => {
  const { pathname } = useLocation();
  const contentSpacing =
    pathname === '/'
      ? ''
      : pathname === '/genres' || pathname === '/search' || pathname === '/favorites' || pathname === '/history'
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
