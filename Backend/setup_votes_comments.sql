-- Add columns to experiences table for vote and comment counts
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0;

-- Create experience_votes table
CREATE TABLE IF NOT EXISTS experience_votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experience_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_type ENUM('up', 'down') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (experience_id, user_id),
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create experience_comments table
CREATE TABLE IF NOT EXISTS experience_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experience_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
