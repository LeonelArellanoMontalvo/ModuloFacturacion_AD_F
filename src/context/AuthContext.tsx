
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface Permiso {
  id_permiso: number;
  nombre_permiso: string;
  descripcion: string; // "C", "R", "U", "D", "CR", "CRU", "CRUD"
  url_permiso: string;
  estado: boolean;
  id_modulo: string;
}

interface User {
  usuario: string;
  id_modulo: string;
  permisos: Permiso[];
  rawPermisos?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDirectAccess: boolean;
  login: (usuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  hasPermission: (subModulo: string, accion: 'C' | 'R' | 'U' | 'D') => boolean;
  setDirectAccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDirectAccess, setIsDirectAccessState] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const directAccess = localStorage.getItem('isDirectAccess') === 'true';

      if (directAccess) {
          setIsDirectAccessState(true);
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
      localStorage.removeItem('isDirectAccess');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (usuario: string, contrasena: string) => {
    const response = await fetch('https://aplicacion-de-seguridad-v2.onrender.com/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena, id_modulo: 'FAC' }),
    });

    const rawResponseText = await response.text();

    if (!response.ok) {
        try {
            const errorData = JSON.parse(rawResponseText);
            throw new Error(errorData.message || 'Credenciales incorrectas.');
        } catch (e) {
            throw new Error(rawResponseText || 'Credenciales incorrectas.');
        }
    }

    const data = JSON.parse(rawResponseText);

    const userData: User = {
      usuario,
      id_modulo: 'FAC',
      permisos: data.permisos,
      rawPermisos: rawResponseText,
    };

    setUser(userData);
    setIsDirectAccessState(false);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('isDirectAccess');
  };

  const logout = useCallback(() => {
    setUser(null);
    setIsDirectAccessState(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isDirectAccess');
    router.push('/auth/login');
  }, [router]);

  const hasPermission = useCallback((subModulo: string, accion: 'C' | 'R' | 'U' | 'D'): boolean => {
    if (isDirectAccess) return true;
    if (!user) return false;

    // The dashboard is a special case, always visible if the user is logged in
    if (subModulo === 'Dashboard') return true;

    // TEMP: Allow access to reports for now for development
    if (subModulo.startsWith('Reporte')) return true;

    const permiso = user.permisos.find(p => p.nombre_permiso.toLowerCase() === subModulo.toLowerCase());
    if (!permiso || !permiso.estado) return false;

    return permiso.descripcion.includes(accion);
  }, [user, isDirectAccess]);

  const setDirectAccess = () => {
    setIsDirectAccessState(true);
    setUser(null);
    localStorage.setItem('isDirectAccess', 'true');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDirectAccess, login, logout, hasPermission, setDirectAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
