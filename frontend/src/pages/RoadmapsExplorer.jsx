import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getAllRoadmaps } from '../lib/roadmapDataLoader';
import {
  Map, Search, Sparkles, CheckCircle2, Bookmark, ArrowRight,
  GraduationCap, Building2, BookOpen, Layers, Target, Compass, Star, Check
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

    // Load active roadmap from localStorage
    const savedActive = localStorage.getItem('grindfam_active_roadmap');
    if (savedActive) {
      setActiveRoadmapId(savedActive);
    }

    // Load completed steps
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
      rm.steps.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    if (selectedCategory === 'ALL') return matchesSearch;
    if (selectedCategory === 'ROLE') return matchesSearch && rm.category.toLowerCase().includes('role');
    if (selectedCategory === 'COMPANY') return matchesSearch && rm.category.toLowerCase().includes('company');
    if (selectedCategory === 'SHEET') return matchesSearch && rm.category.toLowerCase().includes('sheet');
    return matchesSearch;
  });

  const getCompletedCount = (roadmapId) => {
    const setForRm = completedStepsMap[roadmapId] || [];
    return setForRm.length;
  };

  return (
    <div className="page-shell">
      <Sidebar activeSection="roadmaps" />

      <div className="page-content">
        <Navbar />

        <main className="page-main-constrained space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-900/30 to-[#0d1117] border border-[#30363d] p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Map className="w-64 h-64 text-indigo-400" />
            </div>
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Learning Paths • Inspired by roadmap.sh</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Career & Role Roadmaps
              </h1>
              <p className="text-sm md:text-base text-[#8b949e] leading-relaxed">
                Step-by-step visual roadmaps for <strong>Roles</strong> (SDE Intern, Campus Placement, Senior Level, DBA), <strong>Top Companies</strong> (Google, Amazon, Meta, Uber, Netflix), and <strong>Creator DSA Sheets</strong> (Striver, NeetCode, Love Babbar). Follow any roadmap to track your milestone progress!
              </p>
            </div>
          </div>

          {/* Active Followed Roadmap Banner */}
          {activeRoadmapId && (
            <div className="bg-gradient-to-r from-emerald-900/30 via-teal-900/20 to-[#0d1117] border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Active Target Roadmap</span>
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roadmaps by title, creator, or topic..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'All Roadmaps', icon: Compass },
                { id: 'ROLE', label: '🎓 Role Tracks', icon: GraduationCap },
                { id: 'COMPANY', label: '🏢 Company Interview Kits', icon: Building2 },
                { id: 'SHEET', label: '📚 Creator DSA Sheets', icon: BookOpen }
              ].map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30'
                        : 'bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-white hover:border-[#484f58]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Roadmaps Grid View */}
          {filteredRoadmaps.length === 0 ? (
            <div className="text-center py-16 bg-[#161b22]/30 border border-[#30363d] rounded-2xl p-8 space-y-3">
              <Map className="w-12 h-12 text-[#6e7681] mx-auto" />
              <h3 className="text-base font-semibold text-white">No Roadmaps Found</h3>
              <p className="text-xs text-[#8b949e]">Try adjusting your search query or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoadmaps.map(rm => {
                const isFollowing = activeRoadmapId === rm.id;
                const completedCount = getCompletedCount(rm.id);
                const totalSteps = rm.steps.length;

                return (
                  <motion.div
                    key={rm.id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/roadmap/${rm.id}`)}
                    className={`group relative bg-[#0d1117]/90 backdrop-blur border rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      isFollowing
                        ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : 'border-[#30363d] hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Header Badge & Follow Button */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {rm.category}
                        </span>

                        <button
                          onClick={(e) => toggleFollowRoadmap(e, rm.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                            isFollowing
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 h-3 text-[#6e7681]" />
                              <span>Follow Roadmap</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Title & Creator */}
                      <div>
                        <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                          <span>{rm.title}</span>
                          <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </h3>
                        <p className="text-xs text-[#8b949e] mt-1 font-medium">
                          Source: <span className="text-[#e6edf3]">{rm.creator}</span>
                        </p>
                      </div>

                      {/* Milestone Step Preview Pills */}
                      <div className="space-y-2 pt-2 border-t border-[#21262d]">
                        <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block">
                          Key Milestones ({totalSteps} Steps):
                        </span>
                        <div className="space-y-1.5">
                          {rm.steps.slice(0, 3).map((step, sIdx) => (
                            <div key={sIdx} className="text-xs text-[#e6edf3] flex items-center gap-2 truncate bg-[#161b22]/70 px-2.5 py-1.5 rounded-lg border border-[#21262d]">
                              <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {step.stepNumber}
                              </span>
                              <span className="truncate">{step.title}</span>
                            </div>
                          ))}
                          {totalSteps > 3 && (
                            <p className="text-[11px] text-indigo-400 font-semibold pl-1">
                              + {totalSteps - 3} more milestones
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Progress Bar */}
                    <div className="pt-4 mt-4 border-t border-[#21262d] flex items-center justify-between text-xs">
                      <span className="text-[#8b949e]">
                        {completedCount} of {totalSteps} steps completed
                      </span>
                      <span className="font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Infographic →
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default RoadmapsExplorer;
