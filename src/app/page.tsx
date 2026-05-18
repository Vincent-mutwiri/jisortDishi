'use client';

import { useRouter } from 'next/navigation';
import { UtensilsCrossed, Refrigerator, Wallet, Heart, ArrowRight, Sparkles, TrendingDown, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Hero Section */}
      <section className="px-6 py-20 md:px-12 md:py-32">
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
            Jisort Dishi
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl text-[#5A5A40] mb-8 font-medium"
          >
            Smart meals for smart budgets
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-[#4a4a3a] mb-12 max-w-2xl mx-auto"
          >
            Transform your pantry into delicious, budget-friendly meals. 
            Track ingredients, get smart recommendations, and reduce food waste.
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={handleGetStarted}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#5A5A40] text-white rounded-2xl font-semibold text-lg hover:bg-[#4a4a30] transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
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
