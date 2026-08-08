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

  // Screen selection: 'lounge', 'dashboard', 'reviews', 'dms', 'repo'
  const [activeScreen, setActiveScreen] = useState('lounge');
  const [activeChannel, setActiveChannel] = useState('general');

  const currentUserName = profile?.name || session?.user?.email?.split('@')[0] || 'AlexChen';

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-['Inter'] antialiased selection:bg-[#4cd7f6]/30 selection:text-[#4cd7f6]">
      {/* ── TOP STITCH APP BAR / SCREEN SWITCHER ── */}
      <div className="bg-[#0e0e0e] border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
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
                  ? 'bg-[#f2633f]/20 text-[#f2633f] border border-[#f2633f]/40'
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
                  ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
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
                  ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Code Reviews</span>
            </button>

            <button
              onClick={() => setActiveScreen('dms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeScreen === 'dms'
                  ? 'bg-[#a078ff]/20 text-[#a078ff] border border-[#a078ff]/40'
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
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
              <span>Repository</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-['JetBrains_Mono'] text-[#a88a83] hidden sm:inline">
            Squad Code: <strong className="text-[#f2633f]">{activeSquad?.code || 'GRIND2026'}</strong>
          </span>
          <button className="bg-[#f2633f] text-white text-xs px-3 py-1.5 rounded font-['JetBrains_Mono'] font-bold hover:brightness-110 shadow-[0_0_10px_rgba(242,99,63,0.3)] transition-all cursor-pointer">
            Join New Squad
          </button>
        </div>
      </div>

      {/* ── SCREEN 1: SQUAD LOUNGE (EXACT STITCH DESIGN SYSTEM HTML) ── */}
      {activeScreen === 'lounge' && (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-60px)]">
          {/* Sub Navigation */}
          <aside className="w-full md:w-[280px] bg-[#0e0e0e] border-r border-white/10 p-6 flex flex-col gap-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIwHIaa31XSaQ21h4vGBfIkMxb-efbXX3czeVvAawxlixpfvnTqNxGe0HKbZX_gLFPlHNVfYVNzfweyKwhULUFziKwPnz1hxmSo_QOthK5GcYqiioSp4bOMUVAS9GnhTDBePkG1P5RuIRfC9D3DuWollfw9RXZsrt-P56cpjVUCFOKJ_qKyyWixQvIqxj4bv-G6QcRtCm436YVDAgeCXJ_8bmyJDM81fyKcv53lj6rQhGhVxkkRYVQ"
                alt="Squad Terminal"
                className="w-10 h-10 rounded-lg object-cover ring-2 ring-[#353534]"
              />
              <div>
                <h1 className="font-['Outfit'] text-lg font-bold text-[#ffb4a2]">{activeSquad?.name || 'Developer Hub'}</h1>
                <p className="font-['Inter'] text-xs text-[#e1bfb7]">Elite Tier</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-['Outfit'] text-sm font-bold text-white">DSA Dream Team</h3>
              <ul className="flex flex-col gap-1 font-['JetBrains_Mono'] text-xs">
                <li>
                  <button
                    onClick={() => setActiveChannel('general')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
                      activeChannel === 'general' ? 'text-[#ffb4a2] bg-[#353534]/40 font-bold' : 'text-[#e1bfb7] hover:text-white'
                    }`}
                  >
                    <span className="text-[#e1bfb7]">#</span> general
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveChannel('daily-wins')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
                      activeChannel === 'daily-wins' ? 'text-[#ffb4a2] bg-[#353534]/40 font-bold' : 'text-[#e1bfb7] hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">emoji_events</span> daily-wins
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveChannel('doubt-solver')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
                      activeChannel === 'doubt-solver' ? 'text-[#ffb4a2] bg-[#353534]/40 font-bold' : 'text-[#e1bfb7] hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">help</span> doubt-solver
                  </button>
                </li>
                <li className="mt-2">
                  <div className="flex items-center gap-2 text-[#4cd7f6] px-3 py-1.5 font-bold">
                    <div className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse shadow-[0_0_8px_#ffb4ab]" />
                    <span>Live Coding</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Chat Stream Container */}
          <main className="flex-1 bg-[#131313] p-4 md:p-6">
            <SquadChat />
          </main>
        </div>
      )}

      {/* ── SCREEN 2: SQUAD DASHBOARD (EXACT STITCH DASHBOARD HTML) ── */}
      {activeScreen === 'dashboard' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col gap-1">
            <h1 className="font-['Outfit'] text-3xl font-bold text-white">{activeSquad?.name || 'Squad Alpha'}</h1>
            <p className="font-['Inter'] text-sm text-[#e1bfb7]">
              Elite Tier <span className="mx-2">•</span> {members.length || 14} Members <span className="mx-2">•</span> Rank #42 Global
            </p>
          </div>

          {/* Live Presence Bar */}
          <section className="glass-panel bg-[#1e1e1e]/85 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Outfit'] text-lg font-bold text-[#4cd7f6]">Live Presence</h2>
              <span className="font-['Inter'] text-xs text-[#e1bfb7]">View All →</span>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="relative w-12 h-12 rounded-full">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDA_DAg1lWb_QBStwkegaL3MfJea2IrP9yGbJ8b0yPhaJMF7Q0NVOmmyA6Pbvyb3NKPma-H4yVRE6MHBYo8fRGGzEikSy6TrW0ZhhBI5oRAZKEBYIXO6Px5BnT0s-wrngmFaBDeadHvZFBsQP9U1XfNqXnOICFXxi_lTsZ1MNCBT4QK8OpIA_W-IeFNs3pyAZckTJvgelgn3ffqzAxo3KTfwLYHNesM7_K6V_FmoVqCIpyJrAIYXZS"
                    alt="alex_dev"
                    className="w-full h-full rounded-full object-cover border-2 border-[#10B981] shadow-[0_0_8px_#10B981]"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#131313] rounded-full p-[2px]">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
                  </div>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1]">{currentUserName}</span>
              </div>

              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="relative w-12 h-12 rounded-full">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqWmNp_8aOHLRu6593bk49iequZT5O3tt6MQZS--Z62zz4D3BRgGGCCpQY2VgDgu0-CgLwVlBFCRRBUDlsA3HkNo7dyoEWnNmOnPLqmvRM4zb-Y8fks3aT0URy3qiyaQpoknc0EU3oRgbCjY-1n2h6GvyW_IxXrXXMo-J1oNr9mAUGGguAy_1DHNKwW27Lbtme2li2xUVFnN6ySI5nfh9nRX_j4c7NQpzPyW09i2PBtL7zt1DHW_cz"
                    alt="sarah_cpp"
                    className="w-full h-full rounded-full object-cover border-2 border-[#F59E0B] shadow-[0_0_8px_#F59E0B]"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#131313] rounded-full p-[2px]">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[12px]">code</span>
                  </div>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1]">sarah_cpp</span>
              </div>

              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="relative w-12 h-12 rounded-full">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGQgTKthnkTS-9cFlYqnO2ESOjFblE81p1CyrcF3vQhl9-U4dY3GiAlVBj6HFblZ42GVBKZUH4yR7iiWH1wemMeJmixpbhqYyzzmdXwFQ7o5wPNitBgEoilngsYUDc74w_zQ6hy9SvpaGe4H2qLYM1cWjHX7yX-Y5dfBM7wowGXKECprbV8l90I1OmilusH9Ts21lRrWSpqbFMLWvHLjOc4WmXTFMZXFc_FYvXkFmxFq-OcBjAqtnL"
                    alt="j_smith"
                    className="w-full h-full rounded-full object-cover border-2 border-[#3B82F6] shadow-[0_0_8px_#3B82F6]"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#131313] rounded-full p-[2px]">
                    <span className="material-symbols-outlined text-[#3B82F6] text-[12px]">target</span>
                  </div>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1]">j_smith</span>
              </div>
            </div>
          </section>

          {/* Role & Target Badges */}
          <section className="flex flex-wrap gap-3 items-center">
            <span className="font-['Inter'] text-xs text-[#e1bfb7]">Focus:</span>
            <div className="px-3 py-1 rounded-full bg-[#f2633f]/15 border border-[#f2633f]/30 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#f2633f]">corporate_fare</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#f2633f]">Target: Google</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#4cd7f6]/15 border border-[#4cd7f6]/30 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">trending_up</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#4cd7f6]">SDE-2 Prep</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#a078ff]/15 border border-[#a078ff]/30 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#a078ff]">memory</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#a078ff]">DP Specialist</span>
            </div>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h2 className="font-['Outfit'] text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4cd7f6]">dynamic_feed</span> Activity Feed
                </h2>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
                <p className="font-['Inter'] text-sm text-[#e1bfb7]">
                  <strong className="text-white">{currentUserName}</strong> solved a Hard problem: <span className="font-['JetBrains_Mono'] text-[#f2633f]">Alien Dictionary</span> (Beats 98.2%)
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <button className="w-full bg-[#f2633f] text-white py-3 rounded-xl font-['Outfit'] font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_15px_rgba(242,99,63,0.4)] transition-all cursor-pointer">
                <span className="material-symbols-outlined">swords</span> Start 1v1 Battle
              </button>
              <button
                onClick={() => setActiveScreen('reviews')}
                className="w-full bg-transparent border border-[#333333] hover:border-[#4cd7f6] text-[#e5e2e1] hover:text-[#4cd7f6] py-3 rounded-xl font-['Outfit'] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">code</span> Post Code Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN 3: CODE REVIEWS (EXACT STITCH CODE REVIEW HTML) ── */}
      {activeScreen === 'reviews' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-6">
          <PeerCodeReviewQueue />
        </div>
      )}

      {/* ── SCREEN 4: DIRECT MESSAGES HUB (EXACT STITCH DM HTML) ── */}
      {activeScreen === 'dms' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 bg-[#0e0e0e] border border-white/10 rounded-xl p-4 min-h-[550px]">
            <h3 className="font-['Outfit'] text-base font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6]">chat_bubble</span> Direct Messages Hub
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

      {/* ── SCREEN 5: REPOSITORY (EXACT STITCH REPO HTML) ── */}
      {activeScreen === 'repo' && (
        <div className="max-w-[1440px] mx-auto p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="font-['Outfit'] text-xl font-bold text-white">Squad Code Repository</h2>
            <button className="bg-[#f2633f] text-white px-4 py-2 rounded text-xs font-['JetBrains_Mono'] font-bold hover:brightness-110 transition-all cursor-pointer">
              Submit Code Snippet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-['Inter'] text-sm font-bold text-[#4cd7f6]">Two Sum Hash Map Optimization</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#0e0e0e] text-white border border-[#333]">C++</span>
              </div>
              <pre className="bg-[#0e0e0e] border border-[#333] rounded p-3 text-xs font-['JetBrains_Mono'] text-[#4cd7f6] overflow-x-auto">
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
    </div>
  );
}
