import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../lib/index';

interface AuthUser extends User {
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null as AuthUser | null,
      isAuthenticated: false,

      login: async (email: string, password: string, role: UserRole) => {
        // Mock authentication - in production, this would call an API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create mock user data based on role
        const mockUser: AuthUser = {
          id: `user_${Date.now()}`,
          name: getMockNameByRole(role),
          email,
          role,
          avatar: getMockAvatarByRole(role),
          phone: '+1 (555) 123-4567',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({ user: mockUser, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper function to get mock name based on role
function getMockNameByRole(role: UserRole): string {
  switch (role) {
    case UserRole.TEACHER:
      return 'Sarah Johnson';
    case UserRole.STUDENT:
      return 'Alex Martinez';
    case UserRole.PARENT:
      return 'Michael Smith';
    case UserRole.ADMIN:
      return 'Admin User';
    default:
      return 'User';
  }
}

// Helper function to get mock avatar based on role
function getMockAvatarByRole(role: UserRole): string {
  switch (role) {
    case UserRole.TEACHER:
      return 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher';
    case UserRole.STUDENT:
      return 'https://api.dicebear.com/7.x/avataaars/svg?seed=student';
    case UserRole.PARENT:
      return 'https://api.dicebear.com/7.x/avataaars/svg?seed=parent';
    case UserRole.ADMIN:
      return 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin';
    default:
      return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
  }
}

// Custom hook for easier access
export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};
