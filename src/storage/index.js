require('dotenv').config();
const SqliteStorage = require('./sqliteStorage');
const SupabaseStorage = require('./supabaseStorage');

/**
 * Hybrid Storage Strategy
 * Defaults to Local SQLite for 100% free usage.
 * Supports Supabase for cloud sync/backup if configured.
 */
function getStorage() {
  const type = process.env.STORAGE_TYPE || 'sqlite';
  
  if (type === 'supabase' && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    console.log('☁️  Connected to Supabase Cloud Storage');
    return new SupabaseStorage(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }
  
  console.log('📁 Using Local SQLite Storage');
  return new SqliteStorage('jobs.db');
}

module.exports = { getStorage };
