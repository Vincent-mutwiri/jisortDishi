'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, ChevronRight, ChevronLeft, Coffee, Utensils, Cookie, Wine, Star,
  Wallet, Users, Clock, Search, ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useCurrency } from '../context/CurrencyContext';
import { useSavedMeals } from '../context/SavedMealsContext';
import { useData } from '../context/DataContext';
import { api } from '../lib/api';

export default function FindMeals() {
  const router = useRouter();
  const { currency } = useCurrency();
  const { setSuggestions } = useSavedMeals();
  const { profile, pantry, refreshProfile, refreshPantry } = useData();
  
  // Wizard fields
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('meal');
  const [mealType, setMealType] = useState('');
  const [people, setPeople] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Ensure data is loaded (uses cached data if available)
  useState(() => {
    refreshProfile();
    refreshPantry();
  });

  const steps = [
    { title: 'Budget', icon: Wallet },
    { title: 'Category', icon: Search },
    { title: 'Meal Type', icon: Clock },
    { title: 'People', icon: Users },
    { title: 'Notes', icon: Sparkles },
  ];

  const categories = [
    { value: 'meal', label: 'Meal', icon: <Utensils size={22} />, desc: 'Full dishes', color: 'from-orange-100 to-orange-50', accent: 'text-orange-600' },
    { value: 'drink', label: 'Drink', icon: <Coffee size={22} />, desc: 'Beverages', color: 'from-blue-100 to-blue-50', accent: 'text-blue-600' },
    { value: 'snack', label: 'Snack', icon: <Cookie size={22} />, desc: 'Quick bites', color: 'from-yellow-100 to-yellow-50', accent: 'text-yellow-600' },
    { value: 'dessert', label: 'Dessert', icon: <Star size={22} />, desc: 'Sweet treats', color: 'from-pink-100 to-pink-50', accent: 'text-pink-600' },
    { value: 'soup', label: 'Soup/Stew', icon: <Wine size={22} />, desc: 'Warm bowls', color: 'from-emerald-100 to-emerald-50', accent: 'text-emerald-600' },
    { value: 'any', label: 'Surprise me', icon: <Sparkles size={22} />, desc: 'Any category', color: 'from-purple-100 to-purple-50', accent: 'text-purple-600' },
  ];

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', emoji: '🌅', time: 'Morning' },
    { value: 'lunch', label: 'Lunch', emoji: '☀️', time: 'Midday' },
    { value: 'dinner', label: 'Dinner', emoji: '🌙', time: 'Evening' },
    { value: 'brunch', label: 'Brunch', emoji: '🥐', time: 'Late morning' },
    { value: 'afternoon snack', label: 'Afternoon Snack', emoji: '🕒', time: '2-4pm' },
    { value: 'late night', label: 'Late Night', emoji: '🌃', time: 'After dark' },
  ];

  const canProceed = () => {
    if (step === 0) return budget && Number(budget) > 0;
    if (step === 2) return !!mealType;
    return true;
  };

  const handleGenerate = async () => {
    const b = Number(budget);
    if (!b || b <= 0) {
      toast.error('Enter a valid budget');
      return;
    }
    if (!mealType) {
      toast.error('Select a meal type');
      return;
    }

    setLoading(true);
    try {
      const items = pantry.map(i => i.item_name);
      const results = await api.getSuggestions({
        budget: b,
        items,
        preferences: profile?.dietary_preferences || [],
        currency,
        category,
        meal_type: mealType,
        people,
        extra_notes: notes,
      });
      setSuggestions(results, b, currency);
      router.push('/suggestions');
    } catch (e) {
      toast.error('Failed to generate suggestions. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0f0eb] rounded-full text-sm font-bold text-[#5A5A40] mb-3">
          <ChefHat size={16} />
          <span>Meal Finder</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">What do you want to eat?</h1>
        <p className="text-[#9e9e9e]">Tell us a few things and we'll suggest options that fit.</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={`flex flex-col items-center gap-1 transition-all ${i > step ? 'opacity-40' : 'cursor-pointer'}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                i === step ? 'bg-[#5A5A40] text-white shadow-lg' : i < step ? 'bg-[#5A5A40]/20 text-[#5A5A40]' : 'bg-[#f0f0eb] text-[#9e9e9e]'
              }`}>
                <s.icon size={18} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide ${i === step ? 'text-[#5A5A40]' : 'text-[#9e9e9e]'}`}>{s.title}</span>
            </button>
          ))}
        </div>
        <div className="h-2 bg-[#f0f0eb] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#5A5A40] rounded-full"
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-[32px] border border-[#eaeaE0] shadow-sm p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Budget */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">How much do you have?</h2>
              <p className="text-sm text-[#9e9e9e] mb-6">We'll only suggest options within this budget.</p>
              <div className="relative max-w-xs mx-auto mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#5A5A40]">{currency}</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && Number(budget) > 0 && setStep(1)}
                  placeholder="0"
                  autoFocus
                  className="w-full pl-20 pr-4 py-5 text-4xl font-bold bg-[#fcfcfb] border border-[#eaeaE0] rounded-2xl outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all text-center"
                />
              </div>
              {pantry.length > 0 && (
                <p className="text-center text-sm text-[#9e9e9e]">
                  <span className="font-semibold text-[#5A5A40]">{pantry.length} items</span> in your pantry — we'll use them to reduce costs
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(1)}
                  disabled={!canProceed()}
                  className="px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Category */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">What category?</h2>
              <p className="text-sm text-[#9e9e9e] mb-5">Pick what you're craving right now.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                      category === cat.value ? 'border-[#5A5A40] bg-gradient-to-br ' + cat.color : 'border-[#eaeaE0] hover:border-[#5A5A40]/30'
                    }`}
                  >
                    <span className={cat.accent}>{cat.icon}</span>
                    <span className="font-bold text-sm text-[#1a1a1a]">{cat.label}</span>
                    <span className="text-[10px] text-[#9e9e9e]">{cat.desc}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(0)} className="px-5 py-3 rounded-2xl font-bold text-[#4a4a3a] hover:bg-[#f0f0eb] transition-all flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] transition-all flex items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Meal Type */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">Which meal is this?</h2>
              <p className="text-sm text-[#9e9e9e] mb-5">This helps with portions and timing.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mealTypes.map(mt => (
                  <button
                    key={mt.value}
                    onClick={() => setMealType(mt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                      mealType === mt.value ? 'border-[#5A5A40] bg-[#f0f0eb]' : 'border-[#eaeaE0] hover:border-[#5A5A40]/30'
                    }`}
                  >
                    <span className="text-2xl">{mt.emoji}</span>
                    <span className="font-bold text-sm text-[#1a1a1a]">{mt.label}</span>
                    <span className="text-[10px] text-[#9e9e9e]">{mt.time}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="px-5 py-3 rounded-2xl font-bold text-[#4a4a3a] hover:bg-[#f0f0eb] transition-all flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!mealType}
                  className="px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: People */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">How many people?</h2>
              <p className="text-sm text-[#9e9e9e] mb-6">We'll scale costs and portions.</p>
              <div className="flex items-center justify-center gap-6 mb-6">
                <button
                  onClick={() => setPeople(p => Math.max(1, p - 1))}
                  className="w-14 h-14 rounded-2xl bg-[#f0f0eb] flex items-center justify-center text-2xl font-bold text-[#5A5A40] hover:bg-[#e0e0d8] transition-all"
                >−</button>
                <div className="text-center min-w-[100px]">
                  <p className="text-6xl font-bold text-[#1a1a1a]">{people}</p>
                  <p className="text-sm text-[#9e9e9e] mt-1">{people === 1 ? 'person' : 'people'}</p>
                </div>
                <button
                  onClick={() => setPeople(p => Math.min(20, p + 1))}
                  className="w-14 h-14 rounded-2xl bg-[#f0f0eb] flex items-center justify-center text-2xl font-bold text-[#5A5A40] hover:bg-[#e0e0d8] transition-all"
                >+</button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[1,2,3,4,5,6,8,10,12,15,20].map(n => (
                  <button
                    key={n}
                    onClick={() => setPeople(n)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${people === n ? 'bg-[#5A5A40] text-white' : 'bg-[#f0f0eb] text-[#4a4a3a] hover:bg-[#e0e0d8]'}`}
                  >{n}</button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="px-5 py-3 rounded-2xl font-bold text-[#4a4a3a] hover:bg-[#f0f0eb] transition-all flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={() => setStep(4)} className="px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] transition-all flex items-center gap-2">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Notes + Generate */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">Any special requests?</h2>
              <p className="text-sm text-[#9e9e9e] mb-4">Allergies, cravings, dietary needs? (optional)</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. No onions, spicy food, I want chapati..."
                rows={3}
                className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5A5A40] resize-none transition-all mb-5"
              />

              {/* Summary */}
              <div className="bg-[#f7f7f2] rounded-2xl p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Budget</p>
                  <p className="font-bold text-[#1a1a1a] mt-0.5">{currency} {budget || '0'}</p>
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Category</p>
                  <p className="font-bold text-[#1a1a1a] capitalize mt-0.5">{category}</p>
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Meal</p>
                  <p className="font-bold text-[#1a1a1a] capitalize mt-0.5">{mealType}</p>
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">People</p>
                  <p className="font-bold text-[#1a1a1a] mt-0.5">{people}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(3)} className="px-5 py-3 rounded-2xl font-bold text-[#4a4a3a] hover:bg-[#f0f0eb] transition-all flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-8 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Finding meals…</>
                  ) : (
                    <><Sparkles size={18} /> Jisort Dishi!</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick tags */}
      {step === 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9e9e9e] mb-3">Popular budgets</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[100, 200, 500, 1000].map(amt => (
              <button
                key={amt}
                onClick={() => setBudget(String(amt))}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${Number(budget) === amt ? 'bg-[#5A5A40] text-white' : 'bg-white border border-[#eaeaE0] text-[#4a4a3a] hover:border-[#5A5A40]'}`}
              >
                {currency} {amt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
