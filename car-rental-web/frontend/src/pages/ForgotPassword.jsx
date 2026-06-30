import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPasswordAPI } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordAPI({ email });
      toast.success('Recovery code sent!');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.2),_transparent_50%)]" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
        
        <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white transition text-sm mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
        </Link>

        <>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white">Reset Password</h2>
            <p className="text-gray-400 mt-2">Enter your email to receive recovery instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`relative rounded-2xl border ${isFocused ? 'border-yellow-400/60 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]' : 'border-white/10'} bg-white/5 transition`}>
              <label className={`absolute left-12 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-gray-500 transition-all ${email ? 'top-3 text-[10px] text-yellow-200' : ''}`}>Email Address</label>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-transparent rounded-2xl pl-12 pr-4 py-5 text-white focus:outline-none"
                required
              />
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || !email}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-4 rounded-2xl font-bold text-lg shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition disabled:opacity-50">
              {loading ? 'Processing...' : 'Send Instructions'}
            </motion.button>
          </form>
        </>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
