import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('auth_token')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    () => localStorage.getItem('refresh_token')
  );

  const login = useCallback((newToken: string, newRefreshToken: string) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('refresh_token', newRefreshToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
