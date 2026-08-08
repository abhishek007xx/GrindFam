import React, { useState } from 'react';
import SquadChat from '../squad/SquadChat';

export default function StitchSquadLounge({ showSidebar = true }) {
  const [activeChannel, setActiveChannel] = useState('general');

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col md:flex-row overflow-hidden font-['Inter']">
      {/* Optional Inner SideNavBar if used standalone */}
      {showSidebar && (
        <nav className="w-full md:w-[280px] bg-[#0e0e0e] border-r border-white/10 flex flex-col py-6 px-4 shrink-0">
          <div className="px-4 mb-8 flex items-center gap-4">
            <img
              alt="Squad Terminal"
              className="w-10 h-10 rounded-lg object-cover ring-2 ring-[#353534]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIwHIaa31XSaQ21h4vGBfIkMxb-efbXX3czeVvAawxlixpfvnTqNxGe0HKbZX_gLFPlHNVfYVNzfweyKwhULUFziKwPnz1hxmSo_QOthK5GcYqiioSp4bOMUVAS9GnhTDBePkG1P5RuIRfC9D3DuWollfw9RXZsrt-P56cpjVUCFOKJ_qKyyWixQvIqxj4bv-G6QcRtCm436YVDAgeCXJ_8bmyJDM81fyKcv53lj6rQhGhVxkkRYVQ"
            />
            <div>
              <h1 className="font-['Outfit'] text-lg font-bold text-[#ffb4a2]">Developer Hub</h1>
              <p className="font-['Inter'] text-xs text-[#e1bfb7]">Elite Tier</p>
            </div>
          </div>
          <div className="px-4 mt-auto mb-6">
            <h3 className="font-['Outfit'] text-base font-bold text-[#e5e2e1] mb-3">DSA Dream Team</h3>
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
      <main className="flex-1 flex flex-col bg-[#131313] h-full min-h-[650px]">
        {/* Chat Header */}
        <header className="h-16 bg-[#131313]/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-['Outfit'] text-2xl font-bold text-[#e5e2e1] flex items-center gap-2">
              <span className="text-[#e1bfb7] font-light">#</span>{activeChannel}
            </h2>
            <div className="hidden md:flex bg-[#353534] px-3 py-1 rounded-full text-[#e1bfb7] font-['JetBrains_Mono'] text-xs items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">group</span> 24 Members
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-[#e1bfb7] hover:text-[#4cd7f6] transition-all">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="text-[#e1bfb7] hover:text-[#4cd7f6] transition-all">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <SquadChat />
        </div>
      </main>
    </div>
  );
}
