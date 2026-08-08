const inspectLeetCode = async () => {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `
          query getUserData($username: String!) {
            matchedUser(username: $username) {
              username
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
              profile {
                ranking
                reputation
              }
            }
            recentAcSubmissionList(username: $username, limit: 200) {
              title
              titleSlug
              timestamp
            }
          }
        `,
        variables: { username: 'Abhishek_jb007' }
      })
    });
    const data = await res.json();
    console.log('UserData:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
};
inspectLeetCode();
