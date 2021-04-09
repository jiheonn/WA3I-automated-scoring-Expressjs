const mysql = require('mysql');
const config = require('./config.json');

const db = mysql.createConnection(config.db);

db.connect((err) => {
  if (err) throw err;
});

module.exports = db;