import React from 'react';

export default function StitchCodeReviewHub() {
  return (
    <div className="flex flex-1 overflow-hidden p-4 md:p-6 gap-6 w-full mx-auto font-['Inter'] antialiased">
      {/* Left Column: Snippet List (35%) */}
      <section className="w-full lg:w-[35%] flex flex-col h-full gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Review Queue</h2>
          <button className="bg-[#EA5D3A] text-white px-4 py-2 rounded text-sm font-medium hover:brightness-110 hover:shadow-[0_0_8px_rgba(234,93,58,0.5)] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Snippet
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button className="bg-[#03b5d3]/20 text-[#4cd7f6] border border-[#4cd7f6]/50 px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] whitespace-nowrap">All</button>
          <button className="bg-[#353534]/50 text-[#e1bfb7] border border-transparent hover:border-[#333333] px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] whitespace-nowrap transition-colors">C++</button>
          <button className="bg-[#353534]/50 text-[#e1bfb7] border border-transparent hover:border-[#333333] px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] whitespace-nowrap transition-colors">Java</button>
          <button className="bg-[#353534]/50 text-[#e1bfb7] border border-transparent hover:border-[#333333] px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] whitespace-nowrap transition-colors">Python</button>
          <button className="bg-[#353534]/50 text-[#e1bfb7] border border-transparent hover:border-[#333333] px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] whitespace-nowrap transition-colors">Rust</button>
        </div>

        {/* Snippet List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 chat-scroll">
          {/* Card 1 (Active) */}
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] p-4 rounded-lg border-l-4 border-l-[#EA5D3A] cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4cd7f6]/5 to-transparent opacity-100"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-['Inter'] text-base font-semibold text-[#4cd7f6]">Optimize Dijkstra's Inner Loop</h3>
                <span className="text-xs text-[#e1bfb7] font-['JetBrains_Mono']">2h ago</span>
              </div>
              <div className="flex gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#131313] text-[#e5e2e1] border border-[#333333]">C++</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#131313] text-[#e5e2e1] border border-[#333333]">O(V log V)</span>
              </div>
              <div className="bg-[#0e0e0e] p-2 rounded border border-[#333333] font-['JetBrains_Mono'] text-[12px] text-[#e1bfb7] overflow-hidden h-[44px]">
                <code>priority_queue&lt;pair&lt;int, int&gt;, vector&lt;pair&lt;int, int&gt;&gt;, greater&lt;&gt;&gt; pq;</code><br/>
                <code>dist[src] = 0; pq.push({0, src});</code>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] p-4 rounded-lg border-l-4 border-l-[#10B981] cursor-pointer interactive-glow transition-all group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-['Inter'] text-base font-semibold text-[#e5e2e1] group-hover:text-[#4cd7f6] transition-colors">Segment Tree Lazy Prop Fix</h3>
              <span className="text-xs text-[#e1bfb7] font-['JetBrains_Mono']">5h ago</span>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#131313] text-[#e5e2e1] border border-[#333333]">Java</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#131313] text-[#e5e2e1] border border-[#333333]">O(log n)</span>
            </div>
            <div className="bg-[#0e0e0e] p-2 rounded border border-[#333333] font-['JetBrains_Mono'] text-[12px] text-[#e1bfb7] overflow-hidden h-[44px] opacity-70">
              <code>if (lazy[node] != 0) {'{'}</code><br/>
              <code>    tree[node] += (end - start + 1) * lazy[node];</code>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] p-4 rounded-lg border-l-4 border-l-[#EF4444] cursor-pointer interactive-glow transition-all group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-['Inter'] text-base font-semibold text-[#e5e2e1] group-hover:text-[#4cd7f6] transition-colors">Memoization state collision</h3>
              <span className="text-xs text-[#e1bfb7] font-['JetBrains_Mono']">1d ago</span>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#131313] text-[#e5e2e1] border border-[#333333]">Python</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#131313] text-[#e5e2e1] border border-[#333333]">O(N*M)</span>
            </div>
            <div className="bg-[#0e0e0e] p-2 rounded border border-[#333333] font-['JetBrains_Mono'] text-[12px] text-[#e1bfb7] overflow-hidden h-[44px] opacity-70">
              <code>@lru_cache(None)</code><br/>
              <code>def dp(i, j, mask):</code>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Snippet Detail (65%) */}
      <section className="hidden lg:flex w-[65%] flex-col h-full bg-[#1c1b1b] rounded-xl border border-[#333333] overflow-hidden shadow-xl min-h-[600px]">
        {/* Detail Header */}
        <div className="p-5 border-b border-[#333333] flex justify-between items-start bg-[#131313]/50">
          <div>
            <h1 className="font-['Outfit'] text-2xl font-bold text-[#e5e2e1] mb-2">Optimize Dijkstra's Inner Loop</h1>
            <div className="flex items-center gap-4 text-sm text-[#e1bfb7] font-['JetBrains_Mono']">
              <span className="flex items-center gap-1">
                <img alt="Author" className="w-5 h-5 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCic9uDMlsQtNM-i3LUhd5CS8KGcIHw_s1DfIDBU_UVvwtNcOThIcvki8oc25UwoR3ZPCOwb--VJdayLTTTHX4W-sYTA4NkQHtlbUdtEZt-3J35SCaD0Z0fX1q63m2Q8BxIDsB-JJcC1wkSyttL60Tz0oBqGJXaRG39LoNvLtmKPXp8azFTROPmK7aTT64U_RXieeanzN45DgI3PLM6zXruiBRqkq6kolf1S6wCGktSkMIbTvfQ2MfS"/> 
                @algo_master99
              </span>
              <span>•</span>
              <span>C++</span>
              <span>•</span>
              <span className="text-[#4cd7f6]">Needs Review</span>
            </div>
          </div>
          <button className="bg-transparent border border-[#4cd7f6] text-[#4cd7f6] px-4 py-2 rounded text-sm font-medium hover:bg-[#4cd7f6]/10 hover:shadow-[0_0_10px_rgba(76,215,246,0.3)] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            Suggest Code Fix
          </button>
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 overflow-y-auto bg-[#0D0D0D] relative font-['JetBrains_Mono'] text-sm">
          {/* Line Numbers & Code Grid */}
          <div className="flex min-h-full relative">
            {/* Gutter */}
            <div className="w-12 bg-[#131313] flex flex-col text-right pr-2 py-4 text-[#555] border-r border-[#333333] select-none text-xs">
              <div className="py-[2px]">1</div>
              <div className="py-[2px] relative group cursor-pointer hover:text-[#4cd7f6]">2
                <div className="absolute w-2 h-2 rounded-full bg-[#a078ff] right-[-10px] top-1/2 -translate-y-1/2 shadow-[0_0_5px_#a078ff]"></div>
              </div>
              <div className="py-[2px]">3</div>
              <div className="py-[2px]">4</div>
              <div className="py-[2px] bg-[#4cd7f6]/10 text-[#4cd7f6] border-r-2 border-[#4cd7f6] relative">5</div>
              <div className="py-[2px]">6</div>
              <div className="py-[2px]">7</div>
              <div className="py-[2px]">8</div>
              <div className="py-[2px]">9</div>
              <div className="py-[2px] relative group cursor-pointer hover:text-[#4cd7f6]">10
                <div className="absolute w-2 h-2 rounded-full bg-[#a078ff] right-[-10px] top-1/2 -translate-y-1/2 opacity-50"></div>
              </div>
            </div>
            
            {/* Code Content */}
            <div className="flex-1 p-4 overflow-x-auto text-[#d4d4d4] whitespace-pre pt-4">
              <span className="text-[#569cd6]">void</span> <span className="text-[#dcdcaa]">dijkstra</span>(<span className="text-[#569cd6]">int</span> src, <span className="text-[#569cd6]">int</span> n, <span className="text-[#4ec9b0]">vector</span>&lt;<span className="text-[#4ec9b0]">pair</span>&lt;<span className="text-[#569cd6]">int</span>, <span className="text-[#569cd6]">int</span>&gt;&gt; adj[]) {'{\n'}
              {'    '}<span className="text-[#4ec9b0]">vector</span>&lt;<span className="text-[#569cd6]">int</span>&gt; <span className="text-[#9cdcfe]">dist</span>(n, <span className="text-[#b5cea8]">1e9</span>);{'\n'}
              {'    '}<span className="text-[#4ec9b0]">priority_queue</span>&lt;<span className="text-[#4ec9b0]">pair</span>&lt;<span className="text-[#569cd6]">int</span>, <span className="text-[#569cd6]">int</span>&gt;, <span className="text-[#4ec9b0]">vector</span>&lt;<span className="text-[#4ec9b0]">pair</span>&lt;<span className="text-[#569cd6]">int</span>, <span className="text-[#569cd6]">int</span>&gt;&gt;, <span className="text-[#4ec9b0]">greater</span>&lt;&gt;&gt; <span className="text-[#9cdcfe]">pq</span>;{'\n\n'}
              <div className="bg-[#4cd7f6]/10 -mx-4 px-4 border-l-2 border-transparent">{'    '}<span className="text-[#9cdcfe]">dist</span>[src] = <span className="text-[#b5cea8]">0</span>;</div>{' '}<span className="text-[#9cdcfe]">pq</span>.<span className="text-[#dcdcaa]">push</span>({'{'}<span className="text-[#b5cea8]">0</span>, src{'}'});{'\n\n'}
              {'    '}<span className="text-[#c586c0]">while</span> (!<span className="text-[#9cdcfe]">pq</span>.<span className="text-[#dcdcaa]">empty</span>()) {'{\n'}
              {'        '}<span className="text-[#569cd6]">int</span> d = <span className="text-[#9cdcfe]">pq</span>.<span className="text-[#dcdcaa]">top</span>().<span className="text-[#9cdcfe]">first</span>;{'\n'}
              {'        '}<span className="text-[#569cd6]">int</span> u = <span className="text-[#9cdcfe]">pq</span>.<span className="text-[#dcdcaa]">top</span>().<span className="text-[#9cdcfe]">second</span>;{'\n'}
              {'        '}<span className="text-[#9cdcfe]">pq</span>.<span className="text-[#dcdcaa]">pop</span>();{'\n'}
              {'    }\n'}
              {'}'}
            </div>

            {/* Inline Comment Overlay (simulated for line 2) */}
            <div className="absolute left-16 top-10 right-4 bg-[rgba(30,30,30,0.85)] backdrop-blur-md rounded shadow-lg border-l-2 border-l-[#a078ff] z-10 w-3/4 max-w-md">
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#a078ff]">@reviewer_x</span>
                  <span className="text-[10px] text-[#e1bfb7]">Line 2</span>
                </div>
                <p className="text-sm text-[#e5e2e1] mb-2 font-['Inter']">Using `1e9` might not be enough if edge weights can be large. Consider `INT_MAX` or `1e18` if using `long long`.</p>
                <div className="flex gap-2 font-['Inter']">
                  <button className="text-xs text-[#4cd7f6] hover:underline">Reply</button>
                  <button className="text-xs text-[#e1bfb7] hover:text-[#e5e2e1]">Resolve</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Comments Thread */}
        <div className="h-1/3 min-h-[250px] bg-[#353534] border-t border-[#333333] flex flex-col font-['Inter']">
          <div className="p-3 border-b border-[#333333] flex items-center justify-between bg-[#131313]/50">
            <h3 className="font-['Outfit'] text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">forum</span> Discussion
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Comment */}
            <div className="flex gap-3">
              <img alt="User" className="w-8 h-8 rounded-full border border-[#333333] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT-UNLy_tdfcW-owCv0ltIZUMgjjwMgnLnbUE0WYKf6qxyHvFmOXyg2_viOxOeBjbOVToTALcF5quUfpWJ31EHG-g8rUrqx_Gjcec_7xUqjW2P2PcPWEfDKvBrzrfLXsvUqumRrPsweFSfp4j0oeAiQAbEoLaDIE19CG0aIvnN162lUTSr9EsCM2gIU-pGGZLVKjlvqzkzx_6Q98ea3P4kOd0MYhtSlztblT8h-kIXtT9qFRIYSQlP"/>
              <div className="flex-1">
                <div className="bg-[#131313] p-3 rounded-lg border border-[#333333] rounded-tl-none">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-sm text-[#e5e2e1]">@sys_admin</span>
                    <span className="text-xs text-[#e1bfb7]">1h ago</span>
                  </div>
                  <p className="text-sm text-[#e1bfb7]">Looks solid overall, but check line 10. You should probably skip processing if `d &gt; dist[u]` to avoid TLE on dense graphs.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Comment Input */}
          <div className="p-3 bg-[#131313] border-t border-[#333333]">
            <div className="relative">
              <textarea className="w-full bg-[#0D0D0D] border border-[#333333] rounded p-3 pr-12 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6] focus:shadow-[0_0_8px_rgba(76,215,246,0.3)] transition-all resize-none h-[60px]" placeholder="Leave a review comment..."></textarea>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4cd7f6] p-2 hover:bg-[#4cd7f6]/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
