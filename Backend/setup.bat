@echo off
echo Setting up FreelancerGuard Backend...

echo Installing npm dependencies...
npm install

echo.
echo Copying environment file...
if not exist .env (
    copy .env.example .env
    echo .env file created from .env.example
    echo Please edit .env with your actual database credentials!
) else (
    echo .env file already exists
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your database credentials
echo 2. Create MySQL database: CREATE DATABASE freelancerguard_db;
echo 3. Run database schema: mysql -u username -p freelancerguard_db ^< database/schema.sql
echo 4. Start development server: npm run dev
echo.
pause
