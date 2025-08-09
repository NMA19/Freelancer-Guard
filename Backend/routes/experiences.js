const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const auth = require("../middleware/auth");

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
        (SELECT COUNT(*) FROM votes v WHERE v.experience_id = e.id AND v.vote_type = 'up') as upvotes,
        (SELECT COUNT(*) FROM votes v WHERE v.experience_id = e.id AND v.vote_type = 'down') as downvotes,
        (SELECT COUNT(*) FROM comments c WHERE c.experience_id = e.id) as comment_count
      FROM experiences e
      JOIN users u ON e.user_id = u.id
      WHERE e.status = 'approved'
    `;

    const queryParams = [];

    // Add filters
    if (category) {
      query += " AND e.category = ?";
      queryParams.push(category);
    }

    if (rating) {
      query += " AND e.rating = ?";
      queryParams.push(rating);
    }

    if (search) {
      query += " AND (e.title LIKE ? OR e.description LIKE ? OR e.client_name LIKE ?)";
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Add sorting
    const allowedSortBy = ["created_at", "rating", "title"];
    const allowedSortOrder = ["ASC", "DESC"];
    
    const validSortBy = allowedSortBy.includes(sortBy) ? sortBy : "created_at";
    const validSortOrder = allowedSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : "DESC";
    
    query += ` ORDER BY e.${validSortBy} ${validSortOrder}`;
    query += " LIMIT ? OFFSET ?";
    queryParams.push(parseInt(limit), parseInt(offset));

    const [experiences] = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM experiences e WHERE e.status = 'approved'";
    const countParams = [];

    if (category) {
      countQuery += " AND e.category = ?";
      countParams.push(category);
    }

    if (rating) {
      countQuery += " AND e.rating = ?";
      countParams.push(rating);
    }

    if (search) {
      countQuery += " AND (e.title LIKE ? OR e.description LIKE ? OR e.client_name LIKE ?)";
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.query(countQuery, countParams);
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

    const [experiences] = await pool.query(`
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
    const [comments] = await pool.query(`
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
router.post("/", [
  auth,
  body("title")
    .trim()
    .isLength({ min: 10, max: 255 })
    .withMessage("Title must be between 10 and 255 characters"),
  body("description")
    .trim()
    .isLength({ min: 50 })
    .withMessage("Description must be at least 50 characters"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("client_name")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Client name must be less than 255 characters"),
  body("project_value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Project value must be a positive number"),
  body("evidence_url")
    .optional()
    .isURL()
    .withMessage("Evidence URL must be valid")
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
      rating,
      client_name,
      project_value,
      evidence_url
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO experiences 
      (user_id, title, description, category, rating, client_name, project_value, evidence_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      title,
      description,
      category,
      rating,
      client_name || null,
      project_value || null,
      evidence_url || null
    ]);

    res.status(201).json({
      success: true,
      message: "Experience created successfully",
      experienceId: result.insertId
    });
  } catch (error) {
    console.error("Create experience error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @route   PUT /api/experiences/:id/vote
// @desc    Vote on an experience
// @access  Private
router.put("/:id/vote", [
  auth,
  body("voteType")
    .isIn(["up", "down"])
    .withMessage("Vote type must be 'up' or 'down'")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { voteType } = req.body;

    // Check if experience exists
    const [experiences] = await pool.query("SELECT id FROM experiences WHERE id = ?", [id]);
    if (experiences.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Experience not found"
      });
    }

    // Insert or update vote
    await pool.query(`
      INSERT INTO votes (experience_id, user_id, vote_type)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE vote_type = ?
    `, [id, req.user.id, voteType, voteType]);

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
