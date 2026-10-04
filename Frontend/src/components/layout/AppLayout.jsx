import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import { Outlet, useLocation } from 'react-router-dom'

function AppLayout() {
  const { pathname } = useLocation()
  const hasHero = pathname === '/'

  return (
    <div>
         <Navbar />
 
      <div id="main-content" className={`flex-1 ${hasHero ? '' : 'pt-20 md:pt-24'}`}>
        <Outlet />
      </div>
 
      <Footer />
    </div>
  )
}

export default AppLayout