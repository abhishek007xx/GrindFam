import React from 'react';
import SquadChat from '../squad/SquadChat';
import { useSquadStore } from '../../store/useSquadStore';

export default function StitchSquadLounge({ showSidebar = true }) {
  const { activeChannel, setActiveChannel, members, activeSquad } = useSquadStore();

  return (
    <div className="bg-[#131313] text-[#e5e2e1] h-full min-h-screen flex flex-col md:flex-row overflow-hidden font-['Inter']">
      {/* Optional Inner SideNavBar if used standalone */}
      {showSidebar && (
        <nav className="w-full md:w-[280px] bg-[#0e0e0e] border-r border-white/10 flex flex-col py-6 px-4 shrink-0">
          <div className="px-4 mb-8 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#EA5D3A] flex items-center justify-center font-['Outfit'] font-bold text-white text-xl">
              {(activeSquad?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-['Outfit'] text-lg font-bold text-[#ffb4a2]">{activeSquad?.name || 'Developer Hub'}</h1>
              <p className="font-['Inter'] text-xs text-[#e1bfb7]">{activeSquad?.squad_type || 'Elite Tier'}</p>
            </div>
          </div>
          <div className="px-4 mt-auto mb-6">
            <h3 className="font-['Outfit'] text-base font-bold text-[#e5e2e1] mb-3">Channels</h3>
            <ul className="flex flex-col gap-1 font-['JetBrains_Mono'] text-xs">
              <li>
                <button
                  onClick={() => setActiveChannel('general')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    activeChannel === 'general' ? 'text-[#ffb4a2] bg-[#353534]/20 font-bold' : 'text-[#e1bfb7] hover:text-white'
                  }`}
                >
                  <span className="text-[#e1bfb7]">#</span> general
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveChannel('daily-wins')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    activeChannel === 'daily-wins' ? 'text-[#ffb4a2] bg-[#353534]/20 font-bold' : 'text-[#e1bfb7] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">emoji_events</span> daily-wins
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveChannel('doubt-solver')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    activeChannel === 'doubt-solver' ? 'text-[#ffb4a2] bg-[#353534]/20 font-bold' : 'text-[#e1bfb7] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">help</span> doubt-solver
                </button>
              </li>
            </ul>
          </div>
        </nav>
      )}

      {/* Main Chat Canvas */}
      <main className="flex-1 flex flex-col bg-[#131313] h-full min-h-0 overflow-hidden relative">
        {/* Chat Header */}
        <header className="h-16 bg-[#131313]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-['Outfit'] text-2xl font-bold text-[#e5e2e1] flex items-center gap-2">
              <span className="text-[#e1bfb7] font-light">#</span>{activeChannel || 'general'}
            </h2>
            <div className="hidden md:flex bg-[#353534] px-3 py-1 rounded-full text-[#e1bfb7] font-['JetBrains_Mono'] text-xs items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">group</span> {members.length || 1} Members
            </div>
          </div>
        </header>

        {/* Squad Chat Container (Direct child with flex-1 h-full min-h-0) */}
        <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
          <SquadChat />
        </div>
      </main>
    </div>
  );
}
