'use client';

import { useState, useEffect } from 'react';
import { User, Pizza, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserProfile } from '../types';
import { api } from '../lib/api';

export default function Profile() {
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
        currency: profile.currency,
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
    setProfile({
      ...profile,
      dietary_preferences: current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag],
    });
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#5A5A40] flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {profile?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">{profile?.name}</h2>
          <p className="text-sm text-[#9e9e9e]">{profile?.email}</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-[28px] border border-[#eaeaE0] p-6 space-y-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-base text-[#1a1a1a]">
            <User size={18} className="text-[#5A5A40]" /> Personal Info
          </h3>
          <div>
            <label className="block text-xs font-bold uppercase text-[#9e9e9e] mb-2 tracking-widest">Full Name</label>
            <input
              type="text"
              value={profile?.name || ''}
              onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : null)}
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

        {/* Dietary Goals */}
        <div className="bg-white rounded-[28px] border border-[#eaeaE0] p-6 space-y-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-base text-[#1a1a1a]">
            <Pizza size={18} className="text-[#5A5A40]" /> Dietary Goals
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
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
