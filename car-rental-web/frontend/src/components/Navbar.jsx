import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Car, Menu, X, User, LogOut, Bell, Check } from 'lucide-react';
import { getNotificationsAPI, markNotificationReadAPI, markAllNotificationsReadAPI } from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const { data } = await getNotificationsAPI();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markNotificationReadAPI(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setShowNotifications(false);
      if (notif.relatedId) {
        navigate(`/bookings/${notif.relatedId}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadAPI();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

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
    if (user.role === 'seller') {
      links.push({ name: 'Dashboard', path: '/seller-dashboard' });
    }
    if (user.role === 'customer') {
      links.push({ name: 'Become a Partner', path: '/register-seller' });
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-wider">
          <Car className="w-7 h-7 text-yellow-400" />
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            LUXERIDE
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.path} to={l.path} className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors duration-300">
              {l.name}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-300 hover:text-yellow-400 transition p-1"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-black animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-4 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-3 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="px-4 pb-2 mb-2 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-yellow-400 hover:underline flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-gray-500">
                          No notifications found.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {notifications.map((notif) => (
                            <button
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full text-left px-4 py-3 hover:bg-white/5 transition flex flex-col gap-1 ${
                                !notif.isRead ? 'bg-yellow-400/5' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`text-xs font-bold ${!notif.isRead ? 'text-yellow-400' : 'text-white'}`}>
                                  {notif.title}
                                </span>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 leading-relaxed">
                                {notif.body}
                              </p>
                              <span className="text-[9px] text-gray-500">
                                {new Date(notif.createdAt).toLocaleTimeString()} · {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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

        <div className="flex items-center gap-4 md:hidden">
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-300 hover:text-yellow-400 transition p-1"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-black">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="text-white">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

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
