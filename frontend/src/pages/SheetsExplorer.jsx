import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { sheetsData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import {
  FileCode2, Search, ArrowRight, CheckCircle2, User,
  Sparkles, BookOpen
} from 'lucide-react';

function ProgressRing({ percentage, size = 64, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#21262d"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#orange-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA5D3A" />
            <stop offset="100%" stopColor="#F2704E" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-xs font-bold text-white font-mono">
        {percentage}%
      </span>
    </div>
  );
}

export function SheetsExplorer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sheets, setSheets] = useState([]);
  const [sheetStats, setSheetStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('ALL');

  useEffect(() => {
    async function fetchSheetsAndProgress() {
      try {
        setLoading(true);

        const { data: remoteSheets, error: sheetsErr } = await supabase
          .from('sheets')
          .select('*')
          .order('name');

        let activeSheets = remoteSheets;
        if (sheetsErr || !remoteSheets || remoteSheets.length === 0) {
          activeSheets = sheetsData.map((s, idx) => ({
            id: `local-sheet-${s.slug}`,
            name: s.sheet_name,
            creator: s.creator_name,
            slug: s.slug,
            popularity_rank: s.popularity_rank ?? idx,
            total_problems: s.total_problems_count || 0
          }));
        } else {
          const localMap = new Map(sheetsData.map(s => [s.slug, s.popularity_rank]));
          activeSheets = activeSheets.map(s => ({
            ...s,
            popularity_rank: localMap.get(s.slug) ?? 999
          }));
        }

        activeSheets.sort((a, b) => (a.popularity_rank ?? 999) - (b.popularity_rank ?? 999));
        setSheets(activeSheets);

        const stats = {};
        const solvedMap = {};

        if (user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('problem_id, problems(source_id)')
            .eq('user_id', user.id)
            .eq('status', 'solved');

          if (progressData) {
            progressData.forEach(item => {
              const srcId = item.problems?.source_id;
              if (srcId) {
                solvedMap[srcId] = (solvedMap[srcId] || 0) + 1;
              }
            });
          }
        }

        activeSheets.forEach(s => {
          const total = s.total_problems || 0;
          const solved = solvedMap[s.id] || 0;
          const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
          stats[s.id] = { total, solved, percentage };
        });

        setSheetStats(stats);
      } catch (err) {
        console.warn('Error fetching sheets. Using local fallback.', err);
        const fallbackSheets = sheetsData.map((s, idx) => ({
          id: `local-sheet-${s.slug}`,
          name: s.sheet_name,
          creator: s.creator_name,
          slug: s.slug,
          popularity_rank: s.popularity_rank ?? idx,
          total_problems: s.total_problems_count || 0
        })).sort((a, b) => (a.popularity_rank ?? 999) - (b.popularity_rank ?? 999));
        setSheets(fallbackSheets);
      } finally {
        setLoading(false);
      }
    }

    fetchSheetsAndProgress();
  }, [user]);

  const filteredSheets = sheets.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.creator.toLowerCase().includes(searchQuery.toLowerCase());
    if (creatorFilter === 'ALL') return matchesSearch;
    return matchesSearch && s.creator.toLowerCase().includes(creatorFilter.toLowerCase());
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner — Dark Neutral Background with Orange Radial Glow */}
      <div className="relative overflow-hidden rounded-xl bg-[#121212] border border-white/[0.08] p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,rgba(234,93,58,0.08),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[#8b949e] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#EA5D3A]" />
            <span>Popularity Ranked Curriculum</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
            Creator DSA Sheets
          </h1>
          <p className="text-xs md:text-sm text-[#8b949e] leading-relaxed">
            Striver's A2Z Sheet, Striver SDE, Love Babbar 450, NeetCode 150, Blind 75, Apna College, Code Army & more!
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sheets or creators..."
            className="w-full pl-10 pr-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#EA5D3A] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'Striver', 'Love Babbar', 'NeetCode', 'Apna College', 'Rohit Negi'].map(filter => (
            <button
              key={filter}
              onClick={() => setCreatorFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                creatorFilter === filter
                  ? 'bg-[#EA5D3A] text-white border-[#EA5D3A] shadow-md shadow-[#EA5D3A]/20'
                  : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-white hover:border-[#484f58]'
              }`}
            >
              {filter === 'ALL' ? 'All Creators' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-52 rounded-xl bg-[#161b22]/50 border border-[#30363d] animate-pulse p-5 space-y-4" />
          ))}
        </div>
      ) : filteredSheets.length === 0 ? (
        <div className="text-center py-12 bg-[#121212] border border-white/[0.08] rounded-xl p-6 space-y-2">
          <FileCode2 className="w-10 h-10 text-[#6e7681] mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">No Sheets Found</h3>
          <p className="text-xs text-[#8b949e]">Try adjusting your search query or creator filter.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredSheets.map((s, idx) => {
            const stats = sheetStats[s.id] || { total: s.total_problems || 0, solved: 0, percentage: 0 };

            return (
              <motion.div
                key={s.id}
                variants={cardVariants}
                onClick={() => navigate(`/sheet/${s.slug}`)}
                className="group relative bg-[#121212] border border-white/[0.08] hover:border-[#EA5D3A]/40 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-[#EA5D3A]/5 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 pr-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#181818] border border-white/10 text-[#8b949e] text-[10px] font-semibold uppercase tracking-wider">
                        #{idx + 1} Sheet
                      </span>
                      <h3 className="text-base font-extrabold text-white group-hover:text-[#EA5D3A] transition-colors leading-snug">
                        {s.name}
                      </h3>
                      <p className="text-xs text-[#8b949e] flex items-center gap-1">
                        <User className="w-3 h-3 text-[#6e7681]" />
                        <span>{s.creator}</span>
                      </p>
                    </div>

                    <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
                      <ProgressRing percentage={stats.percentage} size={60} strokeWidth={5} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8b949e]">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#6e7681]" />
                      <span>{stats.total} Problems</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-[#EA5D3A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{stats.solved} Solved</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 flex items-center justify-between text-xs font-bold text-[#EA5D3A] group-hover:translate-x-0.5 transition-transform">
                  <span>Open Sheet Checklist</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default SheetsExplorer;
