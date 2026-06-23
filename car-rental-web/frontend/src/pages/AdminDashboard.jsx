import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Car, Calendar, DollarSign, Trash2, Lock, Unlock, Check, X, BarChart3, UserCog, CarFront, BookOpen, TrendingUp, Eye, Tag, Edit, Percent } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  getStatsAPI,
  getTopCarsAPI,
  getUsersAPI,
  deleteUserAPI,
  toggleUserStatusAPI,
  getCarsAPI,
  createCarAPI,
  deleteCarAPI,
  getAllBookingsAPI,
  updateBookingStatusAPI,
  confirmPaymentAPI,
  getAvailabilityCalendarAPI,
  getPricingSurgesAPI,
  getAdminVouchersAPI,
  createAdminVoucherAPI,
  updateAdminVoucherAPI,
  deleteAdminVoucherAPI,
  getAdminAllSurgesAPI,
  getAdminActiveSurgesAPI,
  createAdminSurgeAPI,
  updateAdminSurgeAPI,
  deleteAdminSurgeAPI,
  getCarsTimelineAPI,
  getCalendarOccupancyAPI
} from '../services/api';
import toast from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'users', label: 'Users', icon: <UserCog className="w-4 h-4" /> },
  { id: 'cars', label: 'Cars', icon: <CarFront className="w-4 h-4" /> },
  { id: 'bookings', label: 'Bookings', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'vouchers', label: 'Vouchers', icon: <Tag className="w-4 h-4" /> },
  { id: 'pricing', label: 'Dynamic Pricing', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
  { id: 'occupancy', label: 'Occupancy Logs', icon: <BarChart3 className="w-4 h-4" /> },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState({ name:'', brand:'', pricePerDay:'', type:'Sedan', description:'', imageUrl:'', seats:5, transmission:'Auto', fuelType:'Gasoline', rating:4.5 });
  const [calendarBookings, setCalendarBookings] = useState([]);
  const [pricingSurges, setPricingSurges] = useState([]);

  // New modules states
  const [vouchers, setVouchers] = useState([]);
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    limit: '',
    isActive: true
  });
  const [editingVoucherId, setEditingVoucherId] = useState(null);

  const [surges, setSurges] = useState([]);
  const [newSurge, setNewSurge] = useState({
    car: '',
    multiplier: '',
    reason: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [editingSurgeId, setEditingSurgeId] = useState(null);

  const [timelineData, setTimelineData] = useState({ dates: [], timeline: [] });
  const [timelineDate, setTimelineDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [occupancyLogs, setOccupancyLogs] = useState([]);
  const [occupancyMonth, setOccupancyMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadData();
  }, []);

  // Sync tab loading
  useEffect(() => {
    if (tab === 'vouchers') {
      loadVouchers();
    } else if (tab === 'pricing') {
      loadSurges();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'timeline') {
      loadTimeline(timelineDate);
    }
  }, [timelineDate, tab]);

  useEffect(() => {
    if (tab === 'occupancy') {
      loadOccupancy(occupancyMonth);
    }
  }, [occupancyMonth, tab]);

  // Load functions
  const loadVouchers = async () => {
    try {
      const res = await getAdminVouchersAPI();
      setVouchers(res.data);
    } catch (err) {
      toast.error('Failed to load vouchers');
    }
  };

  const loadSurges = async () => {
    try {
      const res = await getAdminAllSurgesAPI();
      setSurges(res.data);
    } catch (err) {
      toast.error('Failed to load pricing surges');
    }
  };

  const loadTimeline = async (date) => {
    try {
      const res = await getCarsTimelineAPI(date);
      setTimelineData(res.data);
    } catch (err) {
      toast.error('Failed to load timeline data');
    }
  };

  const loadOccupancy = async (month) => {
    try {
      const res = await getCalendarOccupancyAPI(month);
      setOccupancyLogs(res.data);
    } catch (err) {
      toast.error('Failed to load occupancy logs');
    }
  };

  // Actions for Vouchers
  const handleCreateOrUpdateVoucher = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newVoucher,
        discountValue: Number(newVoucher.discountValue),
        minOrderValue: Number(newVoucher.minOrderValue || 0),
        maxDiscountAmount: newVoucher.maxDiscountAmount ? Number(newVoucher.maxDiscountAmount) : null,
        limit: newVoucher.limit ? Number(newVoucher.limit) : null,
      };
      if (editingVoucherId) {
        await updateAdminVoucherAPI(editingVoucherId, payload);
        toast.success('Voucher updated!');
        setEditingVoucherId(null);
      } else {
        await createAdminVoucherAPI(payload);
        toast.success('Voucher created!');
      }
      setNewVoucher({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: 0,
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
        limit: '',
        isActive: true
      });
      loadVouchers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save voucher');
    }
  };

  const handleEditVoucher = (v) => {
    setEditingVoucherId(v._id);
    setNewVoucher({
      code: v.code,
      discountType: v.discountType || 'percentage',
      discountValue: v.discountValue !== undefined && v.discountValue !== null ? v.discountValue : (v.discount || 0),
      minOrderValue: v.minOrderValue !== undefined && v.minOrderValue !== null ? v.minOrderValue : (v.minBookingValue || 0),
      maxDiscountAmount: v.maxDiscountAmount || '',
      startDate: v.startDate || (v.createdAt ? v.createdAt.split('T')[0] : ''),
      endDate: v.endDate || (v.expiryDate ? new Date(v.expiryDate).toISOString().split('T')[0] : ''),
      limit: v.limit !== undefined && v.limit !== null ? v.limit : (v.usageLimit || ''),
      isActive: v.isActive
    });
  };

  const handleDeleteVoucher = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      try {
        await deleteAdminVoucherAPI(id);
        toast.success('Voucher deleted');
        loadVouchers();
      } catch (err) {
        toast.error('Failed to delete voucher');
      }
    }
  };

  // Actions for Dynamic Pricing
  const handleCreateOrUpdateSurge = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newSurge,
        multiplier: Number(newSurge.multiplier),
      };
      if (editingSurgeId) {
        await updateAdminSurgeAPI(editingSurgeId, payload);
        toast.success('Surge updated!');
        setEditingSurgeId(null);
      } else {
        await createAdminSurgeAPI(payload);
        toast.success('Surge created!');
      }
      setNewSurge({
        car: '',
        multiplier: '',
        reason: '',
        startDate: '',
        endDate: '',
        isActive: true
      });
      loadSurges();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save surge');
    }
  };

  const handleEditSurge = (s) => {
    setEditingSurgeId(s._id);
    setNewSurge({
      car: s.car?._id || s.car || '',
      multiplier: s.multiplier,
      reason: s.reason,
      startDate: s.startDate,
      endDate: s.endDate,
      isActive: s.isActive
    });
  };

  const handleDeleteSurge = async (id) => {
    if (window.confirm('Are you sure you want to delete this pricing surge?')) {
      try {
        await deleteAdminSurgeAPI(id);
        toast.success('Pricing surge deleted');
        loadSurges();
      } catch (err) {
        toast.error('Failed to delete pricing surge');
      }
    }
  };

  // Helper selectors
  const surgeStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const active = surges.filter(s => s.isActive && s.startDate <= today && s.endDate >= today);
    const count = active.length;
    const peak = count > 0 ? Math.max(...active.map(s => s.multiplier)) : 1.0;
    const sum = active.reduce((acc, s) => acc + s.multiplier, 0);
    const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : 1.0;
    return { count, peak, avg };
  }, [surges]);

  const getMultiplierBadge = (multiplier) => {
    if (multiplier <= 1.0) {
      return { label: 'NORMAL', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    } else if (multiplier <= 1.3) {
      return { label: 'ELEVATED', class: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' };
    } else if (multiplier <= 1.6) {
      return { label: 'HIGH', class: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
    } else {
      return { label: 'CRITICAL', class: 'bg-red-500/10 text-red-400 border border-red-500/20' };
    }
  };

  const loadData = async () => {
    const [statsRes, usersRes, carsRes, bookingsRes, topCarsRes, availabilityRes, surgeRes] = await Promise.allSettled([
      getStatsAPI(),
      getUsersAPI(),
      getCarsAPI(),
      getAllBookingsAPI(),
      getTopCarsAPI(),
      getAvailabilityCalendarAPI(),
      getPricingSurgesAPI()
    ]);

    if (statsRes.status === 'fulfilled') {
      const statsData = { ...statsRes.value.data };
      if (topCarsRes.status === 'fulfilled') {
        statsData.topCars = topCarsRes.value.data.map((item) => ({
          name: item.carDetails?.name || 'Unknown',
          brand: item.carDetails?.brand || '',
          model: item.carDetails?.model || '',
          count: item.bookingCount || 0,
          imageUrl: item.carDetails?.imageUrl || ''
        }));
      }
      setStats(statsData);
    } else {
      console.error('Failed to load stats:', statsRes.reason);
    }

    if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
    else console.error('Failed to load users:', usersRes.reason);

    if (carsRes.status === 'fulfilled') setCars(carsRes.value.data);
    else console.error('Failed to load cars:', carsRes.reason);

    if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
    else console.error('Failed to load bookings:', bookingsRes.reason);

    if (availabilityRes.status === 'fulfilled') setCalendarBookings(availabilityRes.value.data || []);
    else console.error('Failed to load availability:', availabilityRes.reason);

    if (surgeRes.status === 'fulfilled') {
      setPricingSurges(surgeRes.value.data.map((item) => {
        const basePrice = item.currentPrice || 0;
        const surgePercentage = item.bookingCount > 8 ? 25 : item.bookingCount > 4 ? 15 : item.bookingCount > 2 ? 10 : 0;
        return {
          carId: item._id,
          brand: item.brand || '',
          model: item.model || item.carName || '',
          image: item.imageUrl || '',
          basePrice,
          dynamicPrice: Math.round(basePrice * (1 + surgePercentage / 100)),
          surgePercentage
        };
      }));
    } else {
      console.error('Failed to load pricing surges:', surgeRes.reason);
    }
  };

  const handleDeleteUser = async (id) => { await deleteUserAPI(id); toast.success('User deleted'); loadData(); };
  const handleToggleUser = async (id) => { await toggleUserStatusAPI(id); toast.success('Updated'); loadData(); };
  const handleDeleteCar = async (id) => { await deleteCarAPI(id); toast.success('Car removed'); loadData(); };
  const handleBookingStatus = async (id, status) => { await updateBookingStatusAPI(id, status); toast.success(`Booking ${status}`); loadData(); };
  const handleConfirmPayment = async (id) => {
    try {
      await confirmPaymentAPI({ bookingId: id });
      toast.success('Payment confirmed!');
      loadData();
    } catch (err) {
      toast.error('Failed to confirm payment');
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await createCarAPI({ ...newCar, pricePerDay: Number(newCar.pricePerDay), seats: Number(newCar.seats), rating: Number(newCar.rating) });
      toast.success('Car added!'); setShowAddCar(false); loadData();
      setNewCar({ name:'', brand:'', pricePerDay:'', type:'Sedan', description:'', imageUrl:'', seats:5, transmission:'Auto', fuelType:'Gasoline', rating:4.5 });
    } catch (err) { toast.error('Failed to add car'); }
  };

  const statCards = [
    { icon: <Users className="w-6 h-6" />, label: 'Total Users', value: stats.totalUsers || 0, color: 'from-blue-500 to-blue-600' },
    { icon: <Car className="w-6 h-6" />, label: 'Total Cars', value: stats.totalCars || 0, color: 'from-emerald-500 to-emerald-600' },
    { icon: <Calendar className="w-6 h-6" />, label: 'Total Bookings', value: stats.totalBookings || 0, color: 'from-purple-500 to-purple-600' },
    { icon: <DollarSign className="w-6 h-6" />, label: 'Revenue', value: `${(stats.revenue || 0).toLocaleString()} VNĐ`, color: 'from-yellow-400 to-amber-500' },
  ];

  const monthLabels = useMemo(() => {
    return Array.from({ length: 6 }).map((_, idx) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - idx));
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    });
  }, []);

  const monthlyRevenue = useMemo(() => {
    return monthLabels.map((key) => stats.monthlyRevenue?.[key] || 0);
  }, [monthLabels, stats.monthlyRevenue]);

  const revenueChartData = {
    labels: monthLabels.map((label) => {
      const [year, month] = label.split('-');
      return new Date(year, Number(month) - 1).toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Revenue',
        data: monthlyRevenue,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#f59e0b'
      }
    ]
  };

  const bookingsByLocation = useMemo(() => {
    const entries = Object.entries(stats.bookingsByLocation || {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 6);
  }, [stats.bookingsByLocation]);

  const locationChartData = {
    labels: bookingsByLocation.map(([location]) => location),
    datasets: [
      {
        label: 'Bookings',
        data: bookingsByLocation.map(([, value]) => value),
        backgroundColor: ['#f59e0b', '#38bdf8', '#22c55e', '#a855f7', '#f97316', '#f43f5e'],
        borderRadius: 12
      }
    ]
  };

  const bookingStatusStats = stats.bookingStatusStats || { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 };

  const statusChartData = {
    labels: Object.keys(bookingStatusStats),
    datasets: [
      {
        data: Object.values(bookingStatusStats),
        backgroundColor: ['#facc15', '#38bdf8', '#22c55e', '#f43f5e'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
    }
  };

  const donutOptions = {
    responsive: true,
    plugins: { legend: { display: true, labels: { color: '#e2e8f0' } } }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm tracking-wider uppercase text-yellow-200">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-black mb-8">
          Admin <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Dashboard</span>
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* DASHBOARD TAB */}
          {tab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white/10 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition backdrop-blur-xl shadow-xl shadow-black/20">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 shadow-lg`}>{s.icon}</div>
                    <p className="text-sm text-gray-400">{s.label}</p>
                    <p className="text-3xl font-black mt-1">{s.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-6">
                <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-400">Revenue Overview</p>
                      <h3 className="text-2xl font-bold mt-1">Revenue by Month</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <TrendingUp className="w-4 h-4" /> +12.8%
                    </div>
                  </div>
                  <Line data={revenueChartData} options={chartOptions} height={120} />
                </div>

                <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                  <div className="mb-6">
                    <p className="text-sm text-gray-400">Status Mix</p>
                    <h3 className="text-2xl font-bold mt-1">Booking Status</h3>
                  </div>
                  <Doughnut data={statusChartData} options={donutOptions} height={120} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                  <div className="mb-6">
                    <p className="text-sm text-gray-400">Bookings by Location</p>
                    <h3 className="text-2xl font-bold mt-1">City Demand</h3>
                  </div>
                  <Bar data={locationChartData} options={chartOptions} height={120} />
                </div>

                <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                  <div className="mb-6">
                    <p className="text-sm text-gray-400">Active Users</p>
                    <h3 className="text-2xl font-bold mt-1">User Activity</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                      <p className="text-xs text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold mt-2">{stats.totalUsers || 0}</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                      <p className="text-xs text-gray-500">Active Users</p>
                      <p className="text-2xl font-bold mt-2">{stats.activeUsers || 0}</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                      <p className="text-xs text-gray-500">New This Month</p>
                      <p className="text-2xl font-bold mt-2">{stats.newUsersThisMonth || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-6">
                <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                  <div className="mb-6">
                    <p className="text-sm text-gray-400">Most Rented Cars</p>
                    <h3 className="text-2xl font-bold mt-1">Top Cars</h3>
                  </div>
                  <div className="space-y-4">
                    {stats.topCars?.length > 0 ? stats.topCars.map((car, index) => (
                      <div key={car.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">{index + 1}</span>
                          <img src={car.imageUrl} alt={car.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <p className="text-sm font-semibold">{car.brand} {car.model}</p>
                            <p className="text-xs text-gray-500">{car.count} bookings</p>
                          </div>
                        </div>
                        <span className="text-yellow-400 text-sm font-semibold">{car.count}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500">No booking data yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                  <div className="mb-6">
                    <p className="text-sm text-gray-400">Highest Demand Cars</p>
                    <h3 className="text-2xl font-bold mt-1">Pricing Surges</h3>
                  </div>
                  <div className="space-y-4">
                    {pricingSurges.length > 0 ? pricingSurges.map((car) => {
                      const surgeColor = car.surgePercentage > 20 ? 'text-red-400' : car.surgePercentage > 10 ? 'text-orange-400' : 'text-green-400';
                      return (
                        <div key={car.carId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={car.image} alt={`${car.brand} ${car.model}`} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <p className="text-sm font-semibold">{car.brand} {car.model}</p>
                            <p className="text-xs text-gray-500">Base {(car.basePrice || 0).toLocaleString()} VNĐ → {(car.dynamicPrice || 0).toLocaleString()} VNĐ</p>
                          </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${surgeColor}`}>{car.surgePercentage || 0}%</p>
                            {car.surgePercentage > 20 && (
                              <span className="text-xs text-red-400">🔥 Hot demand</span>
                            )}
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-sm text-gray-500">No surge data yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                <div className="mb-6">
                  <p className="text-sm text-gray-400">Recent Bookings</p>
                  <h3 className="text-2xl font-bold mt-1">Latest Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-white/10">
                        <th className="py-3">Dates</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking._id} className="border-b border-white/5">
                          <td className="py-3">
                            <div>
                               <p className="font-medium">{booking.customerName || booking.user?.name || 'Unknown'}</p>
                               <p className="text-[10px] text-gray-600">{booking.customerEmail || booking.user?.email}</p>
                            </div>
                          </td>
                          <td className="py-3 text-gray-400">{booking.car?.name || 'Unknown'}</td>
                          <td className="py-3 text-gray-400 text-xs">
                            {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-medium ${booking.status === 'Pending' ? 'bg-yellow-400/10 text-yellow-400' : booking.status === 'Approved' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 text-right pr-4">
                             <button 
                               onClick={() => navigate(`/bookings/${booking._id}`)}
                               className="p-1 px-2 bg-white/10 hover:bg-yellow-400 hover:text-black rounded text-[10px] uppercase font-bold transition flex items-center gap-1"
                             >
                                <Eye className="w-3 h-3" /> Detail
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 text-gray-400">
                    <th className="py-4 px-6 text-left">Name</th><th className="py-4 px-6 text-left">Email</th><th className="py-4 px-6">Role</th><th className="py-4 px-6">Status</th><th className="py-4 px-6">Actions</th>
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-4 px-6 font-medium">{u.name}</td>
                        <td className="py-4 px-6 text-gray-400">{u.email}</td>
                        <td className="py-4 px-6 text-center"><span className={`px-3 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>{u.role}</span></td>
                        <td className="py-4 px-6 text-center"><span className={`px-3 py-1 rounded-full text-xs ${u.status === 'Active' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>{u.status}</span></td>
                        <td className="py-4 px-6 text-center space-x-2">
                          <button onClick={() => handleToggleUser(u._id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition" title={u.status === 'Active' ? 'Lock' : 'Unlock'}>
                            {u.status === 'Active' ? <Lock className="w-4 h-4 text-yellow-400" /> : <Unlock className="w-4 h-4 text-green-400" />}
                          </button>
                          <button onClick={() => handleDeleteUser(u._id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* CARS TAB */}
          {tab === 'cars' && (
            <motion.div key="cars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setShowAddCar(!showAddCar)} className="mb-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-yellow-500/30 transition">
                + Add New Car
              </button>

              {showAddCar && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleAddCar}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['name','brand','pricePerDay','type','description','imageUrl'].map(field => (
                    <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={newCar[field]} onChange={(e) => setNewCar({...newCar, [field]: e.target.value})} required
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none" />
                  ))}
                  <button type="submit" className="md:col-span-3 bg-yellow-400 text-black py-3 rounded-xl font-bold">Add Car</button>
                </motion.form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map(c => (
                  <div key={c._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                    <img src={c.imageUrl} alt={c.name} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold">{c.name}</h3>
                      <p className="text-sm text-gray-500">{c.brand} · ${c.pricePerDay}/day</p>
                      <button onClick={() => handleDeleteCar(c._id)} className="mt-3 flex items-center gap-1 text-red-400 text-sm hover:text-red-300"><Trash2 className="w-4 h-4" /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* BOOKINGS TAB */}
          {tab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold flex items-center gap-2"><Car className="w-5 h-5 text-yellow-400" /> {b.car?.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500 mt-1">Customer: {b.customerName || b.user?.name} ({b.customerEmail || b.user?.email})</p>
                      <p className="text-xs text-gray-600">ID: {b._id}</p>
                      <p className="text-sm text-gray-500">Pickup: {new Date(b.pickupDate).toLocaleDateString()} → Return: {new Date(b.returnDate).toLocaleDateString()}</p>
                      <p className="text-yellow-400 font-bold mt-1">{(b.totalPrice || 0).toLocaleString()} VNĐ</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === 'Pending' ? 'bg-yellow-400/10 text-yellow-400' : b.status === 'Approved' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>{b.status}</span>
                      <button 
                         onClick={() => navigate(`/bookings/${b._id}`)}
                         className="p-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                         <Eye className="w-4 h-4" /> View Details
                      </button>
                      {b.status === 'Pending' && (
                        <>
                          <button onClick={() => handleConfirmPayment(b._id)} className="p-2 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-xs font-bold text-blue-400 transition"><DollarSign className="w-4 h-4" /> Confirm Payment</button>
                          <button onClick={() => handleBookingStatus(b._id, 'Approved')} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20"><Check className="w-4 h-4 text-green-400" /></button>
                          <button onClick={() => handleBookingStatus(b._id, 'Cancelled')} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20"><X className="w-4 h-4 text-red-400" /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-center text-gray-500 py-10">No bookings yet</p>}
              </div>
            </motion.div>
          )}

          {/* VOUCHERS TAB */}
          {tab === 'vouchers' && (
            <motion.div key="vouchers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
                {/* Form Column */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
                  <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-yellow-400" />
                    {editingVoucherId ? 'Edit Voucher' : 'Create New Voucher'}
                  </h3>
                  <form onSubmit={handleCreateOrUpdateVoucher} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Voucher Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SUMMER50"
                        value={newVoucher.code}
                        onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                        required
                        disabled={!!editingVoucherId}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white uppercase placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Discount Type</label>
                        <select
                          value={newVoucher.discountType}
                          onChange={(e) => setNewVoucher({ ...newVoucher, discountType: e.target.value })}
                          className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (VNĐ)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Discount Value</label>
                        <input
                          type="number"
                          placeholder="e.g. 10 or 100000"
                          value={newVoucher.discountValue}
                          onChange={(e) => setNewVoucher({ ...newVoucher, discountValue: e.target.value })}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Min Order Value</label>
                        <input
                          type="number"
                          placeholder="Min Order (VNĐ)"
                          value={newVoucher.minOrderValue}
                          onChange={(e) => setNewVoucher({ ...newVoucher, minOrderValue: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Max Discount</label>
                        <input
                          type="number"
                          placeholder="Ceiling (VNĐ)"
                          value={newVoucher.maxDiscountAmount}
                          onChange={(e) => setNewVoucher({ ...newVoucher, maxDiscountAmount: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newVoucher.startDate}
                          onChange={(e) => setNewVoucher({ ...newVoucher, startDate: e.target.value })}
                          required
                          className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">End Date</label>
                        <input
                          type="date"
                          value={newVoucher.endDate}
                          onChange={(e) => setNewVoucher({ ...newVoucher, endDate: e.target.value })}
                          required
                          className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Usage Limit</label>
                        <input
                          type="number"
                          placeholder="Unlimited"
                          value={newVoucher.limit}
                          onChange={(e) => setNewVoucher({ ...newVoucher, limit: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center mt-6">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newVoucher.isActive}
                            onChange={(e) => setNewVoucher({ ...newVoucher, isActive: e.target.checked })}
                            className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 bg-white/5 border-white/10"
                          />
                          Is Active
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      {editingVoucherId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVoucherId(null);
                            setNewVoucher({
                              code: '',
                              discountType: 'percentage',
                              discountValue: '',
                              minOrderValue: 0,
                              maxDiscountAmount: '',
                              startDate: '',
                              endDate: '',
                              limit: '',
                              isActive: true
                            });
                          }}
                          className="w-full bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
                      >
                        {editingVoucherId ? 'Update Voucher' : 'Create Voucher'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* List Column */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl overflow-x-auto">
                  <h3 className="text-xl font-bold mb-6 text-white">Voucher Records</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-left text-xs uppercase tracking-wider">
                        <th className="py-4 px-4">Code</th>
                        <th className="py-4 px-4">Discount</th>
                        <th className="py-4 px-4">Usage</th>
                        <th className="py-4 px-4">Dates</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.map((v) => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        
                        // Fallback for legacy voucher records
                        const discountType = v.discountType || 'percentage';
                        const discountVal = v.discountValue !== undefined && v.discountValue !== null ? v.discountValue : (v.discount || 0);
                        const minOrderVal = v.minOrderValue !== undefined && v.minOrderValue !== null ? v.minOrderValue : (v.minBookingValue || 0);
                        const limitVal = v.limit !== undefined && v.limit !== null ? v.limit : v.usageLimit;
                        const startDateVal = v.startDate || (v.createdAt ? v.createdAt.split('T')[0] : '');
                        const endDateVal = v.endDate || (v.expiryDate ? new Date(v.expiryDate).toISOString().split('T')[0] : '');
                        
                        const isExpired = endDateVal < todayStr;
                        return (
                          <tr key={v._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 font-bold text-yellow-400 tracking-wider uppercase">{v.code}</td>
                            <td className="py-4 px-4">
                              {discountType === 'percentage' ? (
                                <span className="font-semibold">{discountVal}% off</span>
                              ) : (
                                <span className="font-semibold">{discountVal.toLocaleString()} VNĐ</span>
                              )}
                              {minOrderVal > 0 && (
                                <p className="text-[10px] text-gray-500">Min: {minOrderVal.toLocaleString()} VNĐ</p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-medium text-gray-300">{v.usedCount}</span>
                              <span className="text-gray-500"> / {limitVal || '∞'}</span>
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-400">
                              <div>Start: {startDateVal}</div>
                              <div>End: {endDateVal}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-center w-max ${
                                  v.isActive ? 'bg-green-400/10 text-green-400' : 'bg-white/10 text-gray-400'
                                }`}>
                                  {v.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {isExpired && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-400/10 text-red-400 text-center w-max">
                                    Expired
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleEditVoucher(v)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-yellow-400"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteVoucher(v._id)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {vouchers.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-gray-500 py-10">No vouchers available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* PRICING TAB */}
          {tab === 'pricing' && (
            <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 animate-in fade-in duration-200">
              {/* Analytics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl text-center">
                  <p className="text-sm text-gray-400">Active Surges</p>
                  <p className="text-3xl font-black text-white mt-2">{surgeStats.count}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl text-center">
                  <p className="text-sm text-gray-400">Average Multiplier</p>
                  <p className="text-3xl font-black text-yellow-400 mt-2">{surgeStats.avg}x</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl text-center">
                  <p className="text-sm text-gray-400">Peak Multiplier</p>
                  <p className="text-3xl font-black text-red-400 mt-2">{surgeStats.peak}x</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
                {/* Form Column */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
                  <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    {editingSurgeId ? 'Edit pricing surge' : 'Create Pricing Surge'}
                  </h3>
                  <form onSubmit={handleCreateOrUpdateSurge} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Car</label>
                      <select
                        value={newSurge.car}
                        onChange={(e) => setNewSurge({ ...newSurge, car: e.target.value })}
                        required
                        className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                      >
                        <option value="">Select Car...</option>
                        {cars.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.brand} {c.name} ({(c.pricePerDay || 0).toLocaleString()} VNĐ)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Multiplier</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 1.25"
                          value={newSurge.multiplier}
                          onChange={(e) => setNewSurge({ ...newSurge, multiplier: e.target.value })}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center mt-6">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newSurge.isActive}
                            onChange={(e) => setNewSurge({ ...newSurge, isActive: e.target.checked })}
                            className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 bg-white/5 border-white/10"
                          />
                          Is Active
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Reason / Event Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Lunar New Year Rush"
                        value={newSurge.reason}
                        onChange={(e) => setNewSurge({ ...newSurge, reason: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newSurge.startDate}
                          onChange={(e) => setNewSurge({ ...newSurge, startDate: e.target.value })}
                          required
                          className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">End Date</label>
                        <input
                          type="date"
                          value={newSurge.endDate}
                          onChange={(e) => setNewSurge({ ...newSurge, endDate: e.target.value })}
                          required
                          className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      {editingSurgeId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSurgeId(null);
                            setNewSurge({
                              car: '',
                              multiplier: '',
                              reason: '',
                              startDate: '',
                              endDate: '',
                              isActive: true
                            });
                          }}
                          className="w-full bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
                      >
                        {editingSurgeId ? 'Update Surge' : 'Create Surge'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* List Column */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl overflow-x-auto">
                  <h3 className="text-xl font-bold mb-6 text-white">Dynamic Pricing Records</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-left text-xs uppercase tracking-wider">
                        <th className="py-4 px-4">Car Details</th>
                        <th className="py-4 px-4">Multiplier</th>
                        <th className="py-4 px-4">Reason</th>
                        <th className="py-4 px-4">Duration</th>
                        <th className="py-4 px-4">Tier Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surges.map((s) => {
                        const badgeInfo = getMultiplierBadge(s.multiplier);
                        const carObj = s.car || {};
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isExpired = s.endDate < todayStr;
                        const isLive = s.isActive && s.startDate <= todayStr && s.endDate >= todayStr;

                        return (
                          <tr key={s._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                {carObj.imageUrl && (
                                  <img src={carObj.imageUrl} alt={carObj.name || carObj.model} className="w-12 h-10 object-cover rounded-lg" />
                                )}
                                <div>
                                  <p className="font-semibold text-white">{carObj.brand} {carObj.name || carObj.model}</p>
                                  <p className="text-xs text-gray-500">Base: {(carObj.pricePerDay || 0).toLocaleString()} VNĐ</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-black text-base text-yellow-400">{s.multiplier}x</span>
                              <p className="text-[10px] text-gray-400">→ {Math.round((carObj.pricePerDay || 0) * s.multiplier).toLocaleString()} VNĐ</p>
                            </td>
                            <td className="py-4 px-4 text-gray-300 font-medium">{s.reason}</td>
                            <td className="py-4 px-4 text-xs text-gray-400">
                              <div>From: {s.startDate}</div>
                              <div>To: {s.endDate}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-center w-max ${badgeInfo.class}`}>
                                  {badgeInfo.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-center w-max ${
                                  isLive ? 'bg-green-400/10 text-green-400' : isExpired ? 'bg-red-400/10 text-red-400' : 'bg-white/10 text-gray-400'
                                }`}>
                                  {isLive ? 'Live' : isExpired ? 'Expired' : 'Scheduled'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleEditSurge(s)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-yellow-400"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSurge(s._id)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {surges.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-gray-500 py-10">No pricing surges configured</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TIMELINE TAB */}
          {tab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div>
                  <h3 className="text-xl font-bold text-white">Car Availability Timeline</h3>
                  <p className="text-sm text-gray-400 mt-1">Rolling 10-day timeline grid displaying car rental status</p>
                </div>
                <div className="w-full md:w-auto">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 text-center md:text-left">Start Date</label>
                  <CustomDatePicker value={timelineDate} onChange={setTimelineDate} />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-left">
                      <th className="py-4 px-4 min-w-[200px] text-xs uppercase tracking-wider">Car Model</th>
                      {timelineData.dates?.map((dStr) => {
                        const d = new Date(dStr);
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                        const dateNum = d.getDate();
                        return (
                          <th key={dStr} className="py-4 px-2 text-center min-w-[70px]">
                            <div className="text-[10px] text-gray-500 uppercase font-semibold">{dayName}</div>
                            <div className="text-sm font-bold text-white mt-0.5">{dateNum}</div>
                            <div className="text-[9px] text-gray-600 mt-0.5">{d.getMonth() + 1}/{d.getFullYear().toString().slice(-2)}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {timelineData.timeline?.map((carItem) => (
                      <tr key={carItem.carId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {carItem.imageUrl && (
                              <img src={carItem.imageUrl} alt={carItem.carName} className="w-12 h-9 object-cover rounded-lg" />
                            )}
                            <div>
                              <p className="font-semibold text-white">{carItem.brand} {carItem.carName}</p>
                              <p className="text-xs text-gray-400">{carItem.type} · {(carItem.pricePerDay || 0).toLocaleString()} VNĐ</p>
                            </div>
                          </div>
                        </td>
                        {carItem.schedule?.map((day) => {
                          const isBooked = day.status === 'booked';
                          return (
                            <td key={day.date} className="py-4 px-1 text-center">
                              <div
                                className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                  isBooked
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-red-500/5'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5'
                                }`}
                                title={`${day.date}: ${isBooked ? 'Booked' : 'Available'}`}
                              >
                                {isBooked ? 'NO' : 'OK'}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {(!timelineData.timeline || timelineData.timeline.length === 0) && (
                      <tr>
                        <td colSpan={11} className="text-center text-gray-500 py-10">No cars registered in system</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* OCCUPANCY TAB */}
          {tab === 'occupancy' && (
            <motion.div key="occupancy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div>
                  <h3 className="text-xl font-bold text-white">Fleet Occupancy Logs</h3>
                  <p className="text-sm text-gray-400 mt-1">Monthly calendar heatmap displaying daily fleet occupancy rates</p>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Month</label>
                    <input
                      type="month"
                      value={occupancyMonth}
                      onChange={(e) => setOccupancyMonth(e.target.value)}
                      required
                      className="bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Monthly Heatmap Calendar View */}
              {occupancyLogs.length > 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                  {/* Calendar Grid Header */}
                  <div className="grid grid-cols-7 gap-3 text-center mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <span key={day} className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Grid Cells */}
                  <div className="grid grid-cols-7 gap-3">
                    {(() => {
                      const firstDayOfWeek = new Date(occupancyLogs[0].date).getDay();
                      const blanks = Array(firstDayOfWeek).fill(null);
                      const cells = [...blanks, ...occupancyLogs];

                      return cells.map((cell, idx) => {
                        if (cell === null) {
                          return <div key={`blank-${idx}`} className="aspect-square bg-transparent rounded-2xl" />;
                        }

                        const rate = cell.occupancyRate;
                        let heatClass = 'bg-white/5 text-gray-400 border border-white/5';
                        if (rate > 90) {
                          heatClass = 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg shadow-red-500/5';
                        } else if (rate > 60) {
                          heatClass = 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-lg shadow-orange-500/5';
                        } else if (rate > 30) {
                          heatClass = 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-lg shadow-yellow-500/5';
                        } else if (rate > 0) {
                          heatClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/5';
                        }

                        const dObj = new Date(cell.date);
                        const dayNum = dObj.getDate();

                        return (
                          <div
                            key={cell.date}
                            className={`aspect-square rounded-2xl p-3 flex flex-col justify-between transition-all hover:scale-105 cursor-default group relative ${heatClass}`}
                          >
                            <span className="text-sm font-black">{dayNum}</span>
                            <div className="text-right">
                              <span className="text-xs font-extrabold block">{rate}%</span>
                              <span className="text-[9px] opacity-60 block mt-0.5">{cell.totalBookings} booked</span>
                            </div>
                            
                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2.5 bg-black border border-white/10 rounded-xl text-center shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-[11px] text-white backdrop-blur-md">
                              <div className="font-bold">{dObj.toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
                              <div className="mt-1 text-yellow-400">Occupancy: {rate}%</div>
                              <div className="text-gray-400">{cell.totalBookings} cars reserved</div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Heatmap Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-white/5 text-xs text-gray-400">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Legend:</span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-white/5 border border-white/10 block" /> 0% (Empty)
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40 block" /> 1-30% (Low)
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/40 block" /> 31-60% (Moderate)
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/40 block" /> 61-90% (High)
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-red-500/20 border border-red-500/40 block" /> 91-100% (Peak)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-gray-500 backdrop-blur-xl">
                  No occupancy data available for the selected month
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
