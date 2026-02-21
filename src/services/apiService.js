const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071/api';

class ApiService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          return this.handleResponse(retryResponse);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }

      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // Auth endpoints
  async register(email, password, name) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  }

  async googleAuth(idToken) {
    const response = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  }

  logout() {
    this.clearTokens();
  }

  // Provider endpoints
  async createProvider(providerData) {
    return this.request('/providers', {
      method: 'POST',
      body: JSON.stringify(providerData),
    });
  }

  async getProvider(providerId) {
    return this.request(`/providers/${providerId}`);
  }

  async getMyProvider() {
    return this.request('/providers/me');
  }

  async updateProvider(providerData) {
    return this.request('/providers/me', {
      method: 'PUT',
      body: JSON.stringify(providerData),
    });
  }

  async getMatches() {
    return this.request('/providers/matches');
  }

  async acceptMatch(matchId) {
    return this.request(`/providers/matches/${matchId}/accept`, {
      method: 'POST',
    });
  }

  async declineMatch(matchId) {
    return this.request(`/providers/matches/${matchId}/decline`, {
      method: 'POST',
    });
  }

  // Job endpoints
  async createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getJob(jobId) {
    return this.request(`/jobs/${jobId}`);
  }

  async listJobs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.latitude) params.append('latitude', filters.latitude);
    if (filters.longitude) params.append('longitude', filters.longitude);
    if (filters.radiusKm) params.append('radiusKm', filters.radiusKm);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);

    const queryString = params.toString();
    return this.request(`/jobs${queryString ? `?${queryString}` : ''}`);
  }

  async getMyJobs() {
    return this.request('/jobs/my');
  }

  async cancelJob(jobId) {
    return this.request(`/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  }

  async completeJob(jobId, rating, review) {
    return this.request(`/jobs/${jobId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  }

  // Skills endpoints
  async listSkills() {
    return this.request('/skills');
  }

  async extractSkills(text) {
    return this.request('/skills/extract', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async calculateRate(categories, yearsExperience, rating) {
    return this.request('/skills/rate', {
      method: 'POST',
      body: JSON.stringify({ categories, yearsExperience, rating }),
    });
  }

  // Notification endpoints
  async getNotifications(unreadOnly = false) {
    return this.request(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`);
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }
}

const apiService = new ApiService();
export default apiService;
