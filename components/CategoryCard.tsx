
import React from 'react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  label: string;
  icon: string;
  onClick: (cat: Category) => void;
  color: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, label, icon, onClick, color }) => {
  return (
    <button
      onClick={() => onClick(category)}
      className={`${color} hover:scale-105 active:scale-95 transition-all duration-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm border border-black/5 aspect-square sm:aspect-auto sm:h-40`}
    >
      <span className="text-4xl sm:text-5xl">{icon}</span>
      <span className="text-sm sm:text-lg font-bold text-gray-800">{label}</span>
    </button>
  );
};

export default CategoryCard;
