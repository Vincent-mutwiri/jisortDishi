import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { 
  RegisterRequest, 
  LoginRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  RegisterResponse,
  LoginResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse
} from '../types';

// NextAuth configuration for Google OAuth
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile?.sub) {
        token.sub = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

// Email-based authentication API client
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');

  const response = await fetch(path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const auth = {
  // User management
  setCurrentUser: (user: { user_id: string; name: string; email: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jisort_user_id', user.user_id);
      localStorage.setItem('jisort_user_name', user.name);
      localStorage.setItem('jisort_user_email', user.email);
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      return {
        user_id: localStorage.getItem('jisort_user_id'),
        name: localStorage.getItem('jisort_user_name'),
        email: localStorage.getItem('jisort_user_email'),
      };
    }
    return { user_id: null, name: null, email: null };
  },

  clearCurrentUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jisort_user_id');
      localStorage.removeItem('jisort_user_name');
      localStorage.removeItem('jisort_user_email');
    }
  },

  // API methods
  register: (credentials: RegisterRequest): Promise<RegisterResponse> => 
    request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  login: (credentials: LoginRequest): Promise<LoginResponse> => 
    request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  forgotPassword: (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => 
    request<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => 
    request<ResetPasswordResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
