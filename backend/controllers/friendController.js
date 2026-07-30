const supabase = require('../config/supabaseClient');

/**
 * POST /api/friends/add
 * Accept { friendLeetcodeUsername }
 * Finds user profile by LeetCode username and adds to user's friends list
 */
const addFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendLeetcodeUsername } = req.body;

    if (!friendLeetcodeUsername || !friendLeetcodeUsername.trim()) {
      return res.status(400).json({ error: 'LeetCode username is required.' });
    }

    const targetUsername = friendLeetcodeUsername.trim();

    // 1. Find profile in `profiles` table
    const { data: friendProfile, error: searchError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('leetcode_username', targetUsername)
      .maybeSingle();

    if (searchError) {
      console.error('Error searching profile:', searchError);
      return res.status(500).json({ error: 'Database error searching for friend.' });
    }

    if (!friendProfile) {
      return res.status(404).json({
        error: `User with LeetCode handle "${targetUsername}" has not registered on GrindFam yet.`
      });
    }

    // 2. Prevent adding oneself
    if (friendProfile.id === userId) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
    }

    // 3. Check if already added
    const { data: existingFriend, error: checkError } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', userId)
      .eq('friend_id', friendProfile.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing friend:', checkError);
      return res.status(500).json({ error: 'Database error checking friendship.' });
    }

    if (existingFriend) {
      return res.status(400).json({ error: 'This user is already in your friends list.' });
    }

    // 4. Insert into friends table
    const { data: newFriend, error: insertError } = await supabase
      .from('friends')
      .insert([
        {
          user_id: userId,
          friend_id: friendProfile.id
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting friend:', insertError);
      return res.status(500).json({ error: 'Failed to add friend.' });
    }

    return res.status(201).json({
      message: 'Friend added successfully!',
      friend: friendProfile,
      relationship: newFriend
    });
  } catch (error) {
    console.error('Error in addFriend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/friends/remove/:id
 * Remove friend by target friend profile ID
 */
const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendTargetId = req.params.id;

    if (!friendTargetId) {
      return res.status(400).json({ error: 'Friend ID is required.' });
    }

    // Delete record from friends table matching user_id and friend_id
    const { error: deleteError } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendTargetId);

    if (deleteError) {
      console.error('Error deleting friend:', deleteError);
      return res.status(500).json({ error: 'Failed to remove friend.' });
    }

    return res.json({ message: 'Friend removed successfully.' });
  } catch (error) {
    console.error('Error in removeFriend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addFriend,
  removeFriend
};
