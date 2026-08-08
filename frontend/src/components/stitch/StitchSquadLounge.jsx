import React, { useState } from 'react';
import SquadChat from '../squad/SquadChat';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function StitchSquadLounge({ showSidebar = true, onOpenCreateSquad, onOpenJoinSquad }) {
  const { 
    activeChannel, setActiveChannel, members, activeSquad, 
    addMemberByUsername, setMemberRole, kickMember, leaveSquad
  } = useSquadStore();
  const { user } = useAuth();

  const [showRightMemberPanel, setShowRightMemberPanel] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addInput, setAddInput] = useState('');
  const [toast, setToast] = useState(null);
  const [kickTarget, setKickTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState('🔥 Weekly Goal: Solve 10 Dynamic Programming & Graph problems to level up squad rank!');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isAdmin = activeSquad?.created_by === user?.id || (activeSquad?.roles || []).includes('admin');

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!addInput.trim() || !activeSquad?.id) return;
    setIsSaving(true);
    try {
      const added = await addMemberByUsername(activeSquad.id, addInput.trim());
      showToast(`Added @${added.username || addInput} to squad!`);
      setShowAddMemberModal(false);
      setAddInput('');
    } catch (err) {
      showToast(err.message || 'Failed to add member', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKickConfirm = async () => {
    if (!activeSquad?.id || !kickTarget) return;
    setIsSaving(true);
    try {
      await kickMember(activeSquad.id, kickTarget.user_id);
      showToast(`Kicked ${kickTarget.name} from squad.`);
      setKickTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to kick member', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    if (!activeSquad?.id) return;
    try {
      await setMemberRole(activeSquad.id, targetUserId, [newRole]);
      showToast(`Role updated to ${newRole}!`);
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleCopyInviteCode = () => {
    const code = activeSquad?.invite_code || activeSquad?.code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    showToast(`Invite Code ${code} copied!`);
  };

  const handleLeaveSquad = async () => {
    if (!activeSquad?.id) return;
    if (!window.confirm('Are you sure you want to leave this squad?')) return;
    try {
      await leaveSquad(activeSquad.id);
      showToast('Left squad.');
    } catch (err) {
      showToast(err.message || 'Failed to leave squad', 'error');
    }
  };

  const onlineMembers = members.filter(m => m.isOnline);
  const offlineMembers = members.filter(m => !m.isOnline);

  return (
    <div className="bg-[#131313] text-[#e5e2e1] h-full min-h-screen flex flex-col md:flex-row overflow-hidden font-['Inter'] relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-2 transition-all animate-bounce ${
          toast.type === 'error'
            ? 'bg-red-500/20 border-red-500/50 text-red-300'
            : 'bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]'
        }`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          <span className="font-['Inter'] text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#EA5D3A]/50 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-['Outfit'] text-xl font-bold text-white">Add Member to {activeSquad?.name}</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-[#e1bfb7] hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-['Inter'] text-xs text-[#e1bfb7]">
              Enter username or LeetCode handle of the developer to invite them directly.
            </p>
            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <input 
                type="text" 
                value={addInput}
                onChange={(e) => setAddInput(e.target.value)}
                placeholder="Username or LeetCode handle"
                className="w-full bg-[#121212] border border-[#59413b] rounded-lg px-4 py-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#EA5D3A]"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#353534] text-[#e1bfb7] hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !addInput.trim()}
                  className="px-5 py-1.5 rounded-lg bg-[#EA5D3A] text-white font-bold text-xs hover:brightness-110 disabled:opacity-50"
                >
                  {isSaving ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kick Confirmation Modal */}
      {kickTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-red-500/50 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-['Outfit'] text-lg font-bold text-white">Kick {kickTarget.name}?</h3>
            <p className="font-['Inter'] text-xs text-[#e1bfb7]">Are you sure you want to remove this member from the squad?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setKickTarget(null)}
                className="px-4 py-1.5 rounded-lg bg-[#353534] text-[#e1bfb7] hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleKickConfirm}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? 'Kicking...' : 'Confirm Kick'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Channel Sidebar */}
      {showSidebar && (
        <nav className="w-full md:w-[260px] bg-[#0e0e0e] border-r border-white/10 flex flex-col py-5 px-3 shrink-0">
          {/* Squad Info Header */}
          <div className="px-2 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#EA5D3A] flex items-center justify-center font-['Outfit'] font-bold text-white text-lg flex-shrink-0">
                {(activeSquad?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="font-['Outfit'] text-base font-bold text-[#ffb4a2] truncate">{activeSquad?.name || 'Developer Hub'}</h1>
                <p className="font-['Inter'] text-[11px] text-[#e1bfb7] truncate">{activeSquad?.squad_type || 'Elite Tier'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-2 mb-4 space-y-1.5">
            <button
              onClick={handleCopyInviteCode}
              className="w-full py-1.5 px-2.5 rounded bg-[#1c1b1b] border border-[#EA5D3A]/30 text-[#EA5D3A] hover:bg-[#EA5D3A]/10 font-['JetBrains_Mono'] text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Code: {activeSquad?.invite_code || activeSquad?.code || 'COMMUNITY'}</span>
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
            </button>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={onOpenJoinSquad}
                className="flex-1 py-1 rounded bg-[#353534] hover:bg-[#4cd7f6] hover:text-black text-[#e1bfb7] font-['JetBrains_Mono'] text-[10px] font-bold transition-all cursor-pointer text-center"
              >
                + Join Squad
              </button>
              <button
                onClick={onOpenCreateSquad}
                className="flex-1 py-1 rounded bg-[#EA5D3A]/20 hover:bg-[#EA5D3A] text-[#EA5D3A] hover:text-white font-['JetBrains_Mono'] text-[10px] font-bold transition-all cursor-pointer text-center border border-[#EA5D3A]/40"
              >
                + Create
              </button>
            </div>
          </div>

          {/* Channels List */}
          <div className="px-2 mt-2 flex-1">
            <h3 className="font-['Outfit'] text-xs font-bold text-[#e5e2e1] uppercase tracking-wider mb-2">Channels</h3>
            <ul className="flex flex-col gap-1 font-['JetBrains_Mono'] text-xs">
              <li>
                <button
                  onClick={() => setActiveChannel('general')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    activeChannel === 'general' ? 'text-[#ffb4a2] bg-[#353534]/40 font-bold border-l-2 border-[#EA5D3A]' : 'text-[#e1bfb7] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><span className="text-[#e1bfb7]">#</span> general</span>
                  <span className="text-[10px] bg-[#EA5D3A]/20 text-[#EA5D3A] px-1.5 py-0.5 rounded">MAIN</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveChannel('announcements')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    activeChannel === 'announcements' ? 'text-[#ffb4a2] bg-[#353534]/40 font-bold border-l-2 border-[#EA5D3A]' : 'text-[#e1bfb7] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">campaign</span> announcements</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveChannel('daily-wins')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    activeChannel === 'daily-wins' ? 'text-[#ffb4a2] bg-[#353534]/40 font-bold border-l-2 border-[#EA5D3A]' : 'text-[#e1bfb7] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">emoji_events</span> daily-wins</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveChannel('doubt-solver')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    activeChannel === 'doubt-solver' ? 'text-[#ffb4a2] bg-[#353534]/40 font-bold border-l-2 border-[#EA5D3A]' : 'text-[#e1bfb7] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">help</span> doubt-solver</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      )}

      {/* Main Chat Canvas */}
      <main className="flex-1 flex flex-col bg-[#131313] h-full min-h-0 overflow-hidden relative">
        {/* Chat Header */}
        <header className="h-14 bg-[#131313]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-3">
            <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1] flex items-center gap-1.5">
              <span className="text-[#e1bfb7] font-light">#</span>{activeChannel || 'general'}
            </h2>
            <div className="bg-[#353534] px-2.5 py-0.5 rounded-full text-[#e1bfb7] font-['JetBrains_Mono'] text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span>{onlineMembers.length} Online</span>
              <span className="text-white/30">|</span>
              <span>{members.length || 1} Total</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-3 py-1 rounded bg-[#EA5D3A] text-white hover:brightness-110 text-xs font-bold font-['Outfit'] flex items-center gap-1 cursor-pointer shadow-md"
              title="Add Member to Squad"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span> Add Member
            </button>

            <button
              onClick={() => setShowRightMemberPanel(!showRightMemberPanel)}
              className={`px-2.5 py-1 rounded text-xs font-bold font-['JetBrains_Mono'] flex items-center gap-1 transition-colors cursor-pointer ${
                showRightMemberPanel ? 'bg-[#EA5D3A]/20 text-[#EA5D3A] border border-[#EA5D3A]/40' : 'bg-[#353534] text-[#e1bfb7] hover:text-white'
              }`}
              title="Toggle Members Panel"
            >
              <span className="material-symbols-outlined text-[16px]">group</span> Roster
            </button>

            <button
              onClick={handleLeaveSquad}
              className="p-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              title="Leave Squad"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        </header>

        {/* Pinned Announcement Bar */}
        {pinnedAnnouncement && (
          <div className="bg-[#1c1b1b] border-b border-[#EA5D3A]/30 px-6 py-2 flex items-center justify-between text-xs text-[#e1bfb7] font-['JetBrains_Mono'] shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="material-symbols-outlined text-[#EA5D3A] text-[16px]">push_pin</span>
              <span className="truncate text-white font-medium">{pinnedAnnouncement}</span>
            </div>
            <button onClick={() => setPinnedAnnouncement(null)} className="text-[#e1bfb7] hover:text-white ml-2">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        )}

        {/* Squad Chat Container */}
        <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
          <SquadChat />
        </div>
      </main>

      {/* Right Sidebar: WhatsApp / Discord Style Members & Online Roster */}
      {showRightMemberPanel && (
        <aside className="w-full md:w-[260px] bg-[#0e0e0e] border-l border-white/10 flex flex-col py-4 px-3 shrink-0 h-full overflow-y-auto z-30">
          <div className="flex justify-between items-center pb-3 border-b border-white/10 px-2">
            <h3 className="font-['Outfit'] text-sm font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#EA5D3A] text-[18px]">group</span> Squad Roster
            </h3>
            <span className="font-['JetBrains_Mono'] text-xs text-[#4cd7f6] bg-[#4cd7f6]/10 px-2 py-0.5 rounded font-bold">
              {members.length}
            </span>
          </div>

          {/* ONLINE MEMBERS */}
          <div className="mt-4">
            <p className="px-2 text-[10px] font-bold text-[#10B981] font-['JetBrains_Mono'] uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> ONLINE — {onlineMembers.length}
            </p>
            <div className="space-y-1">
              {onlineMembers.length === 0 ? (
                <p className="px-2 text-xs text-[#e1bfb7]/50 italic">No members online right now</p>
              ) : (
                onlineMembers.map(m => {
                  const isMe = m.user_id === user?.id;
                  const isMemberAdmin = (m.roles || []).includes('admin') || m.role === 'admin';

                  return (
                    <div key={m.user_id} className="p-2 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] flex items-center justify-between gap-2 border border-white/5 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-[#353534] flex items-center justify-center text-white font-bold text-xs border border-[#59413b] overflow-hidden">
                            {m.avatar_url ? (
                              <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                            ) : (
                              (m.name || 'M').charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] rounded-full border border-black" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                            <span className="truncate">{m.name}</span>
                            {isMe && <span className="text-[9px] bg-[#4cd7f6]/20 text-[#4cd7f6] px-1 rounded">YOU</span>}
                          </div>
                          <span className="text-[10px] text-[#e1bfb7] font-['JetBrains_Mono'] block truncate">
                            @{m.username || 'grinder'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isMemberAdmin && (
                          <span className="text-[9px] bg-[#EA5D3A]/20 text-[#EA5D3A] border border-[#EA5D3A]/40 px-1.5 py-0.5 rounded font-bold font-['JetBrains_Mono']">
                            ADMIN
                          </span>
                        )}
                        {isAdmin && !isMe && (
                          <button
                            onClick={() => setKickTarget(m)}
                            className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-500/20"
                            title="Kick Member"
                          >
                            <span className="material-symbols-outlined text-[14px]">person_remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ALL / OFFLINE MEMBERS */}
          <div className="mt-6">
            <p className="px-2 text-[10px] font-bold text-[#e1bfb7] font-['JetBrains_Mono'] uppercase tracking-wider mb-2">
              ALL MEMBERS — {members.length}
            </p>
            <div className="space-y-1">
              {members.map(m => {
                const isMe = m.user_id === user?.id;
                const isMemberAdmin = (m.roles || []).includes('admin') || m.role === 'admin';

                return (
                  <div key={m.user_id} className="p-2 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] flex items-center justify-between gap-2 border border-white/5 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#353534] flex items-center justify-center text-white font-bold text-xs border border-[#59413b] overflow-hidden flex-shrink-0">
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                        ) : (
                          (m.name || 'M').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                          <span className="truncate">{m.name}</span>
                          {isMe && <span className="text-[9px] bg-[#4cd7f6]/20 text-[#4cd7f6] px-1 rounded">YOU</span>}
                        </div>
                        <span className="text-[10px] text-[#e1bfb7] font-['JetBrains_Mono'] block truncate">
                          @{m.username || 'grinder'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isAdmin && !isMe ? (
                        <select
                          value={m.role || 'member'}
                          onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                          className="bg-[#121212] text-[#4cd7f6] border border-[#4cd7f6]/40 rounded px-1.5 py-0.5 text-[10px] font-['JetBrains_Mono'] font-bold outline-none cursor-pointer"
                        >
                          <option value="member">Member</option>
                          <option value="moderator">Mod</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-['JetBrains_Mono'] font-bold ${
                          isMemberAdmin ? 'bg-[#EA5D3A]/20 text-[#EA5D3A] border border-[#EA5D3A]/40' : 'bg-[#353534] text-[#e1bfb7]'
                        }`}>
                          {m.role || 'member'}
                        </span>
                      )}

                      {isAdmin && !isMe && (
                        <button
                          onClick={() => setKickTarget(m)}
                          className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-500/20"
                          title="Kick Member"
                        >
                          <span className="material-symbols-outlined text-[14px]">person_remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
