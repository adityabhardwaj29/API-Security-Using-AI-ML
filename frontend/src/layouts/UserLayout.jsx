import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const UserLayout = () => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const res = await api.get('/cart');
      setCartCount(res.data.total_items || 0);
    } catch (err) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  return (
    <div className="app-container">
      <Navbar cartCount={cartCount} />
      <main style={{ flex: 1 }}>
        <Outlet context={{ refreshCart: fetchCartCount }} />
      </main>
      <Footer />
    </div>
  );
};
