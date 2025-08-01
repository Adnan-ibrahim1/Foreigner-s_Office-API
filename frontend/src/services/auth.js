import { authAPI } from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(username, password) {
    try {
      const response = await authAPI.login({ username, password });
      const { token, user } = response.data;
      
      this.token = token;
      this.user = user;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  }

  async logout() {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await authAPI.getCurrentUser();
      this.user = response.data;
      localStorage.setItem('user', JSON.stringify(this.user));
      return this.user;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      return null;
    }
  }

  hasPermission(permission) {
    if (!this.user) return false;
    return this.user.permissions?.includes(permission) || this.user.is_admin;
  }

  isAdmin() {
    return this.user?.is_admin || false;
  }
}

const authService = new AuthService();
export default authService;