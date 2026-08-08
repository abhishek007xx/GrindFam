import React, { useState } from 'react';
import StitchSquadLounge from '../components/stitch/StitchSquadLounge';
import StitchSquadDashboard from '../components/stitch/StitchSquadDashboard';
import StitchCodeReviewHub from '../components/stitch/StitchCodeReviewHub';
import StitchSquadLeaderboard from '../components/stitch/StitchSquadLeaderboard';
import StitchDMHub from '../components/stitch/StitchDMHub';
import StitchSquadRepo from '../components/stitch/StitchSquadRepo';
import StitchSettings from '../components/stitch/StitchSettings';

export default function SquadHub() {
  // Screen selection: 'lounge', 'dashboard', 'reviews', 'leaderboard', 'dms', 'repo', 'settings'
  const [activeScreen, setActiveScreen] = useState('lounge');

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-['Inter'] antialiased selection:bg-[#4cd7f6]/30 selection:text-[#4cd7f6]">
      {/* ── STITCH GLOBAL TOP APP BAR ── */}
      <header className="bg-[#0e0e0e] border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="font-['Outfit'] text-xl font-bold text-[#ffb4a2] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f2633f] text-2xl">terminal</span>
            <span>Developer Hub</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveScreen('lounge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'lounge'
                  ? 'bg-[#f2633f]/20 text-[#f2633f] border border-[#f2633f]/40 font-bold'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">groups</span>
              <span>Squad Lounge</span>
            </button>

            <button
              onClick={() => setActiveScreen('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'dashboard'
                  ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              <span>Squad Dashboard</span>
            </button>

            <button
              onClick={() => setActiveScreen('reviews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'reviews'
                  ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Code Reviews</span>
            </button>

            <button
              onClick={() => setActiveScreen('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'leaderboard'
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-bold'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">leaderboard</span>
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveScreen('dms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'dms'
                  ? 'bg-[#a078ff]/20 text-[#a078ff] border border-[#a078ff]/40 font-bold'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              <span>Direct Messages</span>
            </button>

            <button
              onClick={() => setActiveScreen('repo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'repo'
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-bold'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">folder_open</span>
              <span>Repository</span>
            </button>

            <button
              onClick={() => setActiveScreen('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'settings'
                  ? 'bg-[#353534]/50 text-white border border-[#59413b] font-bold'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
              <span>Settings</span>
            </button>
          </div>
        </div>

        <button className="bg-[#f2633f] text-white text-xs px-4 py-2 rounded font-['JetBrains_Mono'] font-bold hover:brightness-110 shadow-[0_0_10px_rgba(242,99,63,0.3)] transition-all cursor-pointer shrink-0">
          Join New Squad
        </button>
      </header>

      {/* ── SCREEN CANVAS ── */}
      {activeScreen === 'lounge' && <StitchSquadLounge />}
      {activeScreen === 'dashboard' && <StitchSquadDashboard />}
      {activeScreen === 'reviews' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-8">
          <StitchCodeReviewHub />
        </div>
      )}
      {activeScreen === 'leaderboard' && (
        <StitchSquadLeaderboard />
      )}
      {activeScreen === 'dms' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-8">
          <StitchDMHub />
        </div>
      )}
      {activeScreen === 'repo' && (
        <StitchSquadRepo />
      )}
      {activeScreen === 'settings' && (
        <StitchSettings />
      )}
    </div>
  );
}
