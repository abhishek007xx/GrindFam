import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, Flame } from 'lucide-react';

export default function CalendarDatePickerModal({ isOpen, onClose, selectedDate, onSelectDate }) {
  const parseSafeDate = (val) => {
    if (!val) return new Date();
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const [currentMonth, setCurrentMonth] = useState(() => {
    const initial = parseSafeDate(selectedDate);
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const [pickedDate, setPickedDate] = useState(() => {
    if (selectedDate && typeof selectedDate === 'string' && selectedDate.includes('-')) {
      return selectedDate;
    }
    return new Date().toISOString().split('T')[0];
  });

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dayNum) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    setPickedDate(dateStr);
  };

  const handleConfirm = () => {
    if (onSelectDate) {
      onSelectDate(pickedDate);
    }
    onClose();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-[#1E1E1E] border border-[#333333] rounded-2xl p-5 shadow-2xl space-y-4 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#EA5D3A]" />
              <h3 className="text-sm font-bold text-white">Select Activity Date</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-[#141414] border border-[#333333] text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono text-white">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-[#141414] border border-[#333333] text-zinc-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 uppercase">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank slots for previous month padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedMonth = String(month + 1).padStart(2, '0');
              const formattedDay = String(dayNum).padStart(2, '0');
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const isSelected = pickedDate === dateStr;
              const isToday = todayStr === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(dayNum)}
                  className={`h-8 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center relative ${
                    isSelected
                      ? 'bg-[#EA5D3A] text-white shadow-md font-bold scale-105'
                      : isToday
                      ? 'bg-[#EA5D3A]/20 text-[#EA5D3A] border border-[#EA5D3A]/40'
                      : 'bg-[#141414] hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Native HTML Date Picker Fallback for Quick Select */}
          <div className="pt-2 border-t border-[#2C2C2C] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400">Direct:</span>
              <input
                type="date"
                value={pickedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setPickedDate(e.target.value);
                    const parsed = new Date(e.target.value);
                    setCurrentMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
                  }
                }}
                className="bg-[#141414] border border-[#333333] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#EA5D3A]"
              />
            </div>

            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 bg-[#EA5D3A] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#f2704e] transition-all flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
