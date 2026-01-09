
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './pages/Auth';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import Navbar from './components/Navbar';
import { Category } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-pink-500" size={48} />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-10">
      <Navbar 
        userEmail={session.user.email} 
        onGoHome={() => setSelectedCategory(null)} 
      />
      
      <main>
        {selectedCategory ? (
          <CategoryDetail 
            category={selectedCategory} 
            userId={session.user.id} 
            onBack={() => setSelectedCategory(null)}
          />
        ) : (
          <Home onSelectCategory={setSelectedCategory} />
        )}
      </main>

      {/* Footer Branding */}
      {!selectedCategory && (
        <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Hết Nghĩ Nổi - Made with ❤️ for your brain</p>
        </footer>
      )}
    </div>
  );
};

export default App;
