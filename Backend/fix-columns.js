const mysql = require('mysql2/promise');

async function addMissingColumns() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'freelancerguard'
    });

    console.log('Connected to database');

    // Check current structure of experiences table
    const [columns] = await connection.execute('DESCRIBE experiences');
    console.log('Current experiences table columns:');
    columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));

    // Add missing columns one by one
    const columnsToAdd = [
      'upvotes INT DEFAULT 0',
      'downvotes INT DEFAULT 0', 
      'comment_count INT DEFAULT 0'
    ];

    for (const column of columnsToAdd) {
      try {
        await connection.execute(`ALTER TABLE experiences ADD COLUMN ${column}`);
        console.log(`✅ Added column: ${column}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Column already exists: ${column.split(' ')[0]}`);
        } else {
          console.error(`❌ Error adding column ${column}:`, error.message);
        }
      }
    }

    // Show final structure
    const [finalColumns] = await connection.execute('DESCRIBE experiences');
    console.log('\nFinal experiences table columns:');
    finalColumns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));

    await connection.end();
    console.log('\n🎉 Column check completed!');
  } catch (error) {
    console.error('❌ Database operation failed:', error);
  }
}

addMissingColumns();
