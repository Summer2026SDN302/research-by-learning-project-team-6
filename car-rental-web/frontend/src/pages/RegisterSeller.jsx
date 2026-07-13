import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitSellerRequestAPI, getMySellerRequestAPI } from '../services/api';
import toast from 'react-hot-toast';

const RegisterSeller = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    idCardImage: '',
    agreedToTerms: false
  });

  useEffect(() => {
    fetchMyRequest();
  }, []);

  const fetchMyRequest = async () => {
    try {
      const { data } = await getMySellerRequestAPI();
      setExistingRequest(data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch request status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, idCardImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      toast.error('You must agree to the terms and conditions');
      return;
    }
    
    setSubmitting(true);
    try {
      const { data } = await submitSellerRequestAPI(formData);
      toast.success('Request submitted successfully!');
      setExistingRequest(data.request);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.05),_transparent_60%)]" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-4">
            <Shield className="w-8 h-8 text-yellow-400" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">Become a Partner</h1>
          <p className="text-gray-400">Join our exclusive network of luxury fleet owners.</p>
        </div>

        {existingRequest && existingRequest.status !== 'Rejected' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-center">
            {existingRequest.status === 'Pending' && (
              <div className="flex flex-col items-center">
                <Clock className="w-16 h-16 text-yellow-400 mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-white mb-2">Request Under Review</h2>
                <p className="text-gray-400">Your application is currently being reviewed by our administration team. This usually takes 24-48 hours.</p>
              </div>
            )}
            {existingRequest.status === 'Approved' && (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h2>
                <p className="text-gray-400">Your request has been approved. You are now an official partner.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            {existingRequest?.status === 'Rejected' && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <h3 className="text-red-400 font-bold">Previous Request Rejected</h3>
                  <p className="text-sm text-red-400/80 mt-1">Reason: {existingRequest.adminNotes || 'Does not meet criteria.'}</p>
                  <p className="text-sm text-red-400/80 mt-1">You may submit a new application below with corrected information.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Legal Name</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-400 transition"
                    placeholder="Enter your exact name on ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Identity Document (ID Card / Passport)</label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-yellow-400/50 transition bg-black/20">
                  {formData.idCardImage ? (
                    <div className="flex flex-col items-center">
                      <img src={formData.idCardImage} alt="ID Preview" className="h-32 object-contain rounded-lg mb-4" />
                      <button type="button" onClick={() => setFormData({ ...formData, idCardImage: '' })} className="text-sm text-red-400 hover:underline">Remove Image</button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-2">Upload a clear photo of your ID</p>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleImageUpload}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400/10 file:text-yellow-400 hover:file:bg-yellow-400/20 cursor-pointer mx-auto max-w-[250px]"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="bg-black/20 border border-white/5 rounded-xl p-5 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-600 text-yellow-400 focus:ring-yellow-400/50 focus:ring-offset-gray-900 bg-gray-700"
                />
                <label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed">
                  I agree to the <span className="text-yellow-400 cursor-pointer hover:underline">Partner Terms of Service</span> and confirm that all information provided is accurate. I understand that false information may lead to permanent account suspension.
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !formData.idCardImage}
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegisterSeller;
