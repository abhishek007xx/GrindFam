import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Zap, Search, Wrench, Database, Shield, Cloud, Award, Terminal,
  CheckCircle2, Circle, Check, ExternalLink, Sparkles, BookOpen, Layers,
  ArrowRight, MousePointerClick, ChevronRight, Play, FileText, HelpCircle
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

const themeStyles = {
  yellow: {
    headerBg: 'bg-amber-400 text-amber-950 border-amber-500',
    cardBorder: 'border-amber-400/50 hover:border-amber-500',
    nodeBadge: 'bg-amber-400 text-amber-950 font-extrabold',
    lineColor: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  blue: {
    headerBg: 'bg-sky-400 text-sky-950 border-sky-500',
    cardBorder: 'border-sky-400/50 hover:border-sky-500',
    nodeBadge: 'bg-sky-400 text-sky-950 font-extrabold',
    lineColor: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.25)',
  },
  purple: {
    headerBg: 'bg-purple-400 text-purple-950 border-purple-500',
    cardBorder: 'border-purple-400/50 hover:border-purple-500',
    nodeBadge: 'bg-purple-400 text-purple-950 font-extrabold',
    lineColor: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.25)',
  },
  green: {
    headerBg: 'bg-emerald-400 text-emerald-950 border-emerald-500',
    cardBorder: 'border-emerald-400/50 hover:border-emerald-500',
    nodeBadge: 'bg-emerald-400 text-emerald-950 font-extrabold',
    lineColor: '#34d399',
    glow: 'rgba(52, 211, 153, 0.25)',
  },
  red: {
    headerBg: 'bg-rose-400 text-rose-950 border-rose-500',
    cardBorder: 'border-rose-400/50 hover:border-rose-500',
    nodeBadge: 'bg-rose-400 text-rose-950 font-extrabold',
    lineColor: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.25)',
  },
  teal: {
    headerBg: 'bg-teal-400 text-teal-950 border-teal-500',
    cardBorder: 'border-teal-400/50 hover:border-teal-500',
    nodeBadge: 'bg-teal-400 text-teal-950 font-extrabold',
    lineColor: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.25)',
  },
  indigo: {
    headerBg: 'bg-indigo-400 text-indigo-950 border-indigo-500',
    cardBorder: 'border-indigo-400/50 hover:border-indigo-500',
    nodeBadge: 'bg-indigo-400 text-indigo-950 font-extrabold',
    lineColor: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.25)',
  }
};

export function RoadmapFlowChart({ steps, completedSteps, onToggleStep, onSelectStep }) {
  const [hoveredStep, setHoveredStep] = useState(null);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="relative w-full overflow-x-auto py-8 px-2 select-none min-h-[600px]">
      {/* Blueprint Grid Background Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0),
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 96px 96px, 96px 96px',
        }}
      />

      {/* Main Flow Canvas Container */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        {steps.map((step, index) => {
          const isDone = completedSteps.includes(step.stepNumber);
          const IconComp = iconMap[step.icon] || Code;
          const theme = themeStyles[step.color] || themeStyles.yellow;
          const isHovered = hoveredStep === step.stepNumber;
          const isEven = index % 2 === 0;

          return (
            <div key={step.stepNumber} className="relative space-y-4">

              {/* ── Connector Line to Next Step ── */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full h-16 w-1 z-0 pointer-events-none flex flex-col items-center justify-center">
                  <svg className="h-full w-8 overflow-visible">
                    <line
                      x1="16" y1="0" x2="16" y2="64"
                      stroke={isDone ? '#10b981' : theme.lineColor}
                      strokeWidth="3"
                      strokeDasharray="6 6"
                    />
                    <polygon
                      points="12,56 16,64 20,56"
                      fill={isDone ? '#10b981' : theme.lineColor}
                    />
                  </svg>
                </div>
              )}

              {/* ── Main Category Pill Header (roadmap.sh style) ── */}
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  onClick={() => onSelectStep(step)}
                  className={`cursor-pointer px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 shadow-md flex items-center gap-2 transition-all ${
                    isDone
                      ? 'bg-emerald-400 text-emerald-950 border-emerald-500 shadow-emerald-500/20'
                      : theme.headerBg
                  }`}
                  style={{
                    boxShadow: isHovered ? `0 0 20px ${theme.glow}` : undefined
                  }}
                >
                  <span className="w-5 h-5 rounded-md bg-black/15 flex items-center justify-center text-[11px] font-extrabold">
                    {step.stepNumber}
                  </span>
                  <IconComp className="w-4 h-4" />
                  <span>{step.title}</span>
                  {isDone && <CheckCircle2 className="w-4 h-4 ml-1 text-emerald-950" />}
                </motion.div>
              </div>

              {/* ── Main Topic Container Box (roadmap.sh style) ── */}
              <motion.div
                onMouseEnter={() => setHoveredStep(step.stepNumber)}
                onMouseLeave={() => setHoveredStep(null)}
                whileHover={{ y: -4 }}
                onClick={() => onSelectStep(step)}
                className={`relative max-w-2xl mx-auto rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md ${
                  isDone
                    ? 'bg-emerald-950/15 border-emerald-500/60 ring-2 ring-emerald-500/20'
                    : `bg-[var(--color-surface)] ${theme.cardBorder}`
                }`}
                style={{
                  boxShadow: isHovered
                    ? `0 12px 30px ${theme.glow}, 0 0 0 1px ${theme.lineColor}`
                    : undefined
                }}
              >
                {/* Status Toggle Pin */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStep(step.stepNumber);
                  }}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--color-text-dim)] hover:text-white transition-colors"
                  title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Circle className="w-6 h-6 hover:text-amber-400 transition-colors" />
                  )}
                </button>

                {/* Header info */}
                <div className="pr-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-extrabold tracking-wider ${theme.nodeBadge}`}>
                      Milestone {step.stepNumber}
                    </span>
                    {step.subtitle && (
                      <span className="text-xs text-[var(--color-text-muted)] font-medium truncate">
                        {step.subtitle}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold text-[var(--color-text)] flex items-center gap-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                    {step.description}
                  </p>
                </div>

                {/* ── Submodules / Topic Diagram Boxes (roadmap.sh compound box style) ── */}
                {step.submodules && step.submodules.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        Key Topics & Concepts ({step.submodules.length})
                      </span>
                      <span className="text-[10px] text-[#EA5D3A] flex items-center gap-1 font-semibold">
                        Click any box for details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Submodule grid boxes (roadmap.sh compound button style) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {step.submodules.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStep(step);
                          }}
                          className="group/sub relative bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-400/80 dark:border-amber-500/50 p-2.5 rounded-xl flex items-center justify-center text-center text-xs font-black text-amber-950 dark:text-amber-200 transition-all cursor-pointer hover:bg-amber-300 dark:hover:bg-amber-900/60 hover:scale-[1.02] shadow-sm"
                        >
                          <span className="truncate">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Topics Tags */}
                {step.topics && step.topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {step.topics.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStep(step);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-text-muted)] hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoadmapFlowChart;
