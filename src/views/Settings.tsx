'use client';

import { useState } from 'react';
import { Bell, ShieldCheck, Globe, Trash2, ChevronRight } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';
import { setLocalCurrency } from '../lib/session';

export default function Settings() {
  const { currency, setCurrency } = useCurrency();

  const [notifications, setNotifications] = useState({
    expiryAlerts: true,
    weeklyDigest: false,
    recipeSuggestions: true,
  });

  const toggle = (key: keyof typeof notifications) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    setLocalCurrency(code);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Settings</h2>
        <p className="text-sm text-[#9e9e9e]">Manage your app preferences</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-[28px] border border-[#eaeaE0] p-6 shadow-sm space-y-5">
        <h3 className="flex items-center gap-2 font-bold text-base text-[#1a1a1a]">
          <Bell size={18} className="text-[#5A5A40]" /> Notifications
        </h3>

        {[
          { key: 'expiryAlerts' as const, label: 'Expiry Alerts', desc: 'Get notified when food is about to expire' },
          { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Summary of your pantry and recipes every week' },
          { key: 'recipeSuggestions' as const, label: 'Recipe Suggestions', desc: 'Notify when new recipes match your pantry' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#f0f0eb] last:border-0">
            <div>
              <p className="font-semibold text-sm text-[#1a1a1a]">{item.label}</p>
              <p className="text-xs text-[#9e9e9e]">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-[#5A5A40]' : 'bg-[#e0e0d8]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Currency */}
      <div className="bg-white rounded-[28px] border border-[#eaeaE0] p-6 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-base text-[#1a1a1a]">
          <Globe size={18} className="text-[#5A5A40]" /> Display Currency
        </h3>
        <p className="text-xs text-[#9e9e9e]">This affects all cost displays across the app</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => handleCurrencyChange(c.code)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all border ${
                currency === c.code
                  ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                  : 'bg-[#f5f5f0] text-[#4a4a3a] border-[#eaeaE0] hover:border-[#5A5A40]'
              }`}
            >
              <span className="block text-base leading-none">{c.symbol}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{c.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-[28px] border border-[#eaeaE0] p-6 shadow-sm space-y-3">
        <h3 className="flex items-center gap-2 font-bold text-base text-[#1a1a1a]">
          <ShieldCheck size={18} className="text-[#5A5A40]" /> Security
        </h3>
        <button className="w-full flex items-center justify-between px-4 py-3 bg-[#f5f5f0] rounded-xl text-sm font-semibold text-[#1a1a1a] hover:bg-[#eaeaE0] transition-colors">
          Change Password
          <ChevronRight size={16} className="text-[#9e9e9e]" />
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-[28px] border border-red-100 p-6 shadow-sm space-y-3">
        <h3 className="flex items-center gap-2 font-bold text-base text-red-600">
          <Trash2 size={18} /> Danger Zone
        </h3>
        <p className="text-xs text-[#9e9e9e]">These actions are irreversible. Please be careful.</p>
        <button className="w-full flex items-center justify-between px-4 py-3 bg-red-50 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
          Delete My Account
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
