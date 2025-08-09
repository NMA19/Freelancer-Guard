const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up FreelancerGuard Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from .env.example');
  } else {
    console.log('❌ .env.example file not found');
  }
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your database credentials');
console.log('2. Create MySQL database: CREATE DATABASE freelancerguard_db;');
console.log('3. Run database schema: npm run db:init');
console.log('4. Start development server: npm run dev');

console.log('\n🔧 Environment variables to configure in .env:');
console.log('- DB_HOST (MySQL host)');
console.log('- DB_USER (MySQL username)');
console.log('- DB_PASS (MySQL password)');
console.log('- DB_NAME (Database name)');
console.log('- JWT_SECRET (Secure random string)');

console.log('\n✨ Setup complete!');
