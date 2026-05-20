'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  UtensilsCrossed, Clock, Users, ChefHat, Plus, X, Eye, EyeOff, 
  Save, ArrowLeft, Tag, Apple, ArrowRight, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useRecipeForm } from '../hooks/useRecipeForm';

const CUISINE_OPTIONS = [
  'African', 'Asian', 'Caribbean', 'European', 'Latin American', 
  'Middle Eastern', 'North American', 'Oceanian'
];

const CATEGORY_OPTIONS = [
  { value: 'Breakfast', label: 'Breakfast', description: 'Morning food' },
  { value: 'Lunch', label: 'Lunch', description: 'Midday meal' },
  { value: 'Dinner', label: 'Dinner', description: 'Evening meal' },
  { value: 'Supper', label: 'Supper', description: 'Evening meal' },
  { value: 'Snack', label: 'Snack', description: 'Small food between meals' },
  { value: 'Dessert', label: 'Dessert', description: 'Sweet treat after meal' },
  { value: 'Soup', label: 'Soup', description: 'Hot liquid food' },
  { value: 'Side Dish', label: 'Side Dish', description: 'Extra food with main meal' },
  { value: 'Beverage', label: 'Beverage', description: 'Drink' }
];

const COMMON_UNITS = [
  'cups', 'tablespoons', 'teaspoons', 'ounces', 'pounds', 
  'grams', 'kilograms', 'milliliters', 'liters', 'pieces'
];

const DIETARY_TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
  'nut-free', 'low-carb', 'keto', 'paleo'
];

// Step definitions
const STEPS = [
  { id: 1, title: 'Basic Info', icon: UtensilsCrossed, description: 'Tell us about your recipe' },
  { id: 2, title: 'Ingredients', icon: Apple, description: 'What do you need?' },
  { id: 3, title: 'Instructions', icon: ChefHat, description: 'How to make it' },
  { id: 4, title: 'Details', icon: Tag, description: 'Tags and visibility' },
  { id: 5, title: 'Review', icon: Eye, description: 'Check your recipe' }
];

export default function CreateRecipe() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Use custom hook for form state management
  const {
    recipe,
    updateRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addStep,
    updateStep,
    removeStep,
    addTag,
    removeTag
  } = useRecipeForm();

  // Step navigation
  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  };

  // Validation for each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const hasMealTypes = recipe.category && recipe.category.split(',').filter(c => c.trim()).length > 0;
        return Boolean(
        recipe.title.trim() !== '' && 
        recipe.description.trim() !== '' && 
        recipe.cuisine !== '' && 
        hasMealTypes
      );
      case 2:
        return recipe.ingredients.length > 0;
      case 3:
        return recipe.steps.length > 0;
      case 4:
        return true; // Optional step
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  
  const handleSubmit = async () => {
    // Final validation
    if (!recipe.title.trim()) {
      toast.error('Recipe title is required');
      return;
    }
    
    if (!recipe.description.trim()) {
      toast.error('Recipe description is required');
      return;
    }

    if (recipe.ingredients.length === 0) {
      toast.error('At least one ingredient is required');
      return;
    }

    if (recipe.steps.length === 0) {
      toast.error('At least one cooking step is required');
      return;
    }

    setIsLoading(true);
    try {
      await api.createRecipe(recipe);
      toast.success('Recipe created successfully!');
      router.push('/recipes');
    } catch (error) {
      console.error('Failed to create recipe:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create recipe');
    } finally {
      setIsLoading(false);
    }
  };

  // Step components
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep key="basic-info" recipe={recipe} updateRecipe={updateRecipe} />;
      case 2:
        return <IngredientsStep key="ingredients" recipe={recipe} updateRecipe={updateRecipe} addIngredient={addIngredient} updateIngredient={updateIngredient} removeIngredient={removeIngredient} />;
      case 3:
        return <InstructionsStep key="instructions" recipe={recipe} updateRecipe={updateRecipe} addStep={addStep} updateStep={updateStep} removeStep={removeStep} />;
      case 4:
        return <DetailsStep key="details" recipe={recipe} updateRecipe={updateRecipe} addTag={addTag} removeTag={removeTag} />;
      case 5:
        return <ReviewStep key="review" recipe={recipe} />;
      default:
        return null;
    }
  };

  // Extract step components outside main component to prevent re-creation
const BasicInfoStep = ({ recipe, updateRecipe }: any) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Use local state for inputs to isolate typing issues
  const [localTitle, setLocalTitle] = useState(recipe.title || '');
  const [localDescription, setLocalDescription] = useState(recipe.description || '');

  // Sync local state when global state changes (e.g., when navigating back to this step)
  useEffect(() => {
    setLocalTitle(recipe.title || '');
  }, [recipe.title]);

  useEffect(() => {
    setLocalDescription(recipe.description || '');
  }, [recipe.description]);

  // Immediate updates for input fields
  const updateTitle = (value: string) => {
    setLocalTitle(value);
    updateRecipe('title', value);
  };

  const updateDescription = (value: string) => {
    setLocalDescription(value);
    updateRecipe('description', value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('meal-type-dropdown');
      const button = event.target as HTMLElement;
      
      if (dropdown && !dropdown.contains(button) && !button.closest('#meal-type-button')) {
        dropdown.classList.add('hidden');
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">Recipe Name *</label>
        <p className="text-xs text-[#9e9e9e] mb-2">What do you call this recipe?</p>
        <input
          type="text"
          value={localTitle}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="e.g., Grandma's Chocolate Chip Cookies"
          className="w-full px-4 py-3 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">Description *</label>
        <p className="text-xs text-[#9e9e9e] mb-2">Tell people what makes this recipe special</p>
        <textarea
          value={localDescription}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="A short, tasty description..."
          rows={3}
          className="w-full px-4 py-3 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">Type of Food *</label>
          <p className="text-xs text-[#9e9e9e] mb-2">Where is this food from?</p>
          <select
            value={recipe.cuisine}
            onChange={(e) => updateRecipe('cuisine', e.target.value)}
            className="w-full px-4 py-3 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
          >
            <option value="">Choose food type</option>
            {CUISINE_OPTIONS.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">Meal Types *</label>
          <p className="text-xs text-[#9e9e9e] mb-2">When can people eat this? (Choose all that apply)</p>
          <div className="relative">
            <button
              id="meal-type-button"
              type="button"
              onClick={() => {
                const dropdown = document.getElementById('meal-type-dropdown');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                  setIsDropdownOpen(!isDropdownOpen);
                }
              }}
              className="w-full px-4 py-3 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-left bg-white flex items-center justify-between"
            >
              <span className="text-[#1a1a1a]">
                {recipe.category && recipe.category.split(',').filter(c => c.trim()).length > 0 
                  ? `${recipe.category.split(',').filter(c => c.trim()).length} meal type(s) selected`
                  : 'Choose meal types...'
                }
              </span>
              <ChevronDown size={20} className="text-[#4a4a3a]" />
            </button>
            
            <div
              id="meal-type-dropdown"
              className="hidden absolute z-10 w-full mt-1 bg-white border border-[#eaeaE0] rounded-lg shadow-lg max-h-64 overflow-y-auto"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <label
                  key={category.value}
                  className="flex items-center gap-3 p-3 hover:bg-[#f5f5f0] cursor-pointer transition-colors border-b border-[#eaeaE0] last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={recipe.category?.includes(category.value) || false}
                    onChange={(e) => {
                      const current = recipe.category ? recipe.category.split(',') : [];
                      if (e.target.checked) {
                        updateRecipe('category', [...current, category.value].join(','));
                      } else {
                        updateRecipe('category', current.filter(c => c !== category.value).join(','));
                      }
                    }}
                    className="w-4 h-4 text-[#5A5A40] border-gray-300 rounded focus:ring-[#5A5A40]"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-[#1a1a1a]">{category.label}</span>
                    <span className="text-xs text-[#9e9e9e] block">- {category.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Selected tags display */}
          {recipe.category && recipe.category.split(',').filter(c => c.trim()).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recipe.category.split(',').filter(c => c.trim()).map((selectedCategory) => {
                const category = CATEGORY_OPTIONS.find(cat => cat.value === selectedCategory);
                return category ? (
                  <span
                    key={selectedCategory}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#5A5A40] text-white rounded-full text-sm"
                  >
                    {category.label}
                    <button
                      type="button"
                      onClick={() => {
                        const current = recipe.category ? recipe.category.split(',') : [];
                        updateRecipe('category', current.filter(c => c !== selectedCategory).join(','));
                      }}
                      className="hover:text-[#eaeaE0]"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
          
          {(!recipe.category || recipe.category.split(',').filter(c => c.trim()).length === 0) && (
            <p className="text-xs text-red-600 mt-2">Please select at least one meal type</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">Prep Time *</label>
          <p className="text-xs text-[#9e9e9e] mb-2">Time to get ready (minutes)</p>
          <input
            type="number"
            value={recipe.prep_time_minutes}
            onChange={(e) => updateRecipe('prep_time_minutes', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-4 py-3 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">Cook Time *</label>
          <p className="text-xs text-[#9e9e9e] mb-2">Time to cook (minutes)</p>
          <input
            type="number"
            value={recipe.cook_time_minutes}
            onChange={(e) => updateRecipe('cook_time_minutes', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-4 py-3 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">How Many People *</label>
          <p className="text-xs text-[#9e9e9e] mb-2">Number of servings</p>
          <input
            type="number"
            value={recipe.servings}
            onChange={(e) => updateRecipe('servings', parseInt(e.target.value) || 1)}
            min="1"
            className="w-full px-4 py-3 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">How Hard is It? *</label>
        <p className="text-xs text-[#9e9e9e] mb-2">Choose cooking difficulty level</p>
        <select
          value={recipe.difficulty}
          onChange={(e) => updateRecipe('difficulty', e.target.value as 'easy' | 'medium' | 'hard')}
          className="w-full px-4 py-3 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
        >
          <option value="easy">Easy - Simple to make</option>
          <option value="medium">Medium - Some cooking skill needed</option>
          <option value="hard">Hard - For experienced cooks</option>
        </select>
      </div>
    </div>
  );
};

  const IngredientsStep = ({ recipe, updateRecipe, addIngredient, updateIngredient, removeIngredient }: any) => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">What ingredients do you need?</h3>
          <p className="text-sm text-[#9e9e9e]">List everything needed to make your recipe</p>
        </div>
        <button
          onClick={addIngredient}
          className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-lg hover:bg-[#4a4a30] transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          Add Ingredient
        </button>
      </div>

      <div className="space-y-3">
        {recipe.ingredients.map((ingredient: any, index: number) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 items-start p-4 border border-[#eaeaE0] rounded-lg">
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <input
                type="number"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                placeholder="How much?"
                min="0"
                step="0.1"
                className="w-24 px-3 py-2 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
              <label className="text-xs text-[#9e9e9e] whitespace-nowrap">Amount</label>
            </div>
            
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <select
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                className="w-full sm:w-32 px-3 py-2 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              >
                <option value="">Unit</option>
                {COMMON_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <label className="text-xs text-[#9e9e9e] whitespace-nowrap">Measure</label>
            </div>
            
            <div className="flex gap-2 items-center flex-1">
              <input
                type="text"
                value={ingredient.notes}
                onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                placeholder="What ingredient?"
                className="flex-1 px-3 py-2 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
              <button
                onClick={() => removeIngredient(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {recipe.ingredients.length === 0 && (
          <div className="text-center py-8 text-[#9e9e9e]">
            <Apple size={48} className="mx-auto mb-3 opacity-50" />
            <p className="mb-2">No ingredients added yet</p>
            <p className="text-sm">Click "Add Ingredient" to get started</p>
          </div>
        )}
      </div>
    </div>
  );

  const InstructionsStep = ({ recipe, updateRecipe, addStep, updateStep, removeStep }: any) => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">How do you make it?</h3>
          <p className="text-sm text-[#9e9e9e]">Write step-by-step cooking instructions</p>
        </div>
        <button
          onClick={addStep}
          className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-lg hover:bg-[#4a4a30] transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          Add Step
        </button>
      </div>

      <div className="space-y-4">
        {recipe.steps.map((step: any, index: number) => (
          <div key={index} className="border border-[#eaeaE0] rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#5A5A40] text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  value={step.instruction}
                  onChange={(e) => updateStep(index, 'instruction', e.target.value)}
                  placeholder="What should people do in this step?"
                  rows={3}
                  className="w-full px-3 py-2 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#4a4a3a]" />
                    <input
                      type="number"
                      value={step.duration_minutes || ''}
                      onChange={(e) => updateStep(index, 'duration_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="How long (minutes)?"
                      min="0"
                      className="w-32 px-2 py-1 border border-[#eaeaE0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                    />
                    <label className="text-xs text-[#9e9e9e]">Optional time</label>
                  </div>
                  <button
                    onClick={() => removeStep(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                    <span className="hidden sm:inline ml-1 text-sm">Remove step</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {recipe.steps.length === 0 && (
          <div className="text-center py-8 text-[#9e9e9e]">
            <ChefHat size={48} className="mx-auto mb-3 opacity-50" />
            <p className="mb-2">No cooking steps added yet</p>
            <p className="text-sm">Click "Add Step" to start writing instructions</p>
          </div>
        )}
      </div>
    </div>
  );

  const DetailsStep = ({ recipe, updateRecipe, addTag, removeTag }: any) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tags & Sharing</h3>
        <p className="text-sm text-[#9e9e9e] mb-4">Help people find your recipe and choose who can see it</p>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">Search Words</label>
          <p className="text-xs text-[#9e9e9e] mb-2">Add words to help people find your recipe</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {recipe.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#5A5A40] text-white rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-[#eaeaE0]"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type words and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-4 py-2 border border-[#eaeaE0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#4a4a3a] mb-2">Dietary Info</label>
          <p className="text-xs text-[#9e9e9e] mb-2">Choose any special diet information</p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const current = recipe.dietary_tags || [];
                  if (current.includes(tag)) {
                    updateRecipe('dietary_tags', current.filter((t: string) => t !== tag));
                  } else {
                    updateRecipe('dietary_tags', [...current, tag]);
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  recipe.dietary_tags?.includes(tag)
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-[#f5f5f0] text-[#4a4a3a] hover:bg-[#eaeaE0]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#f5f5f0] rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {recipe.is_public ? <Eye size={20} className="text-[#5A5A40]" /> : <EyeOff size={20} className="text-[#4a4a3a]" />}
              <div>
                <p className="font-semibold text-[#1a1a1a]">Who can see this recipe?</p>
                <p className="text-sm text-[#4a4a3a]">
                  {recipe.is_public ? 'Everyone can see it' : 'Only you can see it'}
                </p>
              </div>
            </div>
            <button
              onClick={() => updateRecipe('is_public', !recipe.is_public)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                recipe.is_public ? 'bg-[#5A5A40]' : 'bg-[#eaeaE0]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  recipe.is_public ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ReviewStep = ({ recipe }: any) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Check Your Recipe</h3>
        <p className="text-sm text-[#9e9e9e]">Make sure everything looks good before creating</p>
      </div>
      
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#eaeaE0]">
        <div className="text-center mb-6">
          <h4 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-2">{recipe.title || 'Untitled Recipe'}</h4>
          <p className="text-[#4a4a3a] mb-4">{recipe.description || 'No description provided'}</p>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#4a4a3a]">
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {recipe.prep_time_minutes + recipe.cook_time_minutes} min total
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} />
              {recipe.servings} people
            </span>
            <span className="px-3 py-1 bg-[#5A5A40] text-white rounded-full text-xs">
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {recipe.ingredients.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold mb-3">Ingredients ({recipe.ingredients.length})</h5>
            <div className="space-y-2">
              {recipe.ingredients.map((ing: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-[#5A5A40]">•</span>
                  <span>{ing.quantity} {ing.unit} {ing.notes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.steps.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold mb-3">How to Make ({recipe.steps.length} steps)</h5>
            <div className="space-y-3">
              {recipe.steps.map((step: any, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#5A5A40] text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <p className="text-sm text-[#4a4a3a]">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4 border-t border-[#eaeaE0]">
          <p className="text-sm text-[#9e9e9e]">
            {recipe.is_public ? '🌍 Everyone can see this recipe' : '🔒 Only you can see this recipe'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#f5f5f0] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">Create Recipe</h1>
            <p className="text-[#4a4a3a]">Let's create your recipe step by step</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div
                key={step.id}
                className="flex items-center cursor-pointer"
                onClick={() => goToStep(step.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-[#5A5A40] text-white'
                      : isCurrent
                      ? 'bg-[#5A5A40] text-white ring-2 ring-[#5A5A40] ring-offset-2'
                      : 'bg-[#eaeaE0] text-[#4a4a3a]'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-sm">✓</span>
                  ) : (
                    <StepIcon size={18} />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      isCompleted ? 'bg-[#5A5A40]' : 'bg-[#eaeaE0]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-[#4a4a3a]">{STEPS[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-2xl p-8 border border-[#eaeaE0]"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 text-[#4a4a3a] hover:bg-[#f5f5f0] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={20} />
          Previous
        </button>

        {currentStep === STEPS.length ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-lg hover:bg-[#4a4a30] disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Recipe'}
            <Save size={20} />
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!validateStep(currentStep)}
            className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-lg hover:bg-[#4a4a30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
