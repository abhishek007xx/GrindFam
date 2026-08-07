import React, { useState, useEffect } from 'react';
import { InfographicRoadmapPath } from '../components/InfographicRoadmapPath';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoadmapById } from '../lib/roadmapDataLoader';
import {
  ArrowLeft, Bookmark, Layers, Check, X, ExternalLink, Route, Sparkles
} from 'lucide-react';

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
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Roadmap Not Found</h2>
        <button
          onClick={() => navigate('/roadmaps')}
          className="px-4 py-2 bg-[#22c55e] text-white rounded-xl text-xs font-bold"
        >
          Back to All Roadmaps
        </button>
      </div>
    );
  }

  const progressPercent = Math.round((completedSteps.length / roadmap.steps.length) * 100) || 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/roadmaps')}
        className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Roadmaps</span>
      </button>

      {/* Header Banner Card with Vector Infographic Gradient */}
      <div className="relative bg-gradient-to-r from-emerald-950/70 via-[#161b22] to-cyan-950/60 border border-[#30363d] rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <Route className="w-64 h-64 text-[#22c55e]" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#21262d]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] text-xs font-bold">
                  {roadmap.category}
                </span>
                <span className="text-xs text-[#8b949e] font-medium">
                  Source: <strong className="text-white">{roadmap.creator}</strong>
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {roadmap.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleFollow}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                  isFollowing
                    ? 'bg-[#22c55e] text-[#0e150e] shadow-lg shadow-[#22c55e]/20'
                    : 'bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d]'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isFollowing ? 'Target Roadmap (Active)' : 'Follow Target Roadmap'}</span>
              </button>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#8b949e]">Progress Breakdown</span>
              <span className="text-[#22c55e]">{completedSteps.length} / {roadmap.steps.length} Milestones ({progressPercent}%)</span>
            </div>
            <div className="progress-track h-3">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Infographic Roadmap Canvas */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#22c55e]" /> Interactive Learning Roadmap
        </h2>
        <InfographicRoadmapPath
          steps={roadmap.steps}
          completedSteps={completedSteps}
          onToggleStep={toggleStepCompleted}
          onSelectStep={(step) => setSelectedStep(step)}
        />
      </div>

      {/* Step Detail Modal */}
      {selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedStep(null)}>
          <div className="w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-xs font-bold">
                  Milestone {selectedStep.stepNumber}
                </span>
                <h3 className="text-base font-bold text-white">{selectedStep.title}</h3>
              </div>
              <button onClick={() => setSelectedStep(null)} className="p-1 text-[#8b949e] hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8b949e] leading-relaxed">{selectedStep.subtitle || selectedStep.description}</p>

            {selectedStep.topics && selectedStep.topics.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e] mb-2">Key Topics Covered</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStep.topics.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs text-[#dce5d9]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#21262d] flex items-center justify-between">
              <button
                onClick={() => toggleStepCompleted(selectedStep.stepNumber)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  completedSteps.includes(selectedStep.stepNumber)
                    ? 'bg-emerald-500/20 text-[#22c55e] border border-[#22c55e]/30'
                    : 'bg-[#22c55e] text-[#0e150e]'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{completedSteps.includes(selectedStep.stepNumber) ? 'Completed' : 'Mark as Completed'}</span>
              </button>

              {selectedStep.sourceUrl && (
                <a
                  href={selectedStep.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#22d3ee] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Learn More</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoadmapDetail;
