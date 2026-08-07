import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoadmaps } from '../lib/roadmapDataLoader';
import { motion } from 'framer-motion';
import {
  Search, Bookmark, ArrowRight, CheckCircle2, Lock,
  Sparkles, Trophy, Clock, Compass, Layers, Play, Award,
  BarChart2, User, BookOpen
} from 'lucide-react';

/* ── Circular Progress Ring (same component used by SheetsExplorer) ── */
function ProgressRing({ percentage, size = 52, strokeWidth = 4.5, color = '#EA5D3A' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#1F1F1F" strokeWidth={strokeWidth} fill="transparent"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-[#FAFAFA] font-mono">
        {percentage}%
      </span>
    </div>
  );
}

/* ── Helper: split steps into dynamic "stages" based on completion ── */
function buildStages(steps, completedStepNumbers) {
  if (!steps || steps.length === 0) return [];

  // Find the boundary: all completed steps form "Completed" stages,
  // then 1 stage for "In Progress", then remaining as "Locked"
  const completed = [];
  const inProgress = [];
  const locked = [];

  steps.forEach(step => {
    if (completedStepNumbers.includes(step.stepNumber)) {
      completed.push(step);
    } else if (inProgress.length === 0) {
      // First uncompleted step is "in progress"
      inProgress.push(step);
    } else {
      locked.push(step);
    }
  });

  const stages = [];

  if (completed.length > 0) {
    stages.push({ label: 'Completed Milestones', status: 'completed', steps: completed });
  }
  if (inProgress.length > 0) {
    stages.push({ label: 'Currently Learning', status: 'active', steps: inProgress });
  }
  if (locked.length > 0) {
    // Show max 3 locked steps as preview
    stages.push({ label: 'Upcoming Milestones', status: 'locked', steps: locked.slice(0, 3), totalLocked: locked.length });
  }

  return stages;
}

/* ── Helper: derive skill breakdown from step topics ── */
function deriveSkillBreakdown(steps, completedStepNumbers) {
  if (!steps || steps.length === 0) return [];

  // Collect all unique topics across all steps
  const topicStepMap = {};
  steps.forEach(step => {
    const topics = step.topics || [];
    topics.forEach(t => {
      const key = t.trim();
      if (!key) return;
      if (!topicStepMap[key]) topicStepMap[key] = { total: 0, completed: 0 };
      topicStepMap[key].total += 1;
      if (completedStepNumbers.includes(step.stepNumber)) {
        topicStepMap[key].completed += 1;
      }
    });
  });

  // Pick top 4 topics by frequency
  const sorted = Object.entries(topicStepMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 4);

  const colors = ['#10B981', '#EA5D3A', '#F97316', '#8B5CF6'];

  return sorted.map(([topic, data], idx) => ({
    label: topic.length > 22 ? topic.slice(0, 20) + '…' : topic,
    percent: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    color: colors[idx % colors.length]
  }));
}

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
    if (savedActive && list.find(r => r.id === savedActive)) {
      setActiveRoadmapId(savedActive);
    } else if (list.length > 0) {
      setActiveRoadmapId(list[0].id);
    }

    const savedProgress = localStorage.getItem('grindfam_roadmap_progress');
    if (savedProgress) {
      try { setCompletedStepsMap(JSON.parse(savedProgress)); }
      catch (e) { console.error(e); }
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

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(rm => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        rm.title.toLowerCase().includes(q) ||
        rm.creator.toLowerCase().includes(q) ||
        rm.steps.some(s =>
          s.title.toLowerCase().includes(q) ||
          (s.topics || []).some(t => t.toLowerCase().includes(q))
        );

      if (selectedCategory === 'ALL') return matchesSearch;
      if (selectedCategory === 'ROLE') return matchesSearch && rm.category?.toLowerCase().includes('role');
      if (selectedCategory === 'COMPANY') return matchesSearch && rm.category?.toLowerCase().includes('company');
      if (selectedCategory === 'SHEET') return matchesSearch && (rm.category?.toLowerCase().includes('sheet') || rm.category?.toLowerCase().includes('dsa'));
      if (selectedCategory === 'DATABASE') return matchesSearch && (rm.title.toLowerCase().includes('dba') || rm.title.toLowerCase().includes('database') || rm.title.toLowerCase().includes('backend') || rm.title.toLowerCase().includes('system'));
      return matchesSearch;
    });
  }, [roadmaps, searchQuery, selectedCategory]);

  // Active roadmap computed data
  const activeRoadmap = roadmaps.find(r => r.id === activeRoadmapId) || null;
  const activeCompleted = activeRoadmapId ? (completedStepsMap[activeRoadmapId] || []) : [];
  const activeTotalSteps = activeRoadmap?.steps?.length || 0;
  const activePercent = activeTotalSteps > 0 ? Math.round((activeCompleted.length / activeTotalSteps) * 100) : 0;

  // Dynamic stages for the active roadmap timeline
  const stages = activeRoadmap ? buildStages(activeRoadmap.steps, activeCompleted) : [];

  // Dynamic skill breakdown
  const skillBreakdown = activeRoadmap ? deriveSkillBreakdown(activeRoadmap.steps, activeCompleted) : [];

  // Animation variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const cardVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-lg bg-[#161B22] border border-[#30363D] p-6 md:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#EA5D3A]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] text-xs font-medium">
              <Compass className="w-3.5 h-3.5 text-[#EA5D3A]" />
              <span>Career Roadmap System</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#F3F4F6] tracking-tight">
              Career Roadmaps
            </h1>
            <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed">
              Guided learning paths for Software Engineering, System Architecture, and Technical Leadership.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roadmaps or topics..."
              className="w-full pl-10 pr-4 py-2 bg-[#161B22] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
        {[
          { id: 'ALL', label: 'All Paths' },
          { id: 'ROLE', label: 'Role Tracks' },
          { id: 'COMPANY', label: 'Company Prep' },
          { id: 'SHEET', label: 'DSA Sheets' },
          { id: 'DATABASE', label: 'System Design' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
              selectedCategory === cat.id
                ? 'bg-[#1F2937] text-white border-[#EA5D3A] shadow-sm'
                : 'bg-[#161B22] text-[#9CA3AF] border-[#30363D] hover:text-white hover:border-[#4B5563]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Main Grid: Cards Left + Analytics Right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Roadmap Cards Grid (8 cols) */}
        <div className="lg:col-span-8">
          {filteredRoadmaps.length === 0 ? (
            <div className="text-center py-12 bg-[#161B22] border border-[#30363D] rounded-lg p-6 space-y-2">
              <Compass className="w-10 h-10 text-[#6B7280] mx-auto" />
              <h3 className="text-sm font-semibold text-[#F3F4F6]">No Roadmaps Found</h3>
              <p className="text-xs text-[#9CA3AF]">Try adjusting your search query or category filter.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {filteredRoadmaps.map((rm) => {
                const isActive = activeRoadmapId === rm.id;
                const rmCompleted = completedStepsMap[rm.id] || [];
                const rmTotal = rm.steps?.length || 0;
                const rmPercent = rmTotal > 0 ? Math.round((rmCompleted.length / rmTotal) * 100) : 0;

                return (
                  <motion.div
                    key={rm.id}
                    variants={cardVariants}
                    onClick={() => navigate(`/roadmap/${rm.id}`)}
                    className={`group relative bg-[#161B22] border rounded-lg p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-[#EA5D3A] shadow-md ring-1 ring-[#EA5D3A]/30'
                        : 'border-[#30363D] hover:border-[#4B5563]'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top: Badge + Follow Button */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 pr-2">
                          <span className="px-2 py-0.5 rounded bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] text-[10px] font-medium">
                            {rm.category}
                          </span>
                          <h3 className="text-base font-bold text-[#F3F4F6] group-hover:text-[#EA5D3A] transition-colors leading-snug">
                            {rm.title}
                          </h3>
                          <p className="text-xs text-[#9CA3AF] flex items-center gap-1">
                            <User className="w-3 h-3 text-[#6B7280]" />
                            <span>{rm.creator}</span>
                          </p>
                        </div>

                        <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
                          <ProgressRing percentage={rmPercent} size={52} strokeWidth={4.5} color="#EA5D3A" />
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="pt-3 border-t border-[#21262D] flex items-center justify-between text-xs text-[#9CA3AF]">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#6B7280]" />
                          <span>{rmTotal} Milestones</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-[#10B981]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{rmCompleted.length} Done</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Follow + View */}
                    <div className="mt-3 pt-2.5 flex items-center justify-between">
                      <button
                        onClick={(e) => toggleFollowRoadmap(e, rm.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
                          isActive
                            ? 'bg-[#EA5D3A]/15 border-[#EA5D3A]/40 text-[#EA5D3A]'
                            : 'bg-[#161B22] border-[#30363D] text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-3 h-3" />
                        {isActive ? 'Following' : 'Follow'}
                      </button>
                      <span className="text-xs font-semibold text-[#EA5D3A] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Open Roadmap <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* ── Right Sidebar: Active Path Analytics (4 cols) ── */}
        <aside className="lg:col-span-4 space-y-4">
          {activeRoadmap ? (
            <>
              {/* Active Path Quick View */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
                  <h3 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-[#EA5D3A]" />
                    Active Path
                  </h3>
                  <span className="text-[10px] font-mono text-[#9CA3AF] bg-[#1F2937] px-2 py-0.5 rounded border border-[#30363D]">
                    {activeRoadmap.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#F3F4F6] leading-snug">{activeRoadmap.title}</h4>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{activeRoadmap.creator}</p>
                </div>

                {/* Overall Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9CA3AF] font-medium">Overall Progress</span>
                    <span className="font-mono font-bold text-[#EA5D3A]">{activePercent}%</span>
                  </div>
                  <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden border border-[#21262D]">
                    <div
                      className="bg-[#EA5D3A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${activePercent}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0D1117] border border-[#21262D]">
                    <Trophy className="w-4 h-4 text-[#EA5D3A] flex-shrink-0" />
                    <div>
                      <span className="block text-[10px] text-[#9CA3AF]">Done</span>
                      <span className="block text-sm font-bold text-[#F3F4F6] font-mono">
                        {activeCompleted.length}/{activeTotalSteps}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0D1117] border border-[#21262D]">
                    <Clock className="w-4 h-4 text-[#EA5D3A] flex-shrink-0" />
                    <div>
                      <span className="block text-[10px] text-[#9CA3AF]">Est. Time</span>
                      <span className="block text-sm font-bold text-[#F3F4F6] font-mono">
                        {Math.max(2, (activeTotalSteps - activeCompleted.length) * 3)}h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resume Button */}
                <button
                  onClick={() => navigate(`/roadmap/${activeRoadmap.id}`)}
                  className="w-full px-4 py-2.5 bg-[#EA5D3A] hover:bg-[#F2633F] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Resume Learning Path
                </button>
              </div>

              {/* Dynamic Milestone Timeline */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-[#21262D]">
                  <Layers className="w-3.5 h-3.5 text-[#EA5D3A]" />
                  Milestone Progress
                </h3>

                <div className="relative pl-5 space-y-4">
                  {/* Vertical connector line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#21262D]" />

                  {stages.map((stage, stageIdx) => (
                    <div key={stageIdx} className="relative">
                      {/* Node dot */}
                      <div className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 ${
                        stage.status === 'completed'
                          ? 'bg-[#10B981] border-[#10B981]'
                          : stage.status === 'active'
                          ? 'bg-[#0D1117] border-[#EA5D3A] shadow-[0_0_6px_#EA5D3A]'
                          : 'bg-[#21262D] border-[#30363D]'
                      }`} />

                      {/* Stage label */}
                      <div className="mb-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                          stage.status === 'completed' ? 'text-[#10B981]'
                          : stage.status === 'active' ? 'text-[#EA5D3A]'
                          : 'text-[#6B7280]'
                        }`}>
                          {stage.label}
                          {stage.status === 'completed' && ` (${stage.steps.length})`}
                          {stage.totalLocked && ` (${stage.totalLocked} remaining)`}
                        </span>
                      </div>

                      {/* Step items */}
                      <div className="space-y-1.5">
                        {stage.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 p-2 rounded-md text-xs transition-all ${
                              stage.status === 'completed'
                                ? 'bg-[#0D1117] border border-[#21262D] text-[#9CA3AF]'
                                : stage.status === 'active'
                                ? 'bg-[#0D1117] border border-[#EA5D3A]/30 text-[#F3F4F6]'
                                : 'bg-[#0D1117] border border-[#21262D] text-[#6B7280] opacity-60'
                            }`}
                          >
                            {stage.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />}
                            {stage.status === 'active' && <Sparkles className="w-3.5 h-3.5 text-[#EA5D3A] flex-shrink-0 mt-0.5" />}
                            {stage.status === 'locked' && <Lock className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0 mt-0.5" />}
                            <span className={`font-medium leading-snug ${
                              stage.status === 'completed' ? 'line-through decoration-[#10B981]/50' : ''
                            }`}>
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {stages.length === 0 && (
                    <p className="text-xs text-[#6B7280] italic pl-1">No milestones started yet. Open the roadmap to begin.</p>
                  )}
                </div>
              </div>

              {/* Skill Breakdown (derived from real topic data) */}
              {skillBreakdown.length > 0 && (
                <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 space-y-3">
                  <h3 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider pb-3 border-b border-[#21262D]">
                    Skill Breakdown
                  </h3>

                  {skillBreakdown.map((skill, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#9CA3AF]">{skill.label}</span>
                        <span className="text-[#F3F4F6] font-mono">{skill.percent}%</span>
                      </div>
                      <div className="w-full bg-[#0D1117] h-1.5 rounded-full overflow-hidden border border-[#21262D]">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${skill.percent}%`, backgroundColor: skill.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certification Banner */}
              <div className="bg-[#161B22] border border-[#EA5D3A]/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#EA5D3A]" />
                  <h4 className="text-xs font-bold text-[#F3F4F6]">Completion Badge</h4>
                </div>
                <p className="text-[11px] text-[#9CA3AF] leading-snug">
                  Finish all milestones to earn your verified GrindFam readiness badge.
                </p>
                <button
                  onClick={() => navigate(`/roadmap/${activeRoadmap.id}`)}
                  className="text-[11px] font-semibold text-[#EA5D3A] hover:underline inline-flex items-center gap-1"
                >
                  View Requirements →
                </button>
              </div>
            </>
          ) : (
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 text-center space-y-2">
              <Compass className="w-8 h-8 text-[#6B7280] mx-auto" />
              <p className="text-xs text-[#9CA3AF]">Follow a roadmap to see your analytics here.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default RoadmapsExplorer;
