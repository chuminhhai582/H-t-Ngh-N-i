
import React from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutGrid } from 'lucide-react';

interface NavbarProps {
  userEmail?: string;
  onGoHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userEmail, onGoHome }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div 
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="bg-pink-500 text-white p-1.5 rounded-lg shadow-sm">
            <LayoutGrid size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Hết Nghĩ Nổi</h1>
        </div>
        
        {userEmail && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-500 font-medium">{userEmail}</span>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
