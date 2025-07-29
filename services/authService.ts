import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface AuthResponse {
  user: User;
  token: string;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const authService = {
  signUp: async (email: string, password: string): Promise<User> => {
    try {
      const response: AuthResponse = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuthToken(response.token);
      return {
        email: response.user.email,
        role: response.user.role,
        organizationId: response.user.organizationId,
      };
    } catch (error) {
      throw error;
    }
  },

  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const response: AuthResponse = await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuthToken(response.token);
      return {
        email: response.user.email,
        role: response.user.role,
        organizationId: response.user.organizationId,
      };
    } catch (error) {
      throw error;
    }
  },

  signOut: (): void => {
    removeAuthToken();
  },

  getCurrentUser: (): User | null => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      // Decode JWT payload (simple base64 decode - in production you might want more validation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        removeAuthToken();
        return null;
      }

      return {
        email: payload.email,
        role: payload.role,
        organizationId: payload.organizationId,
      };
    } catch (error) {
      removeAuthToken();
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },

  getUsersByOrg: async (orgId: string): Promise<User[]> => {
    try {
      const response = await apiRequest(`/organizations/${orgId}/members`);
      return response.members || [];
    } catch (error) {
      throw error;
    }
  },

  assignUserToOrg: async (email: string, orgId: string): Promise<void> => {
    try {
      await apiRequest(`/organizations/${orgId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      throw error;
    }
  },

  removeUserFromOrg: async (email: string, orgId: string): Promise<void> => {
    try {
      await apiRequest(`/organizations/${orgId}/members/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw error;
    }
  },
};
