'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { UtensilsCrossed, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { auth } from '@/src/lib/auth';
import { useEffect, useState } from 'react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      toast.error('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await auth.resetPassword({ token, newPassword: password });
      setIsSuccess(true);
      toast.success('Password reset successful! You can now login with your new password.');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-[#eaeaE0] text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-red-100 text-red-600 mb-6">
            <Lock size={40} strokeWidth={2} />
          </div>
          
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2 tracking-tight">Invalid Link</h1>
          <p className="text-[#4a4a3a] mb-8 text-lg">This password reset link is invalid or has expired.</p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/forgot-password')}
              className="w-full py-3 bg-[#5A5A40] text-white rounded-xl font-semibold hover:bg-[#4a4a30] transition-colors"
            >
              Request New Reset Link
            </button>
            
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 text-[#5A5A40] font-medium hover:bg-[#f5f5f0] rounded-xl transition-colors"
            >
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-[#eaeaE0] text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle size={40} strokeWidth={2} />
          </div>
          
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2 tracking-tight">Password Reset!</h1>
          <p className="text-[#4a4a3a] mb-8 text-lg">Your password has been successfully reset.</p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-[#5A5A40] text-white rounded-xl font-semibold hover:bg-[#4a4a30] transition-colors"
            >
              Login with New Password
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
        <p className="text-[#4a4a3a] mb-8 text-lg">Set your new password</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-[#4a4a3a] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#5A5A40] text-white rounded-xl font-semibold hover:bg-[#4a4a30] transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 text-[#5A5A40] font-medium hover:bg-[#f5f5f0] rounded-xl transition-colors"
        >
          Back to Login
        </button>
      </motion.div>
    </div>
  );
}
