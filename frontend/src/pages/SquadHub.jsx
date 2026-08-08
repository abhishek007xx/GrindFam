import React, { useState } from 'react';
import StitchSquadLounge from '../components/stitch/StitchSquadLounge';
import StitchSquadDashboard from '../components/stitch/StitchSquadDashboard';
import StitchCodeReviewHub from '../components/stitch/StitchCodeReviewHub';
import StitchSquadLeaderboard from '../components/stitch/StitchSquadLeaderboard';
import StitchDMHub from '../components/stitch/StitchDMHub';
import StitchSquadRepo from '../components/stitch/StitchSquadRepo';
import StitchSettings from '../components/stitch/StitchSettings';
import { useTheme } from '../context/ThemeContext';
import NotificationsDropdown from '../components/NotificationsDropdown';
import CalendarDatePickerModal from '../components/CalendarDatePickerModal';
import StreakModal from '../components/StreakModal';
import { useNavigate } from 'react-router-dom';
import { useSquadStore } from '../store/useSquadStore';

export default function SquadHub({ platformTotal = 0 }) {
  // Screen selection: 'lounge', 'dashboard', 'dms', 'reviews', 'leaderboard', 'repo', 'settings'
  const [activeScreen, setActiveScreen] = useState('lounge');
  const { theme, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinError, setJoinError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const navigate = useNavigate();
  const { joinByCode, activeSquad } = useSquadStore();
  const streakDays = platformTotal > 0 ? Math.max(1, Math.floor(platformTotal / 3)) : 0;

  const handleJoinSquadSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim() || isJoining) return;
    setIsJoining(true);
    setJoinError(null);
    try {
      await joinByCode(inviteCodeInput.trim());
      setIsJoinModalOpen(false);
      setInviteCodeInput('');
      setActiveScreen('lounge');
    } catch (err) {
      setJoinError(err.message || 'Failed to join squad with code');
    } finally {
      setIsJoining(false);
    }
  };

  const navItems = [
    { id: 'lounge', label: 'Home', icon: 'home' },
    { id: 'dms', label: 'Direct Messages', icon: 'chat_bubble' },
    { id: 'reviews', label: 'Code Reviews', icon: 'terminal' },
    { id: 'dashboard', label: 'Squads', icon: 'groups' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'equalizer' },
    { id: 'repo', label: 'Repository', icon: 'code' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0D0D0D] text-[#e5e2e1] font-['Inter'] antialiased selection:bg-[#4cd7f6]/30 selection:text-[#4cd7f6] overflow-hidden">
      {/* Join New Squad Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#EA5D3A]/50 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-['Outfit'] text-2xl font-bold text-white">Join New Squad</h3>
              <button 
                onClick={() => { setIsJoinModalOpen(false); setJoinError(null); }}
                className="text-[#e1bfb7] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-['Inter'] text-sm text-[#e1bfb7]">
              Enter the unique Squad Invite Code provided by your squad captain to join their workspace.
            </p>

            {joinError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-xs font-bold">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoinSquadSubmit} className="space-y-4">
              <div>
                <label className="font-['JetBrains_Mono'] text-xs text-[#e1bfb7] uppercase tracking-wider block mb-1">
                  Invite Code
                </label>
                <input 
                  type="text" 
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  placeholder="e.g. ALPHA88"
                  className="w-full bg-[#121212] border border-[#59413b] rounded-lg px-4 py-2.5 font-['JetBrains_Mono'] text-base text-[#4cd7f6] focus:outline-none focus:border-[#4cd7f6] uppercase tracking-widest"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#353534] text-[#e1bfb7] hover:text-white transition-colors text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isJoining || !inviteCodeInput.trim()}
                  className="px-6 py-2 rounded-lg bg-[#EA5D3A] text-white hover:brightness-110 transition-all text-sm font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isJoining ? 'Joining...' : 'Join Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#4cd7f6]/50 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 flex items-center justify-center mx-auto text-[#4cd7f6]">
              <span className="material-symbols-outlined text-3xl">help</span>
            </div>
            <h3 className="font-['Outfit'] text-2xl font-bold text-white">Community Support & Help</h3>
            <p className="font-['Inter'] text-sm text-[#e1bfb7]">
              Need help with your squad, tracking, or code reviews? Connect with the GrindFam support team.
            </p>
            <div className="p-4 bg-[#121212] rounded-xl border border-white/10 space-y-2 text-left font-['Inter'] text-xs text-[#e5e2e1]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#EA5D3A] text-[18px]">mail</span>
                <span>Support Email: <strong className="text-[#4cd7f6]">support@grindfam.dev</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10B981] text-[18px]">forum</span>
                <span>Community Discord: <strong className="text-[#4cd7f6]">discord.gg/grindfam</strong></span>
              </div>
            </div>
            <button 
              onClick={() => setIsSupportModalOpen(false)}
              className="w-full py-2.5 rounded-lg bg-[#353534] text-white hover:bg-[#4cd7f6] hover:text-[#0D0D0D] transition-colors font-bold text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── STITCH LEFT SIDEBAR ── */}
      <aside className="w-[280px] h-full flex flex-col bg-[#0e0e0e] border-r border-white/10 shrink-0 z-30 py-6 px-4">
        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full px-4 py-3 rounded text-xs font-['JetBrains_Mono'] flex items-center gap-3 transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#03b5d3]/10 text-[#4cd7f6] border-l-4 border-[#4cd7f6] font-bold translate-x-1'
                    : 'text-[#e1bfb7] hover:text-white hover:bg-[#353534]/30 hover:text-[#4cd7f6]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Contextual Squad Section: Active Squad */}
          <div className="mt-6 pt-4 border-t border-white/10 px-2">
            <h3 className="font-['Outfit'] text-sm font-bold text-white mb-2">{activeSquad?.name || 'DSA Dream Team'}</h3>
            <div className="space-y-1 font-['JetBrains_Mono'] text-xs">
              <button 
                onClick={() => setActiveScreen('lounge')}
                className={`w-full text-left px-2 py-1.5 rounded transition-colors flex items-center gap-2 cursor-pointer ${
                  activeScreen === 'lounge' ? 'text-[#EA5D3A] bg-[#353534]/30 font-bold' : 'text-[#e1bfb7] hover:text-white'
                }`}
              >
                <span className="text-[#e1bfb7]">#</span> general
              </button>
              <button 
                onClick={() => setActiveScreen('lounge')}
                className="w-full text-left px-2 py-1.5 rounded text-[#e1bfb7] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">emoji_events</span> daily-wins
              </button>
              <button 
                onClick={() => setActiveScreen('lounge')}
                className="w-full text-left px-2 py-1.5 rounded text-[#e1bfb7] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">help</span> doubt-solver
              </button>
              <div className="flex items-center gap-2 text-[#4cd7f6] px-2 py-1.5 font-bold">
                <div className="w-2 h-2 rounded-full bg-[#EA5D3A] animate-pulse shadow-[0_0_8px_#EA5D3A]" /> Live Squad
              </div>
            </div>
          </div>
        </nav>

        {/* Join New Squad Button */}
        <div className="py-4">
          <button 
            onClick={() => setIsJoinModalOpen(true)}
            className="w-full bg-[#EA5D3A] text-white py-2.5 rounded-lg font-['JetBrains_Mono'] text-xs font-bold hover:brightness-110 shadow-[0_0_15px_rgba(234,93,58,0.3)] transition-all cursor-pointer"
          >
            Join New Squad
          </button>
        </div>

        {/* Workspace Tools: Streak, Calendar, Theme, Notifications */}
        <div className="border-t border-white/10 pt-3 pb-2 flex flex-col gap-1 font-['JetBrains_Mono'] text-xs">
          <button
            onClick={() => setIsStreakOpen(true)}
            className="flex items-center justify-between px-3 py-2 rounded text-amber-400 hover:bg-amber-500/10 transition-colors text-left cursor-pointer font-bold"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span> Streak
            </div>
            <span>{streakDays}</span>
          </button>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-3 px-3 py-2 rounded text-[#e1bfb7] hover:text-white transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span> Calendar
          </button>
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="flex items-center justify-between w-full px-3 py-2 rounded text-[#e1bfb7] hover:text-white transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">notifications</span> Notifications
              </div>
              <span className="w-2 h-2 rounded-full bg-[#EA5D3A] animate-pulse"></span>
            </button>
            <NotificationsDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 rounded text-[#e1bfb7] hover:text-white transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Footer Links: Settings, Support */}
        <div className="border-t border-white/10 pt-3 flex flex-col gap-1 font-['JetBrains_Mono'] text-xs">
          <button
            onClick={() => setActiveScreen('settings')}
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors text-left cursor-pointer ${
              activeScreen === 'settings' ? 'text-[#4cd7f6] bg-[#353534]/30 font-bold' : 'text-[#e1bfb7] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span> Settings
          </button>
          <button 
            onClick={() => setIsSupportModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2 rounded text-[#e1bfb7] hover:text-white transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">help</span> Support
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT CANVAS ── */}
      <main className={`flex-1 min-w-0 h-full ${activeScreen === 'lounge' || activeScreen === 'dms' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        {activeScreen === 'lounge' && <StitchSquadLounge showSidebar={false} />}
        {activeScreen === 'dashboard' && <StitchSquadDashboard onNavigate={setActiveScreen} />}
        {activeScreen === 'dms' && <StitchDMHub />}
        {activeScreen === 'reviews' && <StitchCodeReviewHub />}
        {activeScreen === 'leaderboard' && <StitchSquadLeaderboard />}
        {activeScreen === 'repo' && <StitchSquadRepo />}
        {activeScreen === 'settings' && <StitchSettings />}
      </main>
      <CalendarDatePickerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => {
          setSelectedDate(newDate);
          navigate(`/dashboard?date=${newDate}`);
        }}
      />
      <StreakModal
        isOpen={isStreakOpen}
        onClose={() => setIsStreakOpen(false)}
        streakDays={streakDays}
        platformTotal={platformTotal}
      />
    </div>
  );
}
