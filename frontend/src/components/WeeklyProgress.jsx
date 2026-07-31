import React from 'react';
import { ChevronDown } from 'lucide-react';

const WeeklyProgress = ({ yourTodayCount = 0, dailyTarget = 5, weeklyData = [] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const todayIndex = new Date().getDay() - 1;
  const adjustedTodayIndex = todayIndex < 0 ? 6 : todayIndex; // Sunday = 6

  // Use real weeklyData if provided, otherwise fallback to today's count
  const weekData = (Array.isArray(weeklyData) && weeklyData.length === 7)
    ? weeklyData
    : days.map((_, i) => (i === adjustedTodayIndex ? yourTodayCount : 0));

  const totalSolved = weekData.reduce((a, b) => a + b, 0);
  const activeDays = weekData.filter((v) => v > 0).length || 1;
  const avgPerDay = totalSolved > 0 ? (totalSolved / activeDays).toFixed(1) : '0.0';
  const maxVal = Math.max(...weekData, dailyTarget);

  return (
    <div className="dash-card p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Weekly Progress</h3>
        <button className="flex items-center gap-1 text-[11px] text-[#8b949e] font-medium hover:text-white transition-colors">
          This Week <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-28 mb-3">
        {days.map((day, i) => {
          const val = weekData[i];
          const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const isToday = i === adjustedTodayIndex;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-[#8b949e]">{val}</span>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: val > 0 ? `${Math.max(height, 8)}%` : '3px',
                    background: val > 0
                      ? (isToday ? '#22c55e' : 'rgba(34,197,94,0.6)')
                      : '#21262d',
                    boxShadow: isToday && val > 0 ? '0 0 12px rgba(34,197,94,0.4)' : 'none'
                  }}
                ></div>
              </div>
              <span className={`text-[10px] font-medium ${isToday ? 'text-[#22c55e] font-bold' : 'text-[#6e7681]'}`}>{day}</span>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
        <div>
          <span className="text-lg font-extrabold text-white">{totalSolved}</span>
          <span className="text-[11px] text-[#8b949e] ml-1.5">Total Solved</span>
        </div>
        <div>
          <span className="text-lg font-extrabold text-white">{avgPerDay}</span>
          <span className="text-[11px] text-[#8b949e] ml-1.5">Avg / Day</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgress;
