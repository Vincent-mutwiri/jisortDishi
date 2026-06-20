'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { lookupShelfLife, calcExpiry, today } from '../lib/shelfLife';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type { PantryItem } from '../types';

const UNITS = ['pcs', 'kg', 'g', 'liters', 'ml', 'cups', 'bunch', 'pack', 'box', 'bag', 'cans'];

interface WizardProps {
  storageType: 'fridge' | 'pantry';
  onDone: (item: PantryItem) => void;
  onCancel: () => void;
}

export default function PantryWizard({ storageType, onDone, onCancel }: WizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [storedDate, setStoredDate] = useState(today());
  const [expiry, setExpiry] = useState('');
  const [shelfHint, setShelfHint] = useState<{ days: number; label: string } | null>(null);

  // Auto-suggest expiry when name or storedDate changes
  useEffect(() => {
    if (!name) { setShelfHint(null); return; }
    const entry = lookupShelfLife(name);
    if (!entry) { setShelfHint(null); return; }
    const days = storageType === 'fridge' ? (entry.fridge ?? entry.pantry) : (entry.pantry ?? entry.fridge);
    if (!days) { setShelfHint(null); return; }
    setShelfHint({ days, label: entry.category });
    if (storedDate) setExpiry(calcExpiry(storedDate, days));
  }, [name, storedDate, storageType]);

  const applyShelfSuggestion = () => {
    if (shelfHint && storedDate) setExpiry(calcExpiry(storedDate, shelfHint.days));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const item = await api.addPantryItem({
        name,
        quantity: Number(quantity),
        unit,
        expiry: expiry || undefined,
        storage_type: storageType,
      });
      toast.success(`Added to ${storageType}!`);
      onDone(item);
    } catch {
      toast.error('Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { label: 'What is it?', num: 1 },
    { label: 'How much?', num: 2 },
    { label: 'Expiry', num: 3 },
  ];

  const canNext1 = name.trim().length > 0;
  const canNext2 = quantity > 0 && unit;

  return (
    <div className="bg-white rounded-[32px] border border-[#eaeaE0] shadow-sm overflow-hidden mb-8">
      {/* Step indicator */}
      <div className="flex border-b border-[#eaeaE0]">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`flex-1 flex flex-col items-center py-4 text-xs font-bold uppercase tracking-widest transition-colors ${
              step === s.num
                ? 'bg-[#5A5A40] text-white'
                : step > s.num
                ? 'bg-[#f0f0eb] text-[#5A5A40]'
                : 'text-[#9e9e9e]'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[10px] font-bold border-2 ${
              step > s.num ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : step === s.num ? 'border-white text-white' : 'border-[#eaeaE0] text-[#9e9e9e]'
            }`}>
              {step > s.num ? <Check size={12} /> : s.num}
            </span>
            {s.label}
          </div>
        ))}
      </div>

      <div className="p-5 md:p-6">
        <AnimatePresence mode="wait">
          {/* Step 1 — Name */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold mb-1">What are you storing?</h3>
                <p className="text-sm text-[#9e9e9e]">Enter the name of the food item</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#9e9e9e] tracking-widest mb-2">Item Name</label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={storageType === 'fridge' ? 'e.g. Milk, Chicken, Leftovers...' : 'e.g. Rice, Flour, Onions...'}
                  className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none text-lg"
                  onKeyDown={e => e.key === 'Enter' && canNext1 && setStep(2)}
                />
              </div>
              {shelfHint && (
                <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f0eb] rounded-xl text-sm">
                  <Info size={16} className="text-[#5A5A40] shrink-0" />
                  <span className="text-[#4a4a3a]">
                    <span className="font-bold">{shelfHint.label}</span> — typically lasts{' '}
                    <span className="font-bold text-[#5A5A40]">{shelfHint.days} days</span>{' '}
                    in the {storageType}. We'll use this to suggest an expiry date.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2 — Quantity + Date stored */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold mb-1">How much of <span className="text-[#5A5A40]">{name}</span>?</h3>
                <p className="text-sm text-[#9e9e9e]">Enter the quantity and when you stored it</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9e9e9e] tracking-widest mb-2">Quantity</label>
                  <input
                    autoFocus
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={e => setQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9e9e9e] tracking-widest mb-2">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#9e9e9e] tracking-widest mb-2">
                  <Clock size={12} className="inline mr-1" />Date Stored / Purchased
                </label>
                <input
                  type="date"
                  value={storedDate}
                  max={today()}
                  onChange={e => setStoredDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none"
                />
                <p className="text-xs text-[#9e9e9e] mt-1">This helps us calculate how long it will last</p>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Expiry */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold mb-1">When will it expire?</h3>
                <p className="text-sm text-[#9e9e9e]">Review or adjust the suggested expiry date</p>
              </div>

              {shelfHint && (
                <div className="bg-[#f0f0eb] rounded-2xl p-4 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9e9e9e]">Suggested based on food science</p>
                  <p className="text-sm text-[#4a4a3a]">
                    <span className="font-bold text-[#1a1a1a]">{name}</span> ({shelfHint.label}) typically lasts{' '}
                    <span className="font-bold text-[#5A5A40]">{shelfHint.days} days</span> in the {storageType}.
                  </p>
                  <p className="text-xs text-[#9e9e9e]">Stored on {new Date(storedDate).toLocaleDateString()} → expires around {expiry ? new Date(expiry).toLocaleDateString() : '—'}</p>
                  <button
                    type="button"
                    onClick={applyShelfSuggestion}
                    className="mt-2 text-xs font-bold text-[#5A5A40] underline"
                  >
                    Reset to suggested date
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[#9e9e9e] tracking-widest mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none"
                />
                <p className="text-xs text-[#9e9e9e] mt-1">Leave blank if unknown</p>
              </div>

              {/* Summary card */}
              <div className="border border-[#eaeaE0] rounded-2xl p-4 bg-[#fafaf7] space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9e9e9e] mb-3">Summary</p>
                <div className="flex justify-between text-sm"><span className="text-[#9e9e9e]">Item</span><span className="font-bold">{name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9e9e9e]">Quantity</span><span className="font-bold">{quantity} {unit}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9e9e9e]">Stored on</span><span className="font-bold">{new Date(storedDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9e9e9e]">Expires</span><span className={`font-bold ${expiry ? 'text-[#1a1a1a]' : 'text-[#9e9e9e]'}`}>{expiry ? new Date(expiry).toLocaleDateString() : 'Not set'}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#eaeaE0]">
          <button
            onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 text-[#4a4a3a] hover:bg-[#f0f0eb] rounded-xl font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !canNext1 : !canNext2}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#5A5A40] text-white rounded-xl font-bold hover:bg-[#4a4a3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : <><Check size={16} /> Save Item</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
