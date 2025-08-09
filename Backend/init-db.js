const mysql = require('mysql2/promise')
const fs = require('fs').promises
const path = require('path')

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...')
    
    // Create connection without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    })

    console.log('✅ Connected to MySQL server')

    // Create database first
    await connection.execute('CREATE DATABASE IF NOT EXISTS freelancerguard_db')
    console.log('✅ Database created')

    // Connect to the specific database
    await connection.execute('USE freelancerguard_db')
    console.log('✅ Connected to freelancerguard_db')

    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql')
    const schema = await fs.readFile(schemaPath, 'utf8')

    // Split SQL statements and execute them one by one
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('CREATE DATABASE') && !stmt.startsWith('USE'))

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement)
      }
    }
    
    console.log('✅ Database schema created successfully')

    await connection.end()
    console.log('🎉 Database initialization completed!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    process.exit(1)
  }
}

// Run initialization
initializeDatabase()
