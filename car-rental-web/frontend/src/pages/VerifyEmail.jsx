import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Mail, Sparkles, Loader2 } from 'lucide-react';
import { verifyEmailAPI } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmailAPI({ token });
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
      }
    };

    // Simulate network delay for UI effect
    setTimeout(verify, 1500);
  }, [token, navigate]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15),_transparent_60%)]" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] text-center">
        
        {status === 'loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mb-6" />
            <h2 className="text-2xl font-black text-white">Verifying Email...</h2>
            <p className="text-gray-400 mt-2">Please wait while we verify your luxury account.</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Email Verified!</h2>
            <p className="text-gray-400 mt-2">Your elite status is confirmed. Redirecting to login...</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Verification Failed</h2>
            <p className="text-gray-400 mt-2 mb-6">Invalid or expired token. Please request a new verification link.</p>
            <Link to="/login" className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition text-white font-medium">
              Back to Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
