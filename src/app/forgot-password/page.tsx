'use client';

import { useRouter } from 'next/navigation';
import { UtensilsCrossed, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { auth } from '@/src/lib/auth';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await auth.forgotPassword({ email });
      setIsSubmitted(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reset link. Please try again.');
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
        <p className="text-[#4a4a3a] mb-8 text-lg">Reset your password</p>

        {!isSubmitted ? (
          <>
            <p className="text-[#4a4a3a] mb-6 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">Check your email</h3>
            <p className="text-[#4a4a3a] text-sm">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions.
            </p>
            <p className="text-[#9e9e9e] text-xs">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push('/login')}
          className="w-full flex items-center justify-center gap-2 py-3 text-[#5A5A40] font-medium hover:bg-[#f5f5f0] rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>
      </motion.div>
    </div>
  );
}
