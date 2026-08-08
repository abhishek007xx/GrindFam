import React, { useState } from 'react';

export default function SquadHub() {
  const [activeTab, setActiveTab] = useState('lounge'); // 'lounge', 'dashboard'

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-['Inter'] antialiased selection:bg-[#4cd7f6]/30 selection:text-[#4cd7f6]">
      {/* Top Screen Selector Bar */}
      <div className="bg-[#0e0e0e] border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="font-['Outfit'] text-xl font-bold text-[#ffb4a2] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f2633f] text-2xl">terminal</span>
            <span>Developer Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('lounge')}
              className={`px-4 py-2 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'lounge'
                  ? 'bg-[#f2633f]/20 text-[#f2633f] border border-[#f2633f]/40'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">groups</span>
              <span>Squad Lounge</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                  : 'text-[#e1bfb7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              <span>Squad Dashboard</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-[#f2633f] text-white text-xs px-4 py-2 rounded font-['JetBrains_Mono'] font-bold hover:brightness-110 shadow-[0_0_10px_rgba(242,99,63,0.3)] transition-all cursor-pointer">
            Join New Squad
          </button>
        </div>
      </div>

      {/* ── TAB 1: SQUAD LOUNGE (FULL STITCH HTML) ── */}
      {activeTab === 'lounge' && (
        <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex overflow-hidden">
          {/* Global SideNavBar */}
          <nav className="w-[280px] bg-[#0e0e0e] border-r border-white/10 flex flex-col py-6 px-4 shrink-0 hidden md:flex">
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
            <ul className="flex-1 flex flex-col gap-1 mt-4">
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

            {/* Squad specific sub-nav */}
            <div className="px-4 mt-auto mb-6">
              <h3 className="font-['Outfit'] text-base font-bold text-[#e5e2e1] mb-4">DSA Dream Team</h3>
              <ul className="flex flex-col gap-1">
                <li>
                  <a className="flex items-center gap-2 text-[#ffb4a2] font-['JetBrains_Mono'] text-xs bg-[#353534]/20 px-2 py-1.5 rounded" href="#">
                    <span className="text-[#e1bfb7]">#</span> general
                  </a>
                </li>
                <li>
                  <a className="flex items-center gap-2 text-[#e1bfb7] hover:text-white font-['JetBrains_Mono'] text-xs px-2 py-1.5 rounded transition-colors" href="#">
                    <span className="material-symbols-outlined text-[16px]">emoji_events</span> daily-wins
                  </a>
                </li>
                <li>
                  <a className="flex items-center gap-2 text-[#e1bfb7] hover:text-white font-['JetBrains_Mono'] text-xs px-2 py-1.5 rounded transition-colors" href="#">
                    <span className="material-symbols-outlined text-[16px]">help</span> doubt-solver
                  </a>
                </li>
                <li className="mt-1">
                  <div className="flex items-center gap-2 text-[#4cd7f6] font-['JetBrains_Mono'] text-xs px-2 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse shadow-[0_0_8px_#ffb4ab]" /> Live Coding
                  </div>
                </li>
              </ul>
            </div>

            <div className="px-4 mb-4">
              <button className="w-full bg-[#f2633f] text-white py-2 rounded font-['JetBrains_Mono'] text-xs hover:brightness-110 shadow-[0_0_10px_rgba(242,99,63,0.3)] transition-all">Join New Squad</button>
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

          {/* Main Chat Canvas */}
          <main className="flex-1 flex flex-col bg-[#131313] h-full min-h-[600px]">
            {/* Chat Header */}
            <header className="h-16 bg-[#131313]/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
              <div className="flex items-center gap-4">
                <h2 className="font-['Outfit'] text-2xl font-bold text-[#e5e2e1] flex items-center gap-2">
                  <span className="text-[#e1bfb7] font-light">#</span>general
                </h2>
                <div className="hidden md:flex bg-[#353534] px-3 py-1 rounded-full text-[#e1bfb7] font-['JetBrains_Mono'] text-xs items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span> 24 Members
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-[#e1bfb7] hover:text-[#4cd7f6] hover:drop-shadow-[0_0_8px_rgba(76,215,246,0.5)] transition-all">
                  <span className="material-symbols-outlined">search</span>
                </button>
                <button className="text-[#e1bfb7] hover:text-[#4cd7f6] hover:drop-shadow-[0_0_8px_rgba(76,215,246,0.5)] transition-all">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </header>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto chat-scroll p-6 flex flex-col gap-6">
              {/* Message 1 */}
              <div className="flex gap-4 group">
                <img
                  className="w-10 h-10 rounded-lg object-cover ring-2 ring-transparent group-hover:ring-[#353534] transition-all shrink-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWKh2BFvMoEfW2-C81lfKFqe2MGcgG7K-ecr-g_9js9JSAtgyyBjg-DEAQjqzJ-hdq62C1ml02NWZDFXfDfbqW_IwkdAgP2a5sWrnZmde-QBs-MK1fObXAwm6-MvS0uqsXZBo6HwOSjoeI2TND1hdTkaGrgB4HZGCKbW6_To12vozZZVqwqdHpZW_EGzMeIbKDvrLalec0WLrn9DBDA7inlR3GJflp4HaxVRL2h0YJpbOFJORnWFBR"
                  alt="AlexChen"
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-['Outfit'] text-sm font-semibold text-[#ffb4a2]">AlexChen</span>
                    <span className="font-['JetBrains_Mono'] text-[12px] text-[#e1bfb7]">10:42 AM</span>
                  </div>
                  <div className="font-['Inter'] text-sm text-[#e5e2e1] mb-2">
                    Just cracked the dynamic programming challenge from yesterday. The trick was memoizing the subtrees before traversing. Anyone else get stuck on the edge cases?
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-[#353534]/50 hover:bg-[#353534] px-2 py-1 rounded border border-white/5 text-[14px]">🔥</button>
                    <button className="bg-[#353534]/50 hover:bg-[#353534] px-2 py-1 rounded border border-white/5 text-[14px]">🙌</button>
                  </div>
                </div>
              </div>

              {/* Message 2 */}
              <div className="flex gap-4 group">
                <img
                  className="w-10 h-10 rounded-lg object-cover ring-2 ring-transparent group-hover:ring-[#353534] transition-all shrink-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpqCY382CWdbmwUj3x6Hc282vBZVXn3TLZAXyJtp_CP5_9qPyH2lnuHVa9-NtQwJiqzvuNpj82lZsce-ihx2M9_K4juBmJZG2WnMjahwtgS6_ojCFK9ZZsSVei6VxQFHTVgPsFcgfAabaYbMuq-agYsgjg31BIvlBn1pxONkcRMUF5kXMRuAH5_2nVrxSCfpBfvbp8n8QINKzLnq4XlMnymd_UfVhp10Bj6mrwDCcPLOtSQFwVzJ1k"
                  alt="SarahJ_dev"
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-['Outfit'] text-sm font-semibold text-[#4cd7f6]">SarahJ_dev</span>
                    <span className="font-['JetBrains_Mono'] text-[12px] text-[#e1bfb7]">10:45 AM</span>
                  </div>
                  <div className="font-['Inter'] text-sm text-[#e5e2e1] mb-2">
                    Yeah, the O(N^2) solution was timing out for me. Here's how I optimized the inner loop:
                  </div>
                  <div className="bg-[#0D0D0D] border border-[#333333] rounded-lg p-4 mb-2 overflow-x-auto relative group/code">
                    <pre className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1]">
{`def optimized_traversal(node, memo):
    if node in memo:
        return memo[node]
    
    res = 0
    for child in node.children:
        res = max(res, optimized_traversal(child, memo) + node.val)
        
    memo[node] = res
    return res`}
                    </pre>
                    <button className="absolute top-2 right-2 text-[#e1bfb7] hover:text-[#4cd7f6] opacity-0 group-hover/code:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 px-2 py-1 rounded text-[14px] flex items-center gap-1">
                      <span className="text-[#4cd7f6] font-['JetBrains_Mono']">🚀 3</span>
                    </button>
                    <button className="bg-[#353534]/50 hover:bg-[#353534] px-2 py-1 rounded border border-white/5 text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">🎯</button>
                  </div>
                </div>
              </div>

              {/* Message 3 */}
              <div className="flex gap-4 group">
                <img
                  className="w-10 h-10 rounded-lg object-cover ring-2 ring-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAgjAZMHfZ3oD4Qrk-6gOIbKFo-FK-7bjzo1vqK4P-hcapGO4t3DjRiWRk00UGPCOxdLqb2mCpN38XmvNuF9-6tbmUuCmFt3gr-7N5YpLtHABUpZ0fHzOarp-PM37HHgfwpiW4E1GCrvlKmnwGvViNjzdZxFNrZOVxQpKBgj5YzUFvVQpcJXFmOGMUVfae2_apH0LBQ8UqEdUahLavK7Rcn3DlxdYWoH2dRRYPKkXaXZBy7wY2vujz"
                  alt="Neo_Coder"
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-['Outfit'] text-sm font-semibold text-[#f2633f]">Neo_Coder</span>
                    <span className="font-['JetBrains_Mono'] text-[12px] text-[#e1bfb7]">10:51 AM</span>
                  </div>
                  <div className="font-['Inter'] text-sm text-[#e5e2e1] mb-2">
                    Nice! I was using a similar approach but forgot to pass the memo dict by reference in my recursive calls initially. Rookie mistake 😅
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-[#353534]/50 hover:bg-[#353534] px-2 py-1 rounded border border-white/5 text-[14px]">🔥</button>
                    <button className="bg-[#353534]/50 hover:bg-[#353534] px-2 py-1 rounded border border-white/5 text-[14px]">🙌</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Input Area */}
            <div className="p-4 bg-[#131313] shrink-0 border-t border-white/10">
              <div className="bg-[rgba(30,30,30,0.85)] backdrop-blur-[12px] border border-[rgba(51,51,51,0.6)] rounded-xl p-2 flex items-end gap-2 focus-within:border-[#4cd7f6] focus-within:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">
                <button className="p-2 text-[#e1bfb7] hover:text-[#ffb4a2] transition-colors shrink-0">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-[#e5e2e1] font-['Inter'] text-sm placeholder-[#e1bfb7] resize-none py-2 max-h-32 overflow-y-auto"
                  placeholder="Message #general..."
                  rows={1}
                />
                <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
                  <button className="p-2 text-[#e1bfb7] hover:text-[#4cd7f6] transition-colors">
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                  </button>
                  <button className="bg-[#f2633f] hover:brightness-110 hover:shadow-[0_0_12px_rgba(234,93,58,0.5)] text-white p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#e1bfb7]">Press Enter to send, Shift+Enter for new line</span>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ── TAB 2: SQUAD DASHBOARD (FULL STITCH DASHBOARD HTML) ── */}
      {activeTab === 'dashboard' && (
        <div className="bg-[#0D0D0D] text-[#e5e2e1] min-h-screen flex flex-col font-['Inter'] p-6 space-y-6 max-w-[1440px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col gap-1">
            <h1 className="font-['Outfit'] text-3xl font-bold text-white">Squad Alpha</h1>
            <p className="font-['Inter'] text-sm text-[#e1bfb7]">Elite Tier <span className="mx-2">•</span> 14 Members <span class="mx-2">•</span> Rank #42 Global</p>
          </div>

          {/* Section 1: Live Squad Presence Bar */}
          <section className="glass-panel bg-[rgba(30,30,30,0.85)] backdrop-blur-[12px] border border-[rgba(51,51,51,0.6)] rounded-xl p-4 interactive-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Outfit'] text-lg font-bold text-[#4cd7f6]">Live Presence</h2>
              <a className="font-['Inter'] text-xs text-[#e1bfb7] hover:text-[#4cd7f6] transition-colors flex items-center gap-1" href="#">
                View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 px-1 scrollbar-hide">
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
                <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1] truncate w-full text-center group-hover:text-[#4cd7f6] transition-colors">alex_dev</span>
              </div>

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
                <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1] truncate w-full text-center group-hover:text-[#4cd7f6] transition-colors">sarah_cpp</span>
              </div>

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
                <span className="font-['JetBrains_Mono'] text-xs text-[#e5e2e1] truncate w-full text-center group-hover:text-[#4cd7f6] transition-colors">j_smith</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Activity Feed */}
            <section className="lg:col-span-8 space-y-4">
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
                </div>
              </div>

              {/* Feed Item 2 */}
              <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-lg p-4 flex gap-4 interactive-glow transition-all">
                <div className="w-10 h-10 rounded-full shrink-0 bg-[#353534] flex items-center justify-center text-white font-['Outfit'] font-bold">
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
            <section className="lg:col-span-4 space-y-4 sticky top-24">
              <button className="w-full bg-[#EA5D3A] text-white py-3 px-4 rounded-lg font-['Outfit'] text-base font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_15px_rgba(234,93,58,0.4)] transition-all cursor-pointer">
                <span className="material-symbols-outlined">swords</span> Start 1v1 Battle
              </button>

              <button className="w-full bg-transparent border border-[#333333] hover:border-[#4cd7f6] text-[#e5e2e1] hover:text-[#4cd7f6] py-3 px-4 rounded-lg font-['Outfit'] text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                <span className="material-symbols-outlined">code</span> Post Code Review
              </button>

              <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-xl p-4 space-y-3">
                <h3 className="font-['Outfit'] text-base text-white pb-2 border-b border-white/10 flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-[#ffb4a2]">bar_chart</span> Squad Analytics
                </h3>
                <div className="space-y-2 font-['Inter'] text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#e1bfb7]">Active Members</span>
                    <span className="font-['JetBrains_Mono'] text-white font-semibold">12/14</span>
                  </div>
                  <div className="w-full bg-[#0D0D0D] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#4cd7f6] h-full rounded-full w-[85%] shadow-[0_0_8px_rgba(76,215,246,0.5)]" />
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#e1bfb7]">Avg Solved/Week</span>
                    <span className="font-['JetBrains_Mono'] text-white font-semibold">42.5</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#e1bfb7]">Global Rank</span>
                    <span className="font-['JetBrains_Mono'] text-[#ffb4a2] font-semibold">#42</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
