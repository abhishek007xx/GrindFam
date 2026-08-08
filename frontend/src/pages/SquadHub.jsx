import React, { useState } from 'react';
import StitchSquadLounge from '../components/stitch/StitchSquadLounge';
import StitchSquadDashboard from '../components/stitch/StitchSquadDashboard';
import PeerCodeReviewQueue from '../components/community/PeerCodeReviewQueue';
import DMList from '../components/squad/DMList';
import DMChat from '../components/squad/DMChat';
import SquadLeaderboard from '../components/squad/SquadLeaderboard';
import { useSquadStore } from '../store/useSquadStore';

export default function SquadHub() {
  const { activeDMThread } = useSquadStore();

  // Screen selection: 'lounge', 'dashboard', 'reviews', 'leaderboard', 'dms'
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
          </div>
        </div>

        <button className="bg-[#f2633f] text-white text-xs px-4 py-2 rounded font-['JetBrains_Mono'] font-bold hover:brightness-110 shadow-[0_0_10px_rgba(242,99,63,0.3)] transition-all cursor-pointer">
          Join New Squad
        </button>
      </header>

      {/* ── SCREEN CANVAS ── */}
      {activeScreen === 'lounge' && <StitchSquadLounge />}
      {activeScreen === 'dashboard' && <StitchSquadDashboard />}
      {activeScreen === 'reviews' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-8">
          <PeerCodeReviewQueue />
        </div>
      )}
      {activeScreen === 'leaderboard' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-8">
          <SquadLeaderboard />
        </div>
      )}
      {activeScreen === 'dms' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 bg-[#0e0e0e] border border-white/10 rounded-xl p-4 min-h-[550px]">
            <h3 className="font-['Outfit'] text-base font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6]">chat_bubble</span> Direct Messages
            </h3>
            <DMList />
          </div>

          <div className="lg:col-span-8 bg-[#131313] border border-white/10 rounded-xl p-5 min-h-[550px]">
            {activeDMThread ? (
              <DMChat />
            ) : (
              <div className="text-center py-28 space-y-4">
                <span className="material-symbols-outlined text-[#4cd7f6] text-5xl">forum</span>
                <h4 className="font-['Outfit'] text-lg font-bold text-white">Select a Chat or Start a New DM</h4>
                <p className="font-['Inter'] text-xs text-[#e1bfb7] max-w-sm mx-auto">
                  Direct messaging for coders: share problem links, discuss solutions, and review code together in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
