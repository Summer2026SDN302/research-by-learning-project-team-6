import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Car, Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Cars', path: '/cars' },
  ];

  if (user) {
    links.push({ name: 'My Bookings', path: '/my-bookings' });
    if (user.role === 'admin') {
      links.push({ name: 'Dashboard', path: '/admin' });
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-wider">
          <Car className="w-7 h-7 text-yellow-400" />
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            LUXERIDE
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.path} to={l.path} className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors duration-300">
              {l.name}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-yellow-400 font-semibold flex items-center gap-1">
                <User className="w-4 h-4" /> {user.name}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 transition">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-5 py-2 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-yellow-500/30 transition-all">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden bg-black/90 backdrop-blur-xl px-6 py-6 border-t border-white/10 space-y-4">
            {links.map((l) => (
              <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className="block text-gray-300 hover:text-yellow-400 transition">
                {l.name}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout} className="text-red-400">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block text-yellow-400 font-bold">Sign In</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
