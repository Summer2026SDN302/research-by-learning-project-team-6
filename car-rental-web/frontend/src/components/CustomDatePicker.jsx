import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalCells = [...blanks, ...days];

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(year, month, day);
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Select Date';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative w-full max-w-[320px] mx-auto z-30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 hover:border-yellow-500/50 rounded-xl text-white font-medium transition-all shadow-md backdrop-blur-md"
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-yellow-400" />
          {formatDateDisplay(value)}
        </span>
        <span className="text-xs text-gray-400">{isOpen ? 'Close' : 'Open'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-[#1e1e24] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-semibold text-white">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-xs font-semibold text-gray-500 uppercase">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {totalCells.map((cell, idx) => {
              if (cell === null) {
                return <div key={`blank-${idx}`} className="aspect-square" />;
              }

              const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell).padStart(2, '0')}`;
              const isSelected = value === cellDateStr;

              return (
                <button
                  key={`day-${cell}`}
                  type="button"
                  onClick={() => handleDateClick(cell)}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-lg shadow-yellow-500/20'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
