"use client"

import { useState, useMemo, useEffect } from "react"
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
  Briefcase,
  DollarSign,
  CheckCircle,
  Award,
  BookOpen,
  Share2,
  ImageIcon,
  Send,
  ChevronDown,
  ChevronUp,
  Bell,
  Download,
  BarChart3,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Heart,
} from "lucide-react"

const FreelancerGuard = () => {
  const [activeTab, setActiveTab] = useState("experiences")
  const [searchTerm, setSearchTerm] = useState("")
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: "Client didn't pay after 3 months of completed work",
      category: "Payment Issues",
      description:
        "Delivered a complete e-commerce website but client disappeared after delivery. Had to involve legal team to recover payment. Always use escrow services!",
      rating: 1,
      likes: 23,
      views: 156,
      date: "2025-07-20",
      author: "WebDev_Pro",
      clientType: "Individual",
      projectValue: "$2,500",
      verified: true,
      tags: ["web-development", "e-commerce", "payment-dispute"],
      images: ["/placeholder.svg?height=200&width=300"],
      comments: [
        {
          id: 1,
          author: "FreelancerHelper",
          content: "This is exactly why I always use escrow. Sorry this happened to you!",
          date: "2025-07-21",
          likes: 5,
        },
        {
          id: 2,
          author: "LegalAdvice_Pro",
          content: "Did you have a written contract? That would strengthen your legal position.",
          date: "2025-07-22",
          likes: 3,
        },
      ],
    },
    {
      id: 2,
      title: "Amazing long-term partnership with startup",
      category: "Success Story",
      description:
        "Working with this client for 8 months now. Clear communication, fair rates, and always respects deadlines. They even gave me equity in their company!",
      rating: 5,
      likes: 47,
      views: 203,
      date: "2025-07-25",
      author: "DesignGuru",
      clientType: "Startup",
      projectValue: "$15,000+",
      verified: true,
      tags: ["long-term", "startup", "equity", "design"],
      images: ["/placeholder.svg?height=200&width=300"],
      comments: [
        {
          id: 3,
          author: "StartupFounder",
          content: "Great freelancers like you are hard to find. Equity sharing is the way to go!",
          date: "2025-07-26",
          likes: 8,
        },
      ],
    },
    {
      id: 3,
      title: "Scope creep nightmare turned into learning experience",
      category: "Lesson Learned",
      description:
        "Client kept adding features without additional payment. Learned to set strict boundaries and use detailed contracts. Now I always include change request procedures.",
      rating: 2,
      likes: 18,
      views: 89,
      date: "2025-07-15",
      author: "CodeCrafterXX",
      clientType: "Agency",
      projectValue: "$1,200",
      verified: false,
      tags: ["scope-creep", "contracts", "boundaries"],
      images: [],
      comments: [],
    },
  ])

  // New state for enhanced features
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedExperience, setExpandedExperience] = useState(null)
  const [showComments, setShowComments] = useState({})
  const [newComment, setNewComment] = useState("")
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New comment on your experience", read: false, date: "2025-07-26" },
    { id: 2, message: "Your experience was verified", read: false, date: "2025-07-25" },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "Payment Issues",
    description: "",
    rating: 3,
    clientType: "Individual",
    projectValue: "",
    tags: "",
    images: [],
  })

  const [filterCategory, setFilterCategory] = useState("All")
  const [sortBy, setSortBy] = useState("recent")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateRange, setDateRange] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExperiences = localStorage.getItem("freelancerGuardExperiences")
    if (savedExperiences) {
      setExperiences(JSON.parse(savedExperiences))
    }
  }, [])

  // Save to localStorage whenever experiences change
  useEffect(() => {
    localStorage.setItem("freelancerGuardExperiences", JSON.stringify(experiences))
  }, [experiences])

  const categories = [
    "All",
    "Payment Issues",
    "Success Story",
    "Scam Alert",
    "Communication Issues",
    "Lesson Learned",
    "Red Flags",
    "Positive Review",
  ]

  const clientTypes = ["Individual", "Startup", "Agency", "Enterprise", "Non-profit"]

  const handleLike = (id) => {
    setExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, likes: exp.likes + 1 } : exp)))
  }

  const handleCommentLike = (expId, commentId) => {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              comments: exp.comments.map((comment) =>
                comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment,
              ),
            }
          : exp,
      ),
    )
  }

  const handleAddComment = (expId) => {
    if (!newComment.trim()) return

    const comment = {
      id: Date.now(),
      author: "Anonymous",
      content: newComment,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    }

    setExperiences((prev) =>
      prev.map((exp) => (exp.id === expId ? { ...exp, comments: [...exp.comments, comment] } : exp)),
    )

    setNewComment("")
  }

  const handleImageUpload = (files) => {
    // In a real app, you'd upload to a server and get URLs back
    const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...imageUrls] }))
  }

  const handleAddExperience = () => {
    if (!formData.title.trim() || !formData.description.trim()) return

    const newExp = {
      id: Date.now(),
      ...formData,
      likes: 0,
      views: 0,
      date: new Date().toISOString().split("T")[0],
      author: "Anonymous",
      verified: false,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      comments: [],
    }

    setExperiences([newExp, ...experiences])
    setShowAddForm(false)
    setFormData({
      title: "",
      category: "Payment Issues",
      description: "",
      rating: 3,
      clientType: "Individual",
      projectValue: "",
      tags: "",
      images: [],
    })

    // Add notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: "Your experience has been published successfully!",
        read: false,
        date: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ])
  }

  const exportData = () => {
    const dataStr = JSON.stringify(experiences, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "freelancer-experiences.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const filteredAndSorted = useMemo(() => {
    const filtered = experiences.filter((exp) => {
      const matchesCategory = filterCategory === "All" || exp.category === filterCategory
      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesRating = ratingFilter === "all" || exp.rating >= Number.parseInt(ratingFilter)

      let matchesDate = true
      if (dateRange !== "all") {
        const expDate = new Date(exp.date)
        const now = new Date()
        const daysAgo = Number.parseInt(dateRange)
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
        matchesDate = expDate >= cutoffDate
      }

      return matchesCategory && matchesSearch && matchesRating && matchesDate
    })

    return filtered.sort((a, b) => {
      if (sortBy === "recent") return new Date(b.date) - new Date(a.date)
      if (sortBy === "popular") return b.likes - a.likes
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "views") return b.views - a.views
      if (sortBy === "comments") return b.comments.length - a.comments.length
      return 0
    })
  }, [experiences, filterCategory, searchTerm, sortBy, dateRange, ratingFilter])

  const getStars = (count, filled = true) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 inline-block ${
          i < count ? (filled ? "text-yellow-500 fill-current" : "text-yellow-500") : "text-gray-300"
        }`}
      />
    ))

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Payment Issues":
        return <DollarSign className="w-4 h-4 text-red-500" />
      case "Success Story":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Scam Alert":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "Lesson Learned":
        return <BookOpen className="w-4 h-4 text-blue-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "Payment Issues":
        return "bg-red-100 text-red-800 border-red-200"
      case "Success Story":
        return "bg-green-100 text-green-800 border-green-200"
      case "Scam Alert":
        return "bg-red-200 text-red-900 border-red-300"
      case "Lesson Learned":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Communication Issues":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Red Flags":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Positive Review":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const stats = {
    totalExperiences: experiences.length,
    positiveExperiences: experiences.filter((exp) => exp.rating >= 4).length,
    scamAlerts: experiences.filter((exp) => exp.category === "Scam Alert").length,
    avgRating: (experiences.reduce((sum, exp) => sum + exp.rating, 0) / experiences.length).toFixed(1),
    totalComments: experiences.reduce((sum, exp) => sum + exp.comments.length, 0),
    unreadNotifications: notifications.filter((n) => !n.read).length,
  }

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

            {/* Enhanced Stats Dashboard */}
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
                <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
                <div className="text-xs text-gray-600">Comments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
                <div className="text-xs text-gray-600">Avg Rating</div>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {stats.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 ${!notification.read ? "bg-blue-50" : ""}`}
                      >
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {[
            { id: "experiences", label: "Experiences", icon: MessageCircle },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "guidelines", label: "Guidelines", icon: BookOpen },
            { id: "resources", label: "Resources", icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "experiences" && (
          <div className="space-y-6">
            {/* Enhanced Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col gap-4">
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
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
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
                      <option value="comments">Most Discussed</option>
                    </select>

                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={exportData}
                      className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>

                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Share Experience
                    </button>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Time</option>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="365">Last year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                      <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="1">1+ Stars</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setDateRange("all")
                          setRatingFilter("all")
                          setFilterCategory("All")
                          setSearchTerm("")
                        }}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Add Experience Form */}
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
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.clientType}
                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {clientTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
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

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Images (Screenshots, contracts, etc.)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload images or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index),
                                }))
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Overall Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          type="button"
                          key={rating}
                          onClick={() => setFormData({ ...formData, rating })}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${formData.rating >= rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                          />
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

            {/* Enhanced Experiences Grid */}
            <div className="grid gap-6">
              {filteredAndSorted.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                          {exp.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
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
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {exp.comments.length} comments
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">{getStars(exp.rating)}</div>
                        <div className="text-sm text-gray-600">{exp.rating}/5</div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {expandedExperience === exp.id
                        ? exp.description
                        : exp.description.length > 200
                          ? `${exp.description.substring(0, 200)}...`
                          : exp.description}
                      {exp.description.length > 200 && (
                        <button
                          onClick={() => setExpandedExperience(expandedExperience === exp.id ? null : exp.id)}
                          className="text-blue-600 hover:text-blue-700 ml-2 font-medium"
                        >
                          {expandedExperience === exp.id ? "Show less" : "Read more"}
                        </button>
                      )}
                    </p>

                    {/* Images */}
                    {exp.images && exp.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        {exp.images.map((image, index) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Experience image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(image, "_blank")}
                          />
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Client Type:</strong> {exp.clientType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Project Value:</strong> {exp.projectValue}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getCategoryColor(exp.category)}`}
                        >
                          {getCategoryIcon(exp.category)}
                          {exp.category}
                        </div>

                        {exp.tags.length > 0 && (
                          <div className="flex gap-1">
                            {exp.tags.slice(0, 3).map((tag) => (
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
                        <button
                          onClick={() => setShowComments((prev) => ({ ...prev, [exp.id]: !prev[exp.id] }))}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-700 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{exp.comments.length}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {showComments[exp.id] && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Comments ({exp.comments.length})</h4>

                        {/* Add Comment */}
                        <div className="flex gap-3 mb-4">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === "Enter" && handleAddComment(exp.id)}
                          />
                          <button
                            onClick={() => handleAddComment(exp.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                          {exp.comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{comment.author}</span>
                                  <span className="text-sm text-gray-500">{comment.date}</span>
                                </div>
                                <button
                                  onClick={() => handleCommentLike(exp.id, comment.id)}
                                  className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span className="text-sm">{comment.likes}</span>
                                </button>
                              </div>
                              <p className="text-gray-700">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSorted.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters, or be the first to share an experience!
                </p>
              </div>
            )}
          </div>
        )}

        {/* New Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center mb-8">
                <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Analytics</h2>
                <p className="text-gray-600">Insights and trends from our freelancer community</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Experiences</p>
                      <p className="text-3xl font-bold">{stats.totalExperiences}</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Success Rate</p>
                      <p className="text-3xl font-bold">
                        {Math.round((stats.positiveExperiences / stats.totalExperiences) * 100)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Comments</p>
                      <p className="text-3xl font-bold">{stats.totalComments}</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Avg Rating</p>
                      <p className="text-3xl font-bold">{stats.avgRating}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-200" />
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Experience Categories</h3>
                  <div className="space-y-3">
                    {categories.slice(1).map((category) => {
                      const count = experiences.filter((exp) => exp.category === category).length
                      const percentage = Math.round((count / experiences.length) * 100)
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="text-gray-700">{category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Client Types</h3>
                  <div className="space-y-3">
                    {clientTypes.map((type) => {
                      const count = experiences.filter((exp) => exp.clientType === type).length
                      const percentage = Math.round((count / experiences.length) * 100)
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Guidelines and Resources tabs remain the same */}
        {activeTab === "guidelines" && (
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
                      If you encounter content that violates these guidelines, please report it immediately. Our
                      community moderators review all reports within 24 hours. Repeated violations may result in account
                      restrictions or permanent bans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
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
                    title: "Contract Templates",
                    description: "Professional contract templates to protect your work",
                    icon: FileText,
                    color: "blue",
                    comingSoon: false,
                  },
                  {
                    title: "Red Flag Detector",
                    description: "AI-powered tool to identify potential scam clients",
                    icon: AlertTriangle,
                    color: "red",
                    comingSoon: true,
                  },
                  {
                    title: "Rate Calculator",
                    description: "Calculate fair rates based on your skills and market",
                    icon: DollarSign,
                    color: "green",
                    comingSoon: true,
                  },
                  {
                    title: "Client Vetting Guide",
                    description: "Step-by-step guide to evaluate potential clients",
                    icon: Users,
                    color: "purple",
                    comingSoon: false,
                  },
                  {
                    title: "Legal Resources",
                    description: "Know your rights and legal protections",
                    icon: Shield,
                    color: "indigo",
                    comingSoon: false,
                  },
                  {
                    title: "Payment Protection",
                    description: "Escrow services and payment security tips",
                    icon: DollarSign,
                    color: "yellow",
                    comingSoon: true,
                  },
                ].map((resource, index) => {
                  const colorClasses = {
                    blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50",
                    red: "from-red-500 to-red-600 text-red-600 bg-red-50",
                    green: "from-green-500 to-green-600 text-green-600 bg-green-50",
                    purple: "from-purple-500 to-purple-600 text-purple-600 bg-purple-50",
                    indigo: "from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50",
                    yellow: "from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50",
                  }
                  return (
                    <div
                      key={index}
                      className="relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      {resource.comingSoon && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                      )}

                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[resource.color].split(" ")[0]} ${colorClasses[resource.color].split(" ")[1]} flex items-center justify-center mb-4`}
                      >
                        <resource.icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-gray-600 mb-4">{resource.description}</p>

                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          resource.comingSoon
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : `${colorClasses[resource.color].split(" ")[2]} ${colorClasses[resource.color].split(" ")[3]} hover:bg-opacity-80`
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
                  )
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
                    "How to Spot Red Flags in Client Communications",
                    "Setting Up Secure Payment Methods for Freelancers",
                    "Writing Bulletproof Contracts: A Complete Guide",
                    "Dealing with Difficult Clients: Best Practices",
                  ].map((article, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{article}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Community Guides</h4>
                  {[
                    "New Freelancer Onboarding Checklist",
                    "Platform Comparison: Upwork vs Fiverr vs Freelancer",
                    "Building Long-term Client Relationships",
                    "Scaling Your Freelance Business",
                  ].map((guide, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
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
  )
}

export default FreelancerGuard
