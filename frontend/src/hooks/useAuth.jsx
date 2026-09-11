import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Storefront customer user session
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(
    localStorage.getItem('user_token') || localStorage.getItem('token') || null
  );

  // Admin SOC session
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem('admin_token') || (localStorage.getItem('token') && localStorage.getItem('is_admin') === 'true' ? localStorage.getItem('token') : null)
  );

  const [loading, setLoading] = useState(true);

  // Initialize both user and admin auth states independently
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // 1. Check user token
      const curUserToken = localStorage.getItem('user_token') || localStorage.getItem('token');
      if (curUserToken) {
        try {
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${curUserToken}` }
          });
          if (isMounted) {
            setUser(res.data);
            setUserToken(curUserToken);
          }
        } catch (err) {
          console.warn('Customer session expired or invalid.');
          localStorage.removeItem('user_token');
          if (isMounted) {
            setUser(null);
            setUserToken(null);
          }
        }
      }

      // 2. Check admin token
      const curAdminToken = localStorage.getItem('admin_token');
      if (curAdminToken) {
        try {
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${curAdminToken}` }
          });
          if (isMounted) {
            if (res.data.role === 'ADMIN') {
              setAdminUser(res.data);
              setAdminToken(curAdminToken);
            } else {
              localStorage.removeItem('admin_token');
              setAdminUser(null);
              setAdminToken(null);
            }
          }
        } catch (err) {
          console.warn('Admin session expired or invalid.');
          localStorage.removeItem('admin_token');
          if (isMounted) {
            setAdminUser(null);
            setAdminToken(null);
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Standard login handler: intelligently sets customer or admin session based on role and caller
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, ...userData } = res.data;

    if (userData.role === 'ADMIN') {
      localStorage.setItem('admin_token', access_token);
      localStorage.setItem('token', access_token);
      setAdminToken(access_token);
      setAdminUser(userData);
      // Also populate user if no customer session is active for demo convenience
      if (!user) {
        setUser(userData);
        setUserToken(access_token);
      }
    } else {
      localStorage.setItem('user_token', access_token);
      localStorage.setItem('token', access_token);
      setUserToken(access_token);
      setUser(userData);
    }
    return userData;
  };

  // Dedicated Admin login that NEVER touches or overwrites customer user session
  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, ...userData } = res.data;

    if (userData.role !== 'ADMIN') {
      throw new Error('Access denied: Account does not possess Administrator privileges.');
    }

    localStorage.setItem('admin_token', access_token);
    setAdminToken(access_token);
    setAdminUser(userData);
    return userData;
  };

  // Dedicated User login that NEVER touches or overwrites admin session
  const userLogin = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, ...userData } = res.data;

    localStorage.setItem('user_token', access_token);
    localStorage.setItem('token', access_token);
    setUserToken(access_token);
    setUser(userData);
    return userData;
  };

  // Registration sets customer session without affecting admin session
  const register = async (name, email, password, phone = '') => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    const { access_token, ...userData } = res.data;

    localStorage.setItem('user_token', access_token);
    localStorage.setItem('token', access_token);
    setUserToken(access_token);
    setUser(userData);
    return userData;
  };

  // Logout only the customer storefront
  const logoutUser = () => {
    localStorage.removeItem('user_token');
    if (localStorage.getItem('token') === userToken) {
      localStorage.removeItem('token');
    }
    setUserToken(null);
    setUser(null);
  };

  // Logout only the SOC admin session
  const logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    if (localStorage.getItem('token') === adminToken) {
      localStorage.removeItem('token');
    }
    setAdminToken(null);
    setAdminUser(null);
  };

  // Default logout for current context
  const logout = () => {
    if (typeof window !== 'undefined' && window.location && window.location.pathname.startsWith('/admin')) {
      logoutAdmin();
    } else {
      logoutUser();
    }
  };

  const isAdmin = adminUser?.role === 'ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        token: userToken || adminToken,
        adminUser,
        adminToken,
        loading,
        login,
        adminLogin,
        userLogin,
        register,
        logout,
        logoutUser,
        logoutAdmin,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
