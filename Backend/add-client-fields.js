const mysql = require('mysql2/promise');

async function addClientNameColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'freelancerguard'
  });

  console.log('🔧 Adding client_name column to experiences table...');

  try {
    // Add client_name column if it doesn't exist
    await connection.query(`
      ALTER TABLE experiences 
      ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS client_email VARCHAR(255)
    `);
    
    console.log('✅ Client name and email columns added successfully!');

  } catch (error) {
    console.error('❌ Error adding columns:', error);
  } finally {
    await connection.end();
  }
}

addClientNameColumn();
