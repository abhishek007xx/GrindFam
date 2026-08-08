import React, { useState, useEffect } from 'react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';

export default function StitchSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const { 
    activeSquad, updateSquadSettings, leaveSquad, deleteSquad, 
    members, setMemberRole, kickMember, addMemberByUsername 
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null); // 'leave' | 'delete' | 'kick'
  const [kickTarget, setKickTarget] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState('');

  // Account tab state
  const [accountForm, setAccountForm] = useState({
    name: '',
    username: '',
    leetcode_username: '',
    target_company: 'Google',
    bio: '',
    avatar_url: ''
  });

  // Privacy tab state
  const [privacyForm, setPrivacyForm] = useState({
    is_public: true,
    show_streak: true,
    show_online_status: true
  });

  // Notifications tab state
  const [notifyForm, setNotifyForm] = useState({
    nudge_notifications: true,
    chat_mentions: true,
    daily_digest: false
  });

  // Squad tab state
  const [squadForm, setSquadForm] = useState({
    name: '',
    goal: '',
    squad_type: 'private'
  });

  useEffect(() => {
    if (profile || user) {
      const meta = user?.user_metadata || {};
      setAccountForm({
        name: profile?.name || meta.name || '',
        username: profile?.username || meta.username || '',
        leetcode_username: profile?.leetcode_username || meta.leetcode_username || '',
        target_company: profile?.target_company || meta.target_company || 'Google',
        bio: profile?.bio || meta.bio || '',
        avatar_url: profile?.avatar_url || meta.avatar_url || ''
      });
      setPrivacyForm({
        is_public: profile?.is_public ?? meta.is_public ?? true,
        show_streak: profile?.show_streak ?? meta.show_streak ?? true,
        show_online_status: profile?.show_online_status ?? meta.show_online_status ?? true
      });
      setNotifyForm({
        nudge_notifications: profile?.nudge_notifications ?? meta.nudge_notifications ?? true,
        chat_mentions: profile?.chat_mentions ?? meta.chat_mentions ?? true,
        daily_digest: profile?.daily_digest ?? meta.daily_digest ?? false
      });
    }
  }, [profile, user]);

  useEffect(() => {
    if (activeSquad) {
      setSquadForm({
        name: activeSquad.name || '',
        goal: activeSquad.goal || '',
        squad_type: activeSquad.squad_type || 'private'
      });
    }
  }, [activeSquad]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveAccount = async (e) => {
    e?.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await supabase.auth.updateUser({
        data: {
          name: accountForm.name,
          username: accountForm.username,
          leetcode_username: accountForm.leetcode_username,
          target_company: accountForm.target_company,
          bio: accountForm.bio,
          avatar_url: accountForm.avatar_url
        }
      });
      try {
        await supabase
          .from('profiles')
          .update({
            name: accountForm.name,
            username: accountForm.username,
            leetcode_username: accountForm.leetcode_username
          })
          .eq('id', user.id);
      } catch (_) {}
      await refreshProfile();
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving account:', err);
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await supabase.auth.updateUser({ data: privacyForm });
      showToast('Privacy preferences saved!');
    } catch (err) {
      showToast(err.message || 'Failed to save privacy settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await supabase.auth.updateUser({ data: notifyForm });
      showToast('Notification preferences saved!');
    } catch (err) {
      showToast(err.message || 'Failed to save notification settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSquad = async (e) => {
    e?.preventDefault();
    if (!activeSquad?.id) return;
    setIsSaving(true);
    try {
      await updateSquadSettings(activeSquad.id, {
        name: squadForm.name,
        goal: squadForm.goal,
        squad_type: squadForm.squad_type
      });
      showToast('Squad preferences updated successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update squad settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyInviteCode = () => {
    const code = activeSquad?.invite_code || activeSquad?.code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    showToast(`Invite code ${code} copied to clipboard!`);
  };

  const handleLeaveSquadConfirm = async () => {
    if (!activeSquad?.id) return;
    setIsSaving(true);
    try {
      await leaveSquad(activeSquad.id);
      setShowConfirmModal(null);
      showToast('You left the squad.');
    } catch (err) {
      showToast(err.message || 'Failed to leave squad', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSquadConfirm = async () => {
    if (!activeSquad?.id) return;
    setIsSaving(true);
    try {
      await deleteSquad(activeSquad.id);
      setShowConfirmModal(null);
      showToast('Squad deleted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to delete squad', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKickMemberConfirm = async () => {
    if (!activeSquad?.id || !kickTarget) return;
    setIsSaving(true);
    try {
      await kickMember(activeSquad.id, kickTarget.user_id);
      showToast(`Kicked ${kickTarget.name} from squad.`);
      setShowConfirmModal(null);
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
      showToast(err.message || 'Failed to update member role', 'error');
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!addMemberInput.trim() || !activeSquad?.id) return;
    setIsSaving(true);
    try {
      const added = await addMemberByUsername(activeSquad.id, addMemberInput.trim());
      showToast(`Successfully added ${added.username || addMemberInput} to squad!`);
      setShowAddMemberModal(false);
      setAddMemberInput('');
    } catch (err) {
      showToast(err.message || 'Failed to add member', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = activeSquad?.created_by === user?.id || (activeSquad?.roles || []).includes('admin');

  return (
    <div className="pt-8 pb-12 max-w-[1440px] mx-auto min-h-screen flex flex-col md:flex-row gap-8 font-['Inter'] antialiased w-full px-4 md:px-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 transition-all animate-bounce ${
          toast.type === 'error'
            ? 'bg-red-500/20 border-red-500/50 text-red-300'
            : 'bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]'
        }`}>
          <span className="material-symbols-outlined">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          <span className="font-['Inter'] text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#4cd7f6]/50 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-['Outfit'] text-2xl font-bold text-white">Add Member to Squad</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-[#e1bfb7] hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-['Inter'] text-sm text-[#e1bfb7]">
              Enter the username or LeetCode handle of the developer you want to add directly.
            </p>
            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <input 
                type="text" 
                value={addMemberInput}
                onChange={(e) => setAddMemberInput(e.target.value)}
                placeholder="Username or LeetCode Handle"
                className="w-full bg-[#121212] border border-[#59413b] rounded-lg px-4 py-2.5 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6]"
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#353534] text-[#e1bfb7] hover:text-white text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !addMemberInput.trim()}
                  className="px-6 py-2 rounded-lg bg-[#4cd7f6] text-[#0D0D0D] font-bold text-sm hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#59413b]/60 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-['Outfit'] text-2xl font-bold text-[#e5e2e1]">
              {showConfirmModal === 'leave' ? 'Leave Squad?' : showConfirmModal === 'delete' ? 'Delete Squad?' : `Kick ${kickTarget?.name}?`}
            </h3>
            <p className="font-['Inter'] text-sm text-[#e1bfb7]">
              {showConfirmModal === 'leave'
                ? 'Are you sure you want to leave this squad?'
                : showConfirmModal === 'delete'
                ? 'Are you sure you want to permanently delete this squad? All messages & channels will be erased.'
                : `Are you sure you want to kick ${kickTarget?.name} from this squad?`}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => { setShowConfirmModal(null); setKickTarget(null); }}
                className="px-4 py-2 rounded-lg bg-[#353534] text-[#e1bfb7] hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={
                  showConfirmModal === 'leave' ? handleLeaveSquadConfirm : 
                  showConfirmModal === 'delete' ? handleDeleteSquadConfirm : handleKickMemberConfirm
                }
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-[#EF4444] text-white hover:bg-red-600 transition-colors text-sm font-bold shadow-lg shadow-red-500/20"
              >
                {isSaving ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Inner Sidebar */}
      <aside className="w-full md:w-[240px] flex-shrink-0">
        <h1 className="font-['Outfit'] text-3xl font-bold text-[#e5e2e1] mb-6">Settings</h1>
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-4 py-3 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'account' 
                ? 'bg-[#353534] text-[#4cd7f6] border border-[#4cd7f6]/30 shadow-md' 
                : 'text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            Account
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`w-full text-left px-4 py-3 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'members' 
                ? 'bg-[#353534] text-[#4cd7f6] border border-[#4cd7f6]/30 shadow-md' 
                : 'text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            Members & Roles
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left px-4 py-3 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'privacy' 
                ? 'bg-[#353534] text-[#4cd7f6] border border-[#4cd7f6]/30 shadow-md' 
                : 'text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            Privacy
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'notifications' 
                ? 'bg-[#353534] text-[#4cd7f6] border border-[#4cd7f6]/30 shadow-md' 
                : 'text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab('squad')}
            className={`w-full text-left px-4 py-3 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'squad' 
                ? 'bg-[#353534] text-[#4cd7f6] border border-[#4cd7f6]/30 shadow-md' 
                : 'text-[#e1bfb7] hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            Squad Preferences
          </button>
        </nav>
      </aside>

      {/* Settings Content Panels */}
      <div className="flex-1 max-w-3xl glass-panel bg-[rgba(30,30,30,0.6)] rounded-xl p-6 md:p-8 space-y-8 border border-[rgba(51,51,51,0.6)]">
        {/* ─── TAB: MEMBERS & ROLES ─── */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Squad Members & Roles</h2>
                <p className="font-['Inter'] text-sm text-[#e1bfb7]">
                  {activeSquad?.name ? `Managing ${activeSquad.name}` : 'Manage squad members, assign roles, or invite developers.'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-[#EA5D3A] text-white px-4 py-2 rounded-lg font-['Outfit'] font-bold text-sm hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span> Add Member
                </button>
                {activeSquad?.invite_code && (
                  <button 
                    onClick={handleCopyInviteCode}
                    className="bg-[#353534] border border-[#EA5D3A]/40 text-[#EA5D3A] hover:bg-[#EA5D3A]/10 px-3 py-2 rounded-lg font-['JetBrains_Mono'] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span> Copy Code
                  </button>
                )}
              </div>
            </div>

            {/* Members Roster List */}
            {(() => {
              const displayMembers = members.length > 0 ? members : (user ? [{
                user_id: user.id,
                name: profile?.name || profile?.username || user.email?.split('@')[0] || 'Current Grinder',
                username: profile?.username || profile?.leetcode_username || 'you',
                role: 'admin',
                roles: ['admin'],
                avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url,
                isOnline: true
              }] : []);

              if (displayMembers.length === 0) {
                return (
                  <div className="p-8 rounded-xl bg-[#1c1b1b] border border-[#59413b]/30 text-center space-y-4">
                    <span className="material-symbols-outlined text-4xl text-[#EA5D3A]">group_off</span>
                    <h3 className="font-['Outfit'] text-lg font-bold text-white">No Squad Members Loaded</h3>
                    <p className="font-['Inter'] text-sm text-[#e1bfb7]">
                      Invite your developer friends to your squad by username or share your squad invite code.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button 
                        onClick={() => setShowAddMemberModal(true)}
                        className="bg-[#EA5D3A] text-white px-4 py-2 rounded-lg font-bold text-xs"
                      >
                        + Add Member by Username
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {displayMembers.map(member => {
                    const isMemberAdmin = (member.roles || []).includes('admin') || member.role === 'admin';
                    const isSelf = member.user_id === user?.id;

                    return (
                      <div key={member.user_id} className="p-4 rounded-xl bg-[#1c1b1b] border border-[#59413b]/30 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center text-white font-bold border border-[#59413b] overflow-hidden">
                              {member.avatar_url ? (
                                <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                              ) : (
                                (member.name || 'M').charAt(0).toUpperCase()
                              )}
                            </div>
                            {member.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] rounded-full border border-black"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#e5e2e1] flex items-center gap-2">
                              <span>{member.name}</span>
                              {isSelf && <span className="text-[10px] bg-[#4cd7f6]/20 text-[#4cd7f6] px-2 py-0.5 rounded font-['JetBrains_Mono']">YOU</span>}
                            </div>
                            <span className="text-xs text-[#e1bfb7] font-['JetBrains_Mono']">
                              @{member.username || member.leetcode_username || 'member'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {!isSelf ? (
                            <select 
                              value={member.role || 'member'}
                              onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                              className="bg-[#121212] text-[#4cd7f6] border border-[#4cd7f6]/40 rounded px-2.5 py-1 text-xs font-['JetBrains_Mono'] font-bold outline-none cursor-pointer"
                            >
                              <option value="member">Member</option>
                              <option value="mentor">Mentor</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded text-xs font-['JetBrains_Mono'] font-bold ${
                              isMemberAdmin ? 'bg-[#EA5D3A]/20 text-[#EA5D3A] border border-[#EA5D3A]/40' : 'bg-[#353534] text-[#e1bfb7]'
                            }`}>
                              {member.role || 'admin'}
                            </span>
                          )}

                          {!isSelf && (
                            <button 
                              onClick={() => { setKickTarget(member); setShowConfirmModal('kick'); }}
                              className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                              title="Kick Member"
                            >
                              <span className="material-symbols-outlined text-[16px]">person_remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ─── TAB: ACCOUNT ─── */}
        {activeTab === 'account' && (
          <form onSubmit={handleSaveAccount} className="space-y-8">
            <div className="space-y-3">
              <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Profile Avatar</h2>
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-full bg-[#353534] border-2 border-[#59413b] flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg">
                  {accountForm.avatar_url ? (
                    <img src={accountForm.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (accountForm.name || accountForm.username || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input 
                    type="text" 
                    value={accountForm.avatar_url}
                    onChange={(e) => setAccountForm({ ...accountForm, avatar_url: e.target.value })}
                    placeholder="Avatar Image URL (e.g. https://...)"
                    className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-3 py-1.5 font-['Inter'] text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6]"
                  />
                  <span className="text-xs text-[#e1bfb7] block">Paste a link to any custom image URL.</span>
                </div>
              </div>
            </div>

            <hr className="border-[#59413b]/30"/>

            <div className="space-y-6">
              <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Public Profile Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Full Name</label>
                  <input 
                    type="text" 
                    value={accountForm.name} 
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6]" 
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Username</label>
                  <input 
                    type="text" 
                    value={accountForm.username} 
                    onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6]" 
                    placeholder="dev_ninja"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">LeetCode Username</label>
                  <input 
                    type="text" 
                    value={accountForm.leetcode_username} 
                    onChange={(e) => setAccountForm({ ...accountForm, leetcode_username: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6]" 
                    placeholder="leetcode_handle"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Target Company</label>
                  <div className="relative">
                    <select 
                      value={accountForm.target_company} 
                      onChange={(e) => setAccountForm({ ...accountForm, target_company: e.target.value })}
                      className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] appearance-none"
                    >
                      <option value="Google">Google</option>
                      <option value="Meta">Meta</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Apple">Apple</option>
                      <option value="OpenAI">OpenAI</option>
                      <option value="Stripe">Stripe</option>
                      <option value="FAANG (Any)">FAANG (Any)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#e1bfb7] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Bio</label>
                <textarea 
                  value={accountForm.bio} 
                  onChange={(e) => setAccountForm({ ...accountForm, bio: e.target.value })}
                  className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] resize-y" 
                  rows={3} 
                  placeholder="Building distributed systems and grinding LeetCode..."
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#EA5D3A] text-white px-8 py-3 rounded-md font-['Outfit'] text-xl font-bold hover:shadow-[0_0_15px_rgba(234,93,58,0.4)] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        {/* ─── TAB: PRIVACY ─── */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Privacy Settings</h2>
            
            <div className="flex items-center justify-between py-3 border-b border-[#59413b]/20">
              <div>
                <div className="font-['Inter'] text-lg text-[#e5e2e1] font-semibold">Public Profile</div>
                <div className="font-['Inter'] text-sm text-[#e1bfb7]">Allow other squad members to view your stats and activity feed.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={privacyForm.is_public} 
                  onChange={(e) => setPrivacyForm({ ...privacyForm, is_public: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#59413b]/20">
              <div>
                <div className="font-['Inter'] text-lg text-[#e5e2e1] font-semibold">Show Daily Streak</div>
                <div className="font-['Inter'] text-sm text-[#e1bfb7]">Display your active solve streak on your avatar across the squad.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={privacyForm.show_streak} 
                  onChange={(e) => setPrivacyForm({ ...privacyForm, show_streak: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-['Inter'] text-lg text-[#e5e2e1] font-semibold">Show Online Presence</div>
                <div className="font-['Inter'] text-sm text-[#e1bfb7]">Let members see when you are active in the squad lounge.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={privacyForm.show_online_status} 
                  onChange={(e) => setPrivacyForm({ ...privacyForm, show_online_status: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSavePrivacy} 
                disabled={isSaving}
                className="bg-[#EA5D3A] text-white px-8 py-3 rounded-md font-['Outfit'] text-xl font-bold hover:shadow-[0_0_15px_rgba(234,93,58,0.4)] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: NOTIFICATIONS ─── */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Notification Settings</h2>
            
            <div className="flex items-center justify-between py-3 border-b border-[#59413b]/20">
              <div>
                <div className="font-['Inter'] text-lg text-[#e5e2e1] font-semibold">Nudge Notifications</div>
                <div className="font-['Inter'] text-sm text-[#e1bfb7]">Get notified when squad members complete a hard problem or milestone.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifyForm.nudge_notifications} 
                  onChange={(e) => setNotifyForm({ ...notifyForm, nudge_notifications: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cd7f6]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#59413b]/20">
              <div>
                <div className="font-['Inter'] text-lg text-[#e5e2e1] font-semibold">Chat Mentions & DMs</div>
                <div className="font-['Inter'] text-sm text-[#e1bfb7]">Receive notifications when someone tags you in chat or sends a DM.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifyForm.chat_mentions} 
                  onChange={(e) => setNotifyForm({ ...notifyForm, chat_mentions: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cd7f6]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-['Inter'] text-lg text-[#e5e2e1] font-semibold">Daily Progress Digest</div>
                <div className="font-['Inter'] text-sm text-[#e1bfb7]">Receive a daily summary of squad leaderboard movements.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifyForm.daily_digest} 
                  onChange={(e) => setNotifyForm({ ...notifyForm, daily_digest: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cd7f6]"></div>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSaveNotifications} 
                disabled={isSaving}
                className="bg-[#EA5D3A] text-white px-8 py-3 rounded-md font-['Outfit'] text-xl font-bold hover:shadow-[0_0_15px_rgba(234,93,58,0.4)] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: SQUAD PREFERENCES ─── */}
        {activeTab === 'squad' && (
          <div className="space-y-8">
            <form onSubmit={handleSaveSquad} className="space-y-6">
              <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Squad Preferences</h2>
              
              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Squad Name</label>
                <input 
                  value={squadForm.name} 
                  onChange={(e) => setSquadForm({ ...squadForm, name: e.target.value })}
                  className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6]" 
                  type="text" 
                  placeholder="Squad Name"
                />
              </div>

              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Squad Type</label>
                <div className="relative">
                  <select 
                    value={squadForm.squad_type} 
                    onChange={(e) => setSquadForm({ ...squadForm, squad_type: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] appearance-none"
                  >
                    <option value="private">Private (Invite Only)</option>
                    <option value="public">Public</option>
                    <option value="community">Community Tier</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#e1bfb7] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider block">Primary Goal</label>
                <textarea 
                  value={squadForm.goal} 
                  onChange={(e) => setSquadForm({ ...squadForm, goal: e.target.value })}
                  className="w-full bg-[#201f1f] border border-[#59413b] rounded-md px-4 py-2 font-['Inter'] text-base text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] resize-y" 
                  rows={3} 
                  placeholder="e.g., Grinding LeetCode for FAANG interviews"
                ></textarea>
              </div>

              {(activeSquad?.invite_code || activeSquad?.code) && (
                <div className="p-4 rounded-xl bg-[#201f1f] border border-[#59413b]/40 flex items-center justify-between">
                  <div>
                    <span className="font-['JetBrains_Mono'] text-xs text-[#e1bfb7] uppercase block">Squad Invite Code</span>
                    <span className="font-['JetBrains_Mono'] text-lg font-bold text-[#4cd7f6]">
                      {activeSquad.invite_code || activeSquad.code}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={handleCopyInviteCode}
                    className="px-4 py-2 rounded-lg bg-[#4cd7f6]/10 border border-[#4cd7f6]/40 text-[#4cd7f6] hover:bg-[#4cd7f6]/20 transition-all font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span> Copy Code
                  </button>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-[#EA5D3A] text-white px-8 py-3 rounded-md font-['Outfit'] text-xl font-bold hover:shadow-[0_0_15px_rgba(234,93,58,0.4)] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Squad Preferences'}
                </button>
              </div>
            </form>

            <hr className="border-[#59413b]/30"/>

            <div className="space-y-6">
              <h2 className="font-['Outfit'] text-xl font-bold text-[#EF4444]">Danger Zone</h2>
              
              <div className="flex items-center justify-between py-3 border-b border-[#59413b]/20">
                <div>
                  <div className="font-['Inter'] text-lg text-[#e5e2e1] font-semibold">Leave Squad</div>
                  <div className="font-['Inter'] text-sm text-[#e1bfb7]">You will leave this squad and lose access to chat and resources.</div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowConfirmModal('leave')}
                  className="bg-transparent border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/15 px-4 py-2 rounded-md font-['JetBrains_Mono'] text-sm transition-colors font-bold cursor-pointer"
                >
                  Leave Squad
                </button>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-['Inter'] text-lg text-[#EF4444] font-semibold">Delete Squad</div>
                    <div className="font-['Inter'] text-sm text-[#e1bfb7]">Permanently delete this squad and all its associated data.</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowConfirmModal('delete')}
                    className="bg-[#EF4444] text-white hover:bg-red-600 px-4 py-2 rounded-md font-['JetBrains_Mono'] text-sm transition-colors font-bold shadow-lg shadow-red-500/20 cursor-pointer"
                  >
                    Delete Squad
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
