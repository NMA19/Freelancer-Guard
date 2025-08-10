const mysql = require('mysql2/promise');

// Database setup script
async function setupVotesAndComments() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'freelancerguard'
    });

    console.log('Connected to database');

    // Add columns to experiences table
    try {
      await connection.execute(`
        ALTER TABLE experiences 
        ADD COLUMN upvotes INT DEFAULT 0,
        ADD COLUMN downvotes INT DEFAULT 0,
        ADD COLUMN comment_count INT DEFAULT 0
      `);
      console.log('✅ Added columns to experiences table');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Columns may already exist:', error.message);
      } else {
        console.log('✅ Columns already exist in experiences table');
      }
    }

    // Create experience_votes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS experience_votes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        experience_id INT NOT NULL,
        user_id INT NOT NULL,
        vote_type ENUM('up', 'down') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vote (experience_id, user_id),
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created experience_votes table');

    // Create experience_comments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS experience_comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        experience_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created experience_comments table');

    await connection.end();
    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupVotesAndComments();
