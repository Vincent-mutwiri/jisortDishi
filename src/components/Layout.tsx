'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Refrigerator, BookOpen, User, LogOut, UtensilsCrossed, ShoppingBag, Coins, Bell, Settings, Heart, Search, type LucideIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { clearLocalUser, getLocalUserId, saveLocalUser } from '../lib/session';
import { auth } from '../lib/auth';
import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useNotifications } from '../context/NotificationContext';
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
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { currency, symbol } = useCurrency();
  const { unreadCount } = useNotifications();
  const isProvisioningRef = useRef(false);

  const handleLogout = async () => {
    clearLocalUser();
    auth.clearCurrentUser();
    
    // Try to sign out from NextAuth if available, but don't wait for it
    try {
      await signOut({ callbackUrl: '/login' });
    } catch {
      // If NextAuth signOut fails, just redirect manually
      router.replace('/login');
    }
  };

  useEffect(() => {
    const ensureSessionAndProfile = async () => {
      if (status === 'loading') return;

      // Check if we're on the landing page - no auth required
      if (pathname === '/') {
        return;
      }

      // Check if user is authenticated via email/password (localStorage)
      const localUserId = getLocalUserId();
      
      if (status === 'unauthenticated' && !localUserId) {
        // Not authenticated via any method, redirect to login
        router.replace('/login');
        return;
      }

      if (status === 'authenticated' && !localUserId && !isProvisioningRef.current) {
        isProvisioningRef.current = true;
        const userId = (session.user as { id?: string }).id || session.user?.email || crypto.randomUUID();

        const profile = await api.upsertProfile({
          user_id: userId,
          name: session.user?.name || 'Jisort User',
          email: session.user?.email || `google-${userId.slice(0, 8)}@jisort.local`,
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
  }, [router, session, status, pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] text-[#4a4a3a]">
        Loading...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    // Check if user is authenticated via email/password (local storage)
    if (getLocalUserId()) {
      // User is locally authenticated, allow access to protected routes
      // Continue to render the layout
    } else {
      // Not authenticated via any method, redirect to login
      router.replace('/login');
      return null;
    }
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
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#eaeaE0] p-6 h-screen sticky top-0 overflow-hidden">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#5A5A40] mb-3">
            <UtensilsCrossed size={32} strokeWidth={2.5} />
            <h1 className="text-2xl font-bold tracking-tight">Jisort Dishi</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0f0eb] rounded-xl w-fit">
            <Coins size={14} className="text-[#5A5A40]" />
            <span className="text-xs font-bold text-[#5A5A40] tracking-wide">{symbol} {currency}</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/find-meals" icon={Search} label="Find Meals" />
          <NavItem to="/meals" icon={Heart} label="Saved Meals" />
          <NavItem to="/pantry" icon={ShoppingBag} label="Pantry" />
          <NavItem to="/fridge" icon={Refrigerator} label="Fridge" />
          <NavItem to="/recipes" icon={BookOpen} label="Recipes" />
          <NavItem to="/profile" icon={User} label="My Profile" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <Link href="/notifications">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#4a4a3a] hover:bg-[#eaeaE0] transition-colors mt-2 relative">
            <Bell size={20} />
            <span className="font-medium">Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>
            )}
          </div>
        </Link>

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
          <div className="flex items-center gap-1">
            <Link href="/notifications" className="relative p-2 text-[#4a4a3a]">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
              )}
            </Link>
            <button onClick={handleLogout} className="text-red-600 p-2">
              <LogOut size={20} />
            </button>
          </div>
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
          <Link href="/dashboard" className="p-2"><LayoutDashboard size={20} /></Link>
          <Link href="/pantry" className="p-2"><ShoppingBag size={20} /></Link>
          <Link href="/fridge" className="p-2"><Refrigerator size={20} /></Link>
          <Link href="/recipes" className="p-2"><BookOpen size={20} /></Link>
          <Link href="/profile" className="p-2"><User size={20} /></Link>
          <Link href="/settings" className="p-2"><Settings size={20} /></Link>
          <Link href="/meals" className="p-2"><Heart size={20} /></Link>
        </nav>
      </main>
    </div>
  );
}
