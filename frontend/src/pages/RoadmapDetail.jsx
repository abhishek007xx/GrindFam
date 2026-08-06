import React, { useState, useEffect } from 'react';
import InfographicRoadmapPath from '../components/InfographicRoadmapPath';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getRoadmapById } from '../lib/roadmapDataLoader';
import {
  ArrowLeft, CheckCircle2, Circle, Bookmark, ExternalLink, Sparkles,
  BookOpen, Code, Zap, Search, Wrench, Database, Shield, Cloud, Award, Terminal,
  Check, PlayCircle, X, ChevronRight, Compass, Layers
} from 'lucide-react';

const iconMap = {
  code: Code,
  zap: Zap,
  search: Search,
  tool: Wrench,
  database: Database,
  shield: Shield,
  cloud: Cloud,
  award: Award,
  terminal: Terminal,
  lightbulb: Sparkles
};

const colorMap = {
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', ring: 'ring-blue-500/50', gradient: 'from-blue-500/20 to-indigo-500/10' },
  yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', ring: 'ring-yellow-500/50', gradient: 'from-yellow-500/20 to-amber-500/10' },
  purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', ring: 'ring-purple-500/50', gradient: 'from-purple-500/20 to-pink-500/10' },
  green: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', ring: 'ring-emerald-500/50', gradient: 'from-emerald-500/20 to-teal-500/10' },
  red: { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', ring: 'ring-rose-500/50', gradient: 'from-rose-500/20 to-red-500/10' },
  indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/40', text: 'text-indigo-400', ring: 'ring-indigo-500/50', gradient: 'from-indigo-500/20 to-purple-500/10' },
  teal: { bg: 'bg-teal-500/20', border: 'border-teal-500/40', text: 'text-teal-400', ring: 'ring-teal-500/50', gradient: 'from-teal-500/20 to-cyan-500/10' }
};

export function RoadmapDetail() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const rmData = getRoadmapById(roadmapId);
    setRoadmap(rmData);

    // Active roadmap follow status
    const savedActive = localStorage.getItem('grindfam_active_roadmap');
    setIsFollowing(savedActive === roadmapId);

    // Completed steps progress
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
      try {
        map = JSON.parse(savedProgress);
      } catch (e) {
        console.error(e);
      }
    }
    map[roadmapId] = updated;
    localStorage.setItem('grindfam_roadmap_progress', JSON.stringify(map));
  };

  if (!roadmap) {
    return (
      <div className="page-shell">
        <Sidebar activeSection="roadmaps" />
        <div className="page-content">
          <Navbar />
          <main className="page-main-constrained text-center py-20">
            <h2 className="text-xl font-bold text-white">Roadmap Not Found</h2>
            <button
              onClick={() => navigate('/roadmaps')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Back to All Roadmaps
            </button>
          </main>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((completedSteps.length / roadmap.steps.length) * 100) || 0;

  return (
    <div className="page-shell pb-20">
      <Sidebar activeSection="roadmaps" />

      <div className="page-content">
        <Navbar />

        <main className="page-main-constrained space-y-8 animate-fadeIn">
          {/* Back Navigation */}
          <button
            onClick={() => navigate('/roadmaps')}
            className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Roadmaps</span>
          </button>

          {/* Header Card */}
          <div className="relative bg-[#0d1117]/90 backdrop-blur border border-[#30363d] rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#21262d]">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                    {roadmap.category}
                  </span>
                  <span className="text-xs text-[#8b949e] font-medium">
                    Source: <strong className="text-white">{roadmap.creator}</strong>
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {roadmap.title}
                </h1>
                <p className="text-xs md:text-sm text-[#8b949e]">
                  Interactive winding roadmap path. Click on any milestone node to view study guides, key topics, and problem lists!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                    isFollowing
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 border border-indigo-500/30'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Following Roadmap</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Follow This Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8b949e] font-medium">
                  Overall Completion Progress
                </span>
                <span className="text-indigo-400 font-bold">
                  {completedSteps.length} of {roadmap.steps.length} Steps Done ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#161b22] border border-[#30363d] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 🛣️ WINDING INFOGRAPHIC ROADMAP VIEW (Inspired by roadmap.sh & Reference Image) */}
          <div className="relative bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 md:p-12 overflow-hidden shadow-2xl">
            <div className="text-center mb-6 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>Interactive Visual Winding Highway Path</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Roadmap Infographic</h2>
              <p className="text-xs text-[#8b949e]">Click on any circular milestone pin to inspect deep modules, study guides & problem sets</p>
            </div>

            <InfographicRoadmapPath
              steps={roadmap.steps}
              completedSteps={completedSteps}
              onToggleStep={toggleStepCompleted}
              onSelectStep={setSelectedStep}
            />
          </div>
        </main>
      </div>

      {/* 📖 STEP INSPECTOR MODAL / DRAWER */}
      <AnimatePresence>
        {selectedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0d1117] border border-[#30363d] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedStep(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step Title Header */}
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-xs font-extrabold">
                    Step {selectedStep.stepNumber} Milestone
                  </span>
                  {completedSteps.includes(selectedStep.stepNumber) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-white">
                  {selectedStep.title}
                </h2>
                <p className="text-sm text-indigo-400 font-semibold">
                  {selectedStep.subtitle}
                </p>
              </div>

              {/* Description & Study Guide */}
              <div className="space-y-2 bg-[#161b22]/80 border border-[#21262d] rounded-2xl p-5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Study Guide & Overview:</span>
                </span>
                <p className="text-sm text-[#e6edf3] leading-relaxed">
                  {selectedStep.description}
                </p>
              </div>

              {/* Key Topics Covered */}
              {selectedStep.topics.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#8b949e] block">
                    Key Topics Covered:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedStep.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] text-xs font-semibold text-[#e6edf3]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Problems / Skills */}
              {selectedStep.problems.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Practice Problems & Skills:</span>
                  </span>

                  <div className="space-y-2">
                    {selectedStep.problems.map((probSlug, pIdx) => {
                      const probTitle = probSlug
                        .split('-')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');

                      return (
                        <div
                          key={pIdx}
                          className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <span className="text-xs font-bold text-white truncate">
                              {probTitle}
                            </span>
                          </div>

                          <a
                            href={probSlug.startsWith('http') ? probSlug : `https://leetcode.com/problems/${probSlug}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all flex items-center gap-1 flex-shrink-0"
                          >
                            <span>Solve</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Source Documentation Link */}
              {selectedStep.sourceUrl && (
                <div className="pt-2">
                  <a
                    href={selectedStep.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>View Authentic Source Documentation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Bottom Complete Toggle Button */}
              <div className="pt-4 border-t border-[#21262d] flex items-center justify-between">
                <button
                  onClick={() => {
                    toggleStepCompleted(selectedStep.stepNumber);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center gap-2 ${
                    completedSteps.includes(selectedStep.stepNumber)
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {completedSteps.includes(selectedStep.stepNumber)
                      ? 'Completed!'
                      : 'Mark Step as Completed'}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedStep(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white text-xs font-semibold border border-[#30363d]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RoadmapDetail;
