// require('dotenv').config();
const {Pool} = require('pg');
const {getPost} = require('./scraper.js');
const {insert: insertQuery, select: selectQuery} = require('./query.js');
const Discord = require('discord.js');

const {DISCORD_TOKEN, DISCORD_CHANNEL, SUBREDDIT, FETCH_DELAY} = process.env;

const config = {
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
}

const client = new Discord.Client();
const pool = new Pool(config)

async function insert(id) {
  try {
    const res = await pool.query(insertQuery, [id]);
    console.log(`Post ${id} inserted.`);
  } catch (err) {
    console.log(err.stack);
  }
};

async function select(id) {
  try {
    const res = await pool.query(selectQuery, [id]);
    return res.rowCount === 0;
  } catch (err) {
    console.log(err.stack);
  }
}

async function scrape() {
  const posts = await getPost(SUBREDDIT);
  return posts;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channel = client.channels.cache.get(DISCORD_CHANNEL)
  while (true) {
    scrape().then(
      posts => {
        posts.map(async(post) => {
          const newPost = await select(post.id);
          if (newPost) {
            const embed = new Discord.MessageEmbed();
            // embed.setColor('#AEC6CF');
            embed.setTitle(post.title);
            embed.setURL(post.url)
            embed.setImage(post.imageUrl);
            embed.setDescription(`By: [${post.author}](${post.authorUrl})`);
            try {
              channel.send(embed).then(
                insert(post.id)
              )
            } catch (error) {
              console.log('Error sending embed: ', error);
              return;
            }
          } else {
            console.log(`Post ${post.id} already in database.`);
          }
        })
      }
    );
    await sleep(parseInt(FETCH_DELAY));
  }
})

client.login(DISCORD_TOKEN);