import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  role: 'student' | 'hod' | 'faculty';
  name: string;
}

interface AuthContextType {
  user: User | null;
  selectRole: (role: 'student' | 'hod' | 'faculty') => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user role is already selected (from localStorage)
    const storedUser = localStorage.getItem('od_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const getRoleName = (role: 'student' | 'hod' | 'faculty'): string => {
    switch (role) {
      case 'student': return 'Student';
      case 'hod': return 'HOD';
      case 'faculty': return 'Faculty';
      default: return 'User';
    }
  };

  const selectRole = (role: 'student' | 'hod' | 'faculty'): void => {
    const userData: User = {
      role,
      name: getRoleName(role)
    };

    setUser(userData);
    localStorage.setItem('od_user', JSON.stringify(userData));
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('od_user');
  };

  return (
    <AuthContext.Provider value={{ user, selectRole, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};