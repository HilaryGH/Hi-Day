import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, setAuthToken } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  facebookLogin: (accessToken: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
        await loadUser();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      await AsyncStorage.removeItem('token');
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      await AsyncStorage.setItem('token', response.token);
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw error;
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      const response = await authAPI.googleLogin(idToken);
      await AsyncStorage.setItem('token', response.token);
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw error;
    }
  };

  const facebookLogin = async (accessToken: string) => {
    try {
      const response = await authAPI.facebookLogin(accessToken);
      await AsyncStorage.setItem('token', response.token);
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data);
      await AsyncStorage.setItem('token', response.token);
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, googleLogin, facebookLogin, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
