import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { Plus, Trash2, Calendar, Package, Refrigerator, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { PantryItem, StorageUnit } from '../types';

export default function Pantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    expiry: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      // For MVP, we assume a 'default' storage unit for everyone
      const storageRef = collection(db, 'users', auth.currentUser.uid, 'storage');
      const storageSnap = await getDocs(storageRef);
      
      let storageId = 'default';
      if (storageSnap.empty) {
        // Create default storage if it doesn't exist
        const newStorage = await addDoc(storageRef, {
          user_id: auth.currentUser.uid,
          type: 'fridge',
          name: 'Main Storage',
          created_at: serverTimestamp()
        });
        storageId = newStorage.id;
      } else {
        storageId = storageSnap.docs[0].id;
      }

      const itemsRef = collection(db, 'users', auth.currentUser.uid, 'storage', storageId, 'items');
      const itemsSnap = await getDocs(itemsRef);
      const itemsList = itemsSnap.docs.map(doc => ({
        ...doc.data(),
        item_id: doc.id
      })) as PantryItem[];
      
      setItems(itemsList);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'pantry_items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newItem.name) return;

    try {
      const storageRef = collection(db, 'users', auth.currentUser.uid, 'storage');
      const storageSnap = await getDocs(storageRef);
      const storageId = storageSnap.docs[0].id;

      const itemsRef = collection(db, 'users', auth.currentUser.uid, 'storage', storageId, 'items');
      const docRef = await addDoc(itemsRef, {
        user_id: auth.currentUser.uid,
        storage_id: storageId,
        item_name: newItem.name,
        quantity: Number(newItem.quantity),
        unit: newItem.unit,
        expiry_date: newItem.expiry || null,
        date_added: serverTimestamp()
      });

      setItems(prev => [...prev, {
        item_id: docRef.id,
        user_id: auth.currentUser!.uid,
        storage_id: storageId,
        item_name: newItem.name,
        quantity: Number(newItem.quantity),
        unit: newItem.unit,
        expiry_date: newItem.expiry || undefined,
        date_added: new Date().toISOString()
      }]);

      setNewItem({ name: '', quantity: 1, unit: 'pcs', expiry: '' });
      setShowAddForm(false);
      toast.success('Added to pantry!');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (itemId: string, storageId: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'storage', storageId, 'items', itemId));
      setItems(prev => prev.filter(i => i.item_id !== itemId));
      toast.success('Removed from pantry');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">Pantry & Fridge</h2>
          <p className="text-[#4a4a3a]">Manage what you have in stock to reduce waste.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4a4a3a] transition-colors"
        >
          <Plus size={20} />
          {showAddForm ? 'Close Form' : 'Add Item'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleAddItem} className="bg-white p-6 rounded-3xl border border-[#eaeaE0] shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-2">Item Name</label>
                <input 
                  required
                  type="text"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. Eggs, Milk, Kale"
                  className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-2">Qty & Unit</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="w-20 px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none"
                  />
                  <select 
                    value={newItem.unit}
                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    className="flex-1 px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="liters">liters</option>
                    <option value="bunch">bunch</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-2">Expiry Date</label>
                <input 
                  type="date"
                  value={newItem.expiry}
                  onChange={e => setNewItem({...newItem, expiry: e.target.value})}
                  className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-[#333]">
                  Save Item
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Stats */}
      <div className="bg-white rounded-3xl border border-[#eaeaE0] p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9e9e9e]" size={20} />
          <input 
            type="text"
            placeholder="Search your pantry..."
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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A5A40]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <motion.div 
              layout
              key={item.item_id}
              className={`bg-white p-6 rounded-3xl border border-[#eaeaE0] shadow-sm flex items-start justify-between group ${
                isNearExpiry(item.expiry_date) ? 'border-orange-200 bg-orange-25/50' : ''
              }`}
            >
              <div>
                <h4 className="font-bold text-lg mb-1">{item.item_name}</h4>
                <div className="flex items-center gap-2 text-sm text-[#4a4a3a] mb-3">
                  <span className="px-2 py-0.5 bg-[#f0f0eb] rounded-lg text-xs font-bold uppercase tracking-wider">
                    {item.quantity} {item.unit}
                  </span>
                  {item.expiry_date && (
                    <span className={`flex items-center gap-1 ${isNearExpiry(item.expiry_date) ? 'text-orange-600 font-bold' : ''}`}>
                      <Calendar size={12} />
                      {new Date(item.expiry_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#9e9e9e] uppercase font-bold tracking-widest leading-none">
                  Added {new Date(item.date_added).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(item.item_id, item.storage_id)}
                className="p-2 text-[#9e9e9e] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="md:col-span-3 text-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-[#eaeaE0]">
              <Refrigerator size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-[#9e9e9e]">Your pantry is empty. Start adding items!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
