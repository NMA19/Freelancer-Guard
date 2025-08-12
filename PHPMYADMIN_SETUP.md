# 🗃️ phpMyAdmin Integration Setup Guide

## ✅ What's Been Set Up

Your FreelancerGuard app is now configured to work with phpMyAdmin! Here's how to complete the setup:

## 📋 Step 1: Start XAMPP/WAMP/MAMP

1. **Start your local server stack:**
   - **XAMPP**: Start Apache and MySQL services
   - **WAMP**: Start all services  
   - **MAMP**: Start servers
   - **Or standalone MySQL**: Make sure MySQL is running on port 3306

## 📋 Step 2: Access phpMyAdmin

1. **Open phpMyAdmin in your browser:**
   - URL: `http://localhost/phpmyadmin`
   - Or: `http://localhost:8080/phpmyadmin` (depending on your setup)

2. **Login with your MySQL credentials:**
   - Username: `root` (default)
   - Password: (leave empty for default, or your MySQL password)

## 📋 Step 3: Create Database

1. **In phpMyAdmin:**
   - Click "New" in the left sidebar
   - Database name: `freelancer_guard`
   - Collation: `utf8mb4_general_ci`
   - Click "Create"

## 📋 Step 4: Update Database Credentials

1. **Edit the `.env` file in the Backend folder:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_mysql_password
   DB_NAME=freelancer_guard
   DB_PORT=3306
   ```

2. **Update these values:**
   - `DB_USER`: Your MySQL username (usually 'root')
   - `DB_PASS`: Your MySQL password (leave empty if no password)
   - `DB_NAME`: The database name you created

## 📋 Step 5: Restart the Backend

1. **The backend server will automatically:**
   - Connect to your phpMyAdmin database
   - Create all necessary tables
   - Insert sample data for testing

## 🗃️ Database Tables Created

The app creates these tables in phpMyAdmin:

### `experiences` table:
- `id` (Primary Key)
- `title` (Experience title)
- `description` (Experience description)  
- `category` (Web Development, Design, etc.)
- `client_name` (Client or company name)
- `rating` (1-5 stars)
- `project_value` (Project cost)
- `upvotes`, `downvotes`, `comment_count`
- `username` (Freelancer username)
- `created_at`, `updated_at` (Timestamps)

### `users` table:
- `id`, `username`, `email`, `password`, `created_at`

### `votes` table:
- `id`, `experience_id`, `vote_type`, `created_at`

### `comments` table:
- `id`, `experience_id`, `content`, `username`, `created_at`

## 🔧 Managing Data in phpMyAdmin

1. **View Experiences:**
   - Go to `freelancer_guard` database
   - Click on `experiences` table
   - Browse/Edit data as needed

2. **Add/Edit Experiences:**
   - Use the "Insert" tab to add new experiences
   - Use the "Edit" links to modify existing data
   - Changes appear immediately in the React app

3. **Monitor Activity:**
   - Check `votes` table for voting activity
   - Check `comments` table for user comments
   - View `users` table for user registrations

## 🚀 Testing the Integration

1. **Frontend:** http://localhost:5173
2. **Backend API:** http://localhost:5000/api/health
3. **phpMyAdmin:** http://localhost/phpmyadmin
4. **Add experiences** through the app and see them in phpMyAdmin
5. **Edit data** in phpMyAdmin and see changes in the app

## 🔍 Troubleshooting

### Database Connection Issues:
- ✅ Check if MySQL service is running
- ✅ Verify database credentials in `.env`
- ✅ Ensure database `freelancer_guard` exists
- ✅ Check MySQL port (default: 3306)

### phpMyAdmin Access Issues:
- ✅ Check if Apache is running (for phpMyAdmin web interface)
- ✅ Try different URLs: `localhost/phpmyadmin` or `localhost:8080/phpmyadmin`
- ✅ Check XAMPP/WAMP control panel for service status

Your FreelancerGuard app is now fully integrated with phpMyAdmin! 🎉
