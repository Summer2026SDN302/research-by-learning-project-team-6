import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
import { resetPasswordAPI } from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [focusField, setFocusField] = useState('');

  const passwordStrength = (() => {
    const score = [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length;
    if (!form.password) return { label: 'Enter password', color: 'bg-white/10', value: 0 };
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500/70', value: 25 };
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-400/70', value: 50 };
    if (score === 3) return { label: 'Strong', color: 'bg-amber-400/80', value: 75 };
    return { label: 'Elite', color: 'bg-emerald-400/80', value: 100 };
  })();

  const isPasswordValid = form.password.length >= 8;
  const isConfirmValid = form.confirmPassword && form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      toast.error('Email and reset code are required');
      return;
    }
    setLoading(true);
    try {
      await resetPasswordAPI({ email, code, newPassword: form.password });
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400">Invalid Request</h2>
          <p className="text-gray-400 mt-2">Email is missing. Please restart the password reset process.</p>
          <button onClick={() => navigate('/forgot-password')} className="mt-4 px-6 py-2 bg-yellow-400 text-black rounded-lg font-bold">
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.2),_transparent_50%)]" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl font-black text-white">New Password</h2>
          <p className="text-gray-400 mt-2">Enter a new password for your luxury account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <span className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-sm text-yellow-200">
              Resetting for: {email}
            </span>
          </div>

          <div className={`relative rounded-2xl border ${focusField === 'code' ? 'border-yellow-400/60 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]' : 'border-white/10'} bg-white/5 transition`}>
            <label className={`absolute left-12 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-gray-500 transition-all ${code ? 'top-3 text-[10px] text-yellow-200' : ''}`}>6-Digit Code</label>
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onFocus={() => setFocusField('code')}
              onBlur={() => setFocusField('')}
              className="w-full bg-transparent rounded-2xl pl-12 pr-4 py-5 text-white focus:outline-none tracking-[0.5em] text-lg font-mono"
              required
              placeholder={focusField === 'code' ? '------' : ''}
            />
          </div>

          <div className={`relative rounded-2xl border ${focusField === 'password' ? 'border-yellow-400/60 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]' : 'border-white/10'} bg-white/5 transition`}>
            <label className={`absolute left-12 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-gray-500 transition-all ${form.password ? 'top-3 text-[10px] text-yellow-200' : ''}`}>New Password</label>
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField('')}
              className="w-full bg-transparent rounded-2xl pl-12 pr-12 py-5 text-white focus:outline-none"
              required
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Password strength</span>
              <span className="text-yellow-200">{passwordStrength.label}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full ${passwordStrength.color}`} style={{ width: `${passwordStrength.value}%` }} />
            </div>
          </div>

          <div className={`relative rounded-2xl border ${focusField === 'confirmPassword' ? 'border-yellow-400/60 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]' : 'border-white/10'} bg-white/5 transition`}>
            <label className={`absolute left-12 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-gray-500 transition-all ${form.confirmPassword ? 'top-3 text-[10px] text-yellow-200' : ''}`}>Confirm Password</label>
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showConfirmPw ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              onFocus={() => setFocusField('confirmPassword')}
              onBlur={() => setFocusField('')}
              className="w-full bg-transparent rounded-2xl pl-12 pr-12 py-5 text-white focus:outline-none"
              required
            />
            <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              {showConfirmPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {isConfirmValid && <CheckCircle2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />}
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || !isPasswordValid || !isConfirmValid || code.length !== 6}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-4 rounded-2xl font-bold text-lg shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
