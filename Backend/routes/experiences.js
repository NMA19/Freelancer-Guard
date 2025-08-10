const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// @route   GET /api/experiences
// @desc    Get all experiences with pagination and filters
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      rating,
      search,
      sortBy = "created_at",
      sortOrder = "DESC"
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        e.*,
        u.username,
        (SELECT COUNT(*) FROM votes v WHERE v.target_id = e.id AND v.target_type = 'experience' AND v.vote_type = 'up') as upvotes,
        (SELECT COUNT(*) FROM votes v WHERE v.target_id = e.id AND v.target_type = 'experience' AND v.vote_type = 'down') as downvotes,
        (SELECT COUNT(*) FROM comments c WHERE c.experience_id = e.id) as comment_count
      FROM experiences e
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters
    if (category && category !== "All") {
      query += " AND e.category = ?";
      params.push(category);
    }
    
    if (search) {
      query += " AND (e.title LIKE ? OR e.description LIKE ? OR u.username LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Add sorting
    const allowedSortBy = ["created_at", "rating", "title"];
    const allowedSortOrder = ["ASC", "DESC"];
    
    const validSortBy = allowedSortBy.includes(sortBy) ? sortBy : "created_at";
    const validSortOrder = allowedSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : "DESC";
    
    query += ` ORDER BY e.${validSortBy} ${validSortOrder}`;
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);
    
    const [experiences] = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM experiences e
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (category && category !== "All") {
      countQuery += " AND e.category = ?";
      countParams.push(category);
    }
    
    if (search) {
      countQuery += " AND (e.title LIKE ? OR e.description LIKE ? OR u.username LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      experiences,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Get experiences error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @route   GET /api/experiences/:id
// @desc    Get single experience by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [experiences] = await db.query(`
      SELECT 
        e.*,
        u.username,
        (SELECT COUNT(*) FROM votes v WHERE v.experience_id = e.id AND v.vote_type = 'up') as upvotes,
        (SELECT COUNT(*) FROM votes v WHERE v.experience_id = e.id AND v.vote_type = 'down') as downvotes
      FROM experiences e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = ? AND e.status = 'approved'
    `, [id]);

    if (experiences.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Experience not found"
      });
    }

    // Get comments for this experience
    const [comments] = await db.query(`
      SELECT c.*, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.experience_id = ?
      ORDER BY c.created_at DESC
    `, [id]);

    const experience = experiences[0];
    experience.comments = comments;

    res.json({
      success: true,
      experience
    });
  } catch (error) {
    console.error("Get experience error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @route   POST /api/experiences
// @desc    Create new experience
// @access  Private
router.post("/", auth, [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("category")
    .trim()
    .isIn(["Web Development", "Mobile Development", "Design", "Writing", "Marketing", "Data Entry", "Translation", "Video Editing", "Photography", "Consulting", "Other"])
    .withMessage("Invalid category"),
  body("client_type")
    .trim()
    .isIn(["Individual", "Small Business", "Enterprise", "Agency", "Startup", "Non-profit"])
    .withMessage("Invalid client type"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("project_value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Project value must be a positive number")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      client_type,
      project_value,
      rating,
      tags = []
    } = req.body;

    // Determine status based on rating
    let status = "neutral";
    if (rating >= 4) status = "positive";
    else if (rating <= 2) status = "negative";

    const query = `
      INSERT INTO experiences (
        user_id, title, description, category, client_type,
        project_value, rating, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(query, [
      req.user.userId,
      title,
      description,
      category,
      client_type,
      project_value || null,
      rating,
      status
    ]);

    const experienceId = result.insertId;

    // Insert tags if provided
    if (tags && tags.length > 0) {
      const tagQueries = tags.map(tag => {
        return db.query(
          "INSERT INTO experience_tags (experience_id, tag) VALUES (?, ?)",
          [experienceId, tag.trim()]
        );
      });
      await Promise.all(tagQueries);
    }

    res.status(201).json({
      success: true,
      message: "Experience created successfully",
      experienceId
    });

  } catch (error) {
    console.error("Create experience error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @route   POST /api/experiences/:id/vote
// @desc    Vote on an experience
// @access  Private
router.post("/:id/vote", auth, [
  body("vote_type")
    .isIn(["up", "down"])
    .withMessage("Vote type must be up or down")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const experienceId = req.params.id;
    const { vote_type } = req.body;
    const userId = req.user.userId;

    // Check if user already voted
    const [existingVote] = await db.query(
      "SELECT * FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ?",
      [userId, "experience", experienceId]
    );

    if (existingVote.length > 0) {
      // Update existing vote
      await db.query(
        "UPDATE votes SET vote_type = ? WHERE user_id = ? AND target_type = ? AND target_id = ?",
        [vote_type, userId, "experience", experienceId]
      );
    } else {
      // Insert new vote
      await db.query(
        "INSERT INTO votes (user_id, target_type, target_id, vote_type) VALUES (?, ?, ?, ?)",
        [userId, "experience", experienceId, vote_type]
      );
    }

    res.json({
      success: true,
      message: "Vote recorded successfully"
    });

  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
