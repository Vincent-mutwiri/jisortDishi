'use client';

import { useRouter } from 'next/navigation';
import { UtensilsCrossed, Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { saveLocalUser } from '../lib/session';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isProvisioningRef = useRef(false);
  
  // Form states
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const syncGoogleUser = async () => {
      if (status !== 'authenticated' || !session?.user || isProvisioningRef.current) return;
      isProvisioningRef.current = true;

      try {
        const userId = (session.user as { id?: string }).id || session.user.email || crypto.randomUUID();
        const profile = await api.upsertProfile({
          user_id: userId,
          name: session.user.name || 'Jisort User',
          email: session.user.email || `google-${userId.slice(0, 8)}@jisort.local`,
          dietary_preferences: [],
          budget_preference: 1000,
          currency: 'KES',
        });

        saveLocalUser(profile);
        toast.success('Logged in successfully!');
        router.replace('/dashboard');
      } catch (error) {
        isProvisioningRef.current = false;
        console.error(error);
        toast.error('Failed to finish account setup. Please try again.');
      }
    };

    syncGoogleUser();
  }, [router, session, status]);

  const handleGoogleLogin = async () => {
    await signIn('google', { callbackUrl: '/login' });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save user profile locally
      saveLocalUser(data.profile);
      toast.success('Login successful!');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !name) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after successful registration
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || 'Auto-login failed');
      }

      // Save user profile locally
      saveLocalUser(loginData.profile);
      toast.success('Registration successful! Welcome to Jisort Dishi!');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-[#eaeaE0] text-center"
      >
        <div className="inline-flex p-4 rounded-full bg-[#5A5A40] text-white mb-6">
          <UtensilsCrossed size={40} strokeWidth={2} />
        </div>
        
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2 tracking-tight">Jisort Dishi</h1>
        <p className="text-[#4a4a3a] mb-8 text-lg">Smart meals for smart budgets</p>

        {/* Auth Mode Toggle */}
        <div className="flex bg-[#f5f5f0] rounded-xl p-1 mb-8">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              isLoginMode 
                ? 'bg-[#5A5A40] text-white' 
                : 'text-[#4a4a3a] hover:text-[#1a1a1a]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              !isLoginMode 
                ? 'bg-[#5A5A40] text-white' 
                : 'text-[#4a4a3a] hover:text-[#1a1a1a]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={isLoginMode ? handleEmailLogin : handleEmailRegister} className="space-y-4 mb-6">
          {!isLoginMode && (
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
            />
          </div>
          
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-[#4a4a3a] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!isLoginMode && (
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#5A5A40] text-white rounded-xl font-semibold hover:bg-[#4a4a30] transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              isLoginMode ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#eaeaE0]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#9e9e9e]">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-3 py-3 bg-[#1a1a1a] text-white rounded-xl font-semibold hover:bg-[#333] transition-colors mb-6"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 rounded-full" />
          Continue with Google
        </button>

        {/* Features */}
        <div className="space-y-3 mb-8 text-left bg-[#fcfcfb] p-4 rounded-2xl border border-[#f0f0eb]">
          <div className="flex gap-3">
            <Sparkles size={20} className="text-[#5A5A40] shrink-0" />
            <p className="text-sm text-[#4a4a3a]">Get meal suggestions based on your budget.</p>
          </div>
          <div className="flex gap-3">
            <Sparkles size={20} className="text-[#5A5A40] shrink-0" />
            <p className="text-sm text-[#4a4a3a]">Track your pantry and minimize food waste.</p>
          </div>
          <div className="flex gap-3">
            <Sparkles size={20} className="text-[#5A5A40] shrink-0" />
            <p className="text-sm text-[#4a4a3a]">Simple recipes for students and bachelors.</p>
          </div>
        </div>
        
        <p className="text-xs text-[#9e9e9e] leading-relaxed">
          By continuing, you agree to cook more and waste less. 
          Standard recipe fees (future) and data charges may apply.
        </p>
      </motion.div>
    </div>
  );
}
