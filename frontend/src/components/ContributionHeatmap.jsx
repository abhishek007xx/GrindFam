import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Flame, Calendar, TrendingUp, Award, Loader2, GitCommit } from 'lucide-react';
import CalendarDatePickerModal from './CalendarDatePickerModal';

import { API_BASE_URL } from '../config/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getLevel = (count, maxCount) => {
  if (count === 0) return 0;
  if (maxCount === 0) return 1;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};

const levelColorsDark = {
  0: '#1E1E1E',   // empty dark
  1: '#0e4429',   // low green
  2: '#006d32',   // medium green
  3: '#26a641',   // high green
  4: '#39d353',   // max green
};

const levelColorsLight = {
  0: '#e2e8f0',   // empty light slate
  1: '#9be9a8',   // low green
  2: '#40c463',   // medium green
  3: '#30a14e',   // high green
  4: '#216e39',   // max green
};

// Fallback generator for 365 days if API is loading or offline
const generateFallbackDays = () => {
  const days = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 364);

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    days.push({
      date: cursor.toISOString().split('T')[0],
      count: 0
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const ContributionHeatmap = ({ onWeeklyDataLoaded }) => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);

  const activeLevelColors = theme === 'light' ? levelColorsLight : levelColorsDark;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setData({ days: generateFallbackDays(), stats: { totalSolved: 0, activeDays: 0, maxInDay: 0, currentStreak: 0, longestStreak: 0 } });
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/activity/heatmap`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
        if (res.data?.weeklyData) {
          onWeeklyDataLoaded?.(res.data.weeklyData);
        }
      } catch (err) {
        console.warn('Backend activity heatmap fetch error, using fallback:', err);
        setData({ days: generateFallbackDays(), stats: { totalSolved: 0, activeDays: 0, maxInDay: 0, currentStreak: 0, longestStreak: 0 } });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, onWeeklyDataLoaded]);

  const days = data?.days || generateFallbackDays();
  const stats = data?.stats || { totalSolved: 0, activeDays: 0, maxInDay: 0, currentStreak: 0, longestStreak: 0 };
  const maxCount = stats.maxInDay || 1;

  // ── Build the grid: columns = weeks, rows = 7 days (Sun→Sat) ──
  const firstDay = days.length > 0 ? new Date(days[0].date) : new Date();
  const startDow = firstDay.getDay(); // 0=Sun

  const paddedDays = [];
  for (let i = 0; i < startDow; i++) paddedDays.push(null);
  paddedDays.push(...days);

  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek && lastWeek.length < 7) lastWeek.push(null);

  // ── Month labels ──
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    for (const d of week) {
      if (!d) continue;
      const m = new Date(d.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ weekIndex: wi, label: MONTHS[m] });
        lastMonth = m;
        break;
      }
    }
  });

  const handleMouseEnter = (day, e) => {
    if (!day) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  const cellSize = 11;
  const cellGap = 3;

  const yearlyPercent = Math.min(100, Math.round(((stats.activeDays || 0) / 365) * 100));
  const bigRadius = 28;
  const bigCircumference = 2 * Math.PI * bigRadius;
  const bigStrokeOffset = bigCircumference * (1 - yearlyPercent / 100);

  return (
    <div className="dash-card p-4 border border-[#333333] dark:border-[#333333] light:border-slate-200 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white rounded-2xl shadow-sm" id="activity-section">
      {/* Header with Title & Stat Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[#10B981] flex-shrink-0">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2 flex-wrap">
              <span>All-Time Contribution Progress</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#10B981] border border-emerald-500/30 font-semibold">
                GitHub Green
              </span>
            </h3>
            <p className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500">
              <strong className="text-white font-mono">{stats.totalSolved || 0}</strong> problems solved in the last 365 days
            </p>
          </div>
        </div>

        {/* Header Right Stat Chips */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>Streak: {stats.currentStreak || 0}d</span>
          </div>

          <div 
            onClick={() => setIsDatePickerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold cursor-pointer hover:bg-blue-500/20 transition-all"
            title="Click to open interactive Date Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Active: {stats.activeDays || 0}d</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Best: {stats.longestStreak || 0}d</span>
          </div>

          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#10B981] flex-shrink-0 ml-1" />}
        </div>
      </div>

      {/* Heatmap Grid + ⭕ BADA SA GOL Donut Gauge in Red Circle Spot */}
      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center justify-between min-w-[850px] gap-4">
          {/* Heatmap 52-Week Grid */}
          <div className="flex-1">
            {/* Month labels row */}
            <div className="flex ml-8 mb-1" style={{ gap: `${cellGap}px` }}>
              {weeks.map((_, wi) => {
                const label = monthLabels.find((m) => m.weekIndex === wi);
                return (
                  <div key={wi} style={{ width: `${cellSize}px`, flexShrink: 0 }}>
                    {label && (
                      <span className="text-[9px] text-[#A3A3A3] font-medium">{label.label}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid: day labels + cells */}
            <div className="flex items-center">
              {/* Day-of-week labels */}
              <div className="flex flex-col w-6 mr-1.5 flex-shrink-0" style={{ gap: `${cellGap}px` }}>
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
                  <div key={i} className="flex items-center justify-end" style={{ height: `${cellSize}px` }}>
                    <span className="text-[9px] text-[#A3A3A3] font-medium pr-1">{label}</span>
                  </div>
                ))}
              </div>

              {/* Columns = weeks */}
              <div className="flex" style={{ gap: `${cellGap}px` }}>
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap: `${cellGap}px` }}>
                    {week.map((day, di) => {
                      if (!day) {
                        return <div key={di} style={{ width: cellSize, height: cellSize }} />;
                      }
                      const level = getLevel(day.count, maxCount);
                      return (
                        <div
                          key={di}
                          className="rounded-[2px] cursor-pointer transition-all duration-100 hover:ring-1 hover:ring-emerald-400"
                          style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: activeLevelColors[level],
                          }}
                          onMouseEnter={(e) => handleMouseEnter(day, e)}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ⭕ BADA SA GOL - Placed in the exact spot indicated by the user's Red Circle */}
          <div className="flex flex-col items-center justify-center p-3.5 bg-[#141416] dark:bg-[#141416] light:bg-slate-50 border border-[#2B2B32] rounded-2xl flex-shrink-0 min-w-[150px] shadow-md">
            <div className="relative w-20 h-20 mb-1">
              <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
                <circle cx="35" cy="35" r={bigRadius} fill="none" stroke="#222228" strokeWidth="5.5" />
                <circle
                  cx="35" cy="35" r={bigRadius}
                  fill="none" stroke="#10B981" strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeDasharray={bigCircumference}
                  strokeDashoffset={bigStrokeOffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-base font-black text-white dark:text-white light:text-slate-900 leading-none">
                  {yearlyPercent}%
                </span>
                <span className="text-[7px] font-extrabold uppercase tracking-wider text-[#10B981] mt-0.5">Yearly</span>
              </div>
            </div>
            <p className="text-xs font-black text-white dark:text-white light:text-slate-900 text-center">Consistency</p>
            <p className="text-[10px] text-zinc-400 text-center mt-0.5">
              <span className="font-bold text-[#10B981]">{stats.activeDays || 0}</span> / 365 Days
            </p>
          </div>

          {/* Legend inline on the far right */}
          <div className="flex flex-col justify-end items-end h-full flex-shrink-0 pl-3 border-l border-[#2A2A2A]">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#A3A3A3] font-medium mr-0.5">Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className="rounded-[2px]"
                  style={{ width: cellSize, height: cellSize, backgroundColor: activeLevelColors[lvl] }}
                />
              ))}
              <span className="text-[9px] text-[#A3A3A3] font-medium ml-0.5">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-[#262626] border border-slate-700 dark:border-[#333333] shadow-xl pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="text-xs font-bold text-white">
            {hoveredDay.count} problem{hoveredDay.count !== 1 ? 's' : ''} solved
          </p>
          <p className="text-[10px] text-slate-300 dark:text-[#A3A3A3]">
            {new Date(hoveredDay.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      )}

      <CalendarDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedCalendarDate}
        onSelectDate={(newDate) => {
          setSelectedCalendarDate(newDate);
        }}
      />
    </div>
  );
};

export default ContributionHeatmap;
