-- SQL Script to Connect Your PHP Admin Data with React App
-- Copy and run this in your PHP admin database (phpMyAdmin, MySQL Workbench, etc.)

-- 1. First, check if your experience data exists in PHP admin
-- Replace 'your_experience_table' with your actual table name from PHP admin
SELECT * FROM experiences LIMIT 5;

-- 2. If you have experience data in a different table, insert it into the experiences table
-- Update this query with your actual data from PHP admin:

INSERT INTO experiences (
    title, 
    description, 
    client_name, 
    project_value, 
    category, 
    rating, 
    user_id, 
    username,
    created_at
) VALUES (
    'Your Actual Experience Title',  -- Replace with your real experience title
    'Your detailed experience description from PHP admin',  -- Replace with real description
    'Your Client Name',  -- Replace with actual client name
    1500.00,  -- Replace with actual project value
    'Web Development',  -- Replace with actual category
    5,  -- Replace with actual rating (1-5)
    1,  -- Replace with actual user ID
    'your_username',  -- Replace with actual username
    NOW()
);

-- 3. Create a user if it doesn't exist (for authentication)
INSERT INTO users (username, email, password, created_at) VALUES 
('your_username', 'your_email@example.com', '$2a$10$dummy.hash.for.testing', NOW())
ON DUPLICATE KEY UPDATE username = username;

-- 4. Check the inserted data
SELECT 
    e.*,
    u.username as user_name,
    u.email
FROM experiences e
LEFT JOIN users u ON e.user_id = u.id
ORDER BY e.created_at DESC;

-- 5. If you have multiple experiences in PHP admin, you can import them like this:
-- (Replace 'your_php_admin_table' with your actual table name)

-- INSERT INTO experiences (title, description, client_name, project_value, category, rating, user_id, username, created_at)
-- SELECT 
--     title_column,           -- Replace with your column name
--     description_column,     -- Replace with your column name  
--     client_column,          -- Replace with your column name
--     value_column,           -- Replace with your column name
--     category_column,        -- Replace with your column name
--     rating_column,          -- Replace with your column name
--     1,                      -- Default user_id
--     'imported_user',        -- Default username
--     created_date_column     -- Replace with your column name
-- FROM your_php_admin_table;

-- 6. Update vote counts (optional, for testing)
UPDATE experiences SET 
    upvotes = FLOOR(RAND() * 10),
    downvotes = FLOOR(RAND() * 5),
    comment_count = FLOOR(RAND() * 8)
WHERE id = 1;
