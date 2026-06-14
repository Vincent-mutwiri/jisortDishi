'use client';

import { useState, useEffect } from 'react';
import { Heart, Clock, ChefHat, ShoppingBag, CheckCircle, Info, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useSavedMeals } from '../context/SavedMealsContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../lib/api';
import type { SavedAIMeal } from '../types';

export default function SavedMeals() {
  const { savedMeals: localMeals, unsaveMeal } = useSavedMeals();
  const { format } = useCurrency();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dbMeals, setDbMeals] = useState<SavedAIMeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSavedMeals()
      .then(setDbMeals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Merge DB meals with local-only ones (by title dedup)
  const dbTitles = new Set(dbMeals.map(m => m.title));
  const localOnly = localMeals.filter(m => !dbTitles.has(m.title));
  const allMeals = [
    ...dbMeals.map(m => ({
      id: m.meal_id,
      meal_id: m.meal_id,
      title: m.title,
      description: m.description,
      suggested_ingredients: m.suggested_ingredients,
      steps: m.steps,
      estimated_total_cost: m.estimated_total_cost,
      prep_time_mins: m.prep_time_mins,
      nutritional_info: m.nutritional_info,
      savedAt: m.saved_at,
    })),
    ...localOnly.map(m => ({ ...m, meal_id: m.id })),
  ];

  const handleRemove = async (id: string, mealId: string, title: string) => {
    unsaveMeal(id);
    setDbMeals(prev => prev.filter(m => m.meal_id !== mealId));
    await api.deleteSavedMeal(mealId).catch(() => {});
    toast.success(`"${title}" removed`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A5A40]" />
      </div>
    );
  }

  if (allMeals.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <Heart size={52} className="mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">No saved meals yet</h2>
        <p className="text-[#9e9e9e]">Generate meal suggestions on the dashboard and save your favourites here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight flex items-center gap-2">
          <Heart size={22} className="text-red-500" fill="currentColor" /> Saved Meals
        </h2>
        <p className="text-sm text-[#9e9e9e]">{allMeals.length} meal{allMeals.length !== 1 ? 's' : ''} saved</p>
      </div>

      <div className="space-y-4">
        {allMeals.map((meal, mealIdx) => {
          const key = meal.id ?? String(mealIdx);
          const open = expanded === key;
          const pantryIngredients = meal.suggested_ingredients.filter(i => i.is_in_pantry);
          const toBuyIngredients = meal.suggested_ingredients.filter(i => !i.is_in_pantry);
          const totalCost = meal.suggested_ingredients.reduce((s, i) => s + i.approx_cost, 0);
          const savedDate = new Date(meal.savedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

          return (
            <motion.div
              key={meal.id ?? mealIdx}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`bg-white rounded-[24px] border overflow-hidden shadow-sm transition-all ${open ? 'border-[#5A5A40]/30' : 'border-[#eaeaE0]'}`}
            >
              {/* Header */}
              <div className="p-5 flex items-start gap-4 cursor-pointer" onClick={() => setExpanded(open ? null : key)}>
                <div className="w-12 h-12 rounded-2xl bg-[#f0f0eb] flex items-center justify-center shrink-0 text-2xl">
                  {['🍲', '🥘', '🍜', '🥗', '🍱'][mealIdx % 5]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[#1a1a1a] text-base leading-snug">{meal.title}</h3>
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(meal.id ?? '', meal.meal_id ?? meal.id ?? '', meal.title); }}
                      className="p-2 rounded-xl text-[#9e9e9e] hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-[#9e9e9e] mt-0.5 line-clamp-2">{meal.description}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs font-bold text-[#5A5A40]">
                      <Clock size={12} /> {meal.prep_time_mins}m
                    </span>
                    <span className="text-xs font-bold text-[#1a1a1a]">{format(totalCost)}</span>
                    {pantryIngredients.length > 0 && (
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} /> {pantryIngredients.length} from pantry
                      </span>
                    )}
                    <span className="text-[10px] text-[#c0c0b0] ml-auto">Saved {savedDate}</span>
                    <span className="text-[#9e9e9e]">
                      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-6 space-y-6 border-t border-[#f0f0eb] pt-4">

                      {/* Ingredients */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1a1a] mb-3">
                          <ShoppingBag size={15} className="text-[#5A5A40]" /> Ingredients & Pricing
                        </h4>

                        {pantryIngredients.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-2">From your pantry</p>
                            <div className="space-y-1.5">
                              {pantryIngredients.map((ing, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle size={13} className="text-green-500 shrink-0" />
                                    <span className="text-sm font-semibold text-[#1a1a1a]">{ing.name}</span>
                                  </div>
                                  <span className="text-xs text-green-600 font-bold">{format(ing.approx_cost)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {toBuyIngredients.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e] mb-2">Need to buy</p>
                            <div className="space-y-1.5">
                              {toBuyIngredients.map((ing, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#fafafa] border border-[#eaeaE0] rounded-xl">
                                  <span className="text-sm font-semibold text-[#1a1a1a]">{ing.name}</span>
                                  <span className="text-xs text-[#5A5A40] font-bold">{format(ing.approx_cost)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between px-3 py-2.5 bg-[#5A5A40] rounded-xl mt-3">
                          <span className="text-sm font-bold text-white">Estimated Total</span>
                          <span className="text-sm font-bold text-white">{format(totalCost)}</span>
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1a1a] mb-3">
                          <ChefHat size={15} className="text-[#5A5A40]" /> Steps
                        </h4>
                        <ol className="space-y-2.5">
                          {meal.steps.map((step, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="w-6 h-6 rounded-full bg-[#5A5A40] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-sm text-[#4a4a3a] leading-relaxed">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Nutrition */}
                      {meal.nutritional_info && (
                        <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-700 leading-relaxed">{meal.nutritional_info}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
