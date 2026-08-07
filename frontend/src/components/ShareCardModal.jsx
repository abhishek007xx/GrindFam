import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, X, Twitter, Linkedin, Copy, Check, Download, Sparkles,
  Flame, Target, Trophy, Calendar, Code2, ArrowUpRight, CheckCircle2, MessageSquare
} from 'lucide-react';

export default function ShareCardModal({ isOpen, onClose, userStats, userProfile }) {
  const [copied, setCopied] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('summary'); // 'summary' | 'readiness' | 'heatmap'

  if (!isOpen) return null;

  const username = userProfile?.username || userProfile?.name || 'Grind Warrior';
  const streak = userStats?.streak || 14;
  const totalSolved = userStats?.totalSolved || 87;
  const targetCompany = userProfile?.targetCompany || 'Google SDE-2';
  const readinessPercent = userStats?.readiness || 73;
  const rankPercentile = userStats?.rankPercentile || 'Top 12%';

  // Social Share Text Generators
  const shareText = {
    summary: `🔥 30-Day Grind Summary on @GrindFam:\n\n• ${totalSolved} LeetCode problems solved\n• ${streak}-day active streak\n• ${rankPercentile} in Squad Leaderboard\n\nConsistency is key. Join the grind 👇\nhttps://grind-fam.vercel.app/p/${username}`,
    readiness: `🎯 Target Goal Check:\nI'm ${readinessPercent}% ready for ${targetCompany}!\n\nTracked via @GrindFam daily practice & peer code reviews.\n\nSee my verified profile 👇\nhttps://grind-fam.vercel.app/p/${username}`,
    heatmap: `🟩 Heatmap Update:\n${streak} days on fire! ${totalSolved} problems solved this month.\n\nNo missed days on @GrindFam 🚀\nhttps://grind-fam.vercel.app/p/${username}`
  }[selectedTemplate];

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleLinkedinShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://grind-fam.vercel.app/p/${username}`)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDiscord = () => {
    const discordText = `\`\`\`ansi\n🔥 GRINDFAM PROGRESS CARD\nUser: ${username}\nStatus: ${totalSolved} Solved | ${streak}-Day Streak | ${rankPercentile} Squad Rank\nTarget: ${readinessPercent}% Ready for ${targetCompany}\nProfile: https://grind-fam.vercel.app/p/${username}\n\`\`\``;
    navigator.clipboard.writeText(discordText);
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2000);
  };

  // Mock 30-day heatmap grid squares
  const heatmapSquares = Array.from({ length: 35 }, (_, i) => {
    if (i % 7 === 0 || i % 5 === 0) return 3; // level 3
    if (i % 3 === 0) return 2; // level 2
    if (i % 2 === 0) return 1; // level 1
    return 0; // level 0
  });

  const getHeatmapBg = (lvl) => {
    switch (lvl) {
      case 3: return 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 2: return 'bg-[#059669]';
      case 1: return 'bg-[#047857]';
      default: return 'bg-[#21262D]';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363D]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#EA5D3A]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Share Your Grind Progress</h3>
                <p className="text-xs text-[#9CA3AF]">Generate proof of work cards for LinkedIn, X & Discord</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#21262D] text-[#9CA3AF] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">

            {/* Template Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#0D1117] border border-[#30363D] rounded-xl">
              {[
                { id: 'summary', label: '30-Day Summary', icon: Trophy },
                { id: 'readiness', label: 'Target Readiness', icon: Target },
                { id: 'heatmap', label: 'Streak Heatmap', icon: Calendar },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    selectedTemplate === t.id
                      ? 'bg-[#EA5D3A] text-white shadow-lg shadow-[#EA5D3A]/20'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Visual Card Preview */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] border-2 border-[#30363D] p-6 shadow-2xl group">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Flame className="w-32 h-32 text-[#EA5D3A]" />
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white font-black text-lg border-2 border-[#EA5D3A]/40 shadow-lg">
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt={username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      username.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">{username}</h4>
                    <p className="text-xs text-[#9CA3AF]">Verified GrindFam Developer</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-[#EA5D3A]" /> {streak}-Day Streak
                </div>
              </div>

              {/* Template Content */}
              {selectedTemplate === 'summary' && (
                <div className="space-y-4 relative z-10">
                  <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-4">
                    <p className="text-xs text-[#9CA3AF] uppercase tracking-wider font-bold mb-1">30-Day Performance</p>
                    <div className="text-2xl font-black text-white flex items-baseline gap-2">
                      <span>{totalSolved} Problems Solved</span>
                      <span className="text-xs text-[#10B981] font-semibold">{rankPercentile} in Squad</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-3">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Current Consistency</p>
                      <p className="text-lg font-black text-[#EA5D3A] mt-0.5">{streak} Days Active</p>
                    </div>
                    <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-3">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Target Company</p>
                      <p className="text-lg font-black text-purple-400 mt-0.5">{targetCompany}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'readiness' && (
                <div className="space-y-4 relative z-10">
                  <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-5 text-center">
                    <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Target Readiness Evaluation</p>
                    <div className="text-4xl font-black text-[#10B981] my-2">{readinessPercent}% Ready</div>
                    <p className="text-xs text-[#F3F4F6] font-semibold">Prepped for {targetCompany} technical rounds</p>
                  </div>
                </div>
              )}

              {selectedTemplate === 'heatmap' && (
                <div className="space-y-4 relative z-10">
                  <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#10B981]" /> Activity Heatmap</p>
                      <span className="text-[10px] text-[#9CA3AF] font-mono">{totalSolved} commits & solves</span>
                    </div>
                    <div className="grid grid-rows-5 grid-flow-col gap-1.5 overflow-x-auto pb-1">
                      {heatmapSquares.map((lvl, idx) => (
                        <div key={idx} className={`w-4 h-4 rounded-xs transition-all ${getHeatmapBg(lvl)}`} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Branding */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#30363D]/60 relative z-10 text-[10px] text-[#6B7280]">
                <span className="font-bold tracking-widest text-[#9CA3AF] uppercase">GrindFam • Gamified Prep</span>
                <span>grindfam.app/p/{username}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleTwitterShare}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1D9BF0]/15 hover:bg-[#1D9BF0]/25 text-[#1D9BF0] border border-[#1D9BF0]/30 text-xs font-bold transition-all"
              >
                <Twitter className="w-4 h-4" /> Share on X
              </button>
              <button
                onClick={handleLinkedinShare}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 text-[#0A66C2] border border-[#0A66C2]/30 text-xs font-bold transition-all"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </button>
              <button
                onClick={handleCopyDiscord}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-[#5865F2] border border-[#5865F2]/30 text-xs font-bold transition-all"
              >
                {copiedDiscord ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <MessageSquare className="w-4 h-4" />}
                {copiedDiscord ? 'Copied!' : 'Discord'}
              </button>
              <button
                onClick={handleCopyText}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-white border border-[#30363D] text-xs font-bold transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Link!' : 'Copy Text'}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
