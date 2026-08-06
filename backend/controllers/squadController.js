const supabase = require('../config/supabaseClient');
const { generateSquadCode } = require('../config/squadInit');

// ── CREATE SQUAD ─────────────────────────────────────────────
const createSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, goal, avatar_url } = req.body;
    const squadName = (name || '').trim();
    if (!squadName) return res.status(400).json({ error: 'Please provide a name for your squad.' });

    let code = generateSquadCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase.from('squads').select('id').eq('code', code).maybeSingle();
      if (!existing) break;
      code = generateSquadCode();
      attempts++;
    }

    const { data: newSquad, error: createError } = await supabase
      .from('squads')
      .insert([{ name: squadName, code, created_by: userId, goal: goal || null, avatar_url: avatar_url || null, max_members: 10 }])
      .select()
      .single();

    if (createError) return res.status(500).json({ error: 'Failed to create squad.' });

    await supabase.from('squad_members').delete().eq('user_id', userId);
    const { error: memberError } = await supabase
      .from('squad_members')
      .insert([{ squad_id: newSquad.id, user_id: userId, role: 'leader' }]);

    if (memberError) return res.status(500).json({ error: 'Failed to assign squad leadership.' });

    // Post system message
    await supabase.from('squad_messages').insert([{
      squad_id: newSquad.id, user_id: userId, content: `Squad "${squadName}" was created! 🎉`, message_type: 'system'
    }]);

    return res.status(201).json({ message: `Squad "${squadName}" created!`, squad: newSquad, squadCode: code });
  } catch (error) {
    console.error('Error in createSquad:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── JOIN SQUAD ───────────────────────────────────────────────
const joinSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { squadCode, squadId, code: codeInput } = req.body;
    const rawInput = (squadCode || squadId || codeInput || '').trim();
    if (!rawInput) return res.status(400).json({ error: 'Please enter a Squad Code.' });

    const cleanInput = rawInput.toUpperCase();
    let targetSquad = null;

    const { data: byCode } = await supabase.from('squads').select('*').ilike('code', cleanInput).maybeSingle();
    if (byCode) targetSquad = byCode;

    if (!targetSquad) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(rawInput)) {
        const { data: byId } = await supabase.from('squads').select('*').eq('id', rawInput).maybeSingle();
        if (byId) targetSquad = byId;
      }
    }

    if (!targetSquad) return res.status(404).json({ error: `No squad found matching "${rawInput}".` });

    // Check member cap
    const { count } = await supabase.from('squad_members').select('*', { count: 'exact', head: true }).eq('squad_id', targetSquad.id);
    const maxMembers = targetSquad.max_members || 10;
    if (count >= maxMembers) return res.status(400).json({ error: `This squad is full (${maxMembers}/${maxMembers} members).` });

    const { data: existingMember } = await supabase.from('squad_members').select('*').eq('squad_id', targetSquad.id).eq('user_id', userId).maybeSingle();
    if (existingMember) return res.status(400).json({ error: `You are already in "${targetSquad.name}".` });

    await supabase.from('squad_members').delete().eq('user_id', userId);
    const { error: joinError } = await supabase.from('squad_members').insert([{ squad_id: targetSquad.id, user_id: userId, role: 'member' }]);
    if (joinError) return res.status(500).json({ error: 'Failed to join squad.' });

    // System message
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
    await supabase.from('squad_messages').insert([{
      squad_id: targetSquad.id, user_id: userId, content: `${profile?.name || 'A new member'} joined the squad! 👋`, message_type: 'system'
    }]);

    return res.json({ message: `Joined "${targetSquad.name}"!`, squad: targetSquad });
  } catch (error) {
    console.error('Error in joinSquad:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── LEAVE SQUAD ──────────────────────────────────────────────
const leaveSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();

    await supabase.from('squad_members').delete().eq('user_id', userId);

    if (memberRow) {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
      await supabase.from('squad_messages').insert([{
        squad_id: memberRow.squad_id, user_id: userId, content: `${profile?.name || 'A member'} left the squad.`, message_type: 'system'
      }]);
    }

    return res.json({ message: 'You have left your squad.' });
  } catch (error) {
    console.error('Error in leaveSquad:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── GET SQUAD DETAILS ────────────────────────────────────────
const getSquadDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('*, squad:squads(*)').eq('user_id', userId).maybeSingle();

    if (!memberRow || !memberRow.squad) return res.json({ inSquad: false, squad: null, members: [], role: null });

    const { data: members } = await supabase.from('squad_members').select('*, profile:profiles(*)').eq('squad_id', memberRow.squad_id);

    return res.json({
      inSquad: true,
      squad: memberRow.squad,
      role: memberRow.role,
      members: (members || []).map(m => ({ ...m.profile, role: m.role, is_muted: m.is_muted, weekly_solved: m.weekly_solved, joined_at: m.joined_at }))
    });
  } catch (error) {
    console.error('Error in getSquadDetails:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── CHAT: GET MESSAGES ───────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const { data: messages, error } = await supabase
      .from('squad_messages')
      .select('*, profile:profiles!squad_messages_user_id_fkey(id, name, username, avatar_url)')
      .eq('squad_id', memberRow.squad_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // Fallback without profile join if FK doesn't exist
      const { data: fallbackMessages } = await supabase
        .from('squad_messages')
        .select('*')
        .eq('squad_id', memberRow.squad_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return res.json({ messages: (fallbackMessages || []).reverse() });
    }

    return res.json({ messages: (messages || []).reverse() });
  } catch (error) {
    console.error('Error in getMessages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── CHAT: SEND MESSAGE ───────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, message_type } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id, is_muted').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });
    if (memberRow.is_muted) return res.status(403).json({ error: 'You are muted in this squad.' });

    const { data: msg, error } = await supabase
      .from('squad_messages')
      .insert([{ squad_id: memberRow.squad_id, user_id: userId, content: content.trim(), message_type: message_type || 'text' }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to send message.' });
    return res.status(201).json({ message: msg });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── CODE SNIPPETS: GET ───────────────────────────────────────
const getSnippets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const { data: snippets } = await supabase
      .from('squad_code_snippets')
      .select('*')
      .eq('squad_id', memberRow.squad_id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Attach author profiles
    const userIds = [...new Set((snippets || []).map(s => s.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds);
    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    const enriched = (snippets || []).map(s => ({ ...s, author: profileMap[s.user_id] || null }));
    return res.json({ snippets: enriched });
  } catch (error) {
    console.error('Error in getSnippets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── CODE SNIPPETS: POST ──────────────────────────────────────
const createSnippet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, code, language, problem_slug } = req.body;
    if (!title || !code) return res.status(400).json({ error: 'Title and code are required.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id, is_muted').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });
    if (memberRow.is_muted) return res.status(403).json({ error: 'You are muted.' });

    const { data: snippet, error } = await supabase
      .from('squad_code_snippets')
      .insert([{ squad_id: memberRow.squad_id, user_id: userId, title, code, language: language || 'javascript', problem_slug: problem_slug || null }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to share snippet.' });

    // Post system notification in chat
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
    await supabase.from('squad_messages').insert([{
      squad_id: memberRow.squad_id, user_id: userId,
      content: `💻 ${profile?.name || 'Someone'} shared a solution: "${title}"`,
      message_type: 'code'
    }]);

    return res.status(201).json({ snippet });
  } catch (error) {
    console.error('Error in createSnippet:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── SNIPPET COMMENTS: GET ────────────────────────────────────
const getSnippetComments = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const { data: comments } = await supabase
      .from('squad_snippet_comments')
      .select('*')
      .eq('snippet_id', snippetId)
      .order('created_at', { ascending: true });

    const userIds = [...new Set((comments || []).map(c => c.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds.length ? userIds : ['none']);
    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    const enriched = (comments || []).map(c => ({ ...c, author: profileMap[c.user_id] || null }));
    return res.json({ comments: enriched });
  } catch (error) {
    console.error('Error in getSnippetComments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── SNIPPET COMMENTS: POST ───────────────────────────────────
const addSnippetComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const snippetId = req.params.id;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Comment cannot be empty.' });

    const { data: comment, error } = await supabase
      .from('squad_snippet_comments')
      .insert([{ snippet_id: snippetId, user_id: userId, content: content.trim() }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to add comment.' });
    return res.status(201).json({ comment });
  } catch (error) {
    console.error('Error in addSnippetComment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── WEEKLY CHALLENGE: GET ────────────────────────────────────
const getWeeklyChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    // Get current week's challenge
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data: challenge } = await supabase
      .from('squad_weekly_challenges')
      .select('*')
      .eq('squad_id', memberRow.squad_id)
      .eq('week_start', weekStartStr)
      .maybeSingle();

    return res.json({ challenge: challenge || null, weekStart: weekStartStr });
  } catch (error) {
    console.error('Error in getWeeklyChallenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── WEEKLY CHALLENGE: VOTE ───────────────────────────────────
const voteWeeklyChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { problems } = req.body;
    if (!Array.isArray(problems) || problems.length === 0) return res.status(400).json({ error: 'Provide problems array.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Upsert weekly challenge
    const { data: existing } = await supabase.from('squad_weekly_challenges')
      .select('*').eq('squad_id', memberRow.squad_id).eq('week_start', weekStartStr).maybeSingle();

    if (existing) {
      const newVotes = { ...existing.votes, [userId]: problems };
      await supabase.from('squad_weekly_challenges')
        .update({ votes: newVotes, problems: problems.slice(0, 5) })
        .eq('id', existing.id);
    } else {
      await supabase.from('squad_weekly_challenges')
        .insert([{ squad_id: memberRow.squad_id, week_start: weekStartStr, problems: problems.slice(0, 5), votes: { [userId]: problems }, status: 'active' }]);
    }

    return res.json({ message: 'Vote recorded!' });
  } catch (error) {
    console.error('Error in voteWeeklyChallenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── DAILY STANDUP ────────────────────────────────────────────
const postStandup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Standup message required.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const { data: msg, error } = await supabase.from('squad_messages')
      .insert([{ squad_id: memberRow.squad_id, user_id: userId, content: content.trim(), message_type: 'standup' }])
      .select().single();

    if (error) return res.status(500).json({ error: 'Failed to post standup.' });
    return res.status(201).json({ message: msg });
  } catch (error) {
    console.error('Error in postStandup:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── SQUAD LEADERBOARD ────────────────────────────────────────
const getLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const { data: members } = await supabase
      .from('squad_members')
      .select('*, profile:profiles(*)')
      .eq('squad_id', memberRow.squad_id)
      .order('weekly_solved', { ascending: false });

    // Count comments per user (help score)
    const { data: snippets } = await supabase.from('squad_code_snippets').select('id').eq('squad_id', memberRow.squad_id);
    const snippetIds = (snippets || []).map(s => s.id);

    let commentCounts = {};
    if (snippetIds.length > 0) {
      const { data: comments } = await supabase.from('squad_snippet_comments').select('user_id').in('snippet_id', snippetIds);
      (comments || []).forEach(c => { commentCounts[c.user_id] = (commentCounts[c.user_id] || 0) + 1; });
    }

    const leaderboard = (members || []).map((m, idx) => ({
      rank: idx + 1,
      userId: m.user_id,
      name: m.profile?.name || 'Unknown',
      username: m.profile?.username || '',
      avatar_url: m.profile?.avatar_url || null,
      role: m.role,
      weekly_solved: m.weekly_solved || 0,
      helps: commentCounts[m.user_id] || 0,
      points: (m.weekly_solved || 0) * 10 + (commentCounts[m.user_id] || 0) * 5
    }));

    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((m, i) => { m.rank = i + 1; });

    return res.json({ leaderboard });
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── REPORT MEMBER ────────────────────────────────────────────
const reportMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reported_user_id, reason } = req.body;
    if (!reported_user_id || !reason) return res.status(400).json({ error: 'User and reason required.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    await supabase.from('squad_reports').insert([{
      squad_id: memberRow.squad_id, reporter_id: userId, reported_user_id, reason
    }]);

    return res.json({ message: 'Report submitted. Squad admins will review.' });
  } catch (error) {
    console.error('Error in reportMember:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── MUTE MEMBER (Admin) ─────────────────────────────────────
const muteMember = async (req, res) => {
  try {
    const adminId = req.user.id;
    const targetUserId = req.params.userId;

    const { data: adminRow } = await supabase.from('squad_members').select('squad_id, role').eq('user_id', adminId).maybeSingle();
    if (!adminRow || adminRow.role !== 'leader') return res.status(403).json({ error: 'Only squad leaders can mute members.' });

    const { data: targetRow } = await supabase.from('squad_members').select('is_muted').eq('squad_id', adminRow.squad_id).eq('user_id', targetUserId).maybeSingle();
    if (!targetRow) return res.status(404).json({ error: 'Member not found in squad.' });

    await supabase.from('squad_members').update({ is_muted: !targetRow.is_muted }).eq('squad_id', adminRow.squad_id).eq('user_id', targetUserId);

    return res.json({ message: targetRow.is_muted ? 'Member unmuted.' : 'Member muted.' });
  } catch (error) {
    console.error('Error in muteMember:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── KICK MEMBER (Admin) ─────────────────────────────────────
const kickMember = async (req, res) => {
  try {
    const adminId = req.user.id;
    const targetUserId = req.params.userId;

    const { data: adminRow } = await supabase.from('squad_members').select('squad_id, role').eq('user_id', adminId).maybeSingle();
    if (!adminRow || adminRow.role !== 'leader') return res.status(403).json({ error: 'Only squad leaders can remove members.' });

    if (adminId === targetUserId) return res.status(400).json({ error: 'You cannot kick yourself.' });

    await supabase.from('squad_members').delete().eq('squad_id', adminRow.squad_id).eq('user_id', targetUserId);

    const { data: profile } = await supabase.from('profiles').select('name').eq('id', targetUserId).maybeSingle();
    await supabase.from('squad_messages').insert([{
      squad_id: adminRow.squad_id, user_id: adminId,
      content: `${profile?.name || 'A member'} was removed from the squad.`,
      message_type: 'system'
    }]);

    return res.json({ message: 'Member removed from squad.' });
  } catch (error) {
    console.error('Error in kickMember:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── AUTO ENSURE ──────────────────────────────────────────────
const autoEnsureUserSquad = async (userId, userProfile) => {
  try {
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (memberRow && memberRow.squad_id) return memberRow.squad_id;

    const defaultName = `${userProfile.name || 'Grind'}'s Squad`;
    const code = generateSquadCode();
    const { data: newSquad, error: createError } = await supabase
      .from('squads')
      .insert([{ name: defaultName, code, created_by: userId }])
      .select().single();

    if (!createError && newSquad) {
      await supabase.from('squad_members').insert([{ squad_id: newSquad.id, user_id: userId, role: 'leader' }]);
      return newSquad.id;
    }
  } catch (err) {
    console.error('Error in autoEnsureUserSquad:', err);
  }
  return null;
};

module.exports = {
  createSquad, joinSquad, leaveSquad, getSquadDetails,
  getMessages, sendMessage,
  getSnippets, createSnippet,
  getSnippetComments, addSnippetComment,
  getWeeklyChallenge, voteWeeklyChallenge,
  postStandup, getLeaderboard,
  reportMember, muteMember, kickMember,
  autoEnsureUserSquad
};
