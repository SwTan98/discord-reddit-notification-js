// require('dotenv').config();
const snoowrap = require('snoowrap');

const {REDDIT_ID, REDDIT_SECRET, REDDIT_REFRESH, USER_AGENT, FETCH_LIMIT} = process.env;
const r = new snoowrap({
  userAgent: USER_AGENT,
  clientId: REDDIT_ID,
  clientSecret: REDDIT_SECRET,
  refreshToken: REDDIT_REFRESH,
});

async function getPost(subreddit) {
  const submissions = await r.getSubreddit(subreddit).getNew({limit: FETCH_LIMIT});
  const posts = [];
  submissions.map(submission => {
    const post = {
      id: submission.id,
      author: submission.author.name,
      authorUrl: `https://reddit.com/${submission.author.name}`,
      title: submission.title,
      url: `https://reddit.com${submission.permalink}`,
      imageUrl: submission.url,
    }
    posts.push(post);
  });
  return posts;
};

module.exports = {
  getPost,
}