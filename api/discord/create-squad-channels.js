import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: 'Unauthorized user token' });
    }

    const { squadId, squadName } = req.body;
    if (!squadId || !squadName) {
      return res.status(400).json({ error: 'Squad ID and squad name required' });
    }

    // Verify caller is admin of target squad
    const { data: memberRow } = await supabase
      .from('squad_members')
      .select('role')
      .eq('squad_id', squadId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!memberRow || (memberRow.role !== 'admin' && memberRow.role !== 'leader')) {
      return res.status(403).json({ error: 'Only squad admins can connect Discord' });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_SERVER_ID;

    if (!botToken || !guildId) {
      return res.status(500).json({ error: 'Discord integration server environment variables missing' });
    }

    const headers = {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json'
    };

    // a) Create Discord Category Channel (type 4)
    const categoryRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: `🎯 ${squadName}`,
        type: 4
      })
    });
    const categoryData = await categoryRes.json();
    if (!categoryRes.ok) {
      throw new Error(categoryData.message || 'Failed to create Discord category');
    }

    const categoryId = categoryData.id;

    // b) Create Text Channel (type 0) inside category
    const textChannelRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: '💬-squad-chat',
        type: 0,
        parent_id: categoryId
      })
    });
    const textChannelData = await textChannelRes.json();
    if (!textChannelRes.ok) {
      throw new Error(textChannelData.message || 'Failed to create text channel');
    }

    // Create Voice Channel (type 2) inside category
    await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: '🎙-mock-interviews',
        type: 2,
        parent_id: categoryId
      })
    });

    // c) Create invite URL for text channel
    const inviteRes = await fetch(`https://discord.com/api/v10/channels/${textChannelData.id}/invites`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        max_age: 0,
        max_uses: 0,
        unique: true
      })
    });
    const inviteData = await inviteRes.json();
    if (!inviteRes.ok) {
      throw new Error(inviteData.message || 'Failed to create Discord invite link');
    }

    const inviteUrl = `https://discord.gg/${inviteData.code}`;

    // d) Update squad record in Supabase
    await supabase
      .from('squads')
      .update({
        discord_category_id: categoryId,
        discord_invite_url: inviteUrl
      })
      .eq('id', squadId);

    // e) Return invite URL
    return res.status(200).json({
      success: true,
      inviteUrl,
      categoryId
    });
  } catch (err) {
    console.error('Error creating squad Discord channels:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
