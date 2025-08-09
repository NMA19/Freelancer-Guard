-- FreelancerGuard Database Schema
-- Run this in phpMyAdmin to create the database and all required tables

-- Create database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS freelancerguard;
USE freelancerguard;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    reputation_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Experiences table
CREATE TABLE IF NOT EXISTS experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'Data Entry', 'Translation', 'Video Editing', 'Photography', 'Consulting', 'Other') NOT NULL,
    client_type ENUM('Individual', 'Small Business', 'Enterprise', 'Agency', 'Startup', 'Non-profit') NOT NULL,
    project_value DECIMAL(10,2) DEFAULT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    status ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
    is_verified BOOLEAN DEFAULT FALSE,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- Experience tags table
CREATE TABLE IF NOT EXISTS experience_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experience_id INT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
    INDEX idx_experience_id (experience_id),
    INDEX idx_tag (tag),
    UNIQUE KEY unique_experience_tag (experience_id, tag)
);

-- Experience images table
CREATE TABLE IF NOT EXISTS experience_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experience_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type ENUM('screenshot', 'contract', 'proof', 'other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
    INDEX idx_experience_id (experience_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experience_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_experience_id (experience_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Votes table (for experiences and comments)
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_type ENUM('experience', 'comment') NOT NULL,
    target_id INT NOT NULL,
    vote_type ENUM('up', 'down') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_vote (user_id, target_type, target_id),
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_type, target_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    target_type ENUM('experience', 'comment', 'user') NOT NULL,
    target_id INT NOT NULL,
    reason ENUM('spam', 'inappropriate', 'fake', 'harassment', 'other') NOT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_target (target_type, target_id),
    INDEX idx_status (status)
);

-- User sessions table (for JWT token management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('comment', 'vote', 'report', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_type ENUM('experience', 'comment', 'user') DEFAULT NULL,
    related_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Insert some sample data for testing
INSERT INTO users (username, email, password_hash, bio, location) VALUES
('john_dev', 'john@example.com', '$2b$10$example_hash_here', 'Full-stack developer with 5 years of experience', 'New York, USA'),
('sarah_designer', 'sarah@example.com', '$2b$10$example_hash_here', 'UI/UX designer specializing in web applications', 'London, UK'),
('mike_writer', 'mike@example.com', '$2b$10$example_hash_here', 'Content writer and copywriter', 'Toronto, Canada');

-- You can add more sample data as needed
