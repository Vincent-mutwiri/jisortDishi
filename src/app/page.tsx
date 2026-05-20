'use client';

import { useRouter } from 'next/navigation';
import { UtensilsCrossed, Refrigerator, Wallet, Heart, ArrowRight, Sparkles, TrendingDown, Users, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { getLocalUserId, clearLocalUser } from '../lib/session';
import { auth } from '../lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const userId = getLocalUserId();
      const name = localStorage.getItem('jisort_user_name');
      
      if (userId && name) {
        setIsLoggedIn(true);
        setUserName(name);
      }
    };

    checkAuth();
  }, []);

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    clearLocalUser();
    auth.clearCurrentUser();
    setIsLoggedIn(false);
    setUserName('');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-[#eaeaE0] px-6 py-4 md:px-12"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#5A5A40]">
            <UtensilsCrossed size={24} strokeWidth={2.5} />
            <span className="text-lg font-bold">Jisort Dishi</span>
          </div>
          
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Logged in user navigation */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 text-[#4a4a3a] border border-[#eaeaE0] rounded-lg">
                  <User size={18} />
                  <span className="font-medium text-sm">{userName.split(' ')[0]}</span>
                </div>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-lg hover:bg-[#4a4a30] transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
                
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 px-4 py-2 text-[#5A5A40] hover:bg-[#f5f5f0] rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span className="hidden md:inline">Profile</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Not logged in navigation */}
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-4 py-2 text-[#5A5A40] hover:bg-[#f5f5f0] rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span className="hidden md:inline">Login</span>
                </button>
                
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-lg hover:bg-[#4a4a30] transition-colors"
                >
                  <User size={18} />
                  <span className="hidden md:inline">Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:px-12 md:py-32 pt-12">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex p-4 rounded-full bg-[#5A5A40] text-white mb-8"
          >
            <UtensilsCrossed size={48} strokeWidth={2} />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-[#1a1a1a] mb-6 tracking-tight"
          >
            {isLoggedIn ? `Welcome back, ${userName.split(' ')[0]}!` : 'Jisort Dishi'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl text-[#5A5A40] mb-8 font-medium"
          >
            {isLoggedIn ? 'Ready to plan your next meal?' : 'Smart meals for smart budgets'}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-[#4a4a3a] mb-12 max-w-2xl mx-auto"
          >
            {isLoggedIn 
              ? 'Continue your journey to smarter meal planning. Check your dashboard for personalized recommendations.'
              : 'Transform your pantry into delicious, budget-friendly meals. Track ingredients, get smart recommendations, and reduce food waste.'
            }
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={isLoggedIn ? () => router.push('/dashboard') : handleGetStarted}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#5A5A40] text-white rounded-2xl font-semibold text-lg hover:bg-[#4a4a30] transition-colors shadow-lg hover:shadow-xl"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
              Everything you need to eat smarter
            </h2>
            <p className="text-xl text-[#4a4a3a] max-w-2xl mx-auto">
              From pantry management to budget tracking, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-[#f5f5f0] text-[#5A5A40] mb-4">
                <Refrigerator size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">Pantry Tracking</h3>
              <p className="text-[#4a4a3a]">Keep track of what's in your fridge, freezer, and pantry</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-[#f5f5f0] text-[#5A5A40] mb-4">
                <Wallet size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">Budget-Friendly</h3>
              <p className="text-[#4a4a3a]">Get meal recommendations that fit your budget perfectly</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-[#f5f5f0] text-[#5A5A40] mb-4">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">Health Conscious</h3>
              <p className="text-[#4a4a3a]">Nutritious meal suggestions tailored to your preferences</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-[#f5f5f0] text-[#5A5A40] mb-4">
                <TrendingDown size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">Reduce Waste</h3>
              <p className="text-[#4a4a3a]">Use what you have before it expires, save money and the planet</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">
                Perfect for students and busy professionals
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Sparkles size={20} className="text-[#5A5A40] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-[#1a1a1a] mb-1">Save Time</h4>
                    <p className="text-[#4a4a3a">No more wondering what to cook - we'll tell you!</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Sparkles size={20} className="text-[#5A5A40] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-[#1a1a1a] mb-1">Save Money</h4>
                    <p className="text-[#4a4a3a">Stretch your budget with smart meal planning</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Sparkles size={20} className="text-[#5A5A40] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-[#1a1a1a] mb-1">Eat Better</h4>
                    <p className="text-[#4a4a3a">Healthier meals without the complexity</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-[#eaeaE0]"
            >
              <div className="text-center mb-6">
                <Users size={48} className="text-[#5A5A40] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">Join thousands eating smarter</h3>
                <p className="text-[#4a4a3a]">Start your journey to better meals today</p>
              </div>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 bg-[#5A5A40] text-white rounded-xl font-semibold hover:bg-[#4a4a30] transition-colors"
              >
                Get Started Now
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#eaeaE0] px-6 py-12 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 text-[#5A5A40] mb-4 md:mb-0">
              <UtensilsCrossed size={24} strokeWidth={2.5} />
              <span className="text-xl font-bold">Jisort Dishi</span>
            </div>
            <div className="flex gap-6 text-sm text-[#4a4a3a]">
              <button className="hover:text-[#5A5A40] transition-colors">Privacy</button>
              <button className="hover:text-[#5A5A40] transition-colors">Terms</button>
              <button className="hover:text-[#5A5A40] transition-colors">Contact</button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#eaeaE0] text-center text-sm text-[#9e9e9e]">
            <p>© 2024 Jisort Dishi. Smart meals for smart budgets.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
