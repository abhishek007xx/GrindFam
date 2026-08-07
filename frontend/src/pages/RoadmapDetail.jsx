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
        <h2 className="text-xl font-bold text-[#F3F4F6]">Roadmap Not Found</h2>
        <button
          onClick={() => navigate('/roadmaps')}
          className="px-4 py-2 bg-[#EA5D3A] text-white rounded-lg text-xs font-bold"
        >
          Back to All Roadmaps
        </button>
      </div>
    );
  }

  const progressPercent = Math.round((completedSteps.length / roadmap.steps.length) * 100) || 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/roadmaps')}
        className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Roadmaps</span>
      </button>

      {/* Header Banner — Consistent Slate Dark Theme */}
      <div className="relative overflow-hidden rounded-lg bg-[#161B22] border border-[#30363D] p-6 md:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#EA5D3A]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-[#21262D]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-[#1F2937] border border-[#30363D] text-[#EA5D3A] text-xs font-medium">
                  {roadmap.category}
                </span>
                <span className="text-xs text-[#9CA3AF] font-medium">
                  Source: <strong className="text-[#F3F4F6]">{roadmap.creator}</strong>
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#F3F4F6] tracking-tight">
                {roadmap.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleFollow}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                  isFollowing
                    ? 'bg-[#EA5D3A] text-white shadow-sm'
                    : 'bg-[#161B22] hover:bg-[#1F2937] text-[#F3F4F6] border border-[#30363D]'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isFollowing ? 'Following (Active)' : 'Follow Roadmap'}</span>
              </button>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#9CA3AF]">Progress</span>
              <span className="text-[#EA5D3A] font-mono">{completedSteps.length} / {roadmap.steps.length} Milestones ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden border border-[#21262D]">
              <div
                className="bg-[#EA5D3A] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Infographic Roadmap Canvas */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h2 className="text-base font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#EA5D3A]" /> Interactive Learning Roadmap
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
          <div className="w-full max-w-xl bg-[#161B22] border border-[#30363D] rounded-lg p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#EA5D3A]/15 text-[#EA5D3A] text-xs font-bold">
                  Milestone {selectedStep.stepNumber}
                </span>
                <h3 className="text-base font-bold text-[#F3F4F6]">{selectedStep.title}</h3>
              </div>
              <button onClick={() => setSelectedStep(null)} className="p-1 text-[#9CA3AF] hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#9CA3AF] leading-relaxed">{selectedStep.subtitle || selectedStep.description}</p>

            {selectedStep.topics && selectedStep.topics.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Key Topics Covered</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStep.topics.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-[#0D1117] border border-[#21262D] text-xs text-[#F3F4F6]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#21262D] flex items-center justify-between">
              <button
                onClick={() => toggleStepCompleted(selectedStep.stepNumber)}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  completedSteps.includes(selectedStep.stepNumber)
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-[#EA5D3A] text-white'
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
                  className="text-xs text-[#EA5D3A] hover:underline flex items-center gap-1 font-semibold"
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
