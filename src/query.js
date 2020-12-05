module.exports = {
  insert: 'INSERT INTO reddit(post_id) VALUES($1)',
  select: 'SELECT post_id FROM reddit WHERE post_id = $1'
}