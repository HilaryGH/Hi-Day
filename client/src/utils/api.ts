// Use environment variable if set, otherwise use localhost for development or Render for production
const getApiUrl = () => {
  // Check if environment variable is explicitly set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development mode, use localhost; otherwise use Render URL
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    return 'http://localhost:5000/api';
  }
  
  // Default to Render URL for production
  return 'https://hi-day.onrender.com/api';
};

const API_URL = getApiUrl();

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Generic fetch function
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: (data: any) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  googleLogin: (idToken: string) =>
    fetchAPI('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
  getMe: () => fetchAPI('/auth/me'),
};

// Products API
export const productsAPI = {
  getAll: (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return fetchAPI(`/products?${queryString}`);
  },
  getOne: (id: string) => fetchAPI(`/products/${id}`),
  create: (formData: FormData) => {
    const token = getToken();
    return fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'Request failed');
      }
      return response.json();
    });
  },
  update: (id: string, data: any) =>
    fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// Cart API
export const cartAPI = {
  get: () => fetchAPI('/cart'),
  add: (productId: string, quantity: number = 1) =>
    fetchAPI('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  update: (itemId: string, quantity: number) =>
    fetchAPI(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  remove: (itemId: string) =>
    fetchAPI(`/cart/${itemId}`, {
      method: 'DELETE',
    }),
  clear: () =>
    fetchAPI('/cart', {
      method: 'DELETE',
    }),
};

// Order API
export const orderAPI = {
  create: (data: any) =>
    fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyOrders: () => fetchAPI('/orders/my-orders'),
  getOne: (id: string) => fetchAPI(`/orders/${id}`),
  updateStatus: (id: string, data: any) =>
    fetchAPI(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Admin API
export const adminAPI = {
  // Dashboard stats
  getStats: () => fetchAPI('/admin/stats'),

  // User management
  getAllUsers: (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return fetchAPI(`/admin/users?${queryString}`);
  },
  getUser: (id: string) => fetchAPI(`/admin/users/${id}`),
  updateUser: (id: string, data: any) =>
    fetchAPI(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    fetchAPI(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  verifyProvider: (id: string) =>
    fetchAPI(`/admin/providers/${id}/verify`, {
      method: 'PUT',
    }),

  // Product management
  getAllProducts: (params?: {
    category?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return fetchAPI(`/admin/products?${queryString}`);
  },
  deleteProduct: (id: string) =>
    fetchAPI(`/admin/products/${id}`, {
      method: 'DELETE',
    }),
  toggleProductStatus: (id: string) =>
    fetchAPI(`/admin/products/${id}/toggle`, {
      method: 'PUT',
    }),
};

// Promotion API
export const promotionAPI = {
  getAll: (params?: {
    active?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return fetchAPI(`/promotions?${queryString}`);
  },
  getOne: (id: string) => fetchAPI(`/promotions/${id}`),
  create: (data: any) =>
    fetchAPI('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI(`/promotions/${id}`, {
      method: 'DELETE',
    }),
  applyToProducts: (promotionId: string, productIds: string[]) =>
    fetchAPI('/promotions/apply-to-products', {
      method: 'POST',
      body: JSON.stringify({ promotionId, productIds }),
    }),
  removeFromProducts: (productIds: string[]) =>
    fetchAPI('/promotions/remove-from-products', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    }),
  toggleStatus: (id: string) =>
    fetchAPI(`/promotions/${id}/toggle-status`, {
      method: 'PUT',
    }),
};



