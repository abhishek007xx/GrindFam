import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Zap, Search, Wrench, Database, Shield, Cloud, Award, Terminal,
  CheckCircle2, Circle, Check, ChevronDown, ChevronUp, PlayCircle, ExternalLink, Sparkles,
  BookOpen, HelpCircle, FileText, MousePointerClick, Layers, ChevronRight
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
  lightbulb: Sparkles,
  server: Layers
};

const colorStyles = {
  red: {
    bg: 'bg-gradient-to-br from-rose-500 to-red-600',
    ring: 'ring-rose-500/40',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    border: 'border-rose-500/40',
    glow: 'shadow-rose-500/20',
    hover: 'hover:border-rose-500/50',
    accent: '#f43f5e',
    light: 'bg-rose-500/5',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    ring: 'ring-blue-500/40',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/20',
    hover: 'hover:border-blue-500/50',
    accent: '#3b82f6',
    light: 'bg-blue-500/5',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-400 to-yellow-600',
    ring: 'ring-amber-500/40',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/20',
    hover: 'hover:border-amber-500/50',
    accent: '#f59e0b',
    light: 'bg-amber-500/5',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    ring: 'ring-emerald-500/40',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/20',
    hover: 'hover:border-emerald-500/50',
    accent: '#10b981',
    light: 'bg-emerald-500/5',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    ring: 'ring-purple-500/40',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    border: 'border-purple-500/40',
    glow: 'shadow-purple-500/20',
    hover: 'hover:border-purple-500/50',
    accent: '#8b5cf6',
    light: 'bg-purple-500/5',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-400 to-cyan-600',
    ring: 'ring-teal-500/40',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    border: 'border-teal-500/40',
    glow: 'shadow-teal-500/20',
    hover: 'hover:border-teal-500/50',
    accent: '#14b8a6',
    light: 'bg-teal-500/5',
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-500 to-violet-600',
    ring: 'ring-indigo-500/40',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    border: 'border-indigo-500/40',
    glow: 'shadow-indigo-500/20',
    hover: 'hover:border-indigo-500/50',
    accent: '#6366f1',
    light: 'bg-indigo-500/5',
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
      {/* 🛣️ SVG HIGHWAY ROAD CANVAS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
        <svg className="w-full h-full min-h-[750px]" viewBox="0 0 800 1200" fill="none" preserveAspectRatio="none">
          <path
            d="M 150 60 C 650 160, 650 360, 150 460 C -350 560, 650 760, 150 860 C -350 960, 650 1160, 400 1200"
            stroke="#1e293b"
            strokeWidth="60"
            strokeLinecap="round"
          />
          <path
            d="M 150 60 C 650 160, 650 360, 150 460 C -350 560, 650 760, 150 860 C -350 960, 650 1160, 400 1200"
            stroke="#090d16"
            strokeWidth="48"
            strokeLinecap="round"
          />
          <path
            d="M 150 60 C 650 160, 650 360, 150 460 C -350 560, 650 760, 150 860 C -350 960, 650 1160, 400 1200"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeDasharray="16 16"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ROADMAP STEPS */}
      <div className="relative z-10 space-y-20">
        {steps.map((step, idx) => {
          const isEven = idx % 2 === 0;
          const isDone = completedSteps.includes(step.stepNumber);
          const IconComp = iconMap[step.icon] || Code;
          const theme = colorStyles[step.color] || colorStyles.blue;
          const isExpanded = expandedStep === step.stepNumber;
          const hasDetail = step.guide || step.resources || step.interviewFaqs || step.submodules;
          const resourceCount = step.resources?.length || 0;
          const submoduleCount = step.submodules?.length || 0;

          return (
            <motion.div
              key={step.stepNumber}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* ── Milestone Card ── */}
              <div className="w-full md:w-1/2">
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  onClick={() => onSelectStep(step)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-xl backdrop-blur-xl ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : `bg-[var(--color-surface)]/95 border-[var(--color-border)] ${theme.hover}`
                  }`}
                  style={{
                    boxShadow: isDone
                      ? '0 0 30px rgba(16,185,129,0.1)'
                      : `0 0 0 transparent`
                  }}
                >
                  {/* Subtle background glow on hover */}
                  <div
                    className={`absolute inset-0 rounded-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${theme.light}`}
                  />

                  <div className="relative space-y-4">
                    {/* Top Row: Badge + Step number + Complete toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : theme.badgeBg
                      }`}>
                        Step {step.stepNumber}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStep(step.stepNumber);
                        }}
                        className="p-1 text-[var(--color-text-dim)] hover:text-white transition-colors"
                        title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 hover:text-indigo-400 transition-colors" />
                        )}
                      </button>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-xl font-extrabold text-[var(--color-text)] group-hover:text-indigo-400 transition-colors leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed font-medium">
                        {step.subtitle}
                      </p>
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2 bg-[var(--color-surface-elevated)]/70 p-3 rounded-2xl border border-[var(--color-border)]">
                      {step.description}
                    </p>

                    {/* Resource stats row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {submoduleCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-text-dim)] bg-[var(--color-surface-elevated)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                          <Layers className="w-3 h-3" />
                          {submoduleCount} topics
                        </span>
                      )}
                      {resourceCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-text-dim)] bg-[var(--color-surface-elevated)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                          <BookOpen className="w-3 h-3" />
                          {resourceCount} resources
                        </span>
                      )}
                      {step.interviewFaqs?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-text-dim)] bg-[var(--color-surface-elevated)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                          <HelpCircle className="w-3 h-3" />
                          {step.interviewFaqs.length} FAQs
                        </span>
                      )}
                    </div>

                    {/* Click-for-details CTA */}
                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                      {/* Submodules Accordion */}
                      {step.submodules && step.submodules.length > 0 && (
                        <div className="flex-1">
                          <div
                            onClick={(e) => toggleExpand(e, step.stepNumber)}
                            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Topics</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-1.5 pt-2"
                              >
                                {step.submodules.slice(0, 4).map((sub, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="text-xs text-[var(--color-text)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-3 py-2 rounded-xl flex items-center gap-2"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                    <span className="truncate">{sub.name}</span>
                                  </div>
                                ))}
                                {step.submodules.length > 4 && (
                                  <p className="text-[10px] text-[var(--color-text-dim)] pl-4 italic">
                                    +{step.submodules.length - 4} more in detail panel...
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* "View Details" button */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA5D3A] group-hover:translate-x-1 transition-transform ml-auto">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        <span>Full Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ── Central Node Pin ── */}
              <div className="relative z-20 flex-shrink-0 flex items-center justify-center">
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

                  {/* Step number badge */}
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--color-bg)] border-2 border-white rounded-full text-[10px] font-extrabold text-[var(--color-text)] flex items-center justify-center">
                    {step.stepNumber}
                  </span>

                  {/* Pulse indicator for current step */}
                  {!isDone && idx === completedSteps.length && (
                    <>
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-400 border-2 border-white rounded-full animate-ping opacity-75" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-400 border-2 border-white rounded-full" />
                    </>
                  )}
                </motion.div>
              </div>

              {/* Spacer for alternating layout */}
              <div className="w-full md:w-1/2 hidden md:block" />
            </motion.div>
          );
        })}
      </div>

      {/* End of path indicator */}
      {steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center mt-16 space-y-3"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EA5D3A] to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30">
            <Award className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm font-bold text-[var(--color-text)]">End of Learning Path</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Complete all {steps.length} milestones to earn your GrindFam badge
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default InfographicRoadmapPath;
