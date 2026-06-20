'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Clock, Users, BookOpen, ChevronRight, ArrowLeft, ChefHat, ShoppingBasket, BadgeDollarSign, Heart, Eye, MessageCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Recipe, RecipeComment } from '../types';
import { api } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import { getLocalUserId } from '../lib/session';

export default function Recipes() {
  const router = useRouter();
  const { format } = useCurrency();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      setRecipes(await api.getRecipes());
    } catch (error) {
      console.error(error);
      toast.error('Failed to load recipes!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const openRecipe = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setComments([]);
    setCommentText('');
    // Track view
    api.viewRecipe(recipe.recipe_id).catch(() => {});
    // Load comments
    try {
      const c = await api.getComments(recipe.recipe_id);
      setComments(c);
    } catch {}
    // Check if current user liked it
    const userId = getLocalUserId();
    if (userId && recipe.liked_by?.includes(userId)) {
      setLikedIds(prev => new Set(prev).add(recipe.recipe_id));
    }
    setLikeCounts(prev => ({ ...prev, [recipe.recipe_id]: recipe.likes ?? 0 }));
  };

  const handleLike = async (recipeId: string) => {
    try {
      const res = await api.likeRecipe(recipeId);
      setLikedIds(prev => {
        const s = new Set(prev);
        if (res.liked) {
          s.add(recipeId);
        } else {
          s.delete(recipeId);
        }
        return s;
      });
      setLikeCounts(prev => ({ ...prev, [recipeId]: res.likes }));
      if (selectedRecipe?.recipe_id === recipeId) {
        setSelectedRecipe(r => r ? { ...r, likes: res.likes } : r);
      }
    } catch {
      toast.error('Failed to like recipe');
    }
  };

  const handleComment = async () => {
    if (!selectedRecipe || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      const profile = await api.getProfile();
      const c = await api.addComment(selectedRecipe.recipe_id, commentText, profile.name);
      setComments(prev => [c, ...prev]);
      setCommentText('');
      setSelectedRecipe(r => r ? { ...r, comments_count: (r.comments_count ?? 0) + 1 } : r);
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const difficultyColor = (d: string) => {
    if (d === 'easy') return 'bg-green-100 text-green-700';
    if (d === 'hard') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  if (selectedRecipe) {
    const totalIngredientCost = selectedRecipe.ingredients.reduce((sum, ing) => {
      if (ing.costPerUnit != null) return sum + ing.costPerUnit * ing.quantity;
      return sum;
    }, 0);
    const hasCosts = selectedRecipe.ingredients.some(i => i.costPerUnit != null);
    const recipeId = selectedRecipe.recipe_id;
    const liked = likedIds.has(recipeId);
    const likeCount = likeCounts[recipeId] ?? selectedRecipe.likes ?? 0;

    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="flex items-center gap-2 text-[#4a4a3a] hover:text-[#1a1a1a] mb-6 group transition-colors"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Recipes</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-[#eaeaE0] overflow-hidden shadow-sm"
        >
          {/* Hero Banner */}
          <div className="h-48 bg-gradient-to-br from-[#5A5A40] to-[#3a3a28] flex items-center justify-center">
            <BookOpen size={72} className="text-white/20" />
          </div>

          <div className="p-8 md:p-10">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${difficultyColor(selectedRecipe.difficulty)}`}>
                {selectedRecipe.difficulty}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-[#4a4a3a]">
                <Clock size={15} /> {selectedRecipe.prep_time_minutes + selectedRecipe.cook_time_minutes} min
              </span>
              <span className="flex items-center gap-1.5 text-sm text-[#4a4a3a]">
                <Users size={15} /> {selectedRecipe.servings} servings
              </span>
              {selectedRecipe.estimated_cost > 0 && (
                <span className="flex items-center gap-1.5 text-sm font-bold text-[#5A5A40]">
                  <BadgeDollarSign size={15} /> Est. {format(selectedRecipe.estimated_cost)}
                </span>
              )}
              {selectedRecipe.cuisine && (
                <span className="px-3 py-1 bg-[#f0f0eb] rounded-full text-xs font-bold text-[#4a4a3a]">
                  {selectedRecipe.cuisine}
                </span>
              )}
            </div>

            {/* Title + Like/View/Comment stats */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] tracking-tight">{selectedRecipe.title}</h2>
              <button
                onClick={() => handleLike(recipeId)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm transition-all shrink-0 ${
                  liked ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-[#f5f5f0] text-[#4a4a3a] hover:bg-red-50 hover:text-red-400 border border-[#eaeaE0]'
                }`}
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                {likeCount > 0 ? likeCount : 'Like'}
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4 text-xs font-bold text-[#9e9e9e] uppercase tracking-widest">
              <span className="flex items-center gap-1"><Eye size={12} /> {(selectedRecipe.views ?? 0) + 1} views</span>
              <span className="flex items-center gap-1"><Heart size={12} /> {likeCount} likes</span>
              <span className="flex items-center gap-1"><MessageCircle size={12} /> {selectedRecipe.comments_count ?? comments.length} comments</span>
            </div>
            <p className="text-[#4a4a3a] text-lg leading-relaxed italic border-l-4 border-[#5A5A40] pl-5 mb-10">
              {selectedRecipe.description}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Ingredients */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9e9e9e] mb-5">
                  <ShoppingBasket size={16} /> Ingredients
                </h3>
                <ul className="space-y-0 border border-[#eaeaE0] rounded-2xl overflow-hidden">
                  {selectedRecipe.ingredients.map((ing, i) => {
                    const lineCost = ing.costPerUnit != null ? ing.costPerUnit * ing.quantity : null;
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between px-5 py-3.5 border-b border-[#eaeaE0] last:border-b-0 hover:bg-[#fafaf7] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#f0f0eb] text-[10px] font-bold flex items-center justify-center text-[#5A5A40]">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-[#1a1a1a]">
                            {/^ingredient_\d+$/.test(ing.name) ? (ing.notes || ing.name) : ing.name}
                          </span>
                          {ing.notes && !/^ingredient_\d+$/.test(ing.name) && (
                            <span className="text-xs text-[#9e9e9e] hidden sm:inline">({ing.notes})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-right shrink-0">
                          <span className="text-[#4a4a3a] font-medium">{ing.quantity} {ing.unit}</span>
                          {lineCost != null && (
                            <span className="text-[#5A5A40] font-bold text-xs bg-[#f0f0eb] px-2 py-0.5 rounded-lg">
                              {format(lineCost)}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {hasCosts && (
                  <div className="mt-3 flex justify-end">
                    <span className="text-sm font-bold text-[#5A5A40] bg-[#f0f0eb] px-4 py-2 rounded-xl">
                      Ingredients total: {format(totalIngredientCost)}
                    </span>
                  </div>
                )}
              </div>

              {/* Steps */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9e9e9e] mb-5">
                  <ChefHat size={16} /> Preparation Steps
                </h3>
                <ol className="space-y-5">
                  {selectedRecipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-sm">
                        {step.step_number ?? i + 1}
                      </span>
                      <div className="flex-1 pt-1">
                        <p className="text-[#1a1a1a] leading-relaxed">{step.instruction}</p>
                        {step.duration_minutes && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#9e9e9e]">
                            <Clock size={11} /> {step.duration_minutes} min
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Tags */}
            {(selectedRecipe.tags?.length > 0 || selectedRecipe.dietary_tags?.length > 0) && (
              <div className="mt-10 pt-8 border-t border-[#eaeaE0] flex flex-wrap gap-2">
                {[...selectedRecipe.tags, ...selectedRecipe.dietary_tags].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#f0f0eb] text-[#4a4a3a] rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="mt-10 pt-8 border-t border-[#eaeaE0]">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#9e9e9e] mb-5">
                <MessageCircle size={15} /> Comments ({comments.length})
              </h3>

              {/* Add comment */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  placeholder="Share your thoughts or tips..."
                  className="flex-1 px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]"
                />
                <button
                  onClick={handleComment}
                  disabled={commentLoading || !commentText.trim()}
                  className="px-4 py-3 bg-[#5A5A40] text-white rounded-2xl hover:bg-[#4a4a3a] disabled:opacity-40 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Comment list */}
              {comments.length === 0 ? (
                <p className="text-sm text-[#9e9e9e] text-center py-6">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {comments.map(c => (
                    <div key={c.comment_id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#5A5A40] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.user_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 bg-[#fafaf7] rounded-2xl px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#1a1a1a]">{c.user_name}</span>
                          <span className="text-[10px] text-[#9e9e9e]">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-[#4a4a3a] leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">Recipe Library</h2>
          <p className="text-[#4a4a3a]">Discover affordable meals or share your own creations.</p>
        </div>
        <button
          onClick={() => router.push('/recipes/create')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] transition-colors"
        >
          <Plus size={20} />
          Create Recipe
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl border border-[#eaeaE0] p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9e9e9e]" size={20} />
          <input
            type="text"
            placeholder="Search recipes (e.g. Ugali Managu, Beans stew)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-2xl outline-none focus:ring-2 focus:ring-[#5A5A40]"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 text-[#4a4a3a] hover:bg-[#f0f0eb] rounded-2xl transition-colors">
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A5A40]"></div>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-[#eaeaE0]">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-[#9e9e9e] mb-2">No recipes found.</p>
          <p className="text-sm text-[#9e9e9e]">Try a different search or create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <motion.div
              layout
              key={recipe.recipe_id}
              whileHover={{ y: -4 }}
              onClick={() => openRecipe(recipe)}
              className="bg-white rounded-[28px] overflow-hidden border border-[#eaeaE0] shadow-sm cursor-pointer group"
            >
              <div className="h-40 bg-gradient-to-br from-[#f5f5f0] to-[#eaeae0] flex items-center justify-center">
                <BookOpen size={44} className="text-[#5A5A40] opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-2 text-[#9e9e9e] text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={11} /> {recipe.prep_time_minutes + recipe.cook_time_minutes}m</span>
                  {recipe.estimated_cost > 0 && (
                    <span className="text-[#5A5A40]">Est. {format(recipe.estimated_cost)}</span>
                  )}
                </div>
                <h4 className="text-lg font-bold mb-1.5 group-hover:text-[#5A5A40] transition-colors leading-tight">{recipe.title}</h4>
                <p className="text-sm text-[#4a4a3a] line-clamp-2 leading-relaxed mb-4">{recipe.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${difficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#9e9e9e]">
                      <Users size={11} /> {recipe.servings}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#9e9e9e]">
                    {(recipe.likes ?? 0) > 0 && (
                      <span className="flex items-center gap-0.5 text-xs">
                        <Heart size={11} className="text-red-400" /> {recipe.likes}
                      </span>
                    )}
                    {(recipe.comments_count ?? 0) > 0 && (
                      <span className="flex items-center gap-0.5 text-xs">
                        <MessageCircle size={11} /> {recipe.comments_count}
                      </span>
                    )}
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#5A5A40]" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
