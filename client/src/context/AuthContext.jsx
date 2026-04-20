import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('growcap_token');
    const savedUser = localStorage.getItem('growcap_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('growcap_token', jwtToken);
    localStorage.setItem('growcap_user', JSON.stringify(userData));
  };

  const refreshUser = async () => {
    const activeToken = localStorage.getItem('growcap_token');
    if (!activeToken) return;
    try {
      const { data } = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      // Merge new profile data with existing user object to ensure no fields are lost
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('growcap_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('growcap_token');
    localStorage.removeItem('growcap_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
