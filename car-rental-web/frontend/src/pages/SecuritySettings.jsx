import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, AlertTriangle, LogOut, Link as LinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePasswordAPI, logoutAllDevicesAPI } from '../services/api';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Please login to access settings</h2>
          <Link to="/login" className="text-yellow-400 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePasswordAPI(passwords);
      toast.success('Password changed successfully!');
      setPasswords({ current: '', new: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to log out from all devices? This will invalidate all current sessions.')) {
      try {
        await logoutAllDevicesAPI();
        toast.success('Logged out from all devices');
        logout();
        navigate('/login');
      } catch (err) {
        toast.error('Failed to logout from all devices');
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.05),_transparent_60%)]" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Security Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your account security and active sessions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Change Password Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-white">Change Password</h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400/50 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400/50 transition"
                  required
                />
              </div>
              <button type="submit" disabled={loading || !passwords.current || !passwords.new}
                className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>

          {/* Session Management Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="space-y-8">
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <LinkIcon className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-bold text-white">Active Sessions</h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">You are currently logged in on this device. If you notice any suspicious activity, you can force logout from all devices instantly.</p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                  <div>
                    <h3 className="text-red-200 font-bold mb-1">Danger Zone</h3>
                    <p className="text-red-400/80 text-sm mb-4">This action will sign you out of all web browsers and mobile apps where you are currently logged in.</p>
                    <button onClick={handleLogoutAll}
                      className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition">
                      <LogOut className="w-4 h-4" /> Terminate All Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Logout (Current Device) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white mb-1">Sign Out</h3>
                <p className="text-xs text-gray-400">Sign out from this current device only.</p>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
                Sign Out
              </button>
            </div>
            
            {/* Quick nav back */}
            <Link to="/admin" className="inline-block mt-4 text-sm text-yellow-400 hover:underline">
              ← Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
