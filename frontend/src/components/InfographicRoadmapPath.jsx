import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Zap, Search, Wrench, Database, Shield, Cloud, Award, Terminal,
  CheckCircle2, Circle, Check, ChevronDown, ChevronUp, PlayCircle, ExternalLink, Sparkles
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

const colorStyles = {
  red: {
    bg: 'bg-rose-500',
    ring: 'ring-rose-500/40',
    badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    border: 'border-rose-500/50',
    gradient: 'from-rose-500/20 to-red-500/10'
  },
  blue: {
    bg: 'bg-blue-500',
    ring: 'ring-blue-500/40',
    badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    border: 'border-blue-500/50',
    gradient: 'from-blue-500/20 to-indigo-500/10'
  },
  yellow: {
    bg: 'bg-amber-500',
    ring: 'ring-amber-500/40',
    badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    border: 'border-amber-500/50',
    gradient: 'from-amber-500/20 to-yellow-500/10'
  },
  green: {
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-500/40',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    border: 'border-emerald-500/50',
    gradient: 'from-emerald-500/20 to-teal-500/10'
  },
  purple: {
    bg: 'bg-purple-500',
    ring: 'ring-purple-500/40',
    badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    border: 'border-purple-500/50',
    gradient: 'from-purple-500/20 to-pink-500/10'
  },
  teal: {
    bg: 'bg-teal-500',
    ring: 'ring-teal-500/40',
    badgeBg: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    border: 'border-teal-500/50',
    gradient: 'from-teal-500/20 to-cyan-500/10'
  },
  indigo: {
    bg: 'bg-indigo-500',
    ring: 'ring-indigo-500/40',
    badgeBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    border: 'border-indigo-500/50',
    gradient: 'from-indigo-500/20 to-purple-500/10'
  }
};

export function InfographicRoadmapPath({ steps, completedSteps, onToggleStep, onSelectStep }) {
  const [expandedStep, setExpandedStep] = useState(null);

  const toggleExpand = (e, stepNum) => {
    e.stopPropagation();
    setExpandedStep(prev => (prev === stepNum ? null : stepNum));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 px-4 select-none">
      {/* 🛣️ SVG WINDING HIGHWAY ROAD BACKGROUND GRAPHIC */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
        <svg className="w-full h-full min-h-[600px]" viewBox="0 0 800 1200" fill="none" preserveAspectRatio="none">
          {/* Outer Road Border */}
          <path
            d="M 150 50 C 650 150, 650 350, 150 450 C -350 550, 650 750, 150 850 C -350 950, 650 1150, 400 1200"
            stroke="#1e293b"
            strokeWidth="56"
            strokeLinecap="round"
          />
          {/* Inner Road Surface */}
          <path
            d="M 150 50 C 650 150, 650 350, 150 450 C -350 550, 650 750, 150 850 C -350 950, 650 1150, 400 1200"
            stroke="#0f172a"
            strokeWidth="44"
            strokeLinecap="round"
          />
          {/* Center Lane Dashed Divider Line */}
          <path
            d="M 150 50 C 650 150, 650 350, 150 450 C -350 550, 650 750, 150 850 C -350 950, 650 1150, 400 1200"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="14 14"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ROADMAP STEPS CONTAINER */}
      <div className="relative z-10 space-y-16">
        {steps.map((step, idx) => {
          const isEven = idx % 2 === 0;
          const isDone = completedSteps.includes(step.stepNumber);
          const IconComp = iconMap[step.icon] || Code;
          const theme = colorStyles[step.color] || colorStyles.blue;
          const isExpanded = expandedStep === step.stepNumber;

          return (
            <div
              key={step.stepNumber}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Milestone Info Card */}
              <div className="w-full md:w-1/2">
                <motion.div
                  whileHover={{ y: -4 }}
                  onClick={() => onSelectStep(step)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-2xl ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : `bg-[#0d1117]/95 hover:bg-[#161b22] border-[#30363d] hover:${theme.border}`
                  }`}
                >
                  <div className="space-y-4">
                    {/* Step Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : theme.badgeBg
                      }`}>
                        Milestone {step.stepNumber}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStep(step.stepNumber);
                        }}
                        className="p-1 text-[#8b949e] hover:text-white transition-colors"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-[#484f58] hover:text-indigo-400" />
                        )}
                      </button>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                        <span>{step.title}</span>
                      </h3>
                      <p className="text-xs text-[#8b949e] mt-1 leading-relaxed">
                        {step.subtitle}
                      </p>
                    </div>

                    {/* Submodules Accordion Trigger */}
                    {step.topics && step.topics.length > 0 && (
                      <div className="pt-3 border-t border-[#21262d] space-y-2">
                        <div
                          onClick={(e) => toggleExpand(e, step.stepNumber)}
                          className="flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                        >
                          <span>Includes {step.topics.length} Granular Submodules</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-1.5 pt-2"
                            >
                              {step.topics.map((top, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="text-xs text-[#e6edf3] bg-[#161b22] border border-[#21262d] px-3 py-1.5 rounded-xl flex items-center gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                  <span>{top}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* 📍 INFOGRAPHIC CIRCULAR PIN NODE (Matching Reference Image) */}
              <div className="relative z-20 flex-shrink-0 flex items-center justify-center">
                {/* Connector Line/Stalk to Road */}
                <div className="absolute w-12 h-1 bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full opacity-60 hidden md:block" />

                <motion.div
                  whileHover={{ scale: 1.15 }}
                  onClick={() => onSelectStep(step)}
                  className={`w-20 h-20 rounded-full border-4 cursor-pointer flex items-center justify-center transition-all duration-300 shadow-2xl relative group ${
                    isDone
                      ? 'bg-emerald-500 border-white text-slate-950 ring-8 ring-emerald-500/20 scale-105'
                      : `${theme.bg} border-white text-white shadow-indigo-500/20 hover:ring-8 ${theme.ring}`
                  }`}
                >
                  {isDone ? (
                    <Check className="w-10 h-10 stroke-[3]" />
                  ) : (
                    <IconComp className="w-9 h-9 filter drop-shadow-md" />
                  )}

                  {/* Pulsing Pin Indicator */}
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-400 border-2 border-white rounded-full animate-ping opacity-75" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-400 border-2 border-white rounded-full" />
                </motion.div>
              </div>

              {/* Spacer for desktop layout */}
              <div className="w-full md:w-1/2 hidden md:block" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InfographicRoadmapPath;
