import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getFirebaseAuth } from '../config/firebase';
import feathersClient from '../services/feathersClient';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'client' | 'company' | 'super-admin';
  companyId?: string;
  type?: 'individual' | 'legal-entity';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reauthenticate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authInitialized = useRef(false);

  const reauthenticate = useCallback(async () => {
    try {
      const result = await feathersClient.reAuthenticate();
      if (result.accessToken && result.user) {
        setUser(result.user as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('[Auth] No valid session found:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (authInitialized.current) return;
      authInitialized.current = true;

      try {
        await reauthenticate();
      } catch (error) {
        console.log('[Auth] Initial reauth failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [reauthenticate]);

  const login = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const { signInWithEmailAndPassword } = await import('firebase/auth');

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await userCredential.user.getIdToken();

      await feathersClient.authenticate({
        accessToken: firebaseToken,
        strategy: 'firebase',
        userData: { role: 'company' },
      });

      const result = await feathersClient.reAuthenticate();
      setUser(result.user as User);
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await feathersClient.logout();
    } catch (error) {
      console.log('[Auth] Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    reauthenticate,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
