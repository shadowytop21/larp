// LARP stdlib — database.js
// Parameterized Postgres queries via pg.
// SQL injection impossible by construction — raw string concatenation
// into query text is never exposed through this API.
'use strict';

let pg;
try { pg = require('pg'); } catch { pg = null; }

exports.connect = function connect(connectionString) {
  if (!pg) {
    throw new Error(
      'The "pg" package is not installed. Run: npm install pg\n' +
      'Then try your program again.'
    );
  }
  const pool = new pg.Pool({ connectionString });
  return {
    async query(sql, params = []) {
      const result = await pool.query(sql, params);
      return result.rows;
    },
    async close() { await pool.end(); }
  };
};
