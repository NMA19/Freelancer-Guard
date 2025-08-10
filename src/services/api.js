const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('🔥 API Request:', url, config); // Debug log
      const response = await fetch(url, config);
      
      const data = await response.json();
      console.log('🔥 API Response:', data); // Debug log
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Experience methods
  async getExperiences(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/experiences${queryString ? `?${queryString}` : ''}`);
  }

  async createExperience(experienceData) {
    return this.request('/experiences', {
      method: 'POST',
      body: JSON.stringify(experienceData),
    });
  }
}

export default new ApiService();
