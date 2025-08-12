// Mock Database for Development
class MockDB {
  constructor() {
    // Single experience to match your PHP admin database
    this.experiences = [
      {
        id: 1,
        title: "Your Experience Title", // Replace with your actual experience title
        description: "Your experience description from PHP admin", // Replace with actual description
        client_name: "Your Client Name", // Replace with actual client name
        project_value: 1000, // Replace with actual value
        category: "Web Development", // Replace with actual category
        rating: 5, // Replace with actual rating
        user_id: 1,
        username: "your_username", // Replace with actual username
        created_at: new Date("2024-01-15"),
        upvotes: 0,
        downvotes: 0,
        comment_count: 0
      }
    ];

    this.users = [
      { id: 1, username: "freelancer_pro", email: "pro@example.com" },
      { id: 2, username: "design_critic", email: "critic@example.com" },
      { id: 3, username: "mobile_expert", email: "mobile@example.com" }
    ];

    this.votes = [
      { id: 1, user_id: 1, target_id: 1, target_type: "experience", vote_type: "up" },
      { id: 2, user_id: 2, target_id: 2, target_type: "experience", vote_type: "up" },
      { id: 3, user_id: 3, target_id: 3, target_type: "experience", vote_type: "up" }
    ];

    this.comments = [
      { id: 1, experience_id: 1, user_id: 2, content: "Thanks for sharing this positive review!", created_at: new Date() },
      { id: 2, experience_id: 2, user_id: 1, content: "Sorry to hear about this experience.", created_at: new Date() },
      { id: 3, experience_id: 3, user_id: 2, content: "Great to see successful projects!", created_at: new Date() }
    ];
  }

  // Mock query method to simulate database queries
  async query(sql, params = []) {
    console.log('Mock DB Query:', sql);
    
    // Handle different query types
    if (sql.includes('SELECT') && sql.includes('experiences')) {
      return [this.experiences];
    }
    
    if (sql.includes('INSERT INTO experiences')) {
      const newId = this.experiences.length + 1;
      const newExperience = {
        id: newId,
        ...params,
        created_at: new Date(),
        upvotes: 0,
        downvotes: 0,
        comment_count: 0
      };
      this.experiences.push(newExperience);
      return [{ insertId: newId }];
    }
    
    if (sql.includes('INSERT INTO votes')) {
      const newVote = {
        id: this.votes.length + 1,
        user_id: params[0],
        target_id: params[1],
        target_type: params[2],
        vote_type: params[3]
      };
      this.votes.push(newVote);
      return [{ insertId: newVote.id }];
    }
    
    if (sql.includes('SELECT') && sql.includes('votes')) {
      return [this.votes.filter(vote => 
        vote.target_id === params[0] && 
        vote.target_type === params[1] && 
        vote.user_id === params[2]
      )];
    }
    
    if (sql.includes('DELETE FROM votes')) {
      this.votes = this.votes.filter(vote => 
        !(vote.target_id === params[0] && 
          vote.target_type === params[1] && 
          vote.user_id === params[2])
      );
      return [{ affectedRows: 1 }];
    }
    
    if (sql.includes('SELECT') && sql.includes('comments')) {
      const experienceId = params[0];
      const commentsWithUsers = this.comments
        .filter(comment => comment.experience_id === experienceId)
        .map(comment => {
          const user = this.users.find(u => u.id === comment.user_id);
          return {
            ...comment,
            username: user ? user.username : 'Unknown'
          };
        });
      return [commentsWithUsers];
    }
    
    if (sql.includes('INSERT INTO comments')) {
      const newComment = {
        id: this.comments.length + 1,
        experience_id: params[0],
        user_id: params[1],
        content: params[2],
        created_at: new Date()
      };
      this.comments.push(newComment);
      return [{ insertId: newComment.id }];
    }
    
    // Default return for other queries
    return [[]];
  }

  // Method to update vote counts in experiences
  updateVoteCounts(experienceId) {
    const experience = this.experiences.find(exp => exp.id === experienceId);
    if (experience) {
      experience.upvotes = this.votes.filter(vote => 
        vote.target_id === experienceId && 
        vote.target_type === 'experience' && 
        vote.vote_type === 'up'
      ).length;
      
      experience.downvotes = this.votes.filter(vote => 
        vote.target_id === experienceId && 
        vote.target_type === 'experience' && 
        vote.vote_type === 'down'
      ).length;
    }
  }

  // Method to update comment counts
  updateCommentCounts(experienceId) {
    const experience = this.experiences.find(exp => exp.id === experienceId);
    if (experience) {
      experience.comment_count = this.comments.filter(comment => 
        comment.experience_id === experienceId
      ).length;
    }
  }
}

module.exports = new MockDB();
