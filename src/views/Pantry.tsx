'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, Package, Refrigerator, Search, AlertCircle, ShoppingBag, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useData } from '../context/DataContext';
import { useDebounce } from '../hooks/useDebounce';

export default function Pantry({ storageType = 'pantry' }: { storageType?: 'fridge' | 'pantry' }) {
  const router = useRouter();
  const { pantry, isLoadingPantry, deletePantryItem, refreshPantry } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Ensure data is loaded
  useState(() => {
    refreshPantry();
  });

  // Filter items by storage type and search
  const items = useMemo(() => {
    return pantry
      .filter(i => i.storage_type === storageType)
      .filter(i => i.item_name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [pantry, storageType, debouncedSearch]);

  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      await deletePantryItem(itemId);
      toast.success(`Removed from ${storageType}`);
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };


  const isNearExpiry = (dateStr?: string) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            {storageType === 'fridge' ? <Refrigerator size={32} className="text-blue-500" /> : <ShoppingBag size={32} className="text-[#5A5A40]" />}
            <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">{storageType === 'fridge' ? 'Fridge' : 'Pantry'}</h2>
          </div>
          <p className="text-[#4a4a3a]">{storageType === 'fridge' ? 'Track what\'s in your fridge.' : 'Track dry goods and shelf items.'}</p>
        </div>
        <button
          onClick={() => router.push(`/${storageType}/add`)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white rounded-3xl border border-[#eaeaE0] p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9e9e9e]" size={20} />
          <input 
            type="text"
            placeholder={`Search your ${storageType}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-2xl outline-none focus:ring-2 focus:ring-[#5A5A40]"
          />
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#f0f0eb] rounded-xl">
            <Package size={16} />
            <span>{items.length} Total</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl">
            <AlertCircle size={16} />
            <span>{items.filter(i => isNearExpiry(i.expiry_date)).length} Expiring Soon</span>
          </div>
        </div>
      </div>

      {isLoadingPantry && !pantry.length ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A5A40]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <motion.div 
              layout
              key={item.item_id}
              className={`bg-white p-6 rounded-3xl border border-[#eaeaE0] shadow-sm flex items-start justify-between group ${
                isNearExpiry(item.expiry_date) ? 'border-orange-200 bg-orange-25/50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg mb-1">{item.item_name}</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#4a4a3a] mb-2">
                  <span className="px-2 py-0.5 bg-[#f0f0eb] rounded-lg text-xs font-bold uppercase tracking-wider">
                    {item.quantity} {item.unit}
                  </span>
                  {item.expiry_date && (() => {
                    const diffDays = Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / 86400000);
                    const expired = diffDays < 0;
                    const near = diffDays >= 0 && diffDays <= 3;
                    return (
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
                        expired ? 'bg-red-100 text-red-600' : near ? 'bg-orange-100 text-orange-600' : 'bg-green-50 text-green-700'
                      }`}>
                        <Calendar size={11} />
                        {expired ? `Expired ${Math.abs(diffDays)}d ago` : diffDays === 0 ? 'Expires today' : `${diffDays}d left`}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#9e9e9e] uppercase font-bold tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={10} /> Stored {new Date(item.date_added).toLocaleDateString()}</span>
                  {item.expiry_date && (
                    <span className="flex items-center gap-1"><Calendar size={10} /> Expires {new Date(item.expiry_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(item.item_id)}
                disabled={deletingId === item.item_id}
                className="p-2 text-[#9e9e9e] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
          
          {items.length === 0 && (
            <div className="md:col-span-3 text-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-[#eaeaE0]">
              {storageType === 'fridge' ? <Refrigerator size={48} className="mx-auto mb-4 opacity-20" /> : <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />}
              <p className="text-[#9e9e9e]">Your {storageType} is empty. Start adding items!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
