const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'freelancerguard'
  });

  console.log('🔍 Checking experiences table structure...');

  try {
    const [columns] = await connection.query('DESCRIBE experiences');
    console.log('\n📋 Experiences table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULLABLE)'} ${col.Default ? `Default: ${col.Default}` : ''}`);
    });

  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  } finally {
    await connection.end();
  }
}

checkTableStructure();
