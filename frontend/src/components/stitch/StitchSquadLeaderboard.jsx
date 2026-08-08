import React from 'react';

export default function StitchSquadLeaderboard() {
  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto min-h-screen flex flex-col relative pb-12 font-['Inter'] antialiased">
      <div className="pt-8 flex-1 flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1]">Squad Leaderboard</h2>
            <p className="font-['Inter'] text-lg text-[#e1bfb7] mt-2">Track progress, push limits.</p>
          </div>
          <div className="flex bg-[#201f1f] rounded-lg p-1 gap-1 self-start md:self-auto glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)]">
            <button className="px-4 py-2 rounded bg-[#353534] text-[#e5e2e1] font-['JetBrains_Mono'] text-sm shadow-sm">Today</button>
            <button className="px-4 py-2 rounded text-[#e1bfb7] hover:text-[#e5e2e1] font-['JetBrains_Mono'] text-sm transition-colors">Week</button>
            <button className="px-4 py-2 rounded text-[#e1bfb7] hover:text-[#e5e2e1] font-['JetBrains_Mono'] text-sm transition-colors">Month</button>
          </div>
        </div>

        {/* Stats Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] rounded-xl p-6 flex flex-col justify-between h-[120px] interactive-glow transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider">Weekly Solved</span>
              <span className="material-symbols-outlined text-[#4cd7f6]">analytics</span>
            </div>
            <div className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1]">1,248</div>
          </div>
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] rounded-xl p-6 flex flex-col justify-between h-[120px] interactive-glow transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider">Active Today</span>
              <span className="material-symbols-outlined text-[#EA5D3A]">bolt</span>
            </div>
            <div className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1]">24/30</div>
          </div>
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] rounded-xl p-6 flex flex-col justify-between h-[120px] interactive-glow transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider">Avg Streak</span>
              <span className="material-symbols-outlined text-[#EA5D3A]">local_fire_department</span>
            </div>
            <div className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1]">14.2<span className="font-['Inter'] text-base text-[#e1bfb7] ml-2">days</span></div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-xl overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#1c1b1b]/50">
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium w-[80px]">Rank</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium">Member</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium min-w-[200px]">Daily Solved</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium w-[120px]">Streak</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium w-[120px]">Total</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium text-right w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="font-['Inter'] text-base">
                {/* Row 1: Gold */}
                <tr className="border-b border-white/5 hover:bg-[#353534]/20 transition-colors group">
                  <td className="py-6 px-6">
                    <div className="font-['Outfit'] text-xl font-bold text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] flex items-center justify-center w-8 h-8 rounded-full bg-[#201f1f] border border-[#FFD700]/20">1</div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img className="w-10 h-10 rounded-full object-cover border-2 border-[#2a2a2a] ring-2 ring-[#10B981] ring-offset-2 ring-offset-[#0D0D0D]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTOZYPYjeo5SThf0PSOASMzbd4VnlfS0IKTGfKwoQDWa4lPnLjH5ZflA6b12WnOkrLGaIjUcqUf1XAuSHJM7OWT-E9-WbrUUxz7O2IZNhNGgKew62MbGrhtjxjKZ34bCGkXXDgIQOYiSrDQJwavGa6QPkgSDPsJRgCZKD5u-VzI0Qj_AmEDHVxQcqejpwtCrMjhHiXIC_5CKMZ1rBfKE3MgqIOcZTzpy20lm9GRTL8KV6_e6YRJXBv" alt="Avatar"/>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full border border-black"></div>
                      </div>
                      <div>
                        <div className="font-semibold text-[#e5e2e1]">AlexChen_Dev</div>
                        <div className="font-['JetBrains_Mono'] text-[13px] text-[#a078ff] mt-1 bg-[#a078ff]/15 inline-block px-2 py-0.5 rounded-full">Algorithm Master</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] w-6">12</span>
                      <div className="flex-1 h-1.5 bg-[#353534] rounded-full overflow-hidden">
                        <div className="h-full bg-[#EA5D3A] w-[90%] shadow-[0_0_8px_rgba(234,93,58,0.6)]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-sm text-[#e5e2e1]">
                      <span className="text-[#EA5D3A]">🔥</span> 42
                    </div>
                  </td>
                  <td className="py-6 px-6 font-['JetBrains_Mono'] text-sm text-[#e1bfb7]">
                    3,402
                  </td>
                  <td className="py-6 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-full hover:bg-[#353534] text-[#4cd7f6] transition-colors" title="Nudge">
                        <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                      </button>
                      <button className="p-2 rounded-full hover:bg-[#353534] text-[#e1bfb7] transition-colors" title="Direct Message">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 2: Silver */}
                <tr className="border-b border-white/5 hover:bg-[#353534]/20 transition-colors group">
                  <td className="py-6 px-6">
                    <div className="font-['Outfit'] text-xl font-bold text-[#C0C0C0] drop-shadow-[0_0_10px_rgba(192,192,192,0.5)] flex items-center justify-center w-8 h-8 rounded-full bg-[#201f1f] border border-[#C0C0C0]/20">2</div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <img className="w-10 h-10 rounded-full object-cover border-2 border-[#2a2a2a]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8BFcbXRmLu9YHEdv8CvneuLd73EZg1pAje3MU_q4aTtYr0MfS3EBuvRaPaL4Iwav8xmb5Uwb_arGW0GMhjw4RyswyJmVwilf95rLISJJG_JDRCCMvvKpmuGM3RgwDvW5iROMSZo8JvLlovk7j5rhdaurv7osh2RLltf49LU8vgQ88fndmNoPdk9g4nWiv-fIHtV59ww8B-fYI-qhdPuHHCtblzBL0JQ2x_iOeP-rQhA_blsak5cZm" alt="Avatar"/>
                      <div>
                        <div className="font-semibold text-[#e5e2e1]">Sarah_Codes</div>
                        <div className="font-['JetBrains_Mono'] text-[13px] text-[#EA5D3A] mt-1 bg-[#EA5D3A]/15 inline-block px-2 py-0.5 rounded-full">Fast Solver</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] w-6">9</span>
                      <div className="flex-1 h-1.5 bg-[#353534] rounded-full overflow-hidden">
                        <div className="h-full bg-[#EA5D3A] w-[75%] shadow-[0_0_8px_rgba(234,93,58,0.4)]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-sm text-[#e5e2e1]">
                      <span className="text-[#EA5D3A]">🔥</span> 28
                    </div>
                  </td>
                  <td className="py-6 px-6 font-['JetBrains_Mono'] text-sm text-[#e1bfb7]">
                    2,891
                  </td>
                  <td className="py-6 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-full hover:bg-[#353534] text-[#4cd7f6] transition-colors" title="Nudge">
                        <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                      </button>
                      <button className="p-2 rounded-full hover:bg-[#353534] text-[#e1bfb7] transition-colors" title="Direct Message">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 3: Bronze */}
                <tr className="border-b border-white/5 hover:bg-[#353534]/20 transition-colors group">
                  <td className="py-6 px-6">
                    <div className="font-['Outfit'] text-xl font-bold text-[#CD7F32] drop-shadow-[0_0_10px_rgba(205,127,50,0.5)] flex items-center justify-center w-8 h-8 rounded-full bg-[#201f1f] border border-[#CD7F32]/20">3</div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <img className="w-10 h-10 rounded-full object-cover border-2 border-[#2a2a2a]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT0LlgC4zY0HUqs1KzVslveT6XiiSv1jaRbh8D5BI-X3eO9-2aNyqWwut33TgjMazr4eUkK56lnLTWE5PcHgy1-gt0wNVk91AmU9X_uN5wdI711eRZJJnwZhWmUmfa8mI6d9818isksHvjOLiCtOSiqtcKu0UdJg-MKQBWRQz2MoBzGq1zIbKos7TW1HfUy1WZ6v83Ma3mEaD_o-mzzpMRx5a8sF-6V9HDkI-IDJhSQLwVKZo8SKPD" alt="Avatar"/>
                      <div>
                        <div className="font-semibold text-[#e5e2e1]">ByteNinja</div>
                        <div className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] mt-1 bg-[#353534]/30 inline-block px-2 py-0.5 rounded-full">Consistent</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] w-6">7</span>
                      <div className="flex-1 h-1.5 bg-[#353534] rounded-full overflow-hidden">
                        <div className="h-full bg-[#EA5D3A] w-[60%] opacity-80"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-sm text-[#e5e2e1]">
                      <span className="text-[#EA5D3A]">🔥</span> 15
                    </div>
                  </td>
                  <td className="py-6 px-6 font-['JetBrains_Mono'] text-sm text-[#e1bfb7]">
                    2,105
                  </td>
                  <td className="py-6 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-full hover:bg-[#353534] text-[#4cd7f6] transition-colors" title="Nudge">
                        <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                      </button>
                      <button className="p-2 rounded-full hover:bg-[#353534] text-[#e1bfb7] transition-colors" title="Direct Message">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 4: Standard */}
                <tr className="hover:bg-[#353534]/20 transition-colors group">
                  <td className="py-6 px-6">
                    <div className="font-['JetBrains_Mono'] text-sm text-[#e1bfb7] flex items-center justify-center w-8 h-8">4</div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <img className="w-10 h-10 rounded-full object-cover border-2 border-[#2a2a2a] opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_8MU_XCwiodBoFnedIX5619ceidWU77BthpPxG56ka_JucDslolz_64nrOYSxbMh4iD7HuPglgwY2X2iXBb6H5NS4VFV96LjlVu6hyPRy5brSI_X5vh3rI8R3GNj5rN5GSyeUEMBjCK3PTAsIIoYNskFbkYB4elCdVFA_fwT-YL07AbZvxnfaIXWgRw4-nhajoT5gvBMr3XHAXN-qpLGtHKZAndcD1duy3UC8_PrDT0Bd5W7rN5aL" alt="Avatar"/>
                      <div>
                        <div className="font-medium text-[#e1bfb7] group-hover:text-[#e5e2e1] transition-colors">Jordan_T</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-3 opacity-70">
                      <span className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] w-6">3</span>
                      <div className="flex-1 h-1.5 bg-[#353534] rounded-full overflow-hidden">
                        <div className="h-full bg-[#e1bfb7] w-[25%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-sm text-[#e1bfb7]">
                      <span className="grayscale opacity-50">🔥</span> 2
                    </div>
                  </td>
                  <td className="py-6 px-6 font-['JetBrains_Mono'] text-sm text-[#e1bfb7]">
                    1,420
                  </td>
                  <td className="py-6 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-full hover:bg-[#353534] text-[#EA5D3A] transition-colors" title="Nudge to solve">
                        <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                      </button>
                      <button className="p-2 rounded-full hover:bg-[#353534] text-[#e1bfb7] transition-colors" title="Direct Message">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
