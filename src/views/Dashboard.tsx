'use client';

import { useState } from 'react';
import { Sparkles, Refrigerator, AlertTriangle, BookOpen, ShoppingBag, Plus, ArrowRight, ChevronRight, Clock, ChefHat, Search, Heart } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useData } from '../context/DataContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const { currency } = useCurrency();
  const { profile, pantry, recipes, isLoadingProfile, isLoadingPantry, isLoadingRecipes, refreshProfile, refreshPantry, refreshRecipes } = useData();
  const [loading, setLoading] = useState(false);
  
  // Ensure data is fresh (uses cached data immediately, refreshes in background)
  useState(() => {
    refreshProfile();
    refreshPantry();
    refreshRecipes();
  });

  // Show loading state only on initial load when no cached data
  if (isLoadingProfile && !profile) {
    return (
      <div className="max-w-4xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A5A40] mx-auto mb-4"></div>
          <p className="text-[#4a4a3a]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.name?.split(' ')[0] || 'Chef';

  const expiringItems = pantry.filter(item => {
    if (!item.expiry_date) return false;
    const diffDays = Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / 86400000);
    return diffDays >= 0 && diffDays <= 3;
  });
  const expiredItems = pantry.filter(item => {
    if (!item.expiry_date) return false;
    return new Date(item.expiry_date).getTime() < Date.now();
  });
  const recentRecipes = recipes?.slice(0, 3) || [];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">Welcome back, {displayName}!</h2>
        <p className="text-[#4a4a3a]">What are we cooking today?</p>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <ShoppingBag size={18} className="text-[#5A5A40]" />, label: 'Pantry Items', value: pantry.filter(i => i.storage_type === 'pantry').length, href: '/pantry' },
          { icon: <Refrigerator size={18} className="text-blue-500" />, label: 'In Fridge', value: pantry.filter(i => i.storage_type === 'fridge').length, href: '/fridge' },
          { icon: <AlertTriangle size={18} className="text-orange-500" />, label: 'Expiring Soon', value: expiringItems.length + expiredItems.length, href: '/pantry', urgent: expiringItems.length + expiredItems.length > 0 },
          { icon: <BookOpen size={18} className="text-[#5A5A40]" />, label: 'My Recipes', value: recipes.length, href: '/recipes' },
        ].map((stat, i) => (
          <Link key={i} href={stat.href}>
            <div className={`bg-white rounded-2xl border p-4 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer ${
              stat.urgent ? 'border-orange-200 bg-orange-50' : 'border-[#eaeaE0]'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                stat.urgent ? 'bg-orange-100' : 'bg-[#f0f0eb]'
              }`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-[#1a1a1a] leading-none">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e] mt-0.5 truncate">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Expiry Warnings */}
      {(expiringItems.length > 0 || expiredItems.length > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="flex items-center gap-2 font-bold text-sm text-orange-700">
              <AlertTriangle size={16} /> Food needs attention
            </p>
            <Link href="/pantry" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiredItems.map(item => (
              <span key={item.item_id} className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded-full">
                {item.item_name} · expired
              </span>
            ))}
            {expiringItems.map(item => {
              const days = Math.ceil((new Date(item.expiry_date!).getTime() - Date.now()) / 86400000);
              return (
                <span key={item.item_id} className="text-xs font-bold px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full">
                  {item.item_name} · {days === 0 ? 'today' : `${days}d left`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA: Find Meals */}
      <section className="bg-gradient-to-br from-[#5A5A40] to-[#4a4a3a] rounded-[32px] p-8 mb-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ChefHat size={140} />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4">
            <Sparkles size={12} /> AI-Powered Suggestions
          </div>
          <h2 className="text-3xl font-bold mb-3">What do you want to eat?</h2>
          <p className="text-white/80 mb-6 leading-relaxed">
            Tell us your budget, what you're craving, and how many people — we'll find meals that fit perfectly.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/find-meals">
              <button className="px-6 py-3 bg-white text-[#5A5A40] rounded-2xl font-bold hover:bg-[#f0f0eb] transition-all flex items-center gap-2">
                <Search size={18} /> Find Meals
              </button>
            </Link>
            <Link href="/meals">
              <button className="px-6 py-3 bg-white/20 text-white rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center gap-2">
                <Heart size={18} /> Saved Meals
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#9e9e9e] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/pantry">
            <div className="flex items-center gap-3 bg-white border border-[#eaeaE0] rounded-2xl px-5 py-4 hover:shadow-md hover:border-[#5A5A40] transition-all group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-[#f0f0eb] flex items-center justify-center shrink-0">
                <Plus size={18} className="text-[#5A5A40]" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#1a1a1a]">Add to Pantry</p>
                <p className="text-xs text-[#9e9e9e]">Store dry goods & staples</p>
              </div>
              <ChevronRight size={16} className="text-[#9e9e9e] ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link href="/fridge">
            <div className="flex items-center gap-3 bg-white border border-[#eaeaE0] rounded-2xl px-5 py-4 hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#1a1a1a]">Add to Fridge</p>
                <p className="text-xs text-[#9e9e9e]">Track fresh & cold items</p>
              </div>
              <ChevronRight size={16} className="text-[#9e9e9e] ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link href="/recipes/create">
            <div className="flex items-center gap-3 bg-white border border-[#eaeaE0] rounded-2xl px-5 py-4 hover:shadow-md hover:border-[#5A5A40] transition-all group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-[#f0f0eb] flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-[#5A5A40]" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#1a1a1a]">Create Recipe</p>
                <p className="text-xs text-[#9e9e9e]">Save a new dish</p>
              </div>
              <ChevronRight size={16} className="text-[#9e9e9e] ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Recipes */}
      {recentRecipes.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#9e9e9e]">Recent Recipes</h3>
            <Link href="/recipes" className="text-xs font-bold text-[#5A5A40] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentRecipes.map(recipe => (
              <Link key={recipe.recipe_id} href="/recipes">
                <div className="bg-white border border-[#eaeaE0] rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-sm text-[#1a1a1a] line-clamp-1">{recipe.title}</h4>
                    <ChevronRight size={14} className="text-[#9e9e9e] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-[#9e9e9e] line-clamp-2 mb-3">{recipe.description}</p>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">
                    <span className="flex items-center gap-1"><Clock size={10} /> {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)}m</span>
                    <span className="px-2 py-0.5 bg-[#f0f0eb] rounded-full capitalize">{recipe.difficulty}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
