import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Star,
  MessageCircle,
  Eye,
  ThumbsUp,
  Flag,
  Search,
  Filter,
  Plus,
  User,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  FileText,
  AlertCircle,
  Heart,
  Share2,
  ExternalLink
} from 'lucide-react';

const FreelancerGuard = () => {
  const [activeTab, setActiveTab] = useState('experiences');
  const [searchTerm, setSearchTerm] = useState('');
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: 'Client didn\'t pay after 3 months of completed work',
      category: 'Payment Issues',
      description: 'Delivered a complete e-commerce website but client disappeared after delivery. Had to involve legal team to recover payment. Always use escrow services!',
      rating: 1,
      likes: 23,
      views: 156,
      date: '2025-07-20',
      author: 'WebDev_Pro',
      clientType: 'Individual',
      projectValue: '$2,500',
      verified: true,
      tags: ['web-development', 'e-commerce', 'payment-dispute']
    },
    {
      id: 2,
      title: 'Amazing long-term partnership with startup',
      category: 'Success Story',
      description: 'Working with this client for 8 months now. Clear communication, fair rates, and always respects deadlines. They even gave me equity in their company!',
      rating: 5,
      likes: 47,
      views: 203,
      date: '2025-07-25',
      author: 'DesignGuru',
      clientType: 'Startup',
      projectValue: '$15,000+',
      verified: true,
      tags: ['long-term', 'startup', 'equity', 'design']
    },
    {
      id: 3,
      title: 'Scope creep nightmare turned into learning experience',
      category: 'Lesson Learned',
      description: 'Client kept adding features without additional payment. Learned to set strict boundaries and use detailed contracts. Now I always include change request procedures.',
      rating: 2,
      likes: 18,
      views: 89,
      date: '2025-07-15',
      author: 'CodeCrafterXX',
      clientType: 'Agency',
      projectValue: '$1,200',
      verified: false,
      tags: ['scope-creep', 'contracts', 'boundaries']
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Payment Issues',
    description: '',
    rating: 3,
    clientType: 'Individual',
    projectValue: '',
    tags: ''
  });
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const categories = [
    'All', 'Payment Issues', 'Success Story', 'Scam Alert', 'Communication Issues', 
    'Lesson Learned', 'Red Flags', 'Positive Review'
  ];

  const clientTypes = ['Individual', 'Startup', 'Agency', 'Enterprise', 'Non-profit'];

  const handleLike = (id) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, likes: exp.likes + 1 } : exp
    ));
  };

  const handleAddExperience = () => {
    if (!formData.title.trim() || !formData.description.trim()) return;
    
    const newExp = {
      id: Date.now(),
      ...formData,
      likes: 0,
      views: 0,
      date: new Date().toISOString().split('T')[0],
      author: 'Anonymous',
      verified: false,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };
    setExperiences([newExp, ...experiences]);
    setShowAddForm(false);
    setFormData({ 
      title: '', 
      category: 'Payment Issues', 
      description: '', 
      rating: 3, 
      clientType: 'Individual',
      projectValue: '',
      tags: ''
    });
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = experiences.filter(exp => {
      const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
      const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'views') return b.views - a.views;
      return 0;
    });
  }, [experiences, filterCategory, searchTerm, sortBy]);

  const getStars = (count, filled = true) => 
    Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 inline-block ${
          i < count 
            ? (filled ? 'text-yellow-500 fill-current' : 'text-yellow-500') 
            : 'text-gray-300'
        }`} 
      />
    ));

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Payment Issues': return <DollarSign className="w-4 h-4 text-red-500" />;
      case 'Success Story': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Scam Alert': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Lesson Learned': return <BookOpen className="w-4 h-4 text-blue-500" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Payment Issues': return 'bg-red-100 text-red-800 border-red-200';
      case 'Success Story': return 'bg-green-100 text-green-800 border-green-200';
      case 'Scam Alert': return 'bg-red-200 text-red-900 border-red-300';
      case 'Lesson Learned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Communication Issues': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Red Flags': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Positive Review': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    totalExperiences: experiences.length,
    positiveExperiences: experiences.filter(exp => exp.rating >= 4).length,
    scamAlerts: experiences.filter(exp => exp.category === 'Scam Alert').length,
    avgRating: (experiences.reduce((sum, exp) => sum + exp.rating, 0) / experiences.length).toFixed(1)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FreelancerGuard
                </h1>
                <p className="text-sm text-gray-600">Protecting freelancers worldwide</p>
              </div>
            </div>
            
            {/* Stats Dashboard */}
            <div className="hidden md:flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalExperiences}</div>
                <div className="text-xs text-gray-600">Experiences</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.positiveExperiences}</div>
                <div className="text-xs text-gray-600">Success Stories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.scamAlerts}</div>
                <div className="text-xs text-gray-600">Scam Alerts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
                <div className="text-xs text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {[
            { id: 'experiences', label: 'Experiences', icon: MessageCircle },
            { id: 'guidelines', label: 'Guidelines', icon: BookOpen },
            { id: 'resources', label: 'Resources', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'experiences' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search experiences, tags, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3">
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Liked</option>
                    <option value="rating">Highest Rated</option>
                    <option value="views">Most Viewed</option>
                  </select>
                  
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Share Experience
                  </button>
                </div>
              </div>
            </div>

            {/* Add Experience Form */}
            {showAddForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Share Your Experience
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Experience title..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <select
                    value={formData.clientType}
                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {clientTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Project value (e.g., $500)"
                    value={formData.projectValue}
                    onChange={(e) => setFormData({ ...formData, projectValue: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Describe your experience in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Overall Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button 
                          type="button" 
                          key={rating} 
                          onClick={() => setFormData({ ...formData, rating })}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={`w-8 h-8 ${formData.rating >= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={handleAddExperience}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publish Experience
                  </button>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Experiences Grid */}
            <div className="grid gap-6">
              {filteredAndSorted.map(exp => (
                <div key={exp.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                          {exp.verified && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {exp.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(exp.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {exp.views} views
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {getStars(exp.rating)}
                        </div>
                        <div className="text-sm text-gray-600">{exp.rating}/5</div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 mb-4 leading-relaxed">{exp.description}</p>

                    {/* Metadata */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-sm"><strong>Client Type:</strong> {exp.clientType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm"><strong>Project Value:</strong> {exp.projectValue}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getCategoryColor(exp.category)}`}>
                          {getCategoryIcon(exp.category)}
                          {exp.category}
                        </div>
                        
                        {exp.tags.length > 0 && (
                          <div className="flex gap-1">
                            {exp.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                #{tag}
                              </span>
                            ))}
                            {exp.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{exp.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleLike(exp.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="font-medium">{exp.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSorted.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
                <p className="text-gray-600">Try adjusting your search or filters, or be the first to share an experience!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'guidelines' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Guidelines</h2>
                <p className="text-gray-600">Help us maintain a safe and supportive community for all freelancers</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Do's
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Share honest, detailed experiences to help others</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Be respectful and constructive in your feedback</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Verify your experiences with evidence when possible</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Report suspicious or fake content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Follow local laws and platform terms of service</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Don'ts
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Share personal information or engage in doxxing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Post false or misleading information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Use hate speech or discriminatory language</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Promote illegal activities or services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Spam or post repetitive content</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Reporting Policy</h4>
                    <p className="text-blue-800">
                      If you encounter content that violates these guidelines, please report it immediately. 
                      Our community moderators review all reports within 24 hours. Repeated violations may 
                      result in account restrictions or permanent bans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center mb-8">
                <Award className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Freelancer Resources</h2>
                <p className="text-gray-600">Tools and guides to help you succeed as a freelancer</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Contract Templates',
                    description: 'Professional contract templates to protect your work',
                    icon: FileText,
                    color: 'blue',
                    comingSoon: false
                  },
                  {
                    title: 'Red Flag Detector',
                    description: 'AI-powered tool to identify potential scam clients',
                    icon: AlertTriangle,
                    color: 'red',
                    comingSoon: true
                  },
                  {
                    title: 'Rate Calculator',
                    description: 'Calculate fair rates based on your skills and market',
                    icon: DollarSign,
                    color: 'green',
                    comingSoon: true
                  },
                  {
                    title: 'Client Vetting Guide',
                    description: 'Step-by-step guide to evaluate potential clients',
                    icon: Users,
                    color: 'purple',
                    comingSoon: false
                  },
                  {
                    title: 'Legal Resources',
                    description: 'Know your rights and legal protections',
                    icon: Shield,
                    color: 'indigo',
                    comingSoon: false
                  },
                  {
                    title: 'Payment Protection',
                    description: 'Escrow services and payment security tips',
                    icon: DollarSign,
                    color: 'yellow',
                    comingSoon: true
                  }
                ].map((resource, index) => {
                  const colorClasses = {
                    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
                    red: 'from-red-500 to-red-600 text-red-600 bg-red-50',
                    green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
                    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
                    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50',
                    yellow: 'from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50'
                  };

                  return (
                    <div key={index} className="relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      {resource.comingSoon && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[resource.color].split(' ')[0]} ${colorClasses[resource.color].split(' ')[1]} flex items-center justify-center mb-4`}>
                        <resource.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-gray-600 mb-4">{resource.description}</p>
                      
                      <button 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          resource.comingSoon 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : `${colorClasses[resource.color].split(' ')[2]} ${colorClasses[resource.color].split(' ')[3]} hover:bg-opacity-80`
                        }`}
                        disabled={resource.comingSoon}
                      >
                        {resource.comingSoon ? (
                          <>
                            <Clock className="w-4 h-4" />
                            Notify Me
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Access Resource
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Educational Content */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Educational Content
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Latest Articles</h4>
                  {[
                    'How to Spot Red Flags in Client Communications',
                    'Setting Up Secure Payment Methods for Freelancers',
                    'Writing Bulletproof Contracts: A Complete Guide',
                    'Dealing with Difficult Clients: Best Practices'
                  ].map((article, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{article}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Community Guides</h4>
                  {[
                    'New Freelancer Onboarding Checklist',
                    'Platform Comparison: Upwork vs Fiverr vs Freelancer',
                    'Building Long-term Client Relationships',
                    'Scaling Your Freelance Business'
                  ].map((guide, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">{guide}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                <p className="text-blue-100 mb-6">
                  Our community support team is here to help you navigate any challenges you face as a freelancer.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                    Contact Support
                  </button>
                  <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                    Join Discord Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerGuard;