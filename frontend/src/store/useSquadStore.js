import { create } from 'zustand';
import { supabase } from '../supabase';

export const useSquadStore = create((set, get) => ({
  mySquads: [],
  communitySquads: [],
  activeSquad: null,
  activeChannel: 'general',
  members: [],
  messages: [],
  snippets: [],
  challenges: [],
  loading: false,
  error: null,
  realtimeChannel: null,
  typingUsers: [],
  showMemberList: true,

  // Private DM State
  dmThreads: [],
  activeDMThread: null,
  dmMessages: [],
  dmRealtimeChannel: null,

  setActiveChannel: (channel) => set({ activeChannel: channel, activeDMThread: null }),
  toggleMemberList: () => set((s) => ({ showMemberList: !s.showMemberList })),

  // ─── Squads & Community Actions ───
  loadMySquads: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ loading: false }); return; }

      const { data: memberRows, error: memErr } = await supabase
        .from('squad_members').select('*').eq('user_id', user.id);
      if (memErr) throw memErr;

      const squadIds = (memberRows || []).map(m => m.squad_id);
      if (squadIds.length === 0) {
        set({ mySquads: [], activeSquad: null, members: [], loading: false });
        return;
      }

      const { data: squadsData, error: squadsErr } = await supabase
        .from('squads').select('*').in('id', squadIds);
      if (squadsErr) throw squadsErr;

      const roleMap = {};
      const rolesArrayMap = {};
      (memberRows || []).forEach(m => {
        roleMap[m.squad_id] = m.role || 'member';
        rolesArrayMap[m.squad_id] = m.roles || [m.role || 'member'];
      });

      const enrichedSquads = (squadsData || []).map(s => ({
        ...s,
        role: roleMap[s.id] || 'member',
        roles: rolesArrayMap[s.id] || ['member']
      }));

      set({ mySquads: enrichedSquads, loading: false });

      const currentActive = get().activeSquad;
      if (!currentActive || !enrichedSquads.some(s => s.id === currentActive.id)) {
        if (enrichedSquads.length > 0) get().setActiveSquad(enrichedSquads[0].id);
      }
    } catch (err) {
      console.error('Error loading my squads:', err);
      set({ error: err.message, loading: false });
    }
  },

  fetchCommunitySquads: async () => {
    try {
      const { data: squads, error } = await supabase
        .from('squads').select('*').eq('squad_type', 'community')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const squadIds = (squads || []).map(s => s.id);
      let countMap = {};
      if (squadIds.length > 0) {
        const { data: membersData } = await supabase
          .from('squad_members').select('squad_id').in('squad_id', squadIds);
        (membersData || []).forEach(m => {
          countMap[m.squad_id] = (countMap[m.squad_id] || 0) + 1;
        });
      }

      const enriched = (squads || []).map(s => ({
        ...s, member_count: countMap[s.id] || 0
      })).sort((a, b) => b.member_count - a.member_count);

      set({ communitySquads: enriched });
    } catch (err) { console.error('Error fetching community squads:', err); }
  },

  setActiveSquad: async (squadId) => {
    const { mySquads } = get();
    const target = mySquads.find(s => s.id === squadId);
    if (!target) return;
    set({ activeSquad: target, activeChannel: 'general', activeDMThread: null });
    await get().fetchSquadData(squadId);
    get().subscribeRealtime(squadId);
  },

  fetchSquadData: async (squadId) => {
    try {
      // 1. Fetch roster members with roles
      const { data: memberRows } = await supabase
        .from('squad_members').select('*').eq('squad_id', squadId);

      const userIds = [...new Set((memberRows || []).map(m => m.user_id))];
      let profileMap = {};
      let userProgressMap = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles').select('id, username, leetcode_username, discord_username')
          .in('id', userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });

        const { data: progress } = await supabase
          .from('user_progress').select('user_id, solved_at')
          .in('user_id', userIds);
        (progress || []).forEach(p => {
          if (p.solved_at) {
            const date = new Date(p.solved_at);
            const now = new Date();
            if ((now - date) / (1000 * 60 * 60) <= 24) {
              userProgressMap[p.user_id] = true;
            }
          }
        });
      }

      const members = (memberRows || []).map(m => {
        const prof = profileMap[m.user_id] || {};
        return {
          ...m,
          name: prof.username || prof.leetcode_username || 'Grinder',
          username: prof.username || prof.leetcode_username || '',
          leetcode_username: prof.leetcode_username || '',
          discord_username: prof.discord_username || '',
          roles: m.roles || [m.role || 'member'],
          isOnline: Boolean(userProgressMap[m.user_id])
        };
      });

      // 2. Fetch Chat History (last 80 messages) with profile resolution
      const { data: rawMessages } = await supabase
        .from('squad_messages')
        .select('*, profiles(username, leetcode_username)')
        .eq('squad_id', squadId)
        .order('created_at', { ascending: false })
        .limit(80);

      const enrichedMessages = (rawMessages || []).map(m => {
        const prof = m.profiles || {};
        return {
          ...m,
          author_name: prof.username || prof.leetcode_username || 'Member'
        };
      }).reverse();

      // 3. Fetch Code Snippets
      const { data: rawSnippets } = await supabase
        .from('squad_code_snippets').select('*').eq('squad_id', squadId)
        .order('created_at', { ascending: false }).limit(30);

      const snipUserIds = [...new Set((rawSnippets || []).map(s => s.user_id))];
      let snipProfileMap = {};
      if (snipUserIds.length > 0) {
        const { data: snipProfiles } = await supabase
          .from('profiles').select('id, username, leetcode_username')
          .in('id', snipUserIds);
        (snipProfiles || []).forEach(p => { snipProfileMap[p.id] = p; });
      }

      const enrichedSnippets = (rawSnippets || []).map(s => ({
        ...s,
        author: { name: snipProfileMap[s.user_id]?.username || snipProfileMap[s.user_id]?.leetcode_username || 'Member' }
      }));

      // 4. Fetch Weekly Challenge
      const today = new Date();
      const dayOfWeek = today.getDay();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: challenge } = await supabase
        .from('squad_weekly_challenges').select('*')
        .eq('squad_id', squadId).eq('week_start', weekStartStr).maybeSingle();

      set({
        members,
        messages: enrichedMessages,
        snippets: enrichedSnippets,
        challenges: challenge ? [challenge] : []
      });
    } catch (err) { console.error('Error fetching squad data:', err); }
  },

  createSquad: async ({ name, goal, squad_type = 'private', description }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('Squad name required');

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const maxMembers = squad_type === 'community' ? 100 : 10;

    const { data: newSquad, error: squadErr } = await supabase
      .from('squads').insert([{
        name: cleanName, goal: goal || null, squad_type,
        description: description || null, invite_code: inviteCode,
        code: inviteCode, created_by: user.id, max_members: maxMembers
      }]).select().single();
    if (squadErr) throw squadErr;

    const { error: memErr } = await supabase
      .from('squad_members').insert([{
        squad_id: newSquad.id,
        user_id: user.id,
        role: 'admin',
        roles: ['admin']
      }]);
    if (memErr) throw memErr;

    await get().loadMySquads();
    get().setActiveSquad(newSquad.id);
    return newSquad;
  },

  joinByCode: async (codeOrId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const cleanInput = (codeOrId || '').trim().toUpperCase();
    if (!cleanInput) throw new Error('Please enter a valid Squad Invite Code.');

    let targetSquad = null;
    const { data: byInvite } = await supabase
      .from('squads').select('*').ilike('invite_code', cleanInput).maybeSingle();
    if (byInvite) targetSquad = byInvite;

    if (!targetSquad) {
      const { data: byCode } = await supabase
        .from('squads').select('*').ilike('code', cleanInput).maybeSingle();
      if (byCode) targetSquad = byCode;
    }

    if (!targetSquad) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(codeOrId)) {
        const { data: byId } = await supabase
          .from('squads').select('*').eq('id', codeOrId).maybeSingle();
        if (byId) targetSquad = byId;
      }
    }

    if (!targetSquad) throw new Error(`No community squad found matching code "${codeOrId}".`);

    const { error: joinErr } = await supabase
      .from('squad_members').insert([{
        squad_id: targetSquad.id,
        user_id: user.id,
        role: 'member',
        roles: ['member']
      }]);
    if (joinErr) throw joinErr;

    await get().loadMySquads();
    get().setActiveSquad(targetSquad.id);
    return targetSquad;
  },

  leaveSquad: async (squadId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('squad_members').delete().eq('squad_id', squadId).eq('user_id', user.id);
    if (error) throw error;
    set({ activeSquad: null, members: [], messages: [], snippets: [], challenges: [] });
    await get().loadMySquads();
  },

  updateSquadSettings: async (squadId, { name, goal, description, squad_type }) => {
    const { error } = await supabase
      .from('squads')
      .update({ name, goal, description, squad_type })
      .eq('id', squadId);
    if (error) throw error;
    await get().loadMySquads();
    set((s) => ({ activeSquad: s.activeSquad ? { ...s.activeSquad, name, goal, description, squad_type } : null }));
  },

  setMemberRole: async (squadId, targetUserId, newRolesArray) => {
    const primaryRole = newRolesArray.includes('admin') ? 'admin' : newRolesArray.includes('moderator') ? 'moderator' : newRolesArray.includes('mentor') ? 'mentor' : 'member';
    const { error } = await supabase
      .from('squad_members')
      .update({ role: primaryRole, roles: newRolesArray })
      .eq('squad_id', squadId)
      .eq('user_id', targetUserId);

    if (error) throw error;
    await get().fetchSquadData(squadId);
  },

  deleteSquad: async (squadId) => {
    const { error } = await supabase.from('squads').delete().eq('id', squadId);
    if (error) throw error;
    set({ activeSquad: null, members: [], messages: [], snippets: [], challenges: [] });
    await get().loadMySquads();
  },

  // ─── Chat Message Actions ───
  sendMessage: async (content, messageType = 'text') => {
    const { activeSquad, messages } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!activeSquad || !user || !content.trim()) return;

    const { data: prof } = await supabase.from('profiles').select('username, leetcode_username').eq('id', user.id).maybeSingle();
    const author_name = prof?.username || prof?.leetcode_username || 'You';

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      squad_id: activeSquad.id,
      user_id: user.id,
      content: content.trim(),
      message_type: messageType,
      created_at: new Date().toISOString(),
      author_name
    };

    set({ messages: [...messages, tempMessage] });

    try {
      const { data, error } = await supabase
        .from('squad_messages')
        .insert([{
          squad_id: activeSquad.id,
          user_id: user.id,
          content: content.trim(),
          message_type: messageType
        }])
        .select()
        .single();

      if (error) throw error;

      set((s) => ({
        messages: s.messages.map(m => m.id === tempId ? { ...data, author_name } : m)
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
      set({ messages: messages.filter(m => m.id !== tempId) });
      throw err;
    }
  },

  deleteMessage: async (msgId) => {
    const { error } = await supabase.from('squad_messages').delete().eq('id', msgId);
    if (error) throw error;
    set((s) => ({ messages: s.messages.filter(m => m.id !== msgId) }));
  },

  sendTypingEvent: async () => {
    const { realtimeChannel } = get();
    if (!realtimeChannel) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prof } = await supabase.from('profiles').select('username, leetcode_username').eq('id', user.id).maybeSingle();
    const username = prof?.username || prof?.leetcode_username || 'Someone';

    realtimeChannel.send({
      type: 'broadcast', event: 'typing',
      payload: { user_id: user.id, username, timestamp: Date.now() }
    });
  },

  shareSnippet: async ({ title, code, language, problem_slug }) => {
    const { activeSquad } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!activeSquad || !user) return;
    const { error } = await supabase.from('squad_code_snippets').insert([{
      squad_id: activeSquad.id, user_id: user.id,
      title: title.trim(), code, language: language || 'javascript',
      problem_slug: problem_slug || null
    }]);
    if (error) throw error;
    await get().fetchSquadData(activeSquad.id);
  },

  // ─── Realtime Subscriptions ───
  subscribeRealtime: (squadId) => {
    get().unsubscribeRealtime();

    const channel = supabase
      .channel(`squad-realtime-${squadId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'squad_messages',
        filter: `squad_id=eq.${squadId}`
      }, async (payload) => {
        const newMsg = payload.new;
        const currentMessages = get().messages;
        if (currentMessages.some(m => m.id === newMsg.id)) return;

        const { data: prof } = await supabase.from('profiles')
          .select('username, leetcode_username').eq('id', newMsg.user_id).maybeSingle();
        const author_name = prof?.username || prof?.leetcode_username || 'Member';

        set((state) => ({
          messages: [...state.messages.filter(m => !m.id.toString().startsWith('temp-')), { ...newMsg, author_name }]
        }));
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'squad_messages',
        filter: `squad_id=eq.${squadId}`
      }, (payload) => {
        set((s) => ({ messages: s.messages.filter(m => m.id !== payload.old.id) }));
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'squad_members',
        filter: `squad_id=eq.${squadId}`
      }, () => { get().fetchSquadData(squadId); })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const typingUsername = payload?.payload?.username || 'Someone';
        const { typingUsers } = get();
        if (!typingUsers.includes(typingUsername)) {
          set({ typingUsers: [...typingUsers, typingUsername] });
        }
        setTimeout(() => {
          set((s) => ({ typingUsers: s.typingUsers.filter(n => n !== typingUsername) }));
        }, 3000);
      })
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeRealtime: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null, typingUsers: [] });
    }
  },

  // ─── Private DM System ───
  loadDMThreads: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: threads, error } = await supabase
        .from('dm_threads')
        .select('*')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const threadIds = (threads || []).map(t => t.id);
      const partnerIds = (threads || []).map(t => t.participant_a === user.id ? t.participant_b : t.participant_a);

      let profileMap = {};
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, leetcode_username')
          .in('id', partnerIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }

      let lastMsgMap = {};
      let unreadMap = {};
      if (threadIds.length > 0) {
        const { data: lastMsgs } = await supabase
          .from('dm_messages')
          .select('*')
          .in('thread_id', threadIds)
          .order('created_at', { ascending: false });

        (lastMsgs || []).forEach(m => {
          if (!lastMsgMap[m.thread_id]) lastMsgMap[m.thread_id] = m;
          if (!m.read && m.sender_id !== user.id) {
            unreadMap[m.thread_id] = (unreadMap[m.thread_id] || 0) + 1;
          }
        });
      }

      const enriched = (threads || []).map(t => {
        const partnerId = t.participant_a === user.id ? t.participant_b : t.participant_a;
        const prof = profileMap[partnerId] || {};
        const lastMsg = lastMsgMap[t.id];
        return {
          ...t,
          partnerId,
          partnerName: prof.username || prof.leetcode_username || 'Grinder',
          leetcode_username: prof.leetcode_username || '',
          lastMessage: lastMsg?.content || 'Started a conversation',
          lastTime: lastMsg?.created_at || t.created_at,
          unreadCount: unreadMap[t.id] || 0
        };
      });

      set({ dmThreads: enriched });
    } catch (err) {
      console.error('Error loading DM threads:', err);
    }
  },

  openDM: async (partnerId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !partnerId) return;

      // Normalize pair (smaller UUID = participant_a)
      const [partA, partB] = [user.id, partnerId].sort();

      let targetThread = null;
      const { data: existing } = await supabase
        .from('dm_threads')
        .select('*')
        .eq('participant_a', partA)
        .eq('participant_b', partB)
        .maybeSingle();

      if (existing) {
        targetThread = existing;
      } else {
        const { data: newThread, error } = await supabase
          .from('dm_threads')
          .insert([{ participant_a: partA, participant_b: partB }])
          .select()
          .single();
        if (error) throw error;
        targetThread = newThread;
      }

      const { data: partnerProf } = await supabase
        .from('profiles')
        .select('username, leetcode_username')
        .eq('id', partnerId)
        .maybeSingle();

      const activeObj = {
        ...targetThread,
        partnerId,
        partnerName: partnerProf?.username || partnerProf?.leetcode_username || 'Grinder',
        leetcode_username: partnerProf?.leetcode_username || ''
      };

      set({ activeDMThread: activeObj, activeChannel: 'dms' });
      await get().fetchDMMessages(targetThread.id);
      await get().markDMRead(targetThread.id);
      get().subscribeDMs(targetThread.id);
    } catch (err) {
      console.error('Error opening DM:', err);
    }
  },

  fetchDMMessages: async (threadId) => {
    try {
      const { data: msgs, error } = await supabase
        .from('dm_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const senderIds = [...new Set((msgs || []).map(m => m.sender_id))];
      let profileMap = {};
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, leetcode_username')
          .in('id', senderIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }

      const enriched = (msgs || []).map(m => {
        const prof = profileMap[m.sender_id] || {};
        return {
          ...m,
          author_name: prof.username || prof.leetcode_username || 'User'
        };
      });

      set({ dmMessages: enriched });
    } catch (err) {
      console.error('Error fetching DM messages:', err);
      set({ dmMessages: [] });
    }
  },

  sendDM: async (content) => {
    const { activeDMThread, dmMessages } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!activeDMThread || !user || !content.trim()) return;

    const tempId = `temp-dm-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      thread_id: activeDMThread.id,
      sender_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      read: false,
      author_name: 'You'
    };

    set({ dmMessages: [...dmMessages, tempMsg] });

    try {
      const { data, error } = await supabase
        .from('dm_messages')
        .insert([{
          thread_id: activeDMThread.id,
          sender_id: user.id,
          content: content.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      set((s) => ({
        dmMessages: s.dmMessages.map(m => m.id === tempId ? { ...data, author_name: 'You' } : m)
      }));

      get().loadDMThreads();
    } catch (err) {
      console.error('Error sending DM:', err);
      set({ dmMessages: dmMessages.filter(m => m.id !== tempId) });
    }
  },

  markDMRead: async (threadId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !threadId) return;

    await supabase
      .from('dm_messages')
      .update({ read: true })
      .eq('thread_id', threadId)
      .neq('sender_id', user.id);

    get().loadDMThreads();
  },

  subscribeDMs: (threadId) => {
    if (get().dmRealtimeChannel) {
      supabase.removeChannel(get().dmRealtimeChannel);
    }

    const channel = supabase
      .channel(`dm-realtime-${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'dm_messages',
        filter: `thread_id=eq.${threadId}`
      }, async (payload) => {
        const newMsg = payload.new;
        const currentMsgs = get().dmMessages;
        if (currentMsgs.some(m => m.id === newMsg.id)) return;

        const { data: prof } = await supabase.from('profiles')
          .select('username, leetcode_username').eq('id', newMsg.sender_id).maybeSingle();
        const author_name = prof?.username || prof?.leetcode_username || 'User';

        set((s) => ({
          dmMessages: [...s.dmMessages.filter(m => !m.id.toString().startsWith('temp-dm-')), { ...newMsg, author_name }]
        }));

        get().markDMRead(threadId);
      })
      .subscribe();

    set({ dmRealtimeChannel: channel });
  }
}));
