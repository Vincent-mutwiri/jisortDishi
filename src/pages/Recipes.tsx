import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  where,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { Search, Plus, Filter, Clock, Users, BookOpen, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { Recipe } from '../types';

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    cost: 500,
    time: 30,
    isPublic: true
  });

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      // Fetch public recipes
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('is_public', '==', true), orderBy('created_at', 'desc'));
      const querySnap = await getDocs(q);
      const list = querySnap.docs.map(doc => ({ ...doc.data(), recipe_id: doc.id })) as Recipe[];
      setRecipes(list);
    } catch (error) {
      console.error(error);
      // If index is missing, it will error out first time.
      // handleFirestoreError(error, OperationType.LIST, 'recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const recipesRef = collection(db, 'recipes');
      const ingredients = newRecipe.ingredients.split('\n').map(i => ({ name: i, amount: '' }));
      const steps = newRecipe.steps.split('\n');

      const docRef = await addDoc(recipesRef, {
        title: newRecipe.title,
        description: newRecipe.description,
        ingredients,
        steps,
        estimated_cost: Number(newRecipe.cost),
        preparation_time: Number(newRecipe.time),
        created_by: auth.currentUser.uid,
        is_public: newRecipe.isPublic,
        created_at: serverTimestamp()
      });

      toast.success('Recipe published!');
      setShowAddForm(false);
      fetchRecipes(); // Refresh list
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">Recipe Library</h2>
          <p className="text-[#4a4a3a]">Discover affordable meals or share your own creations.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map(recipe => (
            <motion.div
              layout
              key={recipe.recipe_id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-white rounded-[32px] overflow-hidden border border-[#eaeaE0] shadow-sm cursor-pointer group"
            >
              <div className="h-48 bg-[#f5f5f0] flex items-center justify-center text-[#5A5A40]">
                <BookOpen size={48} className="opacity-20 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2 text-[#9e9e9e] font-bold text-[10px] uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={12} /> {recipe.preparation_time}m</span>
                  <span>EST. {recipe.estimated_cost} KES</span>
                </div>
                <h4 className="text-xl font-bold mb-2 group-hover:text-[#5A5A40] transition-colors">{recipe.title}</h4>
                <p className="text-sm text-[#4a4a3a] line-clamp-2 leading-relaxed mb-6">{recipe.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#f0f0eb] border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        <Users size={12} />
                      </div>
                    ))}
                  </div>
                  <span className="text-[#5A5A40] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={20} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#fcfcfb] rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur rounded-full text-[#1a1a1a] shadow-sm z-10 hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="overflow-auto p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-4 py-1.5 bg-[#5A5A40] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    {selectedRecipe.estimated_cost} KES
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#4a4a3a]">
                    <Clock size={16} />
                    {selectedRecipe.preparation_time} minutes
                  </span>
                </div>

                <h3 className="text-4xl font-bold mb-6 tracking-tight">{selectedRecipe.title}</h3>
                <p className="text-lg text-[#4a4a3a] mb-10 leading-relaxed italic border-l-4 border-[#5A5A40] pl-6">
                  {selectedRecipe.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h5 className="text-xs font-bold uppercase text-[#9e9e9e] tracking-widest mb-6">Ingredients</h5>
                    <ul className="space-y-4">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex justify-between items-center py-2 border-b border-[#eaeaE0]">
                          <span className="font-semibold">{ing.name}</span>
                          <span className="text-sm text-[#4a4a3a]">{ing.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase text-[#9e9e9e] tracking-widest mb-6">Preparation Steps</h5>
                    <ol className="space-y-6">
                      {selectedRecipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f0f0eb] flex items-center justify-center font-bold text-xs">
                            {i + 1}
                          </span>
                          <p className="text-[#4a4a3a] leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Recipe Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              layout
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-8 md:p-12"
            >
              <h3 className="text-2xl font-bold mb-8">Share Your Dishi</h3>
              <form onSubmit={handleAddRecipe} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Recipe Title</label>
                  <input 
                    required
                    type="text"
                    value={newRecipe.title}
                    onChange={e => setNewRecipe({...newRecipe, title: e.target.value})}
                    placeholder="e.g. Spicy Rice with Beans"
                    className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Description</label>
                  <textarea 
                    value={newRecipe.description}
                    onChange={e => setNewRecipe({...newRecipe, description: e.target.value})}
                    placeholder="Brief summary of your meal..."
                    className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Ingredients (One per line)</label>
                    <textarea 
                      required
                      value={newRecipe.ingredients}
                      onChange={e => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                      placeholder="Rice&#10;Beans&#10;Onion"
                      className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Steps (One per line)</label>
                    <textarea 
                      required
                      value={newRecipe.steps}
                      onChange={e => setNewRecipe({...newRecipe, steps: e.target.value})}
                      placeholder="Wash rice&#10;Boil water"
                      className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none min-h-[120px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Est. Cost (KES)</label>
                    <input 
                      type="number"
                      value={newRecipe.cost}
                      onChange={e => setNewRecipe({...newRecipe, cost: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Prep Time (mins)</label>
                    <input 
                      type="number"
                      value={newRecipe.time}
                      onChange={e => setNewRecipe({...newRecipe, time: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] transition-all">
                  Publish Publicly
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
