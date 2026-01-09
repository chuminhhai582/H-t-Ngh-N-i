
import React from 'react';
import CategoryCard from '../components/CategoryCard';
import { Category } from '../types';

interface HomeProps {
  onSelectCategory: (cat: Category) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectCategory }) => {
  const categories: { key: Category; label: string; icon: string; color: string }[] = [
    { key: 'food', label: 'Ăn gì?', icon: '🍜', color: 'bg-orange-100' },
    { key: 'drink', label: 'Uống gì?', icon: '☕', color: 'bg-blue-100' },
    { key: 'nail', label: 'Làm nail?', icon: '💅', color: 'bg-pink-100' },
    { key: 'hair', label: 'Làm tóc?', icon: '💇', color: 'bg-purple-100' },
    { key: 'hangout', label: 'Đi chơi?', icon: '🎡', color: 'bg-green-100' },
    { key: 'travel', label: 'Du lịch?', icon: '✈️', color: 'bg-yellow-100' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2 mt-4">
        <h2 className="text-3xl font-bold text-gray-900">Chào bạn yêu! 👋</h2>
        <p className="text-gray-500">Hôm nay chúng mình đau đầu vì chuyện gì nào?</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.key}
            category={cat.key}
            label={cat.label}
            icon={cat.icon}
            color={cat.color}
            onClick={onSelectCategory}
          />
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 italic text-sm">
          "Đừng lãng phí nơ-ron thần kinh cho những việc nhỏ nhặt, để AI của Hết Nghĩ Nổi cân tất!"
        </p>
      </div>
    </div>
  );
};

export default Home;
