import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';

export default function StitchSquadDashboard({ onNavigate }) {
  const { profile } = useAuth();
  const { activeSquad, members, messages } = useSquadStore();
  const [showBattleModal, setShowBattleModal] = useState(false);

  const currentUserName = profile?.name || 'Grinder';

  return (
    <div className="bg-[#0D0D0D] text-[#e5e2e1] min-h-screen flex flex-col font-['Inter'] antialiased p-4 md:p-8 max-w-[1440px] mx-auto space-y-8 relative">
      {/* 1v1 Battle Matchmaker Modal */}
      {showBattleModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#EA5D3A]/50 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EA5D3A]/20 border border-[#EA5D3A]/50 flex items-center justify-center mx-auto text-[#EA5D3A] animate-pulse">
              <span className="material-symbols-outlined text-3xl">swords</span>
            </div>
            <h3 className="font-['Outfit'] text-2xl font-bold text-white">1v1 Code Battle Arena</h3>
            <p className="font-['Inter'] text-sm text-[#e1bfb7]">
              Searching for online squad members to match in a 15-minute speed solve battle...
            </p>
            <div className="p-4 bg-[#121212] rounded-xl border border-white/10 flex items-center justify-around font-['JetBrains_Mono'] text-sm">
              <div className="flex items-center gap-2 text-[#4cd7f6]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping"></span>
                <span>{currentUserName}</span>
              </div>
              <span className="text-[#EA5D3A] font-bold text-lg">VS</span>
              <span className="text-[#e1bfb7] animate-pulse">Searching Opponent...</span>
            </div>
            <div className="flex justify-center gap-4 pt-2">
              <button 
                onClick={() => setShowBattleModal(false)}
                className="px-6 py-2.5 rounded-lg bg-[#353534] text-[#e1bfb7] hover:text-white transition-colors text-sm font-bold cursor-pointer"
              >
                Cancel Battle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="font-['Outfit'] text-3xl font-bold text-white">{activeSquad?.name || 'Squad Alpha'}</h1>
        <p className="font-['Inter'] text-sm text-[#e1bfb7]">
          {activeSquad?.squad_type === 'community' ? 'Community Tier' : 'Elite Tier'} <span className="mx-2">•</span> {members.length || 1} Members <span className="mx-2">•</span> Active
        </p>
      </div>

      {/* Section 1: Live Squad Presence Bar */}
      <section className="glass-panel bg-[rgba(30,30,30,0.85)] backdrop-blur-[12px] border border-[rgba(51,51,51,0.6)] rounded-xl p-5 interactive-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Outfit'] text-lg font-bold text-[#4cd7f6]">Live Presence</h2>
          <span className="font-['Inter'] text-xs text-[#e1bfb7] flex items-center gap-1">
            {members.filter(m => m.isOnline).length} Active Online
          </span>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex gap-6 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          {members.map(member => {
            const isOnline = member.isOnline;
            const name = member.name || member.username || member.leetcode_username || 'Member';
            const initial = name.charAt(0).toUpperCase();
            
            return (
              <div key={member.user_id} className={`flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer ${!isOnline ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}>
                <div className="relative w-10 h-10 rounded-full">
                  {isOnline ? (
                    <>
                      <div className="w-full h-full rounded-full bg-[#353534] flex items-center justify-center ring-2 ring-[#10B981] shadow-[0_0_8px_#10B981] transition-transform group-hover:scale-110 text-[#e1bfb7] font-['Outfit'] font-bold text-lg overflow-hidden">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#0D0D0D] rounded-full p-[2px]">
                        <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#353534] flex items-center justify-center ring-2 ring-[#6B7280] text-[#e1bfb7] font-['Outfit'] font-bold text-lg overflow-hidden">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                      ) : (
                        initial
                      )}
                    </div>
                  )}
                </div>
                <span className={`font-['JetBrains_Mono'] text-xs truncate w-full text-center transition-colors ${isOnline ? 'text-[#e5e2e1] group-hover:text-[#4cd7f6]' : 'text-[#e1bfb7]'}`}>
                  {name}
                </span>
              </div>
            );
          })}
          {members.length === 0 && (
             <span className="font-['JetBrains_Mono'] text-xs text-[#e1bfb7]">No members found</span>
          )}
        </div>
      </section>

      {/* Section 2: Automated Role & Prep Badges */}
      <section className="flex flex-wrap gap-2 items-center">
        <span className="font-['Inter'] text-xs text-[#e1bfb7] mr-2">Tags:</span>
        {activeSquad?.goal && (
          <div className="h-[28px] px-3 rounded-full bg-[#f2633f]/15 border border-[#f2633f]/30 flex items-center gap-1.5 cursor-help hover:bg-[#f2633f]/25 transition-colors">
            <span className="material-symbols-outlined text-[14px] text-[#f2633f]">flag</span>
            <span className="font-['JetBrains_Mono'] text-xs text-[#f2633f]">{activeSquad.goal}</span>
          </div>
        )}
        <div className="h-[28px] px-3 rounded-full bg-[#4cd7f6]/15 border border-[#4cd7f6]/30 flex items-center gap-1.5 cursor-help hover:bg-[#4cd7f6]/25 transition-colors">
          <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">group</span>
          <span className="font-['JetBrains_Mono'] text-xs text-[#4cd7f6]">{activeSquad?.squad_type || 'Private'}</span>
        </div>
      </section>

      {/* Section 3: Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Activity Feed */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <h2 className="font-['Outfit'] text-lg font-bold text-[#e5e2e1] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6]">dynamic_feed</span> Activity Feed
            </h2>
          </div>

          {messages.slice(0, 5).map(msg => (
            <div key={msg.id} className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-lg p-4 flex gap-4 interactive-glow transition-all">
              <div className="w-10 h-10 rounded-full shrink-0 bg-[#353534] flex items-center justify-center font-['Outfit'] font-bold text-white text-lg">
                {(msg.author_name || 'M').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-['Inter'] text-sm text-[#e1bfb7]">
                    <strong className="text-white font-semibold">{msg.author_name}</strong> sent a message
                  </p>
                  <span className="font-['JetBrains_Mono'] text-xs text-[#e1bfb7]/50">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bg-[#121212] rounded border-y border-r border-l-4 border-l-[#4cd7f6] border-white/5 p-3 mt-2">
                  <p className="font-['Inter'] text-sm text-white break-words">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
             <p className="text-xs text-[#e1bfb7]">No recent activity found.</p>
          )}
        </section>

        {/* Actions & Analytics */}
        <section className="lg:col-span-4 flex flex-col gap-4 sticky top-24">
          <button 
            onClick={() => setShowBattleModal(true)}
            className="w-full bg-[#EA5D3A] text-white py-3 px-4 rounded-lg font-['Outfit'] text-base font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_15px_rgba(234,93,58,0.4)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">swords</span> Start 1v1 Battle
          </button>

          <button 
            onClick={() => onNavigate && onNavigate('reviews')}
            className="w-full bg-transparent border border-[#333333] hover:border-[#4cd7f6] text-[#e5e2e1] hover:text-[#4cd7f6] py-3 px-4 rounded-lg font-['Outfit'] text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">code</span> Post Code Review
          </button>

          <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-xl p-4">
            <h3 className="font-['Outfit'] text-base text-white pb-2 border-b border-white/10 flex items-center gap-2 font-bold mb-3">
              <span className="material-symbols-outlined text-[#ffb4a2]">bar_chart</span> Squad Analytics
            </h3>
            <div className="space-y-2 font-['Inter'] text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#e1bfb7]">Active Members</span>
                <span className="font-['JetBrains_Mono'] text-white font-semibold">{members.filter(m => m.isOnline).length}/{members.length || 1}</span>
              </div>
              <div className="w-full bg-[#0D0D0D] h-1.5 rounded-full overflow-hidden mb-2">
                <div className="bg-[#4cd7f6] h-full rounded-full shadow-[0_0_8px_rgba(76,215,246,0.5)] transition-all" style={{ width: `${Math.max(10, (members.filter(m => m.isOnline).length / (members.length || 1)) * 100)}%` }} />
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#e1bfb7]">Avg Solved/Week</span>
                <span className="font-['JetBrains_Mono'] text-white font-semibold">Active</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#e1bfb7]">Global Rank</span>
                <span className="font-['JetBrains_Mono'] text-[#ffb4a2] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {activeSquad?.rank || 42}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
