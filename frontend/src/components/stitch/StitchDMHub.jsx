import React from 'react';

export default function StitchDMHub() {
  return (
    <div className="flex w-full h-[85vh] max-h-[800px] border border-white/10 rounded-xl overflow-hidden mt-6 bg-[#121212] font-['Inter'] antialiased max-w-[1440px] mx-auto shadow-2xl">
      {/* Left Sidebar: Conversations */}
      <aside className="w-full md:w-[380px] h-full flex flex-col bg-[#0e0e0e] border-r border-[#59413b]/30 shrink-0 z-10">
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-[#59413b]/30 bg-[#131313]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="font-['Outfit'] text-[24px] font-bold text-[#EA5D3A]">Messages</span>
            <button className="w-10 h-10 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[#e5e2e1]">edit_square</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e1bfb7]">search</span>
            <input className="w-full bg-[#201f1f] text-[#e5e2e1] rounded-xl pl-10 pr-4 py-2 border-none focus:ring-1 focus:ring-[#EA5D3A] placeholder-[#e1bfb7]/60 font-['Inter'] text-sm transition-shadow" placeholder="Search conversations..." type="text"/>
          </div>
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 flex flex-col gap-1">
          {/* Active Chat */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/20 cursor-pointer">
            <div className="relative shrink-0">
              <img alt="AlexChen Avatar" className="w-[48px] h-[48px] rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtGTUxCiEOijz2eHe_yZuFBDdSh5EBvHNIxbXfMUsWUx2WPZ6Y0stQr82SLn-2tXRSTc9JlGJ3e_R5MMAOrPBOFxEFJ4pto6FhjQ4V_ZfV-LO4PAapF5sk2mRNosjG_kDaC-8sUQaUNbIkKeLXjGSmDx9TshKECuAfE-sGbmQm9cI5Fc4uUQ6mIBLSE-BoSpuVhrNQEnYCevfY_Y7PYRctH_B47VUwRsd-cEkRTCb4ASc13wBoLsPi"/>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] rounded-full border-2 border-[#121212]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-['Inter'] text-base font-semibold text-[#e5e2e1] truncate">AlexChen</span>
                <span className="text-[12px] text-[#EA5D3A] font-medium">10:52 AM</span>
              </div>
              <p className="font-['Inter'] text-sm text-[#EA5D3A] truncate">Voice message (0:14)</p>
            </div>
          </div>
          
          {/* Inactive Chat 1 */}
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1c1b1b] cursor-pointer transition-colors">
            <div className="relative shrink-0">
              <div className="w-[48px] h-[48px] rounded-full bg-[#a078ff] flex items-center justify-center text-[#340080] font-['Outfit'] text-xl font-bold">S</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-['Inter'] text-base font-semibold text-[#e5e2e1] truncate">Sarah_Dev</span>
                <span className="text-[12px] text-[#e1bfb7]">Yesterday</span>
              </div>
              <p className="font-['Inter'] text-sm text-[#e1bfb7] truncate">The PR is ready for review.</p>
            </div>
          </div>
          
          {/* Inactive Chat 2 */}
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1c1b1b] cursor-pointer transition-colors">
            <div className="relative shrink-0">
              <div className="w-[48px] h-[48px] rounded-full bg-[#353534] flex items-center justify-center text-[#e5e2e1]">
                <span className="material-symbols-outlined text-[#e1bfb7]">group</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-['Inter'] text-base font-semibold text-[#e5e2e1] truncate">Project Alpha Team</span>
                <span className="text-[12px] text-[#e1bfb7]">Tue</span>
              </div>
              <p className="font-['Inter'] text-sm text-[#e1bfb7] truncate">Mike: I'll handle the database migration.</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Chat Area */}
      <main className="hidden md:flex flex-1 flex-col bg-[#121212] relative z-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 border-b border-[#59413b]/30 bg-[#131313]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img className="w-[48px] h-[48px] rounded-full object-cover border-2 border-transparent group-hover:border-[#EA5D3A] transition-colors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtGTUxCiEOijz2eHe_yZuFBDdSh5EBvHNIxbXfMUsWUx2WPZ6Y0stQr82SLn-2tXRSTc9JlGJ3e_R5MMAOrPBOFxEFJ4pto6FhjQ4V_ZfV-LO4PAapF5sk2mRNosjG_kDaC-8sUQaUNbIkKeLXjGSmDx9TshKECuAfE-sGbmQm9cI5Fc4uUQ6mIBLSE-BoSpuVhrNQEnYCevfY_Y7PYRctH_B47VUwRsd-cEkRTCb4ASc13wBoLsPi" alt="Avatar"/>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] rounded-full border-2 border-[#131313] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-['Outfit'] text-xl font-bold text-[#e5e2e1] leading-tight">AlexChen</span>
              <span className="font-['Inter'] text-sm text-[#10B981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Grinding
              </span>
            </div>
          </div>
          
          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors rounded-full hover:bg-[#201f1f]">
              <span className="material-symbols-outlined">call</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors rounded-full hover:bg-[#201f1f]">
              <span className="material-symbols-outlined">videocam</span>
            </button>
            <div className="w-px h-6 bg-[#59413b]/50 mx-1"></div>
            <button className="w-10 h-10 flex items-center justify-center text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors rounded-full hover:bg-[#201f1f]">
              <span className="material-symbols-outlined">info</span>
            </button>
          </div>
        </header>
        
        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 chat-scroll">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-3">
            {/* Date Divider */}
            <div className="flex justify-center my-4">
              <span className="text-[12px] uppercase tracking-widest text-[#e1bfb7] bg-[#2a2a2a] px-4 py-1.5 rounded-full font-['JetBrains_Mono'] shadow-sm">Today</span>
            </div>
            
            {/* Received Message: Text */}
            <div className="flex flex-col self-start max-w-[75%]">
              <div className="bg-[#1c1b1b] text-[#e5e2e1] font-['Inter'] text-base rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm border border-[#59413b]/20">
                Hey! Did you figure out the optimal solution for Two Sum? I'm stuck on O(n^2).
              </div>
              <span className="text-[12px] text-[#e1bfb7] mt-1 ml-2 font-medium">10:42 AM</span>
            </div>
            
            {/* Sent Message: Text */}
            <div className="flex flex-col self-end max-w-[75%] items-end mt-2">
              <div className="bg-[#EA5D3A] text-white font-['Inter'] text-base rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
                Yeah, you need to use a hash map to bring it down to O(n).
              </div>
              <span className="text-[12px] text-[#e1bfb7] mt-1 mr-2 font-medium">10:45 AM</span>
            </div>
            
            {/* Sent Message: Code Snippet */}
            <div className="flex flex-col self-end max-w-[85%] items-end mt-1">
              <div className="bg-[#1E1E1E] border border-[#EA5D3A]/30 rounded-xl overflow-hidden shadow-lg w-full text-left">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#201f1f] border-b border-[#59413b]/30">
                  <span className="font-['JetBrains_Mono'] text-[13px] text-[#4cd7f6] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">code</span> solution.py
                  </span>
                  <button className="text-[#e1bfb7] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
                <div className="p-4 bg-[#0D0D0D] overflow-x-auto">
                  <pre className="font-['JetBrains_Mono'] text-sm text-[#e1bfb7] leading-relaxed">
                    <span className="text-[#C678DD]">def</span> <span className="text-[#61AFEF]">twoSum</span>(nums, target):{'\n'}
                    {'    '}seen = {'{}'}{'\n'}
                    {'    '}<span className="text-[#C678DD]">for</span> i, num <span className="text-[#C678DD]">in</span> <span className="text-[#56B6C2]">enumerate</span>(nums):{'\n'}
                    {'        '}diff = target - num{'\n'}
                    {'        '}<span className="text-[#C678DD]">if</span> diff <span className="text-[#C678DD]">in</span> seen:{'\n'}
                    {'            '}<span className="text-[#C678DD]">return</span> [seen[diff], i]{'\n'}
                    {'        '}seen[num] = i{'\n'}
                    {'    '}<span className="text-[#C678DD]">return</span> []
                  </pre>
                </div>
              </div>
              <span className="text-[12px] text-[#e1bfb7] mt-1 mr-2 font-medium">10:46 AM</span>
            </div>
            
            {/* Received Message: Problem Card */}
            <div className="flex flex-col self-start max-w-[75%] mt-4 w-[350px]">
              <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-xl overflow-hidden border-l-4 border-l-[#10B981] hover:border-l-[#EA5D3A] transition-colors interactive-glow cursor-pointer w-full p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-[#201f1f] rounded flex items-center justify-center">
                    <span className="text-[#FFA116] font-bold text-[12px] font-['JetBrains_Mono']">LC</span>
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7]">LeetCode</span>
                </div>
                <div className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">1. Two Sum</div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#10B981]/15 text-[#10B981] font-['JetBrains_Mono'] text-[12px] border border-[#10B981]/30">Easy</span>
                  <span className="text-[#e1bfb7] text-[13px] flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">group</span> 45% Acceptance</span>
                </div>
              </div>
              <span className="text-[12px] text-[#e1bfb7] mt-1 ml-2 font-medium">10:50 AM</span>
            </div>
            
            {/* Received Message: Voice Note */}
            <div className="flex flex-col self-start max-w-[60%] mt-2">
              <div className="bg-[#1c1b1b] rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-[#59413b]/20 flex items-center gap-4">
                <button className="w-12 h-12 rounded-full bg-[#03b5d3] text-[#00424e] flex items-center justify-center hover:scale-105 transition-transform shadow-md">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
                <div className="flex-1 flex flex-col gap-1.5 min-w-[160px]">
                  {/* Simulated Waveform */}
                  <div className="flex items-center gap-[3px] h-8 items-end">
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-2"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-4"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-7"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-3"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-6"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-8"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-4"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-2 opacity-40"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-1 opacity-40"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-4 opacity-40"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-2 opacity-40"></div>
                    <div className="w-1.5 bg-[#4cd7f6] rounded-full h-1 opacity-40"></div>
                  </div>
                  <span className="text-[12px] font-['JetBrains_Mono'] text-[#4cd7f6]">0:14</span>
                </div>
              </div>
              <span className="text-[12px] text-[#e1bfb7] mt-1 ml-2 font-medium">10:52 AM</span>
            </div>
          </div>
        </div>
        
        {/* Input Area */}
        <div className="px-6 pb-6 pt-4 bg-[#121212] shrink-0">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-end gap-3 p-2 bg-[#1c1b1b] border border-[#59413b]/40 rounded-3xl focus-within:border-[#EA5D3A]/50 focus-within:shadow-[0_0_15px_rgba(234,93,58,0.1)] transition-all">
              <button className="w-10 h-10 flex items-center justify-center text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors hover:bg-[#201f1f] rounded-full shrink-0">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <div className="flex-1 min-h-[44px] flex items-center py-1">
                <textarea className="w-full bg-transparent border-none text-[#e5e2e1] font-['Inter'] placeholder-[#e1bfb7]/60 focus:ring-0 resize-none py-2 px-1 max-h-[150px] scrollbar-hide" placeholder="Message AlexChen..." rows={1}></textarea>
              </div>
              <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
                <button className="w-10 h-10 flex items-center justify-center text-[#e1bfb7] hover:text-[#4cd7f6] transition-colors hover:bg-[#201f1f] rounded-full">
                  <span className="material-symbols-outlined">mood</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-[#e1bfb7] hover:text-[#4cd7f6] transition-colors hover:bg-[#201f1f] rounded-full">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button className="w-10 h-10 ml-1 rounded-full bg-[#EA5D3A] text-white flex items-center justify-center hover:brightness-110 shadow-lg hover:shadow-[0_0_15px_rgba(234,93,58,0.4)] transition-all">
                  <span className="material-symbols-outlined ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
