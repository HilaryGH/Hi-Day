// Use environment variable if set, otherwise use localhost for development or Render for production
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = (): string => {
  // Check if environment variable is explicitly set
  const extra = Constants.expoConfig?.extra;
  const apiUrl = extra?.apiUrl;
  
  // Handle different types - could be string, object, or null
  let apiUrlString: string | null = null;
  if (apiUrl) {
    if (typeof apiUrl === 'string') {
      apiUrlString = apiUrl;
    } else if (typeof apiUrl === 'object' && apiUrl !== null) {
      // If it's an object, try to stringify or extract value
      apiUrlString = String(apiUrl);
    }
  }
  
  if (apiUrlString && apiUrlString !== 'null' && apiUrlString !== '' && apiUrlString !== '[object Object]') {
    console.log(`[API Config] Using configured API URL: ${apiUrlString}`);
    return apiUrlString;
  }
  
  // In development mode, handle different scenarios
  if (__DEV__) {
    // Try to get the development server IP from Expo
    const hostUri = Constants.expoConfig?.hostUri;
    let detectedIP = null;
    
    if (hostUri) {
      // Extract IP from hostUri (format: "192.168.1.100:8081" or "exp://192.168.1.100:8081")
      const match = hostUri.match(/(\d+\.\d+\.\d+\.\d+)/);
      if (match) {
        detectedIP = match[1];
        console.log(`[API Config] Detected IP from Expo: ${detectedIP}`);
      }
    }
    
    // For Android emulator, use 10.0.2.2 to access host machine's localhost
    if (Platform.OS === 'android') {
      if (detectedIP) {
        return `http://${detectedIP}:5000/api`;
      }
      // Fallback for Android emulator
      console.log('[API Config] Using Android emulator default: 10.0.2.2');
      return 'http://10.0.2.2:5000/api';
    }
    
    // For iOS simulator and physical devices
    if (detectedIP) {
      return `http://${detectedIP}:5000/api`;
    }
    
    // Fallback to localhost (works for iOS simulator and web)
    console.log('[API Config] Using localhost (iOS simulator/web)');
    return 'http://localhost:5000/api';
  }
  
  // Default to Render URL for production
  console.log('[API Config] Using production URL');
  return 'https://hi-day.onrender.com/api';
};

const API_URL = getApiUrl();

// Ensure API_URL is always a string and log it
if (typeof API_URL !== 'string') {
  console.error('[API Config] ERROR: API_URL is not a string:', typeof API_URL, API_URL);
}

// Log the API URL being used (helpful for debugging)
if (__DEV__) {
  console.log(`[API] Using API URL: ${String(API_URL)}`);
  console.log(`[API] API_URL type: ${typeof API_URL}`);
}

// Simple token storage (you can replace this with AsyncStorage or SecureStore)
let authToken: string | null = null;

// Helper function to get auth token
const getToken = (): string | null => {
  return authToken;
};

// Helper function to set auth token
export const setAuthToken = (token: string | null) => {
  authToken = token;
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

    const url = `${API_URL}${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${url}`); // Debug log

    const response = await fetch(url, {
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
        errorMessage = `Request failed with status ${response.status}`;
        errorData = { message: errorMessage };
      }
      
      console.error(`[API Error] ${response.status} ${url}:`, errorMessage, errorData); // Debug log
      
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
    if (error instanceof Error && (error as any).status) {
      throw error;
    }
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network request failed'))) {
      const networkError = new Error(
        `Network error: Unable to connect to ${String(API_URL)}. ` +
        `Please ensure:\n` +
        `1. The server is running on port 5000\n` +
        `2. Your device/emulator is on the same network\n` +
        `3. Configure API URL in app.json if using a physical device`
      );
      (networkError as any).status = 0;
      (networkError as any).isNetworkError = true;
      (networkError as any).apiUrl = String(API_URL);
      console.error(`[API Error] Network request failed to: ${String(API_URL)}`);
      throw networkError;
    }
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
  register: async (data: any) => {
    // Check if data is FormData (for file uploads) or regular object
    if (data instanceof FormData) {
      const token = getToken();
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: data,
      });
      
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
    } else {
      // Regular JSON registration
      return fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },
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
  facebookLogin: (accessToken: string) =>
    fetchAPI('/auth/facebook', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
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
  create: async (formData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
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
  },
  update: async (id: string, data: any) => {
    // Check if data is FormData (for file uploads) or regular object
    if (data instanceof FormData) {
      const token = getToken();
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: data,
      });
      
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
    } else {
      // Regular JSON update
      return fetchAPI(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  },
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

// Sellers API
export const sellersAPI = {
  getTopSellers: (limit?: number) => {
    const queryString = limit ? `?limit=${limit}` : '';
    return fetchAPI(`/admin/top-sellers${queryString}`);
  },
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
