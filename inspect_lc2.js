const inspectLeetCode2 = async () => {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `
          query userQuestionProgress($userSlug: String!) {
            userProfileUserQuestionProgressV2(userSlug: $userSlug) {
              numAcceptedQuestions {
                count
              }
              numFailedQuestions {
                count
              }
              numUntouchedQuestions {
                count
              }
              userSessionProgress {
                difficulty
                count
              }
            }
          }
        `,
        variables: { userSlug: 'Abhishek_jb007' }
      })
    });
    const data = await res.json();
    console.log('QuestionProgress:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
};
inspectLeetCode2();
