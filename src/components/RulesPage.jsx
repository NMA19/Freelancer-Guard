import React from 'react';

const RulesPage = () => {
  return (
    <div className="rules-page">
      <div className="rules-container">
        <h2>📋 FreelancerGuard Community Rules</h2>
        <p className="rules-intro">
          Welcome to FreelancerGuard! To maintain a supportive and professional community, 
          please follow these guidelines when sharing experiences.
        </p>
        
        <div className="rules-section">
          <h3 className="do-section">✅ DO's - What We Encourage</h3>
          <div className="rules-list do-list">
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Be Honest and Factual</strong>
                <p>Share genuine experiences with accurate details about your interactions with clients.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Provide Constructive Feedback</strong>
                <p>Help others by sharing specific details about communication, payment, and project scope.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Use Professional Language</strong>
                <p>Maintain a respectful tone even when describing negative experiences.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Protect Privacy</strong>
                <p>Use client company names or initials instead of full personal names when possible.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Include Relevant Details</strong>
                <p>Share project timeline, communication style, payment terms, and overall experience.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <div className="rule-content">
                <strong>Update Your Experience</strong>
                <p>If your relationship with a client improves, consider updating your review.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rules-section">
          <h3 className="dont-section">❌ DON'Ts - What We Prohibit</h3>
          <div className="rules-list dont-list">
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>No False Information</strong>
                <p>Do not post fake experiences or deliberately misleading information.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>No Personal Attacks</strong>
                <p>Focus on professional behavior, not personal characteristics or appearance.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>No Spam or Self-Promotion</strong>
                <p>This platform is for sharing experiences, not promoting your own services.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>No Private Information</strong>
                <p>Never share personal contact details, addresses, or sensitive information.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <div className="rule-content">
                <strong>No Revenge Posts</strong>
                <p>Don't use this platform solely to get back at someone - focus on helping others.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rules-section">
          <h3 className="guidelines-section">📝 Additional Guidelines</h3>
          <div className="guidelines-list">
            <div className="guideline-item">
              <strong>Verification:</strong> Consider providing screenshots or documentation (with personal info redacted) for serious claims.
            </div>
            <div className="guideline-item">
              <strong>Categories:</strong> Use appropriate categories to help others find relevant experiences.
            </div>
            <div className="guideline-item">
              <strong>Updates:</strong> If situations change, update your experience or add comments.
            </div>
            <div className="guideline-item">
              <strong>Report Issues:</strong> If you notice violations of these rules, please report them to moderators.
            </div>
          </div>
        </div>
        
        <div className="rules-footer">
          <p>
            <strong>Remember:</strong> This platform exists to help freelancers make informed decisions. 
            Your honest, constructive feedback helps build a better freelancing community for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;
