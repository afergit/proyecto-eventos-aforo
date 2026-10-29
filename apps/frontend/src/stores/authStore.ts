import { create } from 'zustand';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE' | 'STAFF';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loginWithGoogleSSO: (googleToken: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  loginWithGoogleSSO: async (googleToken: string) => {
    // Simulación del handshake SSO Google que intercambia el JWT con el backend Hono
    // En Fase 2 se conecta formalmente con /api/v1/auth/sso-google
    const mockUser: AuthUser = {
      id: 'usr_mock_sso_1',
      name: 'Estudiante TICS316',
      email: 'alumno@usil.pe',
      role: 'ATTENDEE'
    };
    set({
      user: mockUser,
      token: `jwt_session_${googleToken}`,
      isAuthenticated: true
    });
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
