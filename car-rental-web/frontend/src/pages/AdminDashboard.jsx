import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Car, Calendar, DollarSign, Trash2, Lock, Unlock, Check, X, BarChart3, UserCog, CarFront, BookOpen, TrendingUp, Eye } from 'lucide-react';
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
  getAdminCommissionSummaryAPI,
  getPendingSellerRequestsAPI,
  reviewSellerRequestAPI,
  getAdminAllSurgesAPI,
  getAdminActiveSurgesAPI,
  createAdminSurgeAPI,
  updateAdminSurgeAPI,
  deleteAdminSurgeAPI,
  getCarsTimelineAPI,
  getCalendarOccupancyAPI
} from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'users', label: 'Users', icon: <UserCog className="w-4 h-4" /> },
  { id: 'cars', label: 'Cars', icon: <CarFront className="w-4 h-4" /> },
  { id: 'bookings', label: 'Bookings', icon: <BookOpen className="w-4 h-4" /> },
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
  const [commissionSummary, setCommissionSummary] = useState([]);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVED');
  const [declineReason, setDeclineReason] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Sync tab loading
  useEffect(() => {
    if (tab === 'dashboard') {
      loadData();
    }
  }, [tab]);

  const loadData = async () => {
    const [statsRes, usersRes, carsRes, bookingsRes, topCarsRes, availabilityRes, surgeRes, commissionRes] = await Promise.allSettled([
      getStatsAPI(),
      getUsersAPI(),
      getCarsAPI(),
      getAllBookingsAPI(),
      getTopCarsAPI(),
      getAvailabilityCalendarAPI(),
      getPricingSurgesAPI(),
      getAdminCommissionSummaryAPI()
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
      setPricingSurges(surgeRes.value.data.map((item) => ({
        carId: item._id,
        brand: item.brand || '',
        model: item.model || item.carName || '',
        image: item.imageUrl || '',
        basePrice: item.currentPrice || 0,
        dynamicPrice: Math.round((item.currentPrice || 0) * (item.bookingCount > 8 ? 1.25 : item.bookingCount > 4 ? 1.15 : item.bookingCount > 2 ? 1.10 : 1)),
        surgePercentage: item.bookingCount > 8 ? 25 : item.bookingCount > 4 ? 15 : item.bookingCount > 2 ? 10 : 0
      })));
    } else {
      console.error('Failed to load pricing surges:', surgeRes.reason);
    }

    if (commissionRes.status === 'fulfilled') {
      setCommissionSummary(commissionRes.value.data || []);
    } else {
      console.error('Failed to load commission summary:', commissionRes.reason);
    }

    try {
      const pendingRequestsRes = await getPendingSellerRequestsAPI();
      setSellerRequests(pendingRequestsRes.data || []);
    } catch (error) {
      console.error('Failed to load seller requests:', error);
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

  const openReviewModal = (request, action) => {
    setReviewingRequest(request);
    setReviewAction(action);
    setDeclineReason('');
  };

  const handleReviewSellerRequest = async (e) => {
    e.preventDefault();
    if (!reviewingRequest) return;

    if (reviewAction === 'DECLINED' && !declineReason.trim()) {
      toast.error('Please provide a decline reason');
      return;
    }

    setIsReviewSubmitting(true);
    try {
      await reviewSellerRequestAPI(reviewingRequest._id, {
        status: reviewAction,
        reason: declineReason.trim(),
      });
      toast.success(reviewAction === 'APPROVED' ? 'Seller request approved' : 'Seller request declined');
      setReviewingRequest(null);
      setDeclineReason('');
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to review seller request');
    } finally {
      setIsReviewSubmitting(false);
    }
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

  const totalAdminCommission = useMemo(() => {
    return commissionSummary.reduce((sum, item) => sum + Number(item.adminCommission || 0), 0);
  }, [commissionSummary]);

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

              <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Admin Commission</p>
                    <h3 className="text-2xl font-bold mt-1">10% Revenue Share</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-yellow-400">{totalAdminCommission.toLocaleString()} VNĐ</p>
                    <p className="text-xs text-gray-500">Calculated from paid bookings</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white/5 text-left text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Month</th>
                        <th className="px-4 py-3">Vehicle</th>
                        <th className="px-4 py-3">Gross</th>
                        <th className="px-4 py-3">Admin Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionSummary.slice(0, 6).map((item, index) => (
                        <tr key={`${item.year}-${item.month}-${index}`} className="border-t border-white/10">
                          <td className="px-4 py-3 text-gray-300">{item.year}-{String(item.month).padStart(2, '0')}</td>
                          <td className="px-4 py-3 text-gray-300">{item.carName}</td>
                          <td className="px-4 py-3 text-gray-300">{Number(item.grossRevenue || 0).toLocaleString()} VNĐ</td>
                          <td className="px-4 py-3 text-yellow-400 font-semibold">{Number(item.adminCommission || 0).toLocaleString()} VNĐ</td>
                        </tr>
                      ))}
                      {commissionSummary.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No paid bookings found for commission calculations.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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

              </div>

              <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Seller Requests</p>
                    <h3 className="text-2xl font-bold mt-1">Pending approvals</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-semibold">
                    {sellerRequests.length} pending
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-white/10">
                        <th className="py-3">User</th>
                        <th className="py-3">Email</th>
                        <th className="py-3">Requested At</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerRequests.length > 0 ? sellerRequests.map((request) => (
                        <tr key={request._id} className="border-b border-white/5">
                          <td className="py-3 font-medium">{request.user?.name || 'Unknown'}</td>
                          <td className="py-3 text-gray-400">{request.user?.email || '—'}</td>
                          <td className="py-3 text-gray-400">{new Date(request.created_at).toLocaleString()}</td>
                          <td className="py-3 text-right pr-4 space-x-2">
                            <button
                              onClick={() => openReviewModal(request, 'APPROVED')}
                              className="px-3 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openReviewModal(request, 'DECLINED')}
                              className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold"
                            >
                              Decline
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-gray-500">No pending seller requests.</td>
                        </tr>
                      )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map(c => (
                  <div key={c._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <img src={c.imageUrl} alt={c.name} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold">{c.name}</h3>
                      <p className="text-sm text-gray-500">{c.brand} · {Number(c.pricePerDay || 0).toLocaleString()} VNĐ/day</p>
                      <p className="text-xs text-gray-400 mt-2">View-only access for admin</p>
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
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-center text-gray-500 py-10">No bookings yet</p>}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {reviewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">
              {reviewAction === 'APPROVED' ? 'Approve seller request?' : 'Decline seller request?'}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {reviewAction === 'APPROVED'
                ? 'This action will upgrade the user role to seller.'
                : 'Please provide a reason before submitting the decline.'}
            </p>

            {reviewAction === 'DECLINED' && (
              <form onSubmit={handleReviewSellerRequest} className="mt-4 space-y-3">
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={4}
                  required
                  placeholder="Enter rejection reason"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewingRequest(null)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReviewSubmitting}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isReviewSubmitting ? 'Submitting...' : 'Submit Decline'}
                  </button>
                </div>
              </form>
            )}

            {reviewAction === 'APPROVED' && (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingRequest(null)}
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReviewSellerRequest}
                  disabled={isReviewSubmitting}
                  className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isReviewSubmitting ? 'Submitting...' : 'Confirm Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
