import React from 'react';

export default function StitchSquadRepo() {
  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto min-h-screen p-4 md:p-8 flex flex-col gap-8 font-['Inter'] antialiased">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1] mb-2">Repository</h1>
          <p className="font-['Inter'] text-lg text-[#e1bfb7]">Shared knowledge base and algorithmic patterns for the squad.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e1bfb7]">search</span>
            <input className="w-full bg-[#353534] border border-[#59413b] rounded-full py-2 pl-10 pr-4 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6] transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]" placeholder="Search Repository..." type="text"/>
          </div>
          <button className="bg-[#EA5D3A] text-white flex items-center gap-2 px-6 py-2 rounded-lg font-['Outfit'] text-xl font-bold hover:brightness-110 hover:shadow-[0_0_15px_rgba(234,93,58,0.4)] transition-all">
            <span className="material-symbols-outlined">upload</span>
            <span className="hidden sm:inline">Upload Code</span>
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7]">
        <span className="material-symbols-outlined text-[#EA5D3A]">folder</span>
        <span>Squad_Root</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[#e5e2e1]">Algorithms</span>
      </div>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Folder Card */}
        <div className="glass-panel bg-[rgba(32,31,31,0.7)] p-6 rounded-xl hover:box-shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 group cursor-pointer flex flex-col gap-4 border border-[rgba(89,65,59,0.3)]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#4cd7f6]">folder</span>
              <h3 className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] font-semibold group-hover:text-[#4cd7f6] transition-colors">Dynamic Programming</h3>
            </div>
            <button className="text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors">
              <span className="material-symbols-outlined">star</span>
            </button>
          </div>
          <div className="flex justify-between items-end mt-auto pt-4 border-t border-[#59413b]/20">
            <div className="flex items-center gap-3">
              <img alt="Uploader" className="w-6 h-6 rounded-full border border-[#59413b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4ynSDKgH0HvUhpZ6AjGs5iYVPxywy80Y1_ITAdtoClW0eR0bHE7RKWocrYtyeYEyM6nNM9GmQFycOSEP_A0GcfS_5paQCEw3Ar9VvYii929kWamYveyOnX1_GFP2GqTPB9i35bk2bY3TfJTdmYdyxUk7kRO8M7lRmmI-X3KCZ9NJxHR0y1J6rIDbXYq0nDcLoQgbdhCbyrY-mCUo9Ri2xShHdL1Tuug2lpE4OzmScQdpkzI8ZzNbM"/>
              <span className="font-['Inter'] text-sm text-[#e1bfb7]">Updated by Neo</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] opacity-70">2h ago</span>
          </div>
        </div>

        {/* Folder Card */}
        <div className="glass-panel bg-[rgba(32,31,31,0.7)] p-6 rounded-xl hover:box-shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 group cursor-pointer flex flex-col gap-4 border border-[rgba(89,65,59,0.3)]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#4cd7f6]">folder</span>
              <h3 className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] font-semibold group-hover:text-[#4cd7f6] transition-colors">Graph Theory</h3>
            </div>
            <button className="text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </button>
          </div>
          <div className="flex justify-between items-end mt-auto pt-4 border-t border-[#59413b]/20">
            <div className="flex items-center gap-3">
              <img alt="Uploader" className="w-6 h-6 rounded-full border border-[#59413b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6IFq8KecOPfx30AEUbcPKVvqpxej4D45800kFLuk0TWWH_QDQYEHz__BQfUWtguJURwqDM_BObd8pvdjARl90hSY4e3vH4pbz2l8WEBok6OHU5WIbPpwkZXRRSXhk4orMBld1bsezRws0zL_aFqHpB8k3DSTDRkPecp62S0jI8lDa-ELZFAmTX_WelNxECD1BwMsUbSf2zvbWjIzHp-Ys7JSnoqRIGNB5S7YsYOB9cICc9GWm8cJf"/>
              <span className="font-['Inter'] text-sm text-[#e1bfb7]">Updated by Trinity</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] opacity-70">5h ago</span>
          </div>
        </div>

        {/* Folder Card */}
        <div className="glass-panel bg-[rgba(32,31,31,0.7)] p-6 rounded-xl hover:box-shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 group cursor-pointer flex flex-col gap-4 border border-[rgba(89,65,59,0.3)]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#4cd7f6]">folder</span>
              <h3 className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] font-semibold group-hover:text-[#4cd7f6] transition-colors">Strings</h3>
            </div>
            <button className="text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors">
              <span className="material-symbols-outlined">star</span>
            </button>
          </div>
          <div className="flex justify-between items-end mt-auto pt-4 border-t border-[#59413b]/20">
            <div className="flex items-center gap-3">
              <img alt="Uploader" className="w-6 h-6 rounded-full border border-[#59413b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS9tsB4X3IJfeJtV4Z_uyBcA1weNA-VAoUZVvYHqAKLKg1yuy9SkvbxRkBBXQcRoFL7R5ZhFVy0MWSaO5xxViSLd7OQiaEBHNm0PtlzK6X5Bnl8oFN0oF7DgOezHWATAvRrepUupZdGa53Xtb3IGsZHaPoBFcfcGqfst92F2yK9Wl9bNrqyUf2KKWd_JyOkq2Bj1V7zFSpa6S75mY7zLhHuxDY4v_sPjdFna17a22vvVCup65kWWuh"/>
              <span className="font-['Inter'] text-sm text-[#e1bfb7]">Updated by Neo</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] opacity-70">1d ago</span>
          </div>
        </div>

        {/* File Card (Easy) */}
        <div className="glass-panel bg-[rgba(32,31,31,0.7)] p-6 rounded-xl hover:box-shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 group cursor-pointer flex flex-col gap-4 border border-[rgba(89,65,59,0.3)] border-l-4 border-l-[#10B981]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#e1bfb7]">description</span>
              <h3 className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] font-semibold group-hover:text-[#4cd7f6] transition-colors">knapsack_01.cpp</h3>
            </div>
            <button className="text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors">
              <span className="material-symbols-outlined">star</span>
            </button>
          </div>
          <div className="flex justify-between items-end mt-auto pt-4 border-t border-[#59413b]/20">
            <div className="flex items-center gap-3">
              <img alt="Uploader" className="w-6 h-6 rounded-full border border-[#59413b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkmF1XMnQ3fZUVu5446BRMAYy5u9yJpVmRJqzY6fFRHjYUfbNBbK8IQboT3yQpF-LT42HCMSgy4qMXRAFD_ApyxrNu9JU2YsKtYrEb1ssHkl7gHESXZFU0oYG3z9YQaZaDRXy0Py0SJKFACS09huI72CwBGhSy92-fmIECUt-umNmdhJoSUcxdfDHbfOThabXXVlLaZV8r5Rqkfz1_qWO3Q94aLDaTjQidm5DkRmiUMWJ3KLRpyIKN"/>
              <span className="font-['Inter'] text-sm text-[#e1bfb7]">Updated by Trinity</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] opacity-70">2d ago</span>
          </div>
        </div>

        {/* File Card (Medium) */}
        <div className="glass-panel bg-[rgba(32,31,31,0.7)] p-6 rounded-xl hover:box-shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 group cursor-pointer flex flex-col gap-4 border border-[rgba(89,65,59,0.3)] border-l-4 border-l-[#f2633f]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#e1bfb7]">description</span>
              <h3 className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] font-semibold group-hover:text-[#4cd7f6] transition-colors">dijkstra_opt.py</h3>
            </div>
            <button className="text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors">
              <span className="material-symbols-outlined">star</span>
            </button>
          </div>
          <div className="flex justify-between items-end mt-auto pt-4 border-t border-[#59413b]/20">
            <div className="flex items-center gap-3">
              <img alt="Uploader" className="w-6 h-6 rounded-full border border-[#59413b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZGx_bGNHkXeq9GnHSq3y1YlquhkdZkMSJ_8-4XV9wdF2H-IVvHcB3enMUP8Jj6EyYDHtnKH4c3NcRfi_Z1ze9mpScgyzFRDhnLw3EUi-sWz4O4oYMPCYcsDv9II6N-wXQwq9hZpEb6-vaEZAwdHecXU705HWXnF0QLK8xf4uN04Adk8phk7P8xGw8vJ7SsCVvZB6Cq02Bbc9BpPfrL6OOZIYjdUkVoaEVKstXbRrLh_hmpBsbqYV7"/>
              <span className="font-['Inter'] text-sm text-[#e1bfb7]">Updated by Neo</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] opacity-70">3d ago</span>
          </div>
        </div>

        {/* File Card (Hard) */}
        <div className="glass-panel bg-[rgba(32,31,31,0.7)] p-6 rounded-xl hover:box-shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 group cursor-pointer flex flex-col gap-4 border border-[rgba(89,65,59,0.3)] border-l-4 border-l-[#ffb4ab]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#e1bfb7]">description</span>
              <h3 className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] font-semibold group-hover:text-[#4cd7f6] transition-colors">kmp_matcher.java</h3>
            </div>
            <button className="text-[#e1bfb7] hover:text-[#EA5D3A] transition-colors">
              <span className="material-symbols-outlined">star</span>
            </button>
          </div>
          <div className="flex justify-between items-end mt-auto pt-4 border-t border-[#59413b]/20">
            <div className="flex items-center gap-3">
              <img alt="Uploader" className="w-6 h-6 rounded-full border border-[#59413b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoZOl_YYUv2vZXdxrhgG96CrwyyeYf4NFHBuYthDTqtkpD67IHGmXW6V1sfZTaV2pdTSQ922nZv4PiI-KdcGA317D4z72n2JklxFOtn4hWdWSwSqEWvaxZMxl1kiy3XY437rRKWPSF9Wa2KWUD51phVFsaI_dMm1PEgobJDwK1hA53A8G_fnMTYM-yAsSBp_Wpe64kW_4xzThOgJGO9av3HHrXrh-lFdWpHYN8ajdQ5aLaWu4tsiXI"/>
              <span className="font-['Inter'] text-sm text-[#e1bfb7]">Updated by Morpheus</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] opacity-70">1w ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
