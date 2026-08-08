import React from 'react';

export default function StitchSettings() {
  return (
    <div className="pt-8 pb-12 max-w-[1440px] mx-auto min-h-screen flex flex-col md:flex-row gap-8 font-['Inter'] antialiased w-full px-4 md:px-8">
      {/* Settings Inner Sidebar */}
      <aside className="w-full md:w-[240px] flex-shrink-0">
        <h1 className="font-['Outfit'] text-3xl font-bold text-[#e5e2e1] mb-6">Settings</h1>
        <nav className="flex flex-col gap-2">
          <button className="w-full text-left px-4 py-3 rounded bg-[#353534] text-[#4cd7f6] border border-[#4cd7f6]/30 font-medium transition-colors">
            Account
          </button>
          <button className="w-full text-left px-4 py-3 rounded text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-colors">
            Privacy
          </button>
          <button className="w-full text-left px-4 py-3 rounded text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-colors">
            Notifications
          </button>
          <button className="w-full text-left px-4 py-3 rounded text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-colors">
            Squad Preferences
          </button>
        </nav>
      </aside>

      {/* Settings Content Form */}
      <div className="flex-1 max-w-3xl glass-panel bg-[rgba(30,30,30,0.6)] rounded-xl p-6 md:p-8 space-y-8 border border-[rgba(51,51,51,0.6)]">
        {/* Section: Profile Picture */}
        <div className="space-y-3">
          <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <img alt="Current Profile Picture" className="w-24 h-24 rounded-full object-cover border-2 border-[#59413b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgOs_IuSJP3-5kYSXD6zalyusd6_Xv59aJYUA0IeFyGqDsTZYtb7my0sxsmWoGrnl3XHAZMQy0kWb3esz-8_575BjzrBTCYydYrc37Ph8Bu8fthAHcKn42ZBiz3apUOACPZ8PYOUkYcKOo-t2ZxojJv-L_yr3kQHVL_YwipaToOlXTtr0DMFGsCrgjqU4WxrmcDzh49MSWuwoBPp2JKzx7mZ-nYTTAsWMRWXcQVkbQgDri5PHBPmSv"/>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-[#201f1f] border border-[#59413b] rounded font-['JetBrains_Mono'] text-[13px] text-[#e5e2e1] hover:border-[#4cd7f6] hover:text-[#4cd7f6] transition-colors">
                Upload New
              </button>
              <button className="px-4 py-2 text-[#ffb4ab] font-['JetBrains_Mono'] text-[13px] hover:bg-[#ffb4ab]/10 rounded transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>

        <hr className="border-[#59413b]/30"/>

        {/* Section: Basic Info Form */}
        <div className="space-y-6">
          <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Public Profile</h2>
          
          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Username</label>
            <input className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] transition-all placeholder-[#e1bfb7]/50" type="text" defaultValue="DevNinja_99"/>
          </div>

          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Target Company</label>
            <div className="relative">
              <select className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] transition-all appearance-none" defaultValue="OpenAI">
                <option>FAANG (Any)</option>
                <option>Google</option>
                <option>Meta</option>
                <option>Stripe</option>
                <option>OpenAI</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#e1bfb7] pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Bio</label>
            <textarea className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] transition-all resize-y" rows={4} defaultValue="Building distributed systems and grinding LeetCode hards. Currently focusing on Rust and high-performance WebGL."></textarea>
          </div>
        </div>

        <hr className="border-[#59413b]/30"/>

        {/* Section: Preferences (Toggles) */}
        <div className="space-y-6">
          <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Preferences</h2>
          
          <div className="flex items-center justify-between py-2 border-b border-[#59413b]/20">
            <div>
              <div className="font-['Inter'] text-lg text-[#e5e2e1]">Public Profile</div>
              <div className="font-['Inter'] text-sm text-[#e1bfb7]">Allow others to view your stats and activity.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked/>
              <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f2633f]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#59413b]/20">
            <div>
              <div className="font-['Inter'] text-lg text-[#e5e2e1]">Nudge Notifications</div>
              <div className="font-['Inter'] text-sm text-[#e1bfb7]">Get notified when squad members complete a challenge.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked/>
              <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f2633f]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-['Inter'] text-lg text-[#e5e2e1]">Show Streak</div>
              <div className="font-['Inter'] text-sm text-[#e1bfb7]">Display your daily coding streak on your avatar.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer"/>
              <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f2633f]"></div>
            </label>
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-4 flex justify-end">
          <button className="bg-[#f2633f] text-white px-8 py-3 rounded-md font-['Outfit'] text-xl font-bold hover:shadow-[0_0_15px_rgba(242,99,63,0.3)] hover:brightness-110 transition-all duration-300">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
