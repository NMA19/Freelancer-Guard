const mysql = require('mysql2/promise');

async function createTestNotifications() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'freelancerguard'
  });

  console.log('🔔 Creating test notifications...');

  try {
    // Create some test notifications for user 1
    await connection.execute(`
      INSERT INTO notifications (user_id, type, title, message) VALUES
      (1, 'welcome', '🎉 Welcome to FreelancerGuard!', 'Thanks for joining our community. Start sharing your freelancing experiences!'),
      (1, 'vote', '👍 Someone liked your experience', 'Your experience "Great client communication" received a new like!'),
      (1, 'comment', '💬 New comment on your experience', 'Someone commented on your experience about payment delays')
    `);

    // Create notifications for user 2 if exists
    await connection.execute(`
      INSERT INTO notifications (user_id, type, title, message) VALUES
      (2, 'welcome', '🎉 Welcome to FreelancerGuard!', 'Thanks for joining our community. Start sharing your freelancing experiences!'),
      (2, 'system', '🚀 New Features Available', 'Check out our enhanced dashboard with analytics and search features!')
    `);

    console.log('✅ Test notifications created successfully!');

  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    await connection.end();
  }
}

createTestNotifications();
