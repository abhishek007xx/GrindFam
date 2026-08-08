import React, { useState } from 'react';
import StitchSquadLounge from '../components/stitch/StitchSquadLounge';
import StitchSquadDashboard from '../components/stitch/StitchSquadDashboard';
import StitchCodeReviewHub from '../components/stitch/StitchCodeReviewHub';
import StitchSquadLeaderboard from '../components/stitch/StitchSquadLeaderboard';
import StitchDMHub from '../components/stitch/StitchDMHub';
import StitchSquadRepo from '../components/stitch/StitchSquadRepo';
import StitchSettings from '../components/stitch/StitchSettings';

export default function SquadHub() {
  // Screen selection: 'lounge', 'dashboard', 'dms', 'reviews', 'leaderboard', 'repo', 'settings'
  const [activeScreen, setActiveScreen] = useState('lounge');

  const navItems = [
    { id: 'lounge', label: 'Home', icon: 'home' },
    { id: 'dms', label: 'Direct Messages', icon: 'chat_bubble' },
    { id: 'reviews', label: 'Code Reviews', icon: 'terminal' },
    { id: 'dashboard', label: 'Squads', icon: 'groups' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'equalizer' },
    { id: 'repo', label: 'Repository', icon: 'code' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0D0D0D] text-[#e5e2e1] font-['Inter'] antialiased selection:bg-[#4cd7f6]/30 selection:text-[#4cd7f6] overflow-hidden">
      {/* ── STITCH LEFT SIDEBAR (EXACT MATCH FOR IMAGE 2) ── */}
      <aside className="w-[280px] h-full flex flex-col bg-[#0e0e0e] border-r border-white/10 shrink-0 z-30 py-6 px-4">
        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full px-4 py-3 rounded text-xs font-['JetBrains_Mono'] flex items-center gap-3 transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#03b5d3]/10 text-[#4cd7f6] border-l-4 border-[#4cd7f6] font-bold translate-x-1'
                    : 'text-[#e1bfb7] hover:text-white hover:bg-[#353534]/30 hover:text-[#4cd7f6]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Contextual Squad Section: DSA Dream Team */}
          <div className="mt-6 pt-4 border-t border-white/10 px-2">
            <h3 className="font-['Outfit'] text-sm font-bold text-white mb-2">DSA Dream Team</h3>
            <div className="space-y-1 font-['JetBrains_Mono'] text-xs">
              <button 
                onClick={() => setActiveScreen('lounge')}
                className={`w-full text-left px-2 py-1.5 rounded transition-colors flex items-center gap-2 cursor-pointer ${
                  activeScreen === 'lounge' ? 'text-[#EA5D3A] bg-[#353534]/30 font-bold' : 'text-[#e1bfb7] hover:text-white'
                }`}
              >
                <span className="text-[#e1bfb7]">#</span> general
              </button>
              <button 
                onClick={() => setActiveScreen('lounge')}
                className="w-full text-left px-2 py-1.5 rounded text-[#e1bfb7] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">emoji_events</span> daily-wins
              </button>
              <button 
                onClick={() => setActiveScreen('lounge')}
                className="w-full text-left px-2 py-1.5 rounded text-[#e1bfb7] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">help</span> doubt-solver
              </button>
              <div className="flex items-center gap-2 text-[#4cd7f6] px-2 py-1.5 font-bold">
                <div className="w-2 h-2 rounded-full bg-[#EA5D3A] animate-pulse shadow-[0_0_8px_#EA5D3A]" /> Live Coding
              </div>
            </div>
          </div>
        </nav>

        {/* Join New Squad Button */}
        <div className="py-4">
          <button className="w-full bg-[#EA5D3A] text-white py-2.5 rounded-lg font-['JetBrains_Mono'] text-xs font-bold hover:brightness-110 shadow-[0_0_15px_rgba(234,93,58,0.3)] transition-all cursor-pointer">
            Join New Squad
          </button>
        </div>

        {/* Footer Links: Settings, Support, Sign Out */}
        <div className="border-t border-white/10 pt-3 flex flex-col gap-1 font-['JetBrains_Mono'] text-xs">
          <button
            onClick={() => setActiveScreen('settings')}
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors text-left cursor-pointer ${
              activeScreen === 'settings' ? 'text-[#4cd7f6] bg-[#353534]/30 font-bold' : 'text-[#e1bfb7] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span> Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded text-[#e1bfb7] hover:text-white transition-colors text-left cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">help</span> Support
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT CANVAS (Fills Remaining Screen Area) ── */}
      <main className="flex-1 min-w-0 overflow-y-auto h-full">
        {activeScreen === 'lounge' && <StitchSquadLounge showSidebar={false} />}
        {activeScreen === 'dashboard' && <StitchSquadDashboard />}
        {activeScreen === 'dms' && <StitchDMHub />}
        {activeScreen === 'reviews' && <StitchCodeReviewHub />}
        {activeScreen === 'leaderboard' && <StitchSquadLeaderboard />}
        {activeScreen === 'repo' && <StitchSquadRepo />}
        {activeScreen === 'settings' && <StitchSettings />}
      </main>
    </div>
  );
}
