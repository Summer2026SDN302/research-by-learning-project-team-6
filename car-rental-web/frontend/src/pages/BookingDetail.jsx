import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, CreditCard, ChevronLeft, Download, Hash, Phone, Mail, User, Clock, ShieldCheck, CalendarPlus, XCircle, Trash2 } from 'lucide-react';
import { getBookingByIdAPI, cancelBookingAPI, extendBookingAPI, deleteBookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [newReturnDate, setNewReturnDate] = useState('');
  const [extending, setExtending] = useState(false);

  const backPath = user?.role === 'admin' ? '/admin' : '/my-bookings';

  const fetchBookingDetail = async () => {
    try {
      console.log('Fetching booking:', id, 'user:', user?._id);
      const { data } = await getBookingByIdAPI(id, user?._id);
      console.log('Booking data received:', data);
      setBooking(data);
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not load booking details.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchBookingDetail();
    }
  }, [id, user]);

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đặt xe này không?")) return;
    try {
      await cancelBookingAPI(id, user?._id);
      toast.success("Hủy đặt xe thành công!");
      fetchBookingDetail();
    } catch (err) {
      toast.error(err.message || "Không thể hủy đặt xe.");
    }
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    if (!newReturnDate) {
      toast.error("Vui lòng chọn ngày trả xe mới.");
      return;
    }
    if (new Date(newReturnDate) <= new Date(booking.returnDate)) {
      toast.error("Ngày trả xe mới phải sau ngày trả xe hiện tại.");
      return;
    }
    setExtending(true);
    try {
      await extendBookingAPI(id, newReturnDate, user?._id);
      toast.success("Đã gia hạn đặt xe thành công!");
      setShowExtendModal(false);
      fetchBookingDetail();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Không thể gia hạn đặt xe.");
    } finally {
      setExtending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch sử đặt xe này? Hành động này không thể hoàn tác.")) return;
    try {
      await deleteBookingAPI(id, user?._id);
      toast.success("Đã xóa lịch sử đặt xe!");
      navigate(backPath);
    } catch (err) {
      toast.error(err.message || "Không thể xóa.");
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-32 text-center text-white px-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <Hash className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{error || 'Booking Not Found'}</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">The requested booking ID could not be loaded. It may not exist or you might not have the necessary permissions.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate(backPath)} className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:shadow-lg hover:shadow-yellow-400/20 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const days = Math.max(1, Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)));

  return (
    <div className="pt-24 pb-16 min-h-screen bg-primary">
      <div className="max-w-4xl mx-auto px-6">
        <button onClick={() => navigate(backPath)} className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6">
          <ChevronLeft className="w-5 h-5" /> Back to List
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <p className="text-xs text-yellow-500 font-bold uppercase tracking-[0.2em]">Rental Ticket</p>
                   <div className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      booking.status === 'Approved' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 
                      booking.status === 'Pending' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                      'border-red-500/50 text-red-400 bg-red-500/10'
                   }`}>
                      {booking.status}
                   </div>
                </div>
                <h1 className="text-3xl font-black">Booking Confirmation</h1>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {(booking.status === 'Pending' || booking.status === 'Approved') && (
                <button 
                  onClick={handleCancel} 
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition shadow-lg"
                >
                  <XCircle className="w-4 h-4 text-red-400 hover:text-white" /> Hủy Đặt Xe
                </button>
              )}
              
              {/* Nút Gia Hạn: hiện với cả Pending và Approved */}
              {(booking.status === 'Pending' || booking.status === 'Approved') && (
                <button 
                  onClick={() => {
                    setNewReturnDate('');
                    setShowExtendModal(true);
                  }} 
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition shadow-lg"
                >
                  <CalendarPlus className="w-4 h-4" /> Gia Hạn
                </button>
              )}

              {/* Nút Xóa Lịch Sử: chỉ hiện với Completed và Cancelled */}
              {(booking.status === 'Completed' || booking.status === 'Cancelled') && (
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white border border-white/10 hover:border-red-600 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition shadow-lg"
                >
                  <Trash2 className="w-4 h-4" /> Xóa Lịch Sử
                </button>
              )}

              <button onClick={() => window.print()} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition shadow-lg">
                <Download className="w-4 h-4 text-yellow-400" /> Print Ticket
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Car Info */}
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                <img src={booking.car?.imageUrl} alt={booking.car?.name} className="w-32 h-24 object-cover rounded-xl" />
                <div>
                  <h3 className="text-xl font-bold">{booking.car?.brand} {booking.car?.model}</h3>
                  <p className="text-sm text-gray-400">{booking.car?.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                     <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded uppercase font-bold">{booking.car?.type}</span>
                     <span className="text-xs text-gray-500">Year: {booking.car?.year}</span>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">Guest Information</h4>
                 <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div className="flex items-start gap-3">
                       <User className="w-4 h-4 text-accent mt-0.5" />
                       <div><p className="text-gray-500 text-[10px] uppercase font-bold">Full Name</p><p>{booking.customerName}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                       <Phone className="w-4 h-4 text-accent mt-0.5" />
                       <div><p className="text-gray-500 text-[10px] uppercase font-bold">Phone</p><p>{booking.customerPhone}</p></div>
                    </div>
                    <div className="flex items-start gap-3 col-span-2">
                       <Mail className="w-4 h-4 text-accent mt-0.5" />
                       <div><p className="text-gray-500 text-[10px] uppercase font-bold">Email</p><p>{booking.customerEmail}</p></div>
                    </div>
                 </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">Trip Timeline</h4>
                 <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 p-4 rounded-2xl bg-white/5 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-accent" />
                        <div>
                           <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Pickup Date</p>
                           <p className="font-bold text-lg">{new Date(booking.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                           <p className="text-xs text-gray-400">@ Location: {booking.pickupLocation}</p>
                        </div>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-white/5 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-red-400" />
                        <div>
                           <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Return Date</p>
                           <p className="font-bold text-lg">{new Date(booking.returnDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                           <p className="text-xs text-gray-400">Total Duration: {days} Days</p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column - Billing */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 h-fit space-y-6">
               <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Billing & Payment</h4>
               
               <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Base Fare ({days} days)</span>
                     <span className="font-mono">{(booking.totalPrice - (booking.lateFee || 0)).toLocaleString()} VNĐ</span>
                  </div>
                  {booking.lateFee > 0 && (
                    <div className="flex justify-between text-sm text-red-400 font-bold">
                       <span>Late Return Fee</span>
                       <span className="font-mono">{booking.lateFee.toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  <div className="h-px bg-white/10 my-4"></div>
                  <div className="flex justify-between items-end">
                     <span className="text-lg font-bold">Total Amount</span>
                     <div className="text-right">
                        <p className="text-3xl font-black text-yellow-400">{booking.totalPrice.toLocaleString()} VNĐ</p>
                        <p className="text-[10px] text-green-400 uppercase font-bold tracking-widest flex items-center justify-end gap-1">
                           <ShieldCheck className="w-3 h-3" /> {booking.paymentStatus === 'paid' ? 'PAID FULL' : 'PENDING'}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="pt-6 space-y-4">
                  <div className="bg-primary/50 p-4 rounded-xl border border-white/5">
                     <p className="text-[9px] text-gray-600 uppercase font-bold mb-2 tracking-widest">Transaction Metadata</p>
                     <div className="space-y-1.5 font-mono text-xs">
                        <p className="flex justify-between"><span className="text-gray-500">ID:</span> <span className="text-white/70 truncate ml-2">#{booking._id}</span></p>
                        <p className="flex justify-between"><span className="text-gray-500">TXN:</span> <span className="text-white/70 truncate ml-2">{booking.transactionId || '---'}</span></p>
                        <p className="flex justify-between"><span className="text-gray-500">Method:</span> <span className="text-white/70">{booking.paymentMethod?.toUpperCase()}</span></p>
                     </div>
                  </div>
               </div>

               <div className="text-[10px] text-gray-500 text-center uppercase tracking-widest pt-4">
                  Powered by LuxeRide Elite Systems
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal Gia Hạn */}
      <AnimatePresence>
        {showExtendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowExtendModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl z-10 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tight text-white flex items-center gap-2">
                <CalendarPlus className="w-6 h-6 text-yellow-400" /> Gia Hạn Thuê Xe
              </h3>
              
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Ngày trả hiện tại:</span>
                  <span className="font-bold text-white">
                    {new Date(booking.returnDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Đơn giá xe:</span>
                  <span className="font-bold text-yellow-400">
                    {booking.car?.pricePerDay?.toLocaleString()} VNĐ/ngày
                  </span>
                </div>
              </div>

              <form onSubmit={handleExtend} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-bold block">
                    Chọn Ngày Trả Mới *
                  </label>
                  <input 
                    type="date"
                    value={newReturnDate}
                    min={new Date(new Date(booking.returnDate).getTime() + 86400000).toISOString().split('T')[0]}
                    onChange={(e) => setNewReturnDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400/50 transition font-medium"
                    required
                  />
                </div>

                {newReturnDate && new Date(newReturnDate) > new Date(booking.returnDate) && (() => {
                  const diffDays = Math.ceil((new Date(newReturnDate) - new Date(booking.returnDate)) / (1000 * 60 * 60 * 24));
                  const extraPrice = diffDays * (booking.car?.pricePerDay || 0);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-sm space-y-2"
                    >
                      <div className="flex justify-between text-yellow-200">
                        <span>Thời gian gia hạn:</span>
                        <span className="font-bold">+{diffDays} ngày</span>
                      </div>
                      <div className="flex justify-between text-yellow-400 font-bold text-base border-t border-yellow-400/10 pt-2">
                        <span>Chi phí phát sinh:</span>
                        <span>+{extraPrice.toLocaleString()} VNĐ</span>
                      </div>
                    </motion.div>
                  );
                })()}

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowExtendModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-2xl transition text-sm uppercase tracking-wider"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={extending}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold py-3.5 rounded-2xl shadow-lg transition text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {extending ? (
                      <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      "Xác Nhận"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingDetail;
