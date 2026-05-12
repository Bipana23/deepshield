import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Navbar     from './components/Navbar';
import Footer     from './components/Footer';
import Home       from './pages/Home';
import About      from './pages/About';
import Contact    from './pages/Contact';
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import Scan       from './pages/Scan';
import History    from './pages/History';
import UserGuide  from './pages/UserGuide';
import './index.css';

function Layout() {
  const location = useLocation();
  const noNav = ['/login', '/signup'].includes(location.pathname);



  return (
    <>
      {!noNav && <Navbar />}
      <main>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/about"      element={<About />}     />
          <Route path="/contact"    element={<Contact />}   />
          <Route path="/login"      element={<Login />}     />
          <Route path="/signup"     element={<Signup />}    />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/scan"       element={
            <ProtectedRoute><Scan /></ProtectedRoute>
          } />
          <Route path="/history"    element={
            <ProtectedRoute><History /></ProtectedRoute>
          } />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!noNav && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}