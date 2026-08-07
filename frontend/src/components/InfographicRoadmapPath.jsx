import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Zap, Search, Wrench, Database, Shield, Cloud, Award, Terminal,
  CheckCircle2, Circle, Check, ChevronDown, ChevronUp, PlayCircle, ExternalLink, Sparkles,
  BookOpen, HelpCircle, FileText
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
    bg: 'bg-gradient-to-br from-rose-500 to-red-600',
    ring: 'ring-rose-500/40',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    border: 'border-rose-500/40',
    glow: 'shadow-rose-500/20'
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    ring: 'ring-blue-500/40',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/20'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-400 to-yellow-600',
    ring: 'ring-amber-500/40',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/20'
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    ring: 'ring-emerald-500/40',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/20'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    ring: 'ring-purple-500/40',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    border: 'border-purple-500/40',
    glow: 'shadow-purple-500/20'
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-400 to-cyan-600',
    ring: 'ring-teal-500/40',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    border: 'border-teal-500/40',
    glow: 'shadow-teal-500/20'
  }
};

export function InfographicRoadmapPath({ steps, completedSteps, onToggleStep, onSelectStep }) {
  const [expandedStep, setExpandedStep] = useState(null);

  const toggleExpand = (e, stepNum) => {
    e.stopPropagation();
    setExpandedStep(prev => (prev === stepNum ? null : stepNum));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-16 px-4 select-none">
      {/* 🛣️ SVG HIGHWAY ROAD CANVAS WITH SMOOTH CURVED PATH (INFOGRAPHIC DESIGN) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-35">
        <svg className="w-full h-full min-h-[750px]" viewBox="0 0 800 1200" fill="none" preserveAspectRatio="none">
          {/* Outer Road Bed */}
          <path
            d="M 150 60 C 650 160, 650 360, 150 460 C -350 560, 650 760, 150 860 C -350 960, 650 1160, 400 1200"
            stroke="#1e293b"
            strokeWidth="60"
            strokeLinecap="round"
          />
          {/* Inner Road Surface */}
          <path
            d="M 150 60 C 650 160, 650 360, 150 460 C -350 560, 650 760, 150 860 C -350 960, 650 1160, 400 1200"
            stroke="#090d16"
            strokeWidth="48"
            strokeLinecap="round"
          />
          {/* White/Sky-Blue Dashed Center Lane Divider Line */}
          <path
            d="M 150 60 C 650 160, 650 360, 150 460 C -350 560, 650 760, 150 860 C -350 960, 650 1160, 400 1200"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeDasharray="16 16"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ROADMAP STEPS CONTAINER */}
      <div className="relative z-10 space-y-20">
        {steps.map((step, idx) => {
          const isEven = idx % 2 === 0;
          const isDone = completedSteps.includes(step.stepNumber);
          const IconComp = iconMap[step.icon] || Code;
          const theme = colorStyles[step.color] || colorStyles.blue;
          const isExpanded = expandedStep === step.stepNumber;

          return (
            <div
              key={step.stepNumber}
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Milestone Info Card */}
              <div className="w-full md:w-1/2">
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  onClick={() => onSelectStep(step)}
                  className={`p-7 rounded-3xl border cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-2xl backdrop-blur-xl ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : `bg-[#09090B]/95 hover:bg-[#121215] border-[#27272A] hover:${theme.border}`
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Step Header */}
                    <div className="flex items-center justify-between gap-2">
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
                        className="p-1 text-[#A1A1AA] hover:text-white transition-colors"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-[#3F3F46] hover:text-indigo-400" />
                        )}
                      </button>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-xl font-extrabold text-white group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                        <span>{step.title}</span>
                      </h3>
                      <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed font-medium">
                        {step.subtitle}
                      </p>
                    </div>

                    {/* High-level Description Preview */}
                    <p className="text-xs text-[#c9d1d9] leading-relaxed line-clamp-2 bg-[#121215]/70 p-3 rounded-2xl border border-[#222225]">
                      {step.description}
                    </p>

                    {/* Submodules Accordion Trigger */}
                    {step.submodules && step.submodules.length > 0 && (
                      <div className="pt-3 border-t border-[#222225] space-y-2">
                        <div
                          onClick={(e) => toggleExpand(e, step.stepNumber)}
                          className="flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Includes {step.submodules.length} Deep Learning Submodules</span>
                          </span>
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
                              {step.submodules.map((sub, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="text-xs text-[#F4F4F5] bg-[#121215] border border-[#222225] px-3 py-2 rounded-xl flex items-center gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                  <span className="truncate">{sub.name}</span>
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

              {/* 📍 VIBRANT CIRCULAR PIN NODE WITH CONNECTORS (MATCHING INFOGRAPHIC IMAGE) */}
              <div className="relative z-20 flex-shrink-0 flex items-center justify-center">
                {/* Connector Stalk Line to Highway */}
                <div className="absolute w-14 h-1.5 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full opacity-70 hidden md:block" />

                <motion.div
                  whileHover={{ scale: 1.15, rotate: 3 }}
                  onClick={() => onSelectStep(step)}
                  className={`w-20 h-20 rounded-full border-4 border-white cursor-pointer flex items-center justify-center transition-all duration-300 shadow-2xl relative ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 ring-8 ring-emerald-500/20 scale-105'
                      : `${theme.bg} text-white ${theme.glow} hover:ring-8 ${theme.ring}`
                  }`}
                >
                  {isDone ? (
                    <Check className="w-10 h-10 stroke-[3]" />
                  ) : (
                    <IconComp className="w-9 h-9 filter drop-shadow-lg" />
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
