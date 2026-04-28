'use client';

import { useRouter } from 'next/navigation';
import { UtensilsCrossed, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { saveLocalUser } from '../lib/session';
import { useEffect, useRef } from 'react';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isProvisioningRef = useRef(false);

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
        router.replace('/');
      } catch (error) {
        isProvisioningRef.current = false;
        console.error(error);
        toast.error('Failed to finish account setup. Please try again.');
      }
    };

    syncGoogleUser();
  }, [router, session, status]);

  const handleLogin = async () => {
    await signIn('google', { callbackUrl: '/login' });
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
        <p className="text-[#4a4a3a] mb-10 text-lg">Smart meals for smart budgets</p>

        <div className="space-y-4 mb-10 text-left bg-[#fcfcfb] p-4 rounded-2xl border border-[#f0f0eb]">
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

        <button
          onClick={handleLogin}
          disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#1a1a1a] text-white rounded-2xl font-semibold hover:bg-[#333] transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 rounded-full" />
          Continue with Google
        </button>
        
        <p className="mt-8 text-xs text-[#9e9e9e] leading-relaxed">
          By continuing, you agree to cook more and waste less. 
          Standard recipe fees (future) and data charges may apply.
        </p>
      </motion.div>
    </div>
  );
}
