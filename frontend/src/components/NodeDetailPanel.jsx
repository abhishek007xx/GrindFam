import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, BookOpen, HelpCircle, ExternalLink, Code2,
  Youtube, FileText, Layers, ChevronRight, Sparkles,
  CheckCircle2, Circle, Link, Zap, Award, BookMarked,
  Play, Database, Shield, Terminal, Cloud, Wrench
} from 'lucide-react';

/* ── Icon map ── */
const iconMap = {
  code: Code2, zap: Zap, search: Layers, tool: Wrench, database: Database,
  shield: Shield, cloud: Cloud, award: Award, terminal: Terminal, lightbulb: Sparkles,
  server: Layers
};

/* ── Color palette ── */
const colorMap = {
  red:    { gradient: 'from-rose-500 to-red-600', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: '#f43f5e' },
  blue:   { gradient: 'from-blue-500 to-indigo-600', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: '#3b82f6' },
  yellow: { gradient: 'from-amber-400 to-yellow-600', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: '#f59e0b' },
  green:  { gradient: 'from-emerald-400 to-teal-600', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: '#10b981' },
  purple: { gradient: 'from-purple-500 to-pink-600', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: '#8b5cf6' },
  teal:   { gradient: 'from-teal-400 to-cyan-600', text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', glow: '#14b8a6' },
  indigo: { gradient: 'from-indigo-500 to-violet-600', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: '#6366f1' },
};

/* ── Resource type icons ── */
function ResourceIcon({ type }) {
  const cls = 'w-4 h-4 flex-shrink-0';
  switch (type) {
    case 'youtube': return <Youtube className={`${cls} text-red-400`} />;
    case 'docs': return <FileText className={`${cls} text-blue-400`} />;
    case 'course': return <Play className={`${cls} text-emerald-400`} />;
    case 'book': return <BookMarked className={`${cls} text-amber-400`} />;
    case 'tool': return <Wrench className={`${cls} text-purple-400`} />;
    case 'article': return <FileText className={`${cls} text-cyan-400`} />;
    case 'game': return <Award className={`${cls} text-pink-400`} />;
    case 'interactive': return <Sparkles className={`${cls} text-yellow-400`} />;
    default: return <Link className={`${cls} text-gray-400`} />;
  }
}

/* ── Guide renderer: render guide text as rich sections ── */
function GuideSection({ guide }) {
  if (!guide) return null;

  // Split by ### headers
  const sections = guide.split(/\n(?=###)/).filter(Boolean);

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        const lines = section.trim().split('\n');
        const headerLine = lines[0];
        const isHeader = headerLine.startsWith('###');
        const title = isHeader ? headerLine.replace(/^###\s*/, '') : null;
        const content = isHeader ? lines.slice(1).join('\n') : section;

        // Parse content: code blocks and text
        const parts = content.split(/(```[\s\S]*?```)/g);

        return (
          <div key={idx} className="space-y-2">
            {title && (
              <h4 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#EA5D3A] inline-block" />
                {title}
              </h4>
            )}
            {parts.map((part, pIdx) => {
              if (part.startsWith('```')) {
                const code = part.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
                return (
                  <pre key={pIdx} className="bg-[#0d1117] rounded-lg p-3 text-[11px] text-emerald-300 overflow-x-auto font-mono border border-[#30363d] leading-relaxed">
                    <code>{code.trim()}</code>
                  </pre>
                );
              }
              // Render inline code and text
              const formatted = part
                .trim()
                .split('\n')
                .filter(l => l.trim());

              return (
                <div key={pIdx} className="space-y-1.5">
                  {formatted.map((line, lIdx) => {
                    const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*');
                    const isTableRow = line.trim().startsWith('|');
                    const cleanLine = isBullet
                      ? line.trim().replace(/^[-*]\s*/, '')
                      : line;

                    if (isTableRow) {
                      if (line.trim().match(/^[|:\-\s]+$/)) return null;
                      const cells = line.split('|').filter(c => c.trim());
                      const isHeader = idx === 0;
                      return (
                        <div key={lIdx} className={`grid text-[11px] gap-x-2 font-mono ${cells.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {cells.map((cell, cIdx) => (
                            <span key={cIdx} className={`px-2 py-0.5 ${cIdx === 0 ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
                              {cell.trim().replace(/\*\*/g, '')}
                            </span>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <div key={lIdx} className={`text-xs text-[var(--color-text-muted)] leading-relaxed flex ${isBullet ? 'items-start gap-1.5' : 'items-start'}`}>
                        {isBullet && <span className="w-1 h-1 rounded-full bg-[#EA5D3A] flex-shrink-0 mt-2" />}
                        <span dangerouslySetInnerHTML={{
                          __html: cleanLine
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[var(--color-text)] font-semibold">$1</strong>')
                            .replace(/`(.+?)`/g, '<code class="bg-[#1a1a2e] text-emerald-300 px-1 py-0.5 rounded text-[10px] font-mono">$1</code>')
                        }} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main NodeDetailPanel ── */
export function NodeDetailPanel({ step, isCompleted, onClose, onToggleComplete }) {
  const panelRef = useRef(null);

  const theme = colorMap[step?.color] || colorMap.blue;
  const IconComp = iconMap[step?.icon] || Code2;

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!step) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      {/* Side Panel */}
      <motion.aside
        key="panel"
        ref={panelRef}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-full max-w-[520px] z-50 flex flex-col bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl overflow-hidden"
        style={{
          boxShadow: `0 0 60px ${theme.glow}20, -4px 0 40px rgba(0,0,0,0.4)`,
        }}
      >
        {/* ── Gradient Header ── */}
        <div className={`relative bg-gradient-to-br ${theme.gradient} p-6 flex-shrink-0 overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 space-y-3">
            {/* Step badge + icon */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <IconComp className="w-6 h-6 text-white" />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
                Step {step.stepNumber}
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">{step.title}</h2>
              {step.subtitle && (
                <p className="text-sm text-white/80 mt-1 leading-snug">{step.subtitle}</p>
              )}
            </div>

            {/* Complete button */}
            <button
              onClick={() => onToggleComplete(step.stepNumber)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all border ${
                isCompleted
                  ? 'bg-white/20 border-white/40 text-white'
                  : 'bg-white text-gray-900 border-transparent hover:bg-white/90'
              }`}
            >
              {isCompleted ? (
                <><CheckCircle2 className="w-4 h-4" /> Completed</>
              ) : (
                <><Circle className="w-4 h-4" /> Mark as Complete</>
              )}
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">

          {/* Description */}
          <div className={`p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
            <p className="text-sm text-[var(--color-text)] leading-relaxed">{step.description}</p>
          </div>

          {/* Learn with AI Interactive Box (Matching roadmap.sh screenshot 2) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-[var(--color-text)]">Learn with AI Tutor</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => alert(`AI Explanation for "${step.title}":\n\n${step.description}\n\nKey Concept:\n${step.guide ? step.guide.slice(0, 300) : 'Study the sub-topics and code snippets below.'}`)}
                className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Explain Concept
              </button>
              <button
                onClick={() => alert(`Recommended Course for "${step.title}":\n\nCheck out the official documentation and top rated community courses linked under Learning Resources below!`)}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-blue-400 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Recommended Course
              </button>
              <button
                onClick={() => {
                  const q = step.interviewFaqs?.[0] || `What is the core purpose of ${step.title}?`;
                  alert(`AI Quiz for "${step.title}":\n\nQuestion:\n${q}\n\nThink about your answer, then check the Interview Questions section below for details!`);
                }}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-purple-400 transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                Quiz Me
              </button>
            </div>
          </div>

          {/* Topics */}
          {step.topics && step.topics.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Topics Covered
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {step.topics.map((t, idx) => (
                  <span key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium hover:border-[#EA5D3A]/50 transition-colors cursor-default"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Guide Content */}
          {step.guide && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Study Guide
              </h3>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                <GuideSection guide={step.guide} />
              </div>
            </div>
          )}

          {/* Code Snippet */}
          {step.codeSnippet && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                Code Example
              </h3>
              <pre className="bg-[#0d1117] rounded-xl p-4 text-[11px] text-emerald-300 overflow-x-auto font-mono border border-[#30363d] leading-relaxed">
                <code>{step.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Submodules */}
          {step.submodules && step.submodules.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {step.submodules.length} Sub-Topics
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {step.submodules.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#EA5D3A]/30 transition-colors group"
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white bg-gradient-to-br ${theme.gradient}`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs text-[var(--color-text)] font-medium flex-1 leading-snug">
                      {sub.name}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-dim)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {step.resources && step.resources.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Learning Resources
              </h3>
              <div className="space-y-1.5">
                {step.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#EA5D3A]/40 hover:bg-[var(--color-surface-elevated)] transition-all group"
                  >
                    <ResourceIcon type={res.type} />
                    <span className="text-xs font-medium text-[var(--color-text)] group-hover:text-[#EA5D3A] transition-colors flex-1 leading-snug">
                      {res.label}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[var(--color-text-dim)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Interview FAQs */}
          {step.interviewFaqs && step.interviewFaqs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Interview Questions
              </h3>
              <div className="space-y-1.5">
                {step.interviewFaqs.map((faq, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-[#EA5D3A]/20 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#EA5D3A]">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{faq}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback source link */}
          {!step.resources && step.sourceUrl && (
            <a
              href={step.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-[#EA5D3A] hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Learn More
            </a>
          )}

          {/* Bottom spacer */}
          <div className="h-6" />
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

export default NodeDetailPanel;
