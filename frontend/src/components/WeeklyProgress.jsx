import React from 'react';
import { ChevronDown, BarChart2 } from 'lucide-react';
import { useTrackStore } from '../store/useTrackStore';

const WeeklyProgress = ({ yourTodayCount = 0, dailyTarget = 5, weeklyData = [] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ...
  const distanceToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMon);

  // Generate date strings for Mon..Sun of current week
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  const todayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  // 1. Calculate 7-day counts directly from Zustand progressMap
  const progressMapCounts = [0, 0, 0, 0, 0, 0, 0];
  try {
    const progressMap = useTrackStore.getState().progressMap || {};
    const processedProblems = new Set();

    Object.entries(progressMap).forEach(([key, rec]) => {
      if (rec && rec.status === 'solved' && rec.solved_at) {
        // Prevent duplicate counting for key variations of the same problem
        const problemId = rec.problem_id || key;
        const dateStr = rec.solved_at.split('T')[0];
        const uniqueKey = `${problemId}_${dateStr}`;

        if (!processedProblems.has(uniqueKey)) {
          processedProblems.add(uniqueKey);
          const dayIdx = weekDates.indexOf(dateStr);
          if (dayIdx >= 0 && dayIdx < 7) {
            progressMapCounts[dayIdx]++;
          }
        }
      }
    });
  } catch (_) {}

  // 2. Merge backend weeklyData + progressMapCounts + yourTodayCount
  const weekData = days.map((_, i) => {
    const backendCount = (Array.isArray(weeklyData) && weeklyData.length === 7) ? (weeklyData[i] || 0) : 0;
    const storeCount = progressMapCounts[i] || 0;
    let count = Math.max(backendCount, storeCount);
    if (i === todayIndex && yourTodayCount > 0) {
      count = Math.max(count, yourTodayCount);
    }
    return count;
  });

  const totalSolved = weekData.reduce((a, b) => a + b, 0);
  const activeDays = weekData.filter((v) => v > 0).length || 1;
  const avgPerDay = totalSolved > 0 ? (totalSolved / activeDays).toFixed(1) : '0.0';
  const maxVal = Math.max(...weekData, dailyTarget);

  const BAR_CONTAINER_HEIGHT = 96;

  return (
    <div className="dash-card p-5 h-full flex flex-col justify-between bg-[#1E1E1E] border border-[#333333] rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[#EA5D3A] flex items-center justify-center">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">Weekly Progress</h3>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700">
          This Week
        </span>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2.5 mb-3 flex-1" style={{ minHeight: `${BAR_CONTAINER_HEIGHT}px` }}>
        {days.map((day, i) => {
          const val = weekData[i];
          const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const isToday = i === todayIndex;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <span className={`text-[10px] font-mono font-bold transition-all ${val > 0 ? (isToday ? 'text-[#EA5D3A]' : 'text-zinc-300') : 'text-zinc-600'}`}>
                {val}
              </span>
              <div className="w-full flex items-end flex-1">
                <div
                  className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                  style={{
                    height: val > 0 ? `${Math.max(height, 10)}%` : '4px',
                    background: val > 0
                      ? (isToday ? 'linear-gradient(to top, #EA5D3A, #F2704E)' : 'rgba(234,93,58,0.5)')
                      : '#2A2A30',
                    boxShadow: isToday && val > 0 ? '0 0 14px rgba(234,93,58,0.5)' : 'none'
                  }}
                ></div>
              </div>
              <span className={`text-[10px] font-semibold mt-1 ${isToday ? 'text-[#EA5D3A] font-extrabold' : 'text-zinc-500'}`}>{day}</span>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-[#2C2C2C] flex-shrink-0">
        <div>
          <span className="text-lg font-extrabold text-white font-mono">{totalSolved}</span>
          <span className="text-[11px] text-zinc-400 ml-1.5 font-medium">Total Solved</span>
        </div>
        <div>
          <span className="text-lg font-extrabold text-white font-mono">{avgPerDay}</span>
          <span className="text-[11px] text-zinc-400 ml-1.5 font-medium">Avg / Day</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgress;
