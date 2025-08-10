const mysql = require('mysql2/promise');

async function setupEnhancedDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'freelancerguard'
  });

  console.log('🚀 Setting up enhanced FreelancerGuard database...');

  try {
    // Notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Notifications table created');

    // Client blacklist table  
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS client_blacklist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255),
        client_company VARCHAR(255),
        reason TEXT NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        reported_by INT NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        verified_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reported_by) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id),
        INDEX idx_client_name (client_name),
        INDEX idx_client_email (client_email)
      )
    `);
    console.log('✅ Client blacklist table created');

    // Experience verification table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS experience_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        experience_id INT NOT NULL,
        verified_by INT NOT NULL,
        verification_type ENUM('payment_proof', 'communication_proof', 'work_proof') NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id)
      )
    `);
    console.log('✅ Experience verifications table created');

    // User reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reported_user_id INT NOT NULL,
        reporter_id INT NOT NULL,
        reason TEXT NOT NULL,
        category ENUM('spam', 'fake_review', 'harassment', 'inappropriate_content', 'other') NOT NULL,
        status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reported_user_id) REFERENCES users(id),
        FOREIGN KEY (reporter_id) REFERENCES users(id)
      )
    `);
    console.log('✅ User reports table created');

    // User profile enhancements
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reputation_score INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✅ User profile enhancements added');

    // Experience enhancements
    await connection.execute(`
      ALTER TABLE experiences 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_score INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tags JSON,
      ADD COLUMN IF NOT EXISTS project_value DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100),
      ADD COLUMN IF NOT EXISTS project_duration_days INT
    `);
    console.log('✅ Experience enhancements added');

    // Analytics views
    await connection.execute(`
      CREATE OR REPLACE VIEW user_analytics AS
      SELECT 
        u.id as user_id,
        u.username,
        COUNT(DISTINCT e.id) as total_experiences,
        AVG(e.rating) as avg_rating,
        COUNT(DISTINCT ev.id) as total_votes_received,
        COUNT(DISTINCT ec.id) as total_comments_received,
        u.reputation_score,
        u.is_verified
      FROM users u
      LEFT JOIN experiences e ON u.id = e.user_id
      LEFT JOIN experience_votes ev ON e.id = ev.experience_id AND ev.vote_type = 'up'
      LEFT JOIN experience_comments ec ON e.id = ec.experience_id AND ec.user_id != u.id
      GROUP BY u.id, u.username, u.reputation_score, u.is_verified
    `);
    console.log('✅ User analytics view created');

    console.log('🎉 Enhanced database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up enhanced database:', error);
  } finally {
    await connection.end();
  }
}

setupEnhancedDatabase();
