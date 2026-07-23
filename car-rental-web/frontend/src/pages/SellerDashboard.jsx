import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, CarFront, BookOpen, DollarSign, Check, X, Eye, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import {
  getSellerCarsAPI, getSellerBookingsAPI, updateSellerBookingStatusAPI,
  createCarAPI, deleteCarAPI,
  getAdminVouchersAPI, createAdminVoucherAPI, deleteAdminVoucherAPI
} from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'cars', label: 'My Cars', icon: <CarFront className="w-4 h-4" /> },
  { id: 'bookings', label: 'Bookings', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'vouchers', label: 'Vouchers', icon: <DollarSign className="w-4 h-4" /> },
];

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [tab, setTab] = useState('dashboard');
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState({ name: '', brand: '', pricePerDay: '', type: 'Sedan', description: '', imageUrl: '', seats: '', transmission: 'Auto', fuelType: 'Gasoline' });
  const [showAddVoucher, setShowAddVoucher] = useState(false);
  const [newVoucher, setNewVoucher] = useState({ code: '', discountPercent: '', maxUses: '', expiresAt: '' });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (tab === 'dashboard') loadData(); }, [tab]);

  const loadData = async () => {
    const [carsRes, bookingsRes, vouchersRes] = await Promise.allSettled([
      getSellerCarsAPI(),
      getSellerBookingsAPI(),
      getAdminVouchersAPI()
    ]);
    if (carsRes.status === 'fulfilled') setCars(carsRes.value.data);
    if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
    if (vouchersRes.status === 'fulfilled') setVouchers(vouchersRes.value.data);
  };

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const statusCounts = { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 };
  bookings.forEach(b => { if (statusCounts.hasOwnProperty(b.status)) statusCounts[b.status]++; });

  const monthlyData = {};
  bookings.filter(b => b.paymentStatus === 'paid').forEach(b => {
    const d = new Date(b.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyData[key] = (monthlyData[key] || 0) + (b.totalPrice || 0);
  });
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: months[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth() + 1}` };
  });

  const handleBookingStatus = async (id, status) => {
    try {
      await updateSellerBookingStatusAPI(id, status);
      toast.success(`Booking ${status}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await createCarAPI({ ...newCar, pricePerDay: Number(newCar.pricePerDay), seats: Number(newCar.seats) });
      toast.success('Car added!');
      setShowAddCar(false);
      setNewCar({ name: '', brand: '', pricePerDay: '', type: 'Sedan', description: '', imageUrl: '', seats: '', transmission: 'Auto', fuelType: 'Gasoline' });
      loadData();
    } catch (err) { toast.error('Failed to add car'); }
  };

  const handleDeleteCar = async (id) => {
    await deleteCarAPI(id);
    toast.success('Car removed');
    loadData();
  };

  const handleAddVoucher = async (e) => {
    e.preventDefault();
    try {
      await createAdminVoucherAPI({ ...newVoucher, discountPercent: Number(newVoucher.discountPercent), maxUses: Number(newVoucher.maxUses) });
      toast.success('Voucher created!');
      setShowAddVoucher(false);
      setNewVoucher({ code: '', discountPercent: '', maxUses: '', expiresAt: '' });
      loadData();
    } catch (err) { toast.error('Failed to create voucher'); }
  };

  const handleDeleteVoucher = async (id) => {
    await deleteAdminVoucherAPI(id);
    toast.success('Voucher deleted');
    loadData();
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition';
  const btnClass = 'px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 text-sm';

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-16">
      <h1 className="text-3xl font-black mb-1">
        Seller <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Dashboard</span>
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 mb-8 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`${btnClass} flex items-center gap-2 ${tab === t.id ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ===== DASHBOARD TAB ===== */}
      {tab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Cars', value: cars.length, icon: <CarFront className="w-6 h-6 text-green-400" />, bg: 'from-green-500/20' },
              { label: 'Total Bookings', value: bookings.length, icon: <BookOpen className="w-6 h-6 text-purple-400" />, bg: 'from-purple-500/20' },
              { label: 'Revenue', value: `${totalRevenue.toLocaleString()} VNĐ`, icon: <DollarSign className="w-6 h-6 text-yellow-400" />, bg: 'from-yellow-500/20' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.bg} to-transparent border border-white/10 rounded-2xl p-6`}>
                <div className="mb-3">{s.icon}</div>
                <p className="text-sm text-gray-400">{s.label}</p>
                <p className="text-2xl font-black mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-400">Revenue Overview</p>
                  <p className="text-lg font-bold">Revenue by Month</p>
                </div>
                <span className="text-green-400 text-sm flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +12.8%</span>
              </div>
              <Line data={{
                labels: last6.map(m => m.label),
                datasets: [{ label: 'Revenue', data: last6.map(m => monthlyData[m.key] || 0), borderColor: '#eab308', backgroundColor: 'rgba(234,179,8,0.1)', tension: 0.4, fill: true, pointRadius: 4 }]
              }} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }} />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs text-gray-400">Status Mix</p>
              <p className="text-lg font-bold mb-4">Booking Status</p>
              <Doughnut data={{
                labels: Object.keys(statusCounts),
                datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#eab308', '#3b82f6', '#22c55e', '#ef4444'], borderWidth: 0 }]
              }} options={{ responsive: true, plugins: { legend: { position: 'top', labels: { color: '#d1d5db', padding: 12 } } } }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== MY CARS TAB ===== */}
      {tab === 'cars' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">My Cars ({cars.length})</h2>
            <button onClick={() => setShowAddCar(!showAddCar)} className={`${btnClass} bg-gradient-to-r from-yellow-400 to-amber-500 text-black flex items-center gap-2`}>
              <Plus className="w-4 h-4" /> Add New Car
            </button>
          </div>

          <AnimatePresence>
            {showAddCar && (
              <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddCar} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                <input className={inputClass} placeholder="Car Name" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} required />
                <input className={inputClass} placeholder="Brand" value={newCar.brand} onChange={e => setNewCar({ ...newCar, brand: e.target.value })} required />
                <input className={inputClass} placeholder="Price Per Day (VNĐ)" type="number" value={newCar.pricePerDay} onChange={e => setNewCar({ ...newCar, pricePerDay: e.target.value })} required />
                <select className={inputClass} value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })}>
                  {['Sedan', 'SUV', 'Sports', 'Truck', 'Van', 'Coupe'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input className={inputClass} placeholder="Seats" type="number" min="1" value={newCar.seats} onChange={e => setNewCar({ ...newCar, seats: e.target.value })} required />
                <select className={inputClass} value={newCar.transmission} onChange={e => setNewCar({ ...newCar, transmission: e.target.value })}>
                  <option value="Auto">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
                <select className={inputClass} value={newCar.fuelType} onChange={e => setNewCar({ ...newCar, fuelType: e.target.value })}>
                  {['Gasoline', 'Diesel', 'Electric', 'Hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <input className={inputClass} placeholder="Image URL" value={newCar.imageUrl} onChange={e => setNewCar({ ...newCar, imageUrl: e.target.value })} required />
                <textarea className={`${inputClass} md:col-span-2`} placeholder="Description" rows={3} value={newCar.description} onChange={e => setNewCar({ ...newCar, description: e.target.value })} required />
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className={`${btnClass} bg-green-500 text-white`}>Save Car</button>
                  <button type="button" onClick={() => setShowAddCar(false)} className={`${btnClass} bg-white/10 text-gray-300`}>Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Car</th>
                  <th className="px-4 py-3 text-left">Brand</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Price/Day</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car._id} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 flex items-center gap-3">
                      {car.imageUrl && <img src={car.imageUrl} alt={car.name} className="w-12 h-8 rounded object-cover" />}
                      {car.name}
                    </td>
                    <td className="px-4 py-3">{car.brand}</td>
                    <td className="px-4 py-3">{car.type}</td>
                    <td className="px-4 py-3 text-right text-yellow-400 font-semibold">{car.pricePerDay?.toLocaleString()} VNĐ</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDeleteCar(car._id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {cars.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No cars yet. Add your first car!</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ===== BOOKINGS TAB ===== */}
      {tab === 'bookings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-bold mb-6">Manage Bookings ({bookings.length})</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Car</th>
                  <th className="px-4 py-3 text-left">Dates</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.user?.name || b.customerName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{b.user?.email || b.customerEmail || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{b.car?.brand} {b.car?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-400 font-semibold">{b.totalPrice?.toLocaleString()} VNĐ</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                        b.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        b.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {b.status === 'Pending' && (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleBookingStatus(b._id, 'Approved')} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleBookingStatus(b._id, 'Cancelled')} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {b.status === 'Approved' && (
                        <button onClick={() => handleBookingStatus(b._id, 'Completed')} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition" title="Mark Complete">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {(b.status === 'Completed' || b.status === 'Cancelled') && (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No bookings yet for your cars.</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ===== VOUCHERS TAB ===== */}
      {tab === 'vouchers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Vouchers ({vouchers.length})</h2>
            <button onClick={() => setShowAddVoucher(!showAddVoucher)} className={`${btnClass} bg-gradient-to-r from-yellow-400 to-amber-500 text-black flex items-center gap-2`}>
              <Plus className="w-4 h-4" /> Create Voucher
            </button>
          </div>

          <AnimatePresence>
            {showAddVoucher && (
              <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddVoucher} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                <input className={inputClass} placeholder="Voucher Code (e.g. SUMMER20)" value={newVoucher.code} onChange={e => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })} required />
                <input className={inputClass} placeholder="Discount %" type="number" min="1" max="100" value={newVoucher.discountPercent} onChange={e => setNewVoucher({ ...newVoucher, discountPercent: e.target.value })} required />
                <input className={inputClass} placeholder="Max Uses" type="number" min="1" value={newVoucher.maxUses} onChange={e => setNewVoucher({ ...newVoucher, maxUses: e.target.value })} required />
                <input className={inputClass} type="date" value={newVoucher.expiresAt} onChange={e => setNewVoucher({ ...newVoucher, expiresAt: e.target.value })} required />
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className={`${btnClass} bg-green-500 text-white`}>Create</button>
                  <button type="button" onClick={() => setShowAddVoucher(false)} className={`${btnClass} bg-white/10 text-gray-300`}>Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-center">Discount</th>
                  <th className="px-4 py-3 text-center">Uses</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v._id} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono font-bold text-yellow-400">{v.code}</td>
                    <td className="px-4 py-3 text-center">{v.discountPercent}%</td>
                    <td className="px-4 py-3 text-center">{v.usedCount || 0}/{v.maxUses}</td>
                    <td className="px-4 py-3">{v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDeleteVoucher(v._id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {vouchers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No vouchers created yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SellerDashboard;
