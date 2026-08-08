import React from 'react';
import { ChevronDown } from 'lucide-react';

const WeeklyProgress = ({ yourTodayCount = 0, dailyTarget = 5, weeklyData = [] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const todayIndex = new Date().getDay() - 1;
  const adjustedTodayIndex = todayIndex < 0 ? 6 : todayIndex; // Sunday = 6

  // Prepare weekData array and ensure today's count is AT LEAST yourTodayCount
  const initialWeekData = (Array.isArray(weeklyData) && weeklyData.length === 7)
    ? [...weeklyData]
    : days.map(() => 0);

  if (yourTodayCount > 0) {
    initialWeekData[adjustedTodayIndex] = Math.max(initialWeekData[adjustedTodayIndex] || 0, yourTodayCount);
  }

  const weekData = initialWeekData;

  const totalSolved = weekData.reduce((a, b) => a + b, 0);
  const activeDays = weekData.filter((v) => v > 0).length || 1;
  const avgPerDay = totalSolved > 0 ? (totalSolved / activeDays).toFixed(1) : '0.0';
  const maxVal = Math.max(...weekData, dailyTarget);

  const BAR_CONTAINER_HEIGHT = 96; // px — single source of truth for bar area

  return (
    <div className="dash-card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-bold text-white">Weekly Progress</h3>
        <button className="flex items-center gap-1 text-[11px] text-[#A3A3A3] font-medium hover:text-white transition-colors">
          This Week <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 mb-3 flex-1" style={{ minHeight: `${BAR_CONTAINER_HEIGHT}px` }}>
        {days.map((day, i) => {
          const val = weekData[i];
          const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const isToday = i === adjustedTodayIndex;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[10px] font-bold text-[#A3A3A3]">{val}</span>
              <div className="w-full flex items-end flex-1">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: val > 0 ? `${Math.max(height, 8)}%` : '3px',
                    background: val > 0
                      ? (isToday ? '#EA5D3A' : 'rgba(234,93,58,0.6)')
                      : '#2C2C2C',
                    boxShadow: isToday && val > 0 ? '0 0 12px rgba(234,93,58,0.4)' : 'none'
                  }}
                ></div>
              </div>
              <span className={`text-[10px] font-medium ${isToday ? 'text-[#EA5D3A] font-bold' : 'text-[#737373]'}`}>{day}</span>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-[#2C2C2C] flex-shrink-0">
        <div>
          <span className="text-lg font-extrabold text-white">{totalSolved}</span>
          <span className="text-[11px] text-[#A3A3A3] ml-1.5">Total Solved</span>
        </div>
        <div>
          <span className="text-lg font-extrabold text-white">{avgPerDay}</span>
          <span className="text-[11px] text-[#A3A3A3] ml-1.5">Avg / Day</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgress;
