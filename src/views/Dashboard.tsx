'use client';

import { useState, useEffect } from 'react';
import type { GeminiMealSuggestion } from '../lib/gemini';
import { Wallet, Sparkles, Clock, Utensils, ChevronRight, Refrigerator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { PantryItem, UserProfile } from '../types';
import { api } from '../lib/api';

export default function Dashboard() {
  const [budget, setBudget] = useState<string>('');
  const [suggestions, setSuggestions] = useState<GeminiMealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [profile, pantry] = await Promise.all([api.getProfile(), api.getPantry()]);
      setUserProfile(profile);
      setBudget(profile.budget_preference?.toString() || '');
      setPantryItems(pantry);
    };

    fetchData().catch((error) => {
      console.error(error);
      toast.error('Failed to load dashboard data');
    });
  }, []);

  const handleSuggest = async () => {
    if (!budget || isNaN(Number(budget))) {
      toast.error('Please enter a valid budget');
      return;
    }

    setLoading(true);
    try {
      const itemNames = pantryItems.map(i => i.item_name);
      const results = await api.getSuggestions({
        budget: Number(budget),
        items: itemNames,
        preferences: userProfile?.dietary_preferences || [],
        currency: userProfile?.currency || 'KES',
      });
      setSuggestions(results);
      toast.success('Generated suggestions based on your budget!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to get suggestions. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">Welcome back, {userProfile?.name?.split(' ')[0] || 'Chef'}!</h2>
        <p className="text-[#4a4a3a]">What are we cooking today?</p>
      </header>

      {/* Budget Input Section */}
      <section className="bg-white rounded-[32px] p-6 md:p-10 border border-[#eaeaE0] shadow-sm mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
          <Wallet size={120} />
        </div>
        
        <div className="relative z-10">
          <label className="block text-sm font-semibold uppercase tracking-wider text-[#9e9e9e] mb-4">Current Budget Availability</label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#5A5A40]">
                {userProfile?.currency || 'KES'}
              </span>
              <input 
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                className="w-full pl-16 pr-6 py-4 text-3xl font-bold bg-[#fcfcfb] border border-[#eaeaE0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
              />
            </div>
            <button 
              onClick={handleSuggest}
              disabled={loading}
              className="md:w-48 bg-[#5A5A40] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4a4a3a] disabled:opacity-50 transition-colors py-4 md:py-0"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Jisort Dishi</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-4 text-sm text-[#4a4a3a] flex items-center gap-2">
            <Refrigerator size={16} />
            {pantryItems.length > 0 
              ? `Considering ${pantryItems.length} items from your pantry.` 
              : "Pantry is empty! We'll suggest full grocery list meals."}
          </p>
        </div>
      </section>

      {/* Suggestions Results */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Utensils size={20} className="text-[#5A5A40]" />
              Suggested Meals
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestions.map((meal, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-6 border border-[#eaeaE0] shadow-sm flex flex-col h-full"
                >
                  <h4 className="text-lg font-bold mb-2 line-clamp-1">{meal.title}</h4>
                  <p className="text-sm text-[#4a4a3a] mb-4 line-clamp-2">{meal.description}</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between text-xs text-[#9e9e9e] font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Clock size={12} /> {meal.prep_time_mins}m</span>
                      <span>EST. {meal.estimated_total_cost} {userProfile?.currency || 'KES'}</span>
                    </div>
                    
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl text-sm font-bold hover:bg-[#f0f0eb] transition-colors group">
                      View Recipe
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!loading && suggestions.length === 0 && (
        <div className="text-center py-20 opacity-40">
          <Utensils size={48} className="mx-auto mb-4" />
          <p className="text-lg">Enter your budget above to see what you can cook!</p>
        </div>
      )}
    </div>
  );
}
