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
  try {
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
        let errorMessage = 'An error occurred';
        let errorData: any = { message: errorMessage };
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorData.msg || `Request failed with status ${response.status}`;
          } else {
            const text = await response.text();
            errorMessage = text || `Request failed with status ${response.status}`;
            errorData = { message: errorMessage };
          }
        } catch (parseError) {
          // If we can't parse the error, use status-based message
          errorMessage = `Request failed with status ${response.status}`;
          errorData = { message: errorMessage };
        }
        
        // Always create a proper Error object
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).statusCode = response.status;
        (error as any).data = errorData;
        (error as any).response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

    return response.json();
  } catch (error: any) {
    // If it's already an Error with our custom properties, re-throw it
    if (error instanceof Error && (error as any).status) {
      throw error;
    }
    // Otherwise, wrap network errors or other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      (networkError as any).status = 0;
      (networkError as any).isNetworkError = true;
      throw networkError;
    }
    // If error is not an Error instance, convert it
    if (!(error instanceof Error)) {
      const convertedError = new Error(typeof error === 'string' ? error : 'An unexpected error occurred');
      (convertedError as any).originalError = error;
      throw convertedError;
    }
    throw error;
  }
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
    seller?: string;
    isImported?: boolean;
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
        let errorMessage = 'An error occurred';
        let errorData: any = { message: errorMessage };
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `Request failed with status ${response.status}`;
          } else {
            const text = await response.text();
            errorMessage = text || `Request failed with status ${response.status}`;
            errorData = { message: errorMessage };
          }
        } catch (parseError) {
          errorMessage = `Request failed with status ${response.status}`;
          errorData = { message: errorMessage };
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }
      return response.json();
    }).catch((error) => {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
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
  getBestSellers: (limit?: number) => {
    const queryString = limit ? `?limit=${limit}` : '';
    return fetchAPI(`/products/bestsellers${queryString}`);
  },
  toggleBestSeller: (id: string) =>
    fetchAPI(`/products/${id}/bestseller`, {
      method: 'PUT',
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
  getSellerOrders: (params?: {
    orderStatus?: string;
    paymentStatus?: string;
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
    return fetchAPI(`/orders/seller-orders?${queryString}`);
  },
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

  // Order management
  getAllOrders: (params?: {
    orderStatus?: string;
    paymentStatus?: string;
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
    return fetchAPI(`/admin/orders?${queryString}`);
  },
  getOrderStats: () => fetchAPI('/admin/orders/stats'),
};

// Sellers API
export const sellersAPI = {
  getTopSellers: (limit?: number) => {
    const queryString = limit ? `?limit=${limit}` : '';
    return fetchAPI(`/admin/top-sellers${queryString}`);
  },
};

// Subscription API
export const subscriptionAPI = {
  subscribe: (email: string) =>
    fetchAPI('/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  unsubscribe: (email: string) =>
    fetchAPI('/subscriptions/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
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



