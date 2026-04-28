'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Refrigerator, BookOpen, User, LogOut, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { clearLocalUser, getLocalUserId, saveLocalUser } from '../lib/session';
import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { api } from '../lib/api';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: LucideIcon, label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === to;
  
  return (
    <Link href={to}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          isActive 
            ? 'bg-[#5A5A40] text-white' 
            : 'text-[#4a4a3a] hover:bg-[#eaeaE0]'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </motion.div>
    </Link>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isProvisioningRef = useRef(false);

  const handleLogout = async () => {
    clearLocalUser();
    await signOut({ callbackUrl: '/login' });
  };

  useEffect(() => {
    const ensureSessionAndProfile = async () => {
      if (status === 'loading') return;

      if (status === 'unauthenticated') {
        clearLocalUser();
        router.replace('/login');
        return;
      }

      if (!getLocalUserId() && session?.user && !isProvisioningRef.current) {
        isProvisioningRef.current = true;
        const userId = (session.user as { id?: string }).id || session.user.email || crypto.randomUUID();

        const profile = await api.upsertProfile({
          user_id: userId,
          name: session.user.name || 'Jisort User',
          email: session.user.email || `google-${userId.slice(0, 8)}@jisort.local`,
          dietary_preferences: [],
          budget_preference: 1000,
          currency: 'KES',
        });

        saveLocalUser(profile);
      }
    };

    ensureSessionAndProfile().catch(() => {
      clearLocalUser();
      router.replace('/login');
      isProvisioningRef.current = false;
    });
  }, [router, session, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] text-[#4a4a3a]">
        Loading...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (status === 'authenticated' && !getLocalUserId()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] text-[#4a4a3a]">
        Preparing your account...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#eaeaE0] p-6">
        <div className="flex items-center gap-2 mb-10 text-[#5A5A40]">
          <UtensilsCrossed size={32} strokeWidth={2.5} />
          <h1 className="text-2xl font-bold tracking-tight">Jisort Dishi</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/pantry" icon={Refrigerator} label="Pantry / Fridge" />
          <NavItem to="/recipes" icon={BookOpen} label="Recipes" />
          <NavItem to="/profile" icon={User} label="My Profile" />
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#eaeaE0]">
          <div className="flex items-center gap-2 text-[#5A5A40]">
            <UtensilsCrossed size={24} strokeWidth={2.5} />
            <h1 className="text-xl font-bold tracking-tight">Jisort Dishi</h1>
          </div>
          <button onClick={handleLogout} className="text-red-600 p-2">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden flex justify-around p-3 bg-white border-t border-[#eaeaE0]">
          <Link href="/" className="p-2"><LayoutDashboard /></Link>
          <Link href="/pantry" className="p-2"><Refrigerator /></Link>
          <Link href="/recipes" className="p-2"><BookOpen /></Link>
          <Link href="/profile" className="p-2"><User /></Link>
        </nav>
      </main>
    </div>
  );
}
