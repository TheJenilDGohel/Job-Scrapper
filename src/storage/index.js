require('dotenv').config();
const SqliteStorage = require('./sqliteStorage');
const SupabaseStorage = require('./supabaseStorage');

function getStorage() {
  const type = process.env.STORAGE_TYPE || 'sqlite';
  
  if (type === 'supabase') {
    return new SupabaseStorage(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }
  
  return new SqliteStorage('jobs.db');
}

module.exports = { getStorage };
