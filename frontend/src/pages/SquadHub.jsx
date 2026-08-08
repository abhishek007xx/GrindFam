import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSquadStore } from '../store/useSquadStore';
import SquadChat from '../components/squad/SquadChat';
import PeerCodeReviewQueue from '../components/community/PeerCodeReviewQueue';
import SquadLeaderboard from '../components/squad/SquadLeaderboard';
import DMList from '../components/squad/DMList';
import DMChat from '../components/squad/DMChat';

export default function SquadHub() {
  const { profile, session } = useAuth();
  const { activeSquad, members, activeDMThread } = useSquadStore();

  const [activeTab, setActiveTab] = useState('lounge'); // 'lounge', 'codereview', 'leaderboard', 'dms', 'repo'
  const [activeChannel, setActiveChannel] = useState('general');

  const currentUserName = profile?.name || session?.user?.email?.split('@')[0] || 'AlexChen';

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md selection:bg-secondary/30 selection:text-secondary">
      {/* ── STITCH GLOBAL TOP NAVBAR (Exact Screen 10625988f1344d9db9c9bf2e9d945f37 & e0c235bf36d748d69bcbb87e8d8763c3) ── */}
      <header className="bg-surface/85 backdrop-blur-xl docked full-width top-0 sticky z-40 border-b border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex justify-between items-center w-full px-4 md:px-8 h-16 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <div className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
            Developer Hub
          </div>
          <nav className="hidden md:flex gap-6">
            <button
              onClick={() => setActiveTab('lounge')}
              className={`font-body-md text-body-md transition-all cursor-pointer ${
                activeTab === 'lounge' ? 'text-secondary font-bold border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Squad Lounge
            </button>

            <button
              onClick={() => setActiveTab('codereview')}
              className={`font-body-md text-body-md transition-all cursor-pointer ${
                activeTab === 'codereview' ? 'text-secondary font-bold border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Code Review Hub
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`font-body-md text-body-md transition-all cursor-pointer ${
                activeTab === 'leaderboard' ? 'text-secondary font-bold border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('repo')}
              className={`font-body-md text-body-md transition-all cursor-pointer ${
                activeTab === 'repo' ? 'text-secondary font-bold border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Repository
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('dms')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono-label flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'dms' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-variant/50 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
            <span>Direct Messages</span>
          </button>

          <button className="bg-[#EA5D3A] text-white px-4 py-2 rounded text-sm font-mono-label font-medium hover:brightness-110 shadow-[0_0_10px_rgba(234,93,58,0.3)] transition-all cursor-pointer">
            Join New Squad
          </button>
        </div>
      </header>

      {/* ── STITCH LIVE PRESENCE BAR (Exact Screen 10625988f1344d9db9c9bf2e9d945f37) ── */}
      <section className="glass-panel border-b border-white/10 p-4 interactive-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="font-headline-md text-headline-md text-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">cell_tower</span>
            Live Presence
          </h2>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {members.length || 1} Members Online
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 pt-1 px-1 scrollbar-hide">
          {/* Member 1: Online */}
          <div className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer">
            <div className="relative w-10 h-10 rounded-full">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDA_DAg1lWb_QBStwkegaL3MfJea2IrP9yGbJ8b0yPhaJMF7Q0NVOmmyA6Pbvyb3NKPma-H4yVRE6MHBYo8fRGGzEikSy6TrW0ZhhBI5oRAZKEBYIXO6Px5BnT0s-wrngmFaBDeadHvZFBsQP9U1XfNqXnOICFXxi_lTsZ1MNCBT4QK8OpIA_W-IeFNs3pyAZckTJvgelgn3ffqzAxo3KTfwLYHNesM7_K6V_FmoVqCIpyJrAIYXZS"
                alt={currentUserName}
                className="w-full h-full rounded-full object-cover ring-2 ring-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-transform group-hover:scale-110"
              />
              <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-[2px]">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
            </div>
            <span className="font-mono-label text-mono-label text-on-surface truncate w-full text-center group-hover:text-secondary transition-colors">
              {currentUserName}
            </span>
          </div>

          {/* Member 2: Solving */}
          <div className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer">
            <div className="relative w-10 h-10 rounded-full">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqWmNp_8aOHLRu6593bk49iequZT5O3tt6MQZS--Z62zz4D3BRgGGCCpQY2VgDgu0-CgLwVlBFCRRBUDlsA3HkNo7dyoEWnNmOnPLqmvRM4zb-Y8fks3aT0URy3qiyaQpoknc0EU3oRgbCjY-1n2h6GvyW_IxXrXXMo-J1oNr9mAUGGguAy_1DHNKwW27Lbtme2li2xUVFnN6ySI5nfh9nRX_j4c7NQpzPyW09i2PBtL7zt1DHW_cz"
                alt="sarah_cpp"
                className="w-full h-full rounded-full object-cover ring-2 ring-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-transform group-hover:scale-110"
              />
              <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-[2px]">
                <span className="material-symbols-outlined text-[#F59E0B] text-[12px] bg-[#F59E0B]/20 rounded-full block">code</span>
              </div>
            </div>
            <span className="font-mono-label text-mono-label text-on-surface truncate w-full text-center group-hover:text-secondary transition-colors">
              sarah_cpp
            </span>
          </div>

          {/* Member 3: Target Hit */}
          <div className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer">
            <div className="relative w-10 h-10 rounded-full">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGQgTKthnkTS-9cFlYqnO2ESOjFblE81p1CyrcF3vQhl9-U4dY3GiAlVBj6HFblZ42GVBKZUH4yR7iiWH1wemMeJmixpbhqYyzzmdXwFQ7o5wPNitBgEoilngsYUDc74w_zQ6hy9SvpaGe4H2qLYM1cWjHX7yX-Y5dfBM7wowGXKECprbV8l90I1OmilusH9Ts21lRrWSpqbFMLWvHLjOc4WmXTFMZXFc_FYvXkFmxFq-OcBjAqtnL"
                alt="j_smith"
                className="w-full h-full rounded-full object-cover ring-2 ring-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-transform group-hover:scale-110"
              />
              <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-[2px]">
                <span className="material-symbols-outlined text-[#3B82F6] text-[12px] bg-[#3B82F6]/20 rounded-full block">target</span>
              </div>
            </div>
            <span className="font-mono-label text-mono-label text-on-surface truncate w-full text-center group-hover:text-secondary transition-colors">
              j_smith
            </span>
          </div>
        </div>
      </section>

      {/* ── STITCH MAIN VIEW CONTAINER ── */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6">
        {/* VIEW 1: SQUAD LOUNGE (Exact Screen 26eecffc494148fd8983b6bb0b5f1991) */}
        {activeTab === 'lounge' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Contextual Sub-Nav */}
            <div className="lg:col-span-3 bg-surface-container-lowest border border-white/10 rounded-xl p-4 space-y-4">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">DSA Dream Team</h3>
              <ul className="flex flex-col gap-xs">
                <li>
                  <button
                    onClick={() => setActiveChannel('general')}
                    className={`w-full flex items-center gap-2 font-mono-label text-mono-label px-3 py-2 rounded text-left transition-colors cursor-pointer ${
                      activeChannel === 'general' ? 'text-primary bg-surface-variant/30 font-bold border-l-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="text-on-surface-variant">#</span> general
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveChannel('daily-wins')}
                    className={`w-full flex items-center gap-2 font-mono-label text-mono-label px-3 py-2 rounded text-left transition-colors cursor-pointer ${
                      activeChannel === 'daily-wins' ? 'text-primary bg-surface-variant/30 font-bold border-l-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">emoji_events</span> daily-wins
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveChannel('doubt-solver')}
                    className={`w-full flex items-center gap-2 font-mono-label text-mono-label px-3 py-2 rounded text-left transition-colors cursor-pointer ${
                      activeChannel === 'doubt-solver' ? 'text-primary bg-surface-variant/30 font-bold border-l-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">help</span> doubt-solver
                  </button>
                </li>
              </ul>
            </div>

            {/* Chat Feed */}
            <div className="lg:col-span-9 bg-surface border border-white/10 rounded-xl p-4 min-h-[500px]">
              <SquadChat />
            </div>
          </div>
        )}

        {/* VIEW 2: CODE REVIEWS (Exact Screen e0c235bf36d748d69bcbb87e8d8763c3) */}
        {activeTab === 'codereview' && (
          <div className="bg-surface border border-white/10 rounded-xl p-4">
            <PeerCodeReviewQueue />
          </div>
        )}

        {/* VIEW 3: LEADERBOARD (Exact Screen 5490bd01bd5a46d999034819bea76eef) */}
        {activeTab === 'leaderboard' && (
          <div className="bg-surface border border-white/10 rounded-xl p-4">
            <SquadLeaderboard />
          </div>
        )}

        {/* VIEW 4: REPOSITORY (Exact Screen 29934e147c6b41399e37f527f3d55634) */}
        {activeTab === 'repo' && (
          <div className="bg-surface border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Squad Code Repository</h2>
              <button className="bg-[#EA5D3A] text-white px-4 py-2 rounded text-sm font-mono-label font-medium hover:brightness-110 transition-all cursor-pointer">
                Submit Code Snippet
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-body-md text-body-md font-semibold text-secondary">Two Sum Hash Map Optimization</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-label bg-surface border border-[#333333]">C++</span>
                </div>
                <pre className="bg-[#0D0D0D] border border-[#333333] rounded p-3 text-xs font-mono-code text-[#4cd7f6] overflow-x-auto">
{`unordered_map<int, int> mp;
for (int i = 0; i < nums.size(); i++) {
    int diff = target - nums[i];
    if (mp.count(diff)) return {mp[diff], i};
    mp[nums[i]] = i;
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: DIRECT MESSAGES HUB (Exact Screen 072245e3558848129d397a0c858475cc) */}
        {activeTab === 'dms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 bg-surface-container-lowest border border-white/10 rounded-xl p-4 min-h-[500px]">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">chat_bubble</span> Direct Messages
              </h3>
              <DMList />
            </div>

            <div className="lg:col-span-8 bg-surface border border-white/10 rounded-xl p-5 min-h-[500px]">
              {activeDMThread ? (
                <DMChat />
              ) : (
                <div className="text-center py-24 space-y-4">
                  <span className="material-symbols-outlined text-secondary text-5xl">forum</span>
                  <h4 className="font-headline-md text-headline-md text-on-surface">Select a Direct Message Chat</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                    Direct messaging for coders: share problem links, discuss solutions, and review code together.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
