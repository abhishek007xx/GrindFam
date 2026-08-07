import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoadmaps } from '../lib/roadmapDataLoader';
import {
  Search, Bookmark, ArrowRight, CheckCircle2, Lock,
  Sparkles, Trophy, Clock, Compass, Layers, Play, Award, BarChart2
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
    } else if (list.length > 0) {
      setActiveRoadmapId(list[0].id);
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
    if (selectedCategory === 'DATABASE') return matchesSearch && (rm.title.toLowerCase().includes('dba') || rm.title.toLowerCase().includes('database') || rm.title.toLowerCase().includes('backend') || rm.title.toLowerCase().includes('system'));
    return matchesSearch;
  });

  const activeRoadmap = roadmaps.find(r => r.id === activeRoadmapId) || roadmaps[0];
  const activeCompletedCount = activeRoadmapId ? (completedStepsMap[activeRoadmapId]?.length || 0) : 0;
  const activeTotalSteps = activeRoadmap?.steps?.length || 10;
  const activePercent = Math.round((activeCompletedCount / activeTotalSteps) * 100) || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-fadeIn pb-12">
      {/* ── 1. Top Header & Category Filter Pills ── */}
      <header className="flex flex-col gap-5 bg-[#0E0E0E] border border-[#1F1F1F] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EA5D3A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA5D3A]/10 border border-[#EA5D3A]/30 text-[#EA5D3A] text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Universal Career Roadmap System</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#FAFAFA] tracking-tight">
              Career Roadmaps
            </h1>
            <p className="text-xs md:text-sm text-[#8A8A85] leading-relaxed">
              Guided learning paths engineered for high-performance careers in Software Engineering, System Architecture, and Technical Leadership.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A85]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roadmaps or topics..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#171717] border border-[#262626] rounded-2xl text-xs text-[#FAFAFA] placeholder-[#8A8A85] focus:outline-none focus:border-[#EA5D3A] transition-all"
            />
          </div>
        </div>

        {/* Filter Pills Row matching Universal Roadmap System */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#1F1F1F] pt-4">
          {[
            { id: 'ALL', label: 'All Roles' },
            { id: 'ROLE', label: 'Engineering Tracks' },
            { id: 'COMPANY', label: 'Company Hiring Kits' },
            { id: 'SHEET', label: 'DSA Sheet Roadmaps' },
            { id: 'DATABASE', label: 'System Design & Backend' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-[#EA5D3A] text-white border-[#EA5D3A] shadow-lg shadow-[#EA5D3A]/20'
                  : 'bg-[#171717] text-[#8A8A85] border-[#262626] hover:text-[#FAFAFA] hover:border-[#EA5D3A]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── 2. Main Content Grid (Left Canvas + Right Path Analytics) ── */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Canvas Area (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Roadmap Skill Tree Container */}
          {activeRoadmap && (
            <section className="bg-[#121212] border border-[rgba(250,250,250,0.1)] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#1F1F1F]">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="px-3 py-0.5 bg-[#EA5D3A]/15 text-[#EA5D3A] text-[11px] font-bold rounded-full border border-[#EA5D3A]/30">
                      In Progress Path
                    </span>
                    <span className="text-[#8A8A85] text-xs font-mono">{activeRoadmap.category || 'Career Track'}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#FAFAFA]">
                    {activeRoadmap.title}
                  </h2>
                </div>

                <button
                  onClick={() => navigate(`/roadmap/${activeRoadmap.id}`)}
                  className="px-4 py-2.5 bg-[#EA5D3A] hover:bg-[#F2633F] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#EA5D3A]/20 transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Path</span>
                </button>
              </div>

              {/* Universal Roadmap Interactive Timeline Skill Tree */}
              <div className="relative pl-6 md:pl-10 space-y-12">
                {/* Stage 1: Foundations */}
                <div className="relative">
                  <div className="absolute -left-[24px] md:-left-[40px] top-6 bottom-[-48px] w-0.5 bg-[#1F1F1F]" />
                  <div className="absolute -left-[29px] md:-left-[45px] top-2 w-3 h-3 rounded-full bg-[#10B981] shadow-sm shadow-[#10B981]" />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <h3 className="text-xs font-bold text-[#10B981] uppercase tracking-wider">
                        Stage 1: Foundational Core
                      </h3>
                      <span className="text-[11px] text-[#10B981] font-semibold">(Completed)</span>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {activeRoadmap.steps.slice(0, 2).map((step, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/roadmap/${activeRoadmap.id}`)}
                        className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-4 flex items-start justify-between gap-4 cursor-pointer hover:border-[#10B981]/50 transition-all"
                      >
                        <div className="flex items-start gap-3.5">
                          <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-extrabold text-[#FAFAFA] line-through decoration-[#10B981]">
                              {step.title}
                            </h4>
                            <p className="text-xs text-[#8A8A85] mt-1 line-through">
                              {step.desc || 'Core algorithms, complexity, and basic data structures.'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-[#8A8A85] font-mono flex-shrink-0">Completed</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage 2: Advanced Architecture (Active) */}
                <div className="relative">
                  <div className="absolute -left-[24px] md:-left-[40px] top-6 bottom-[-48px] w-0.5 bg-gradient-to-b from-[#EA5D3A] to-[#121212]" />
                  <div className="absolute -left-[31px] md:-left-[47px] top-2 w-4 h-4 rounded-full bg-[#0A0A0A] border-2 border-[#EA5D3A] flex items-center justify-center shadow-[0_0_12px_#EA5D3A]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EA5D3A]" />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#EA5D3A] animate-pulse" />
                      <h3 className="text-xs font-bold text-[#EA5D3A] uppercase tracking-wider">
                        Stage 2: Advanced System Architecture
                      </h3>
                      <span className="text-[11px] text-[#EA5D3A] font-semibold">(In Progress)</span>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {activeRoadmap.steps.slice(2, 4).map((step, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/roadmap/${activeRoadmap.id}`)}
                        className={`bg-[#0A0A0A] rounded-xl p-4 flex items-start justify-between gap-4 cursor-pointer transition-all ${
                          idx === 0
                            ? 'border-l-4 border-l-[#EA5D3A] border-y border-r border-[#1F1F1F] shadow-[0_0_20px_rgba(234,93,58,0.15)]'
                            : 'border border-[#1F1F1F] opacity-75'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-3.5">
                            <Sparkles className="w-4 h-4 text-[#EA5D3A] flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <h4 className="text-xs font-extrabold text-[#FAFAFA]">
                                {step.title}
                              </h4>
                              <p className="text-xs text-[#8A8A85] mt-1">
                                {step.desc || 'Designing high-concurrency distributed services.'}
                              </p>
                            </div>
                          </div>
                          {idx === 0 && (
                            <div className="w-full bg-[#1F1F1F] h-1.5 rounded-full mt-3 overflow-hidden">
                              <div className="bg-[#EA5D3A] h-1.5 rounded-full w-2/3 transition-all" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-[#EA5D3A] font-bold font-mono flex-shrink-0">
                          {idx === 0 ? '65% Complete' : 'Next'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage 3: High Scale (Locked) */}
                <div className="relative">
                  <div className="absolute -left-[29px] md:-left-[45px] top-2 w-3 h-3 rounded-full bg-[#1F1F1F]" />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#1F1F1F]" />
                      <h3 className="text-xs font-bold text-[#8A8A85] uppercase tracking-wider">
                        Stage 3: High-Concurrency & Scale
                      </h3>
                      <span className="text-[11px] text-[#8A8A85] opacity-60">(Locked)</span>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {activeRoadmap.steps.slice(4, 6).map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-4 flex items-start gap-3.5 opacity-50 cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4 text-[#8A8A85] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-extrabold text-[#8A8A85]">
                            {step.title}
                          </h4>
                          <p className="text-xs text-[#8A8A85]/70 mt-1">
                            {step.desc || 'Prerequisite: Complete Stage 2 to unlock.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Popular Roadmaps Grid */}
          <section className="space-y-4">
            <h3 className="text-lg font-extrabold text-[#FAFAFA] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#EA5D3A]" />
              <span>Explore Popular Career Roadmaps</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredRoadmaps.map((rm) => {
                const isCurrent = activeRoadmapId === rm.id;
                return (
                  <div
                    key={rm.id}
                    onClick={() => {
                      setActiveRoadmapId(rm.id);
                      localStorage.setItem('grindfam_active_roadmap', rm.id);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-[#121212] border-[#EA5D3A] shadow-lg ring-1 ring-[#EA5D3A]/50'
                        : 'bg-[#0E0E0E] border-[#1F1F1F] hover:border-[#EA5D3A]/40 hover:bg-[#131313]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#171717] border border-[#262626] text-[#8A8A85] text-[10px] font-bold uppercase">
                          {rm.category}
                        </span>
                        <button
                          onClick={(e) => toggleFollowRoadmap(e, rm.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isCurrent
                              ? 'bg-[#EA5D3A]/20 border-[#EA5D3A]/50 text-[#EA5D3A]'
                              : 'bg-[#171717] border-[#262626] text-[#8A8A85] hover:text-white'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-[#FAFAFA] group-hover:text-[#EA5D3A] transition-colors leading-snug">
                          {rm.title}
                        </h4>
                        <p className="text-xs text-[#8A8A85] mt-1 line-clamp-2">
                          {rm.description || 'Structured milestone-based preparation roadmap.'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1F1F1F] flex items-center justify-between text-xs text-[#8A8A85]">
                      <span className="font-mono">{rm.steps?.length || 8} Milestones</span>
                      <span className="text-[#EA5D3A] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Path →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── Right Sidebar Area: Path Analytics (4 cols) ── */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Path Analytics Card matching Universal Roadmap System */}
          <div className="bg-[#121212] border border-[rgba(250,250,250,0.1)] rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-xs font-extrabold text-[#FAFAFA] uppercase tracking-wider border-b border-[#1F1F1F] pb-3 flex items-center justify-between">
              <span>Path Analytics</span>
              <BarChart2 className="w-4 h-4 text-[#EA5D3A]" />
            </h3>

            {/* Stat 1: Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8A8A85] font-medium">Overall Progress</span>
                <span className="font-mono font-extrabold text-[#EA5D3A]">{activePercent}%</span>
              </div>
              <div className="w-full bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-[#1F1F1F]">
                <div
                  className="bg-[#EA5D3A] h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${activePercent}%` }}
                />
              </div>
            </div>

            {/* Stat 2: Skills Acquired */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
              <div className="w-9 h-9 rounded-xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/20 text-[#EA5D3A] flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] text-[#8A8A85] font-medium">Skills Acquired</span>
                <span className="block text-sm font-extrabold text-[#FAFAFA] font-mono">
                  {activeCompletedCount} / {activeTotalSteps}
                </span>
              </div>
            </div>

            {/* Stat 3: Est. Time Remaining */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
              <div className="w-9 h-9 rounded-xl bg-[#171717] border border-[#262626] text-[#8A8A85] flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-[#EA5D3A]" />
              </div>
              <div>
                <span className="block text-[11px] text-[#8A8A85] font-medium">Est. Time Remaining</span>
                <span className="block text-sm font-extrabold text-[#FAFAFA] font-mono">
                  {Math.max(5, (activeTotalSteps - activeCompletedCount) * 4)} Hrs
                </span>
              </div>
            </div>

            {/* Skill Breakdown Progress Bars */}
            <div className="pt-4 border-t border-[#1F1F1F] space-y-3">
              <h4 className="text-[11px] font-extrabold text-[#8A8A85] uppercase tracking-wider">
                Skill Breakdown
              </h4>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#8A8A85]">Core DSA</span>
                  <span className="text-[#FAFAFA] font-mono">90%</span>
                </div>
                <div className="w-full bg-[#0A0A0A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#8A8A85]">System Architecture</span>
                  <span className="text-[#FAFAFA] font-mono">45%</span>
                </div>
                <div className="w-full bg-[#0A0A0A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#EA5D3A] h-1.5 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#8A8A85]">API & LLD Design</span>
                  <span className="text-[#FAFAFA] font-mono">20%</span>
                </div>
                <div className="w-full bg-[#0A0A0A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#F97316] h-1.5 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Certification Card Banner */}
          <div className="bg-gradient-to-br from-[#1b1715] to-[#0d0c0c] border border-[#EA5D3A]/30 rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#EA5D3A]/20 text-[#EA5D3A] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#FAFAFA]">Career Certification</h4>
              <p className="text-xs text-[#8A8A85] mt-1 leading-snug">
                Complete all milestones in your active target path to unlock your verified GrindFam readiness badge.
              </p>
            </div>
            <button
              onClick={() => navigate(`/roadmap/${activeRoadmap?.id}`)}
              className="text-xs font-bold text-[#EA5D3A] hover:underline inline-flex items-center gap-1"
            >
              <span>View Requirements</span> →
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default RoadmapsExplorer;
