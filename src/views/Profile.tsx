'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, CreditCard, Pizza, Bell, ShieldCheck, Save, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserProfile } from '../types';
import { api } from '../lib/api';
import { clearLocalUser } from '../lib/session';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfile(await api.getProfile());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const updated = await api.updateProfile({
        name: profile.name,
        budget_preference: Number(profile.budget_preference),
        dietary_preferences: profile.dietary_preferences,
        currency: profile.currency
      });
      setProfile(updated);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleDiet = (tag: string) => {
    if (!profile) return;
    const current = profile.dietary_preferences || [];
    const updated = current.includes(tag) 
      ? current.filter(t => t !== tag)
      : [...current, tag];
    setProfile({ ...profile, dietary_preferences: updated });
  };

  const dietTags = ['Vegetarian', 'Vegan', 'No Sugar', 'High Protein', 'Gluten Free', 'Cheap Friendly'];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A5A40]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">Account Settings</h2>
        <p className="text-[#4a4a3a]">Personalize your meal suggestions and budget settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#eaeaE0] text-[#5A5A40] font-bold rounded-2xl shadow-sm">
            <User size={18} /> Profile Info
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#4a4a3a] hover:bg-white rounded-2xl transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#4a4a3a] hover:bg-white rounded-2xl transition-colors">
            <ShieldCheck size={18} /> Security
          </button>
          <button 
            onClick={() => {
              clearLocalUser();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors mt-8"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Form Area */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="bg-white rounded-[32px] border border-[#eaeaE0] p-8 space-y-8 shadow-sm">
            <section className="space-y-6">
              <h3 className="flex items-center gap-2 font-bold text-lg">
                <Settings size={20} className="text-[#5A5A40]" /> General Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Full Name</label>
                  <input 
                    type="text"
                    value={profile?.name || ''}
                    onChange={e => setProfile(p => p ? {...p, name: e.target.value} : null)}
                    className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Email Address</label>
                  <input 
                    disabled
                    type="email"
                    value={profile?.email || ''}
                    className="w-full px-4 py-3 bg-[#f0f0eb] border border-[#eaeaE0] rounded-xl text-[#9e9e9e] cursor-not-allowed"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-[#f0f0eb]">
              <h3 className="flex items-center gap-2 font-bold text-lg">
                <CreditCard size={20} className="text-[#5A5A40]" /> Budget Preferences
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Default Budget</label>
                  <input 
                    type="number"
                    value={profile?.budget_preference || 0}
                    onChange={e => setProfile(p => p ? {...p, budget_preference: parseInt(e.target.value)} : null)}
                    className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Currency</label>
                  <select 
                    value={profile?.currency || 'KES'}
                    onChange={e => setProfile(p => p ? {...p, currency: e.target.value} : null)}
                    className="w-full px-4 py-3 bg-[#fcfcfb] border border-[#eaeaE0] rounded-xl outline-none"
                  >
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="NGN">NGN (Nigerian Naira)</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-[#f0f0eb]">
              <h3 className="flex items-center gap-2 font-bold text-lg">
                <Pizza size={20} className="text-[#5A5A40]" /> Dietary Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {dietTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDiet(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      profile?.dietary_preferences?.includes(tag)
                        ? 'bg-[#5A5A40] text-white shadow-md'
                        : 'bg-[#f0f0eb] text-[#4a4a3a] hover:bg-[#eaeaE0]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <button 
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving Changes...' : 'Save All Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
