import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoadmaps } from '../lib/roadmapDataLoader';
import RoleLevelRoadmap from '../components/RoleLevelRoadmap';
import {
  Map, Search, Sparkles, Bookmark, ArrowRight,
  GraduationCap, Building2, BookOpen, Layers, Compass, Database, Route, Flag
} from 'lucide-react';

export function RoadmapsExplorer() {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [completedStepsMap, setCompletedStepsMap] = useState({});

  useEffect(() => {
    const list = getAllRoadmaps();
    setRoadmaps(list);

    const savedActive = localStorage.getItem('grindfam_active_roadmap');
    if (savedActive) {
      setActiveRoadmapId(savedActive);
    }

    const savedProgress = localStorage.getItem('grindfam_roadmap_progress');
    if (savedProgress) {
      try {
        setCompletedStepsMap(JSON.parse(savedProgress));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleFollowRoadmap = (e, roadmapId) => {
    e.stopPropagation();
    if (activeRoadmapId === roadmapId) {
      setActiveRoadmapId(null);
      localStorage.removeItem('grindfam_active_roadmap');
    } else {
      setActiveRoadmapId(roadmapId);
      localStorage.setItem('grindfam_active_roadmap', roadmapId);
    }
  };

  const filteredRoadmaps = roadmaps.filter(rm => {
    const matchesSearch =
      rm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.steps.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || (s.topics || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    if (selectedCategory === 'ALL') return matchesSearch;
    if (selectedCategory === 'ROLE') return matchesSearch && rm.category.toLowerCase().includes('role');
    if (selectedCategory === 'COMPANY') return matchesSearch && rm.category.toLowerCase().includes('company');
    if (selectedCategory === 'SHEET') return matchesSearch && rm.category.toLowerCase().includes('sheet');
    if (selectedCategory === 'DATABASE') return matchesSearch && (rm.title.toLowerCase().includes('dba') || rm.title.toLowerCase().includes('database') || rm.title.toLowerCase().includes('backend'));
    return matchesSearch;
  });

  const getCompletedCount = (roadmapId) => {
    const setForRm = completedStepsMap[roadmapId] || [];
    return setForRm.length;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#161b22] to-cyan-950/40 border border-[#30363d] p-8 shadow-2xl">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <Route className="w-64 h-64 text-[#22c55e]" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Learning Paths & Role Roadmaps</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Engineering <span className="text-[#22c55e]">Career Roadmaps</span>
          </h1>
          <p className="text-sm md:text-base text-[#8b949e] leading-relaxed">
            Visual step-by-step preparation guides for <strong>Software Roles</strong> (Internship, Campus Placement, Senior Level, PostgreSQL DBA, Fullstack), <strong>Top Tech Companies</strong> (Google, Amazon, Meta), and <strong>Creator DSA Sheets</strong>.
          </p>
        </div>
      </div>

      {/* Role Level Interactive Strategy Component */}
      <RoleLevelRoadmap companyName="GrindFam Career Strategy" />

      {/* Active Target Roadmap Ribbon */}
      {activeRoadmapId && (
        <div className="bg-gradient-to-r from-emerald-900/30 via-teal-900/20 to-[#0d1117] border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[#22c55e] flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider">Active Target Roadmap</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">Following</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                {roadmaps.find(r => r.id === activeRoadmapId)?.title || 'Selected Roadmap'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/roadmap/${activeRoadmapId}`)}
              className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] font-bold text-xs transition-all shadow-lg shadow-[#22c55e]/20 flex items-center gap-1.5"
            >
              <span>Open Interactive Road Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => toggleFollowRoadmap(e, activeRoadmapId)}
              className="px-3 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d] text-xs font-semibold transition-all"
            >
              Unfollow
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roadmaps by title, role, or topic..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#22c55e]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
          {[
            { id: 'ALL', label: 'All Roadmaps', icon: Compass },
            { id: 'ROLE', label: '🎓 Role Tracks', icon: GraduationCap },
            { id: 'COMPANY', label: '🏢 Company Interview Kits', icon: Building2 },
            { id: 'SHEET', label: '📚 Creator DSA Sheets', icon: BookOpen },
            { id: 'DATABASE', label: '🗄️ Database & Cloud', icon: Database },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-[#22c55e] text-[#0e150e] border-[#22c55e] shadow-md'
                  : 'bg-[#161b22] text-[#8b949e] hover:text-white border-[#30363d] hover:bg-[#21262d]'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Roadmaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoadmaps.map(rm => {
          const completedCount = getCompletedCount(rm.id);
          const totalSteps = rm.steps.length;
          const percent = Math.round((completedCount / totalSteps) * 100) || 0;
          const isFollowing = activeRoadmapId === rm.id;

          return (
            <div
              key={rm.id}
              onClick={() => navigate(`/roadmap/${rm.id}`)}
              className="dash-card overflow-hidden bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-[#484f58] transition-all cursor-pointer group flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* SVG Infographic Vector Header Tile (No raster <img>) */}
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-emerald-950 via-[#161b22] to-cyan-950 flex items-center justify-between px-6 border-b border-[#21262d]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] font-black text-lg">
                      {rm.title[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#22c55e]/20 text-[#22c55e]">
                        {rm.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFollowRoadmap(e, rm.id)}
                    className={`p-2 rounded-xl transition-all ${
                      isFollowing
                        ? 'bg-[#22c55e] text-[#0e150e]'
                        : 'bg-[#0d1117] text-[#8b949e] hover:text-white border border-[#30363d]'
                    }`}
                    title={isFollowing ? 'Following' : 'Follow Roadmap'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-[#22c55e] transition-colors leading-snug">
                      {rm.title}
                    </h3>
                    <p className="text-xs text-[#8b949e] mt-1">
                      Curated by <strong className="text-[#dce5d9]">{rm.creator}</strong>
                    </p>
                  </div>

                  {/* Step Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#8b949e] mb-1.5">
                      <span>{completedCount} / {totalSteps} Steps Completed</span>
                      <span className="text-[#22c55e] font-bold">{percent}%</span>
                    </div>
                    <div className="progress-track h-2">
                      <div className="progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 border-t border-[#21262d] bg-[#0d1117]/50 flex items-center justify-between">
                <span className="text-xs text-[#8b949e] font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#22c55e]" />
                  {totalSteps} Milestones
                </span>
                <span className="text-xs font-bold text-[#22c55e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Roadmap <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoadmapsExplorer;
