import React, { useState } from 'react';
import SquadChat from '../squad/SquadChat';

export default function StitchSquadLounge() {
  const [activeChannel, setActiveChannel] = useState('general');

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col md:flex-row overflow-hidden font-['Inter']">
      {/* Global SideNavBar (Exact Stitch HTML) */}
      <nav className="w-full md:w-[280px] bg-[#0e0e0e] border-r border-white/10 flex flex-col py-6 px-4 shrink-0">
        {/* Header */}
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

        {/* Navigation Links */}
        <ul className="flex-1 flex flex-col gap-1">
          <li>
            <a className="text-[#e1bfb7] hover:text-white px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[#353534]/30 hover:text-[#4cd7f6] font-['JetBrains_Mono'] text-xs" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>home</span>
              Home
            </a>
          </li>
          <li>
            <a className="text-[#e1bfb7] hover:text-white px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[#353534]/30 hover:text-[#4cd7f6] font-['JetBrains_Mono'] text-xs" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>chat_bubble</span>
              Direct Messages
            </a>
          </li>
          <li>
            <a className="text-[#e1bfb7] hover:text-white px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[#353534]/30 hover:text-[#4cd7f6] font-['JetBrains_Mono'] text-xs" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>terminal</span>
              Code Reviews
            </a>
          </li>
          <li>
            <a className="text-[#4cd7f6] font-bold bg-[#03b5d3]/10 border-l-4 border-[#4cd7f6] px-4 py-3 flex items-center gap-3 transition-transform translate-x-1 font-['JetBrains_Mono'] text-xs" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              Squads
            </a>
          </li>
          <li>
            <a className="text-[#e1bfb7] hover:text-white px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[#353534]/30 hover:text-[#4cd7f6] font-['JetBrains_Mono'] text-xs" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_bag</span>
              Marketplace
            </a>
          </li>
          <li>
            <a className="text-[#e1bfb7] hover:text-white px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[#353534]/30 hover:text-[#4cd7f6] font-['JetBrains_Mono'] text-xs" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>code</span>
              Repository
            </a>
          </li>
        </ul>

        {/* Squad specific sub-nav (Contextual) */}
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
            <li className="mt-1">
              <div className="flex items-center gap-2 text-[#4cd7f6] px-2 py-1.5 font-bold">
                <div className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse shadow-[0_0_8px_#ffb4ab]" /> Live Coding
              </div>
            </li>
          </ul>
        </div>

        <div className="px-4 mb-4">
          <button className="w-full bg-[#f2633f] text-white py-2 rounded font-['JetBrains_Mono'] text-xs hover:brightness-110 shadow-[0_0_10px_rgba(242,99,63,0.3)] transition-all cursor-pointer">
            Join New Squad
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 border-t border-white/10 pt-4 flex flex-col gap-1">
          <a className="text-[#e1bfb7] hover:text-white flex items-center gap-3 font-['JetBrains_Mono'] text-xs py-1 transition-colors" href="#">
            <span className="material-symbols-outlined text-[18px]">help</span> Support
          </a>
          <a className="text-[#e1bfb7] hover:text-white flex items-center gap-3 font-['JetBrains_Mono'] text-xs py-1 transition-colors" href="#">
            <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
          </a>
        </div>
      </nav>

      {/* Main Chat Canvas (Exact Stitch HTML) */}
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
