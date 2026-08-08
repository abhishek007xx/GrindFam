import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';

export default function StitchSquadDashboard() {
  const { profile } = useAuth();
  const { activeSquad, members } = useSquadStore();

  const currentUserName = profile?.name || 'alex_dev';

  return (
    <div className="bg-[#0D0D0D] text-[#e5e2e1] min-h-screen flex flex-col font-['Inter'] antialiased p-4 md:p-8 max-w-[1440px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="font-['Outfit'] text-3xl font-bold text-white">{activeSquad?.name || 'Squad Alpha'}</h1>
        <p className="font-['Inter'] text-sm text-[#e1bfb7]">
          Elite Tier <span className="mx-2">•</span> {members.length || 14} Members <span className="mx-2">•</span> Rank #42 Global
        </p>
      </div>

      {/* Section 1: Live Squad Presence Bar */}
      <section className="glass-panel bg-[rgba(30,30,30,0.85)] backdrop-blur-[12px] border border-[rgba(51,51,51,0.6)] rounded-xl p-5 interactive-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Outfit'] text-lg font-bold text-[#4cd7f6]">Live Presence</h2>
          <a className="font-['Inter'] text-xs text-[#e1bfb7] hover:text-[#4cd7f6] transition-colors flex items-center gap-1" href="#">
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex gap-6 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          {/* Member 1: Online */}
          <div className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer">
            <div className="relative w-10 h-10 rounded-full">
              <img
                alt="alex_dev"
                className="w-full h-full rounded-full object-cover ring-2 ring-[#10B981] shadow-[0_0_8px_#10B981] transition-transform group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDA_DAg1lWb_QBStwkegaL3MfJea2IrP9yGbJ8b0yPhaJMF7Q0NVOmmyA6Pbvyb3NKPma-H4yVRE6MHBYo8fRGGzEikSy6TrW0ZhhBI5oRAZKEBYIXO6Px5BnT0s-wrngmFaBDeadHvZFBsQP9U1XfNqXnOICFXxi_lTsZ1MNCBT4QK8OpIA_W-IeFNs3pyAZckTJvgelgn3ffqzAxo3KTfwLYHNesM7_K6V_FmoVqCIpyJrAIYXZS"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#0D0D0D] rounded-full p-[2px]">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
            </div>
            <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1] truncate w-full text-center group-hover:text-[#4cd7f6] transition-colors">
              {currentUserName}
            </span>
          </div>

          {/* Member 2: Solving */}
          <div className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer">
            <div className="relative w-10 h-10 rounded-full">
              <img
                alt="sarah_cpp"
                className="w-full h-full rounded-full object-cover ring-2 ring-[#F59E0B] shadow-[0_0_8px_#F59E0B] transition-transform group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqWmNp_8aOHLRu6593bk49iequZT5O3tt6MQZS--Z62zz4D3BRgGGCCpQY2VgDgu0-CgLwVlBFCRRBUDlsA3HkNo7dyoEWnNmOnPLqmvRM4zb-Y8fks3aT0URy3qiyaQpoknc0EU3oRgbCjY-1n2h6GvyW_IxXrXXMo-J1oNr9mAUGGguAy_1DHNKwW27Lbtme2li2xUVFnN6ySI5nfh9nRX_j4c7NQpzPyW09i2PBtL7zt1DHW_cz"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#0D0D0D] rounded-full p-[2px]">
                <span className="material-symbols-outlined text-[#F59E0B] text-[12px] bg-[#F59E0B]/20 rounded-full block">code</span>
              </div>
            </div>
            <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1] truncate w-full text-center group-hover:text-[#4cd7f6] transition-colors">
              sarah_cpp
            </span>
          </div>

          {/* Member 3: Target Hit */}
          <div className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer">
            <div className="relative w-10 h-10 rounded-full">
              <img
                alt="j_smith"
                className="w-full h-full rounded-full object-cover ring-2 ring-[#3B82F6] shadow-[0_0_8px_#3B82F6] transition-transform group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGQgTKthnkTS-9cFlYqnO2ESOjFblE81p1CyrcF3vQhl9-U4dY3GiAlVBj6HFblZ42GVBKZUH4yR7iiWH1wemMeJmixpbhqYyzzmdXwFQ7o5wPNitBgEoilngsYUDc74w_zQ6hy9SvpaGe4H2qLYM1cWjHX7yX-Y5dfBM7wowGXKECprbV8l90I1OmilusH9Ts21lRrWSpqbFMLWvHLjOc4WmXTFMZXFc_FYvXkFmxFq-OcBjAqtnL"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#0D0D0D] rounded-full p-[2px]">
                <span className="material-symbols-outlined text-[#3B82F6] text-[12px] bg-[#3B82F6]/20 rounded-full block">target</span>
              </div>
            </div>
            <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1] truncate w-full text-center group-hover:text-[#4cd7f6] transition-colors">
              j_smith
            </span>
          </div>

          {/* Member 4: Offline */}
          <div className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
            <div className="relative w-10 h-10 rounded-full">
              <div className="w-full h-full rounded-full bg-[#353534] flex items-center justify-center ring-2 ring-[#6B7280] text-[#e1bfb7] font-['Outfit'] font-bold">
                M
              </div>
            </div>
            <span className="font-['JetBrains_Mono'] text-xs text-[#e1bfb7] truncate w-full text-center">mike_j</span>
          </div>
        </div>
      </section>

      {/* Section 2: Automated Role & Prep Badges */}
      <section className="flex flex-wrap gap-2 items-center">
        <span className="font-['Inter'] text-xs text-[#e1bfb7] mr-2">Focus:</span>
        <div className="h-[28px] px-3 rounded-full bg-[#f2633f]/15 border border-[#f2633f]/30 flex items-center gap-1.5 cursor-help hover:bg-[#f2633f]/25 transition-colors">
          <span className="material-symbols-outlined text-[14px] text-[#f2633f]">corporate_fare</span>
          <span className="font-['JetBrains_Mono'] text-xs text-[#f2633f]">Target: Google</span>
        </div>
        <div className="h-[28px] px-3 rounded-full bg-[#4cd7f6]/15 border border-[#4cd7f6]/30 flex items-center gap-1.5 cursor-help hover:bg-[#4cd7f6]/25 transition-colors">
          <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">trending_up</span>
          <span className="font-['JetBrains_Mono'] text-xs text-[#4cd7f6]">SDE-2 Prep</span>
        </div>
        <div className="h-[28px] px-3 rounded-full bg-[#a078ff]/15 border border-[#a078ff]/30 flex items-center gap-1.5 cursor-help hover:bg-[#a078ff]/25 transition-colors">
          <span className="material-symbols-outlined text-[14px] text-[#a078ff]">memory</span>
          <span className="font-['JetBrains_Mono'] text-xs text-[#a078ff]">DP Specialist</span>
        </div>
        <div className="h-[28px] px-3 rounded-full bg-[#353534] border border-[#59413b] flex items-center gap-1.5 cursor-help hover:bg-[#393939] transition-colors">
          <span className="material-symbols-outlined text-[14px] text-[#F59E0B]">local_police</span>
          <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1]">Squad Captain</span>
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
            <div className="flex gap-2 font-['JetBrains_Mono'] text-xs">
              <button className="text-[#4cd7f6] px-2 py-1 bg-[#4cd7f6]/10 rounded font-bold">All</button>
              <button className="text-[#e1bfb7] hover:text-white px-2 py-1 rounded transition-colors">Solves</button>
            </div>
          </div>

          {/* Feed Item 1 */}
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-lg p-4 flex gap-4 interactive-glow transition-all">
            <div className="w-10 h-10 rounded-full shrink-0">
              <img
                alt="alex_dev"
                className="w-full h-full rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVy-5VXqaZ9gmJIk4j10Wmj1q-aSyih-2bDnJ_xxir6pxnU8QcnerE_tAKFD9OHkwjTtCo95eP83di8-XDb2bi4pZy9ssSXapY0AwX-dpI68YHwTyc9RVKKv4xMBmlymFZvK9nXMtlBxSfEZDZG1IJ1nvwE_vGyZ8gUporbKKRbthFNtU1mpoQz20xGlUK30pVM3Z_t50Jd5kUM71B2-QiGcTjisGmBK0w5842fFfTxvT8mao6Yqie"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <p className="font-['Inter'] text-sm text-[#e1bfb7]">
                  <strong className="text-white font-semibold">alex_dev</strong> solved a Hard problem
                </p>
                <span className="font-['JetBrains_Mono'] text-xs text-[#e1bfb7]/50">2m ago</span>
              </div>
              <div className="bg-[#121212] border-l-4 border-[#ffb4ab] rounded-r border-y border-r border-white/5 p-3 mt-2">
                <p className="font-['JetBrains_Mono'] text-sm text-white font-bold">Alien Dictionary</p>
                <p className="font-['JetBrains_Mono'] text-xs text-[#e1bfb7] mt-1">Runtime: 4ms (Beats 98.2%) • C++</p>
              </div>
              <div className="flex gap-4 mt-3">
                <button className="flex items-center gap-1 text-[#e1bfb7] hover:text-[#4cd7f6] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                  <span className="font-['JetBrains_Mono'] text-xs">12</span>
                </button>
                <button className="flex items-center gap-1 text-[#e1bfb7] hover:text-[#4cd7f6] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                  <span className="font-['JetBrains_Mono'] text-xs">3</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feed Item 2 */}
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-lg p-4 flex gap-4 interactive-glow transition-all">
            <div className="w-10 h-10 rounded-full shrink-0 bg-[#353534] flex items-center justify-center font-['Outfit'] font-bold text-white">
              S
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <p className="font-['Inter'] text-sm text-[#e1bfb7]">
                  <strong className="text-white font-semibold">sarah_cpp</strong> hit a milestone
                </p>
                <span className="font-['JetBrains_Mono'] text-xs text-[#e1bfb7]/50">1h ago</span>
              </div>
              <div className="flex items-center gap-3 mt-2 p-3 bg-[#121212] rounded border border-white/5">
                <span className="material-symbols-outlined text-[#F59E0B] text-[24px]">local_fire_department</span>
                <div>
                  <p className="font-['Outfit'] text-sm text-white font-bold">50 Day Global Streak</p>
                  <p className="font-['Inter'] text-xs text-[#e1bfb7]">Top 5% of active users</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Actions & Analytics */}
        <section className="lg:col-span-4 flex flex-col gap-4 sticky top-24">
          <button className="w-full bg-[#EA5D3A] text-white py-3 px-4 rounded-lg font-['Outfit'] text-base font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_15px_rgba(234,93,58,0.4)] transition-all cursor-pointer">
            <span className="material-symbols-outlined">swords</span> Start 1v1 Battle
          </button>

          <button className="w-full bg-transparent border border-[#333333] hover:border-[#4cd7f6] text-[#e5e2e1] hover:text-[#4cd7f6] py-3 px-4 rounded-lg font-['Outfit'] text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
            <span className="material-symbols-outlined">code</span> Post Code Review
          </button>

          <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-xl p-4">
            <h3 className="font-['Outfit'] text-base text-white pb-2 border-b border-white/10 flex items-center gap-2 font-bold mb-3">
              <span className="material-symbols-outlined text-[#ffb4a2]">bar_chart</span> Squad Analytics
            </h3>
            <div className="space-y-2 font-['Inter'] text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#e1bfb7]">Active Members</span>
                <span className="font-['JetBrains_Mono'] text-white font-semibold">12/14</span>
              </div>
              <div className="w-full bg-[#0D0D0D] h-1.5 rounded-full overflow-hidden mb-2">
                <div className="bg-[#4cd7f6] h-full rounded-full w-[85%] shadow-[0_0_8px_rgba(76,215,246,0.5)]" />
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#e1bfb7]">Avg Solved/Week</span>
                <span className="font-['JetBrains_Mono'] text-white font-semibold">42.5</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#e1bfb7]">Global Rank</span>
                <span className="font-['JetBrains_Mono'] text-[#ffb4a2] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 42
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
