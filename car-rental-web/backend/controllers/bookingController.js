const Booking = require('../models/Booking');

const hasOverlap = (startA, endA, startB, endB) => {
  return startA <= endB && endA >= startB;
};

// Đảm bảo hàm helper này nằm ở ngoài cùng đầu file controller
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  // Nếu dateStr đã là đối tượng Date (do mongoose trả về), lấy string YYYY-MM-DD của nó
  const str = dateStr instanceof Date ? dateStr.toISOString().split('T')[0] : String(dateStr);
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0); 
};

/* =========================================================
    USER FUNCTIONS (KHÁCH HÀNG)
};
