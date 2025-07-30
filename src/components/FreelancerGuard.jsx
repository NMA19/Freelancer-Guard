import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';

const FreelancerGuard = () => {
  const [activeTab, setActiveTab] = useState('experiences');
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: 'Client didn\'t pay after delivery',
      category: 'Scam',
      description: 'The client disappeared after I submitted the work.',
      rating: 1,
      likes: 2,
      date: '2025-07-20'
    },
    {
      id: 2,
      title: 'Smooth experience with long-term client',
      category: 'Positive',
      description: 'Clear requirements and timely payments.',
      rating: 5,
      likes: 5,
      date: '2025-07-25'
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Scam',
    description: '',
    rating: 3
  });
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const handleLike = (id) => {
    setExperiences(prev => prev.map(exp => exp.id === id ? { ...exp, likes: exp.likes + 1 } : exp));
  };

  const handleAddExperience = () => {
    const newExp = {
      id: Date.now(),
      ...formData,
      likes: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setExperiences([newExp, ...experiences]);
    setShowAddForm(false);
    setFormData({ title: '', category: 'Scam', description: '', rating: 3 });
  };

  const filtered = experiences.filter(exp =>
    filterCategory === 'All' || exp.category === filterCategory
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'popular') return b.likes - a.likes;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const getStars = (count) => Array.from({ length: count }, (_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 inline-block" />);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">FreelancerGuard</h1>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setActiveTab('experiences')} className={`px-4 py-2 rounded ${activeTab === 'experiences' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Experiences</button>
        <button onClick={() => setActiveTab('guidelines')} className={`px-4 py-2 rounded ${activeTab === 'guidelines' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Guidelines</button>
        <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 rounded ${activeTab === 'resources' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Resources</button>
      </div>

      {activeTab === 'experiences' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border px-2 py-1 rounded">
                <option>All</option>
                <option>Scam</option>
                <option>Positive</option>
                <option>Late Payment</option>
                <option>Disrespectful</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border px-2 py-1 rounded">
                <option value="recent">Most Recent</option>
                <option value="popular">Most Liked</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded">
              <Plus size={16} /> Share Experience
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-50 p-4 border rounded mb-4">
              <h3 className="text-lg font-semibold mb-2">Add Your Experience</h3>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="border px-3 py-2 rounded w-full mb-2"
              >
                <option>Scam</option>
                <option>Positive</option>
                <option>Late Payment</option>
                <option>Disrespectful</option>
              </select>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button type="button" key={rating} onClick={() => setFormData({ ...formData, rating })}>
                    <Star className={`w-5 h-5 ${formData.rating >= rating ? 'text-yellow-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <button onClick={handleAddExperience} className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
            </div>
          )}

          <div className="grid gap-4">
            {sorted.map(exp => (
              <div key={exp.id} className="border p-4 rounded shadow-sm bg-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">{exp.title}</h3>
                  <span className="text-sm text-gray-500">{exp.date}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{exp.description}</p>
                <div className="flex gap-2 items-center text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded">{exp.category}</span>
                  <span>{getStars(exp.rating)}</span>
                  <button onClick={() => handleLike(exp.id)} className="flex items-center gap-1 text-blue-600 ml-auto">
                    <ThumbsUp size={16} /> {exp.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold mb-4">Community Guidelines</h2>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Be respectful and constructive in your posts.</li>
            <li>No doxxing or sharing personal info.</li>
            <li>Flag inappropriate or fake submissions.</li>
            <li>Rate experiences honestly to help others.</li>
            <li>Follow platform rules and local laws.</li>
          </ul>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold mb-4">Freelancer Resources</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default FreelancerGuard;