const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  // Clear all tables in dependency order before reseeding
  await pool.query(`
    TRUNCATE TABLE
      notifications,
      activity_logs,
      project_applications,
      project_tags,
      tasks,
      project_members,
      user_skills,
      projects,
      users
    RESTART IDENTITY CASCADE
  `);
  console.log('Tables cleared.');

  const raw = fs.readFileSync('../database/seed.sql', 'utf8');
  const sql = raw.split('\n').filter((l) => !l.startsWith('\\')).join('\n');

  await pool.query(sql);
  console.log('Seed done.');
  await pool.end();
}

run().catch((e) => { console.error(e.message); pool.end(); });
