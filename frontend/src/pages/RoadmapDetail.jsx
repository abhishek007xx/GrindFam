import React, { useState, useEffect } from 'react';
import { InfographicRoadmapPath } from '../components/InfographicRoadmapPath';
import { RoadmapFlowChart } from '../components/RoadmapFlowChart';
import { NodeDetailPanel } from '../components/NodeDetailPanel';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoadmapById } from '../lib/roadmapDataLoader';
import {
  ArrowLeft, Bookmark, Layers, CheckCircle2, Route, Sparkles,
  BarChart2, Clock, Trophy, Zap, BookOpen, GitGraph, Network
} from 'lucide-react';
import { motion } from 'framer-motion';

const colorGradients = {
  red:    'from-rose-500 to-red-600',
  blue:   'from-blue-500 to-indigo-600',
  yellow: 'from-amber-400 to-yellow-600',
  green:  'from-emerald-400 to-teal-600',
  purple: 'from-purple-500 to-pink-600',
  teal:   'from-teal-400 to-cyan-600',
  indigo: 'from-indigo-500 to-violet-600',
};

export function RoadmapDetail() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('flowchart'); // 'flowchart' | 'timeline'

  useEffect(() => {
    const rmData = getRoadmapById(roadmapId);
    setRoadmap(rmData);

    const savedActive = localStorage.getItem('grindfam_active_roadmap');
    setIsFollowing(savedActive === roadmapId);

    const savedProgress = localStorage.getItem('grindfam_roadmap_progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setCompletedSteps(parsed[roadmapId] || []);
      } catch (e) {
        console.error(e);
      }
    }
  }, [roadmapId]);

  const toggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      localStorage.removeItem('grindfam_active_roadmap');
    } else {
      setIsFollowing(true);
      localStorage.setItem('grindfam_active_roadmap', roadmapId);
    }
  };

  const toggleStepCompleted = (stepNumber) => {
    let updated;
    if (completedSteps.includes(stepNumber)) {
      updated = completedSteps.filter(s => s !== stepNumber);
    } else {
      updated = [...completedSteps, stepNumber];
    }
    setCompletedSteps(updated);

    const savedProgress = localStorage.getItem('grindfam_roadmap_progress');
    let map = {};
    if (savedProgress) {
      try { map = JSON.parse(savedProgress); } catch (e) { console.error(e); }
    }
    map[roadmapId] = updated;
    localStorage.setItem('grindfam_roadmap_progress', JSON.stringify(map));
  };

  if (!roadmap) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto">
          <Route className="w-8 h-8 text-[var(--color-text-dim)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">Roadmap Not Found</h2>
        <p className="text-sm text-[var(--color-text-muted)]">The roadmap you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/roadmaps')}
          className="px-4 py-2 bg-[#EA5D3A] text-white rounded-lg text-xs font-bold hover:bg-[#F2633F] transition-colors"
        >
          Back to All Roadmaps
        </button>
      </div>
    );
  }

  const progressPercent = Math.round((completedSteps.length / roadmap.steps.length) * 100) || 0;
  const firstStepColor = roadmap.steps[0]?.color || 'blue';
  const headerGradient = colorGradients[firstStepColor] || colorGradients.blue;

  const estimatedHours = roadmap.steps.reduce((acc, step) => {
    return acc + (step.submodules?.length || 3) * 1.5;
  }, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/roadmaps')}
        className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Roadmaps</span>
      </button>

      {/* ── Premium Header Banner ── */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${headerGradient} p-6 md:p-8`}>
        {/* Dot grid background */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px'
          }}
        />
        {/* Glow orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-5 border-b border-white/20">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/30">
                  {roadmap.category}
                </span>
                <span className="text-xs text-white/70 font-medium">
                  by <strong className="text-white">{roadmap.creator}</strong>
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {roadmap.title}
              </h1>
              {roadmap.description && (
                <p className="text-sm text-white/80 leading-relaxed max-w-lg">
                  {roadmap.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={toggleFollow}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
                  isFollowing
                    ? 'bg-white text-gray-900 border-transparent shadow-lg'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isFollowing ? '✓ Following' : 'Follow Path'}</span>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Layers className="w-4 h-4" />, label: 'Milestones', value: roadmap.steps.length },
              { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completed', value: completedSteps.length },
              { icon: <Clock className="w-4 h-4" />, label: 'Est. Hours', value: `~${Math.round(estimatedHours)}h` },
              { icon: <Trophy className="w-4 h-4" />, label: 'Progress', value: `${progressPercent}%` },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
                <p className="text-white font-extrabold text-lg font-mono">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-white/80">
              <span>Learning Progress</span>
              <span className="font-mono text-white">{completedSteps.length} / {roadmap.steps.length} Milestones</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <motion.div
                className="bg-white h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Roadmap View Canvas ── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <Network className="w-5 h-5 text-[#EA5D3A]" />
              Interactive Topic Graph
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Click any topic node or module pill to explore detailed guides, resources, and practice problems.
            </p>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-1 bg-[var(--color-surface-elevated)] p-1 rounded-xl border border-[var(--color-border)] self-stretch sm:self-auto">
            <button
              onClick={() => setViewMode('flowchart')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                viewMode === 'flowchart'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Diagram View</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[#EA5D3A] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <GitGraph className="w-3.5 h-3.5" />
              <span>Highway Path</span>
            </button>
          </div>
        </div>

        {/* Dynamic View Rendering */}
        {viewMode === 'flowchart' ? (
          <RoadmapFlowChart
            steps={roadmap.steps}
            completedSteps={completedSteps}
            onToggleStep={toggleStepCompleted}
            onSelectStep={(step) => setSelectedStep(step)}
          />
        ) : (
          <InfographicRoadmapPath
            steps={roadmap.steps}
            completedSteps={completedSteps}
            onToggleStep={toggleStepCompleted}
            onSelectStep={(step) => setSelectedStep(step)}
          />
        )}
      </div>

      {/* ── Node Detail Side Panel ── */}
      {selectedStep && (
        <NodeDetailPanel
          step={selectedStep}
          isCompleted={completedSteps.includes(selectedStep.stepNumber)}
          onClose={() => setSelectedStep(null)}
          onToggleComplete={toggleStepCompleted}
        />
      )}
    </div>
  );
}

export default RoadmapDetail;
