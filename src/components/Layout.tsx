import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Refrigerator, BookOpen, User, LogOut, UtensilsCrossed } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to}>
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

export default function Layout() {
  const handleLogout = () => signOut(auth);

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
            <Outlet />
          </motion.div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden flex justify-around p-3 bg-white border-t border-[#eaeaE0]">
          <Link to="/" className="p-2"><LayoutDashboard /></Link>
          <Link to="/pantry" className="p-2"><Refrigerator /></Link>
          <Link to="/recipes" className="p-2"><BookOpen /></Link>
          <Link to="/profile" className="p-2"><User /></Link>
        </nav>
      </main>
    </div>
  );
}
