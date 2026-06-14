'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Clock, ChefHat, ShoppingBag, CheckCircle, Utensils, Info, Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useSavedMeals } from '../context/SavedMealsContext';
import { useCurrency } from '../context/CurrencyContext';
import { useData } from '../context/DataContext';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../lib/api';
import type { GeminiMealSuggestion } from '../lib/gemini';

const MEAL_EMOJIS = ['🍲', '🥘', '🍜', '🥗', '🍱', '🫕', '🥩', '🍳', '🥙', '🍛'];

export default function Suggestions() {
  const router = useRouter();
  const { suggestions, budget: suggestionBudget, saveMeal, unsaveMeal, isSaved } = useSavedMeals();
  const { currency, format } = useCurrency();
  const { savedMeals, refreshSavedMeals } = useData();
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // Debounce search input
  
  const [selectedMeal, setSelectedMeal] = useState<GeminiMealSuggestion | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'cost_asc' | 'cost_desc' | 'time'>('default');

  // Use debounced search for filtering
  const filtered = useMemo(() => {
    let list = [...suggestions];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.suggested_ingredients.some(i => i.name.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'cost_asc') list.sort((a, b) => a.estimated_total_cost - b.estimated_total_cost);
    if (sortBy === 'cost_desc') list.sort((a, b) => b.estimated_total_cost - a.estimated_total_cost);
    if (sortBy === 'time') list.sort((a, b) => a.prep_time_mins - b.prep_time_mins);
    return list;
  }, [suggestions, debouncedSearch, sortBy]);

  const handleToggleSave = async (meal: GeminiMealSuggestion) => {
    setSaving(meal.title);
    try {
      if (isSaved(meal.title)) {
        const saved = JSON.parse(localStorage.getItem('jisort_saved_meals') || '[]');
        const found = saved.find((m: any) => m.title === meal.title);
        if (found) {
          unsaveMeal(found.id);
          await api.deleteSavedMeal(found.id).catch(() => {});
          toast.success('Removed from saved meals');
        }
      } else {
        try {
          await api.saveMealToDb({
            title: meal.title,
            description: meal.description,
            suggested_ingredients: meal.suggested_ingredients,
            steps: meal.steps,
            estimated_total_cost: meal.estimated_total_cost,
            prep_time_mins: meal.prep_time_mins,
            nutritional_info: meal.nutritional_info,
            budget: suggestionBudget ?? 0,
            currency,
          });
          saveMeal(meal, suggestionBudget ?? 0, currency);
          toast.success('Saved to your meals!');
        } catch (e: any) {
          saveMeal(meal, suggestionBudget ?? 0, currency);
          toast.success(e?.message?.includes('Already saved') ? 'Already saved' : 'Saved locally');
        }
      }
    } finally {
      setSaving(null);
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <Utensils size={52} className="mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">No suggestions yet</h2>
        <p className="text-[#9e9e9e] mb-6">Go back to the dashboard and use the wizard to generate meal ideas.</p>
        <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] transition-colors inline-flex items-center gap-2">
          <Sparkles size={16} /> Generate Suggestions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-[#eaeaE0] transition-colors text-[#4a4a3a]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Suggested Meals</h2>
          <p className="text-sm text-[#9e9e9e]">
            {filtered.length} of {suggestions.length} options within {suggestionBudget ? format(suggestionBudget) : 'your budget'}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#5A5A40] text-[#5A5A40] rounded-2xl text-sm font-bold hover:bg-[#f0f0eb] transition-all"
        >
          <Sparkles size={14} /> New Search
        </button>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search meals, ingredients..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-[#eaeaE0] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-[#1a1a1a]">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#9e9e9e] shrink-0" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-white border border-[#eaeaE0] rounded-2xl text-sm font-bold text-[#4a4a3a] outline-none focus:ring-2 focus:ring-[#5A5A40] cursor-pointer"
          >
            <option value="default">Best match</option>
            <option value="cost_asc">Cheapest first</option>
            <option value="cost_desc">Most expensive</option>
            <option value="time">Quickest first</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-[#9e9e9e] font-bold">No results for "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((meal, idx) => {
            const saved = isSaved(meal.title);
            const pantryCount = meal.suggested_ingredients.filter(i => i.is_in_pantry).length;
            const originalIdx = suggestions.indexOf(meal);

            return (
              <motion.div
                key={meal.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-[24px] border border-[#eaeaE0] shadow-sm overflow-hidden cursor-pointer group"
                onClick={() => setSelectedMeal(meal)}
              >
                {/* Card top band */}
                <div className="h-28 bg-gradient-to-br from-[#f5f5f0] to-[#eaeae0] flex items-center justify-center relative">
                  <span className="text-5xl">{MEAL_EMOJIS[(originalIdx >= 0 ? originalIdx : idx) % MEAL_EMOJIS.length]}</span>
                  {/* Save button */}
                  <button
                    onClick={e => { e.stopPropagation(); handleToggleSave(meal); }}
                    disabled={saving === meal.title}
                    className={`absolute top-3 right-3 p-2 rounded-xl transition-all disabled:opacity-50 ${
                      saved ? 'bg-red-100 text-red-500' : 'bg-white/80 text-[#9e9e9e] hover:text-red-400 hover:bg-white'
                    }`}
                  >
                    {saving === meal.title
                      ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      : <Heart size={16} fill={saved ? 'currentColor' : 'none'} />}
                  </button>
                  {/* Budget badge */}
                  <div className="absolute bottom-2 left-3 px-2.5 py-1 bg-[#5A5A40] text-white text-[10px] font-bold rounded-lg">
                    {format(meal.estimated_total_cost)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-[#1a1a1a] text-sm leading-snug mb-1 group-hover:text-[#5A5A40] transition-colors line-clamp-2">{meal.title}</h3>
                  <p className="text-xs text-[#9e9e9e] line-clamp-2 mb-3 leading-relaxed">{meal.description}</p>

                  <div className="flex items-center gap-3 text-[10px] font-bold text-[#9e9e9e] uppercase tracking-wide flex-wrap">
                    <span className="flex items-center gap-1"><Clock size={10} /> {meal.prep_time_mins}m</span>
                    {pantryCount > 0 && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={10} /> {pantryCount} from pantry
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMeal && (() => {
          const meal = selectedMeal;
          const saved = isSaved(meal.title);
          const pantryIngredients = meal.suggested_ingredients.filter(i => i.is_in_pantry);
          const toBuyIngredients = meal.suggested_ingredients.filter(i => !i.is_in_pantry);

          return (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setSelectedMeal(null)}
              />
              {/* Panel */}
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] shadow-2xl max-h-[90vh] overflow-y-auto md:max-w-2xl md:mx-auto md:left-0 md:right-0"
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-[#e0e0d8]" />
                </div>

                {/* Top bar */}
                <div className="flex items-start justify-between px-6 pt-3 pb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-xl font-bold text-[#1a1a1a] leading-tight">{meal.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs font-bold text-[#5A5A40]"><Clock size={11} /> {meal.prep_time_mins} min</span>
                      <span className="text-xs font-bold text-[#1a1a1a]">{format(meal.estimated_total_cost)}</span>
                      {pantryIngredients.length > 0 && (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                          <CheckCircle size={11} /> {pantryIngredients.length} from pantry
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedMeal(null)} className="p-2 rounded-xl hover:bg-[#f0f0eb] transition-all text-[#9e9e9e]">
                    <X size={20} />
                  </button>
                </div>

                <p className="px-6 text-sm text-[#4a4a3a] leading-relaxed mb-5 italic border-l-4 border-[#5A5A40] ml-6 pl-4">{meal.description}</p>

                <div className="px-6 space-y-6 pb-8">
                  {/* Ingredients */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9e9e9e] mb-3">
                      <ShoppingBag size={13} /> Ingredients & Cost
                    </h4>
                    {pantryIngredients.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-2">From your pantry</p>
                        <div className="space-y-1.5">
                          {pantryIngredients.map((ing, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-xl">
                              <div className="flex items-center gap-2">
                                <CheckCircle size={12} className="text-green-500 shrink-0" />
                                <span className="text-sm font-medium text-[#1a1a1a]">{ing.name}</span>
                              </div>
                              <span className="text-xs text-green-600 font-bold">{format(ing.approx_cost)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {toBuyIngredients.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e] mb-2">Need to buy</p>
                        <div className="space-y-1.5">
                          {toBuyIngredients.map((ing, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#fafafa] border border-[#eaeaE0] rounded-xl">
                              <span className="text-sm font-medium text-[#1a1a1a]">{ing.name}</span>
                              <span className="text-xs text-[#5A5A40] font-bold">{format(ing.approx_cost)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-[#5A5A40] rounded-xl mt-2">
                      <span className="text-sm font-bold text-white">Estimated Total</span>
                      <span className="text-sm font-bold text-white">{format(meal.estimated_total_cost)}</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9e9e9e] mb-3">
                      <ChefHat size={13} /> Preparation Steps
                    </h4>
                    <ol className="space-y-3">
                      {meal.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#5A5A40] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-sm text-[#4a4a3a] leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Nutrition */}
                  {meal.nutritional_info && (
                    <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed">{meal.nutritional_info}</p>
                    </div>
                  )}

                  {/* Save CTA */}
                  <button
                    onClick={() => handleToggleSave(meal)}
                    disabled={saving === meal.title}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 ${
                      saved ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100' : 'bg-[#5A5A40] text-white hover:bg-[#4a4a3a]'
                    }`}
                  >
                    {saving === meal.title
                      ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      : <Heart size={16} fill={saved ? 'currentColor' : 'none'} />}
                    {saved ? 'Remove from Saved Meals' : 'Save this Meal'}
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
