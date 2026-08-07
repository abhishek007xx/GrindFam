import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoadmaps } from '../lib/roadmapDataLoader';
import RoleLevelRoadmap from '../components/RoleLevelRoadmap';
import {
  Search, Bookmark, ArrowRight,
  GraduationCap, Building2, BookOpen, Layers, Compass, Database
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
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Hero Banner Section — Soft Dark Slate (#161B22, #30363D) */}
      <div className="relative overflow-hidden rounded-lg bg-[#161B22] border border-[#30363D] p-6 md:p-8">
        <img
          src="/logo.png"
          alt="GrindFam Mascot"
          className="absolute -bottom-8 -right-8 w-44 h-44 object-contain opacity-[0.05] grayscale pointer-events-none select-none"
        />

        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] text-xs font-medium">
            <Compass className="w-3.5 h-3.5 text-[#EA5D3A]" />
            <span>Structured Preparation Guides</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F3F4F6] tracking-tight">
            Engineering Career Roadmaps
          </h1>
          <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed">
            Visual step-by-step preparation guides for <strong>Software Roles</strong> (Internship, Campus Placement, Senior Level), <strong>Top Tech Companies</strong>, and <strong>DSA Sheets</strong>.
          </p>
        </div>
      </div>

      {/* Role Level Interactive Strategy Component */}
      <RoleLevelRoadmap companyName="GrindFam Career Strategy" />

      {/* Active Target Roadmap Ribbon */}
      {activeRoadmapId && (
        <div className="bg-[#161B22] border border-[#EA5D3A]/40 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] flex items-center justify-center font-bold">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#EA5D3A] uppercase tracking-wider">Active Target Roadmap</span>
                <span className="px-2 py-0.5 rounded text-[#10B981] bg-[#10B981]/15 text-[10px] font-semibold">Following</span>
              </div>
              <h3 className="text-sm font-bold text-[#F3F4F6] mt-0.5">
                {roadmaps.find(r => r.id === activeRoadmapId)?.title || 'Selected Roadmap'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/roadmap/${activeRoadmapId}`)}
              className="px-3.5 py-2 rounded-md bg-[#EA5D3A] hover:bg-[#F2704E] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Open Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => toggleFollowRoadmap(e, activeRoadmapId)}
              className="px-3 py-2 rounded-md bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-white border border-[#30363D] text-xs font-medium transition-all"
            >
              Unfollow
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roadmaps by title or topic..."
            className="w-full pl-10 pr-4 py-2 bg-[#161B22] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
          {[
            { id: 'ALL', label: 'All Roadmaps', icon: Compass },
            { id: 'ROLE', label: '🎓 Role Tracks', icon: GraduationCap },
            { id: 'COMPANY', label: '🏢 Company Kits', icon: Building2 },
            { id: 'SHEET', label: '📚 Creator Sheets', icon: BookOpen },
            { id: 'DATABASE', label: '🗄️ Database & Cloud', icon: Database },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-[#1F2937] text-white border-[#EA5D3A] shadow-sm'
                  : 'bg-[#161B22] text-[#9CA3AF] border-[#30363D] hover:text-white hover:border-[#4B5563]'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Roadmaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoadmaps.map(rm => {
          const completedCount = getCompletedCount(rm.id);
          const totalSteps = rm.steps.length;
          const percent = Math.round((completedCount / totalSteps) * 100) || 0;
          const isFollowing = activeRoadmapId === rm.id;

          return (
            <div
              key={rm.id}
              onClick={() => navigate(`/roadmap/${rm.id}`)}
              className="dash-card overflow-hidden bg-[#161B22] border border-[#30363D] rounded-lg hover:border-[#4B5563] transition-all cursor-pointer group flex flex-col justify-between p-5"
            >
              <div>
                {/* Header Tile */}
                <div className="relative h-24 w-full overflow-hidden bg-[#1F2937] flex items-center justify-between px-4 border-b border-[#30363D] rounded-md mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 flex items-center justify-center text-[#EA5D3A] font-bold text-base">
                      {rm.title[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#161B22] border border-[#30363D] text-[#9CA3AF]">
                        {rm.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFollowRoadmap(e, rm.id)}
                    className={`p-1.5 rounded-md transition-all ${
                      isFollowing
                        ? 'bg-[#EA5D3A] text-white'
                        : 'bg-[#161B22] text-[#9CA3AF] hover:text-white border border-[#30363D]'
                    }`}
                    title={isFollowing ? 'Following' : 'Follow Roadmap'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[#F3F4F6] group-hover:text-[#EA5D3A] transition-colors leading-snug">
                      {rm.title}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Curated by <strong className="text-white">{rm.creator}</strong>
                    </p>
                  </div>

                  {/* Step Progress Bar — Semantic Muted Green (#10B981) */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#9CA3AF] mb-1.5">
                      <span>{completedCount} / {totalSteps} Steps</span>
                      <span className="text-[#10B981] font-bold">{percent}%</span>
                    </div>
                    <div className="progress-track h-1.5 bg-[#1F2937]">
                      <div className="progress-fill h-full bg-[#10B981]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-1 pt-4 mt-4 border-t border-[#21262D] flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF] font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#6B7280]" />
                  {totalSteps} Milestones
                </span>
                <span className="text-xs font-semibold text-[#EA5D3A] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
