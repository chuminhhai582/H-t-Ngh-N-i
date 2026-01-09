
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category, Item, SuggestionParams } from '../types';
import { Plus, List, Shuffle, Sparkles, Image as ImageIcon, Trash2, ChevronLeft, Loader2, Camera } from 'lucide-react';
import { getAISuggestion } from '../services/geminiService';

interface CategoryDetailProps {
  category: Category;
  userId: string;
  onBack: () => void;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({ category, userId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'random' | 'ai'>('list');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [moods, setMoods] = useState<string[]>([]);
  const [budget, setBudget] = useState('trung bình');
  const [weathers, setWeathers] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Random/AI states
  const [randomItem, setRandomItem] = useState<Item | null>(null);
  const [aiParams, setAiParams] = useState<SuggestionParams>({ mood: 'vui', budget: 'trung bình', weather: 'mát mẻ' });
  const [aiResult, setAiResult] = useState<{ item: Item | null; reason: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('category', category)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data);
    setLoading(false);
  }, [category, userId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setUploading(true);

    let imageUrl = '';
    if (file) {
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file);
      
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('user-uploads').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('items').insert({
      user_id: userId,
      category,
      name,
      note,
      mood: moods,
      budget,
      weather: weathers,
      image_url: imageUrl
    });

    if (!error) {
      setName('');
      setNote('');
      setMoods([]);
      setWeathers([]);
      setFile(null);
      fetchItems();
      setActiveTab('list');
    }
    setUploading(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá cái này không?')) return;
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) fetchItems();
  };

  const handleRandom = () => {
    if (items.length === 0) return;
    const randomIndex = Math.floor(Math.random() * items.length);
    setRandomItem(items[randomIndex]);
  };

  const handleAISuggest = async () => {
    setIsAiLoading(true);
    const result = await getAISuggestion(items, aiParams);
    setAiResult(result);
    setIsAiLoading(false);
  };

  const getCategoryTitle = () => {
    const map: Record<Category, string> = {
      food: 'Ăn gì?', drink: 'Uống gì?', nail: 'Mẫu Nail',
      hair: 'Kiểu Tóc', hangout: 'Đi Chơi', travel: 'Du Lịch'
    };
    return map[category];
  };

  const toggleSelection = (val: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(val)) {
      setter(list.filter(item => item !== val));
    } else {
      setter([...list, val]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-pink-500 mb-6 font-medium transition-colors">
        <ChevronLeft size={20} /> Quay lại
      </button>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">{getCategoryTitle()}</h2>
          <p className="text-gray-500">{items.length} lựa chọn của bạn</p>
        </div>
        <div className="flex gap-1 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          {[
            { id: 'list', icon: <List size={18} /> },
            { id: 'add', icon: <Plus size={18} /> },
            { id: 'random', icon: <Shuffle size={18} /> },
            { id: 'ai', icon: <Sparkles size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-pink-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-pink-500" size={40} /></div>
          ) : items.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400">Chưa có món nào hết, thêm mới đi bạn ơi!</p>
              <button onClick={() => setActiveTab('add')} className="mt-4 text-pink-500 font-bold">Thêm ngay ➕</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50 group relative hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-2xl shadow-inner" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{item.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-2">{item.note || 'Không có ghi chú'}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.mood.map(m => <span key={m} className="text-[10px] px-2 py-0.5 bg-pink-50 text-pink-500 rounded-full font-semibold">#{m}</span>)}
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full font-semibold uppercase">{item.budget}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <form onSubmit={handleAddItem} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên lựa chọn *</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Ví dụ: Bún chả Hàng Than"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú (tuỳ chọn)</label>
              <textarea 
                value={note} onChange={e => setNote(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 h-24"
                placeholder="Ghi thêm ít review hoặc địa chỉ..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phù hợp tâm trạng nào?</label>
              <div className="flex flex-wrap gap-2">
                {['vui', 'buồn', 'stress', 'thư giãn', 'hẹn hò', 'đói điên'].map(m => (
                  <button
                    type="button" key={m}
                    onClick={() => toggleSelection(m, moods, setMoods)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${moods.includes(m) ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ngân sách</label>
                <select 
                  value={budget} onChange={e => setBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                >
                  <option value="rẻ">Rẻ (Hạt dẻ)</option>
                  <option value="trung bình">Trung bình</option>
                  <option value="sang">Sang chảnh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Thời tiết?</label>
                <div className="flex flex-wrap gap-2">
                  {['nắng', 'mưa', 'lạnh', 'nóng'].map(w => (
                    <button
                      type="button" key={w}
                      onClick={() => toggleSelection(w, weathers, setWeathers)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${weathers.includes(w) ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh mẫu (Nail/Tóc/Địa điểm)</label>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:border-pink-300 transition-colors bg-gray-50 relative overflow-hidden">
                  {file ? (
                    <img src={URL.createObjectURL(file)} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="text-gray-300 mb-1" />
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Upload</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
                {file && <button type="button" onClick={() => setFile(null)} className="text-red-500 text-sm font-bold">Xoá ảnh</button>}
              </div>
            </div>
          </div>

          <button
            type="submit" disabled={uploading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-100 transition-all flex justify-center items-center gap-2"
          >
            {uploading ? <Loader2 className="animate-spin" /> : 'Lưu lựa chọn ngay'}
          </button>
        </form>
      )}

      {activeTab === 'random' && (
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-50 text-center space-y-8 min-h-[400px] flex flex-col justify-center items-center">
          {!randomItem ? (
            <>
              <div className="text-7xl animate-bounce">🎲</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Thử vận may nhé?</h3>
                <p className="text-gray-500 mt-2">Bấm nút để mình chọn ngẫu nhiên cho bạn một cái!</p>
              </div>
              <button
                onClick={handleRandom}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl transition-all"
              >
                Chọn đi chờ chi!
              </button>
            </>
          ) : (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center space-y-6">
              <div className="text-pink-500 font-bold text-lg">✨ Kết quả là... ✨</div>
              {randomItem.image_url && <img src={randomItem.image_url} alt={randomItem.name} className="w-48 h-48 object-cover rounded-3xl shadow-xl border-4 border-white" />}
              <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight">{randomItem.name}</h3>
              <p className="text-gray-500 max-w-xs">{randomItem.note}</p>
              <button
                onClick={() => setRandomItem(null)}
                className="text-indigo-600 font-bold hover:underline"
              >
                Làm lại phát nữa 🔁
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-yellow-400" />
              <h3 className="text-xl font-bold">AI Gợi ý thông minh</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase">Tâm trạng</label>
                <select 
                  value={aiParams.mood} onChange={e => setAiParams({...aiParams, mood: e.target.value})}
                  className="w-full bg-indigo-800 border border-indigo-700 rounded-xl px-4 py-3 focus:outline-none"
                >
                  {['vui', 'buồn', 'stress', 'thư giãn', 'hẹn hò'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase">Ngân sách</label>
                <select 
                   value={aiParams.budget} onChange={e => setAiParams({...aiParams, budget: e.target.value})}
                  className="w-full bg-indigo-800 border border-indigo-700 rounded-xl px-4 py-3 focus:outline-none"
                >
                   {['rẻ', 'trung bình', 'sang'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase">Thời tiết</label>
                <select 
                   value={aiParams.weather} onChange={e => setAiParams({...aiParams, weather: e.target.value})}
                  className="w-full bg-indigo-800 border border-indigo-700 rounded-xl px-4 py-3 focus:outline-none"
                >
                   {['nắng', 'mưa', 'lạnh', 'nóng', 'mát mẻ'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleAISuggest}
              disabled={isAiLoading || items.length === 0}
              className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold py-4 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isAiLoading ? <Loader2 className="animate-spin" /> : 'Hỏi AI ngay! 🤖'}
            </button>
            {items.length === 0 && <p className="text-indigo-300 text-xs text-center">Cần thêm dữ liệu ở tab ➕ trước khi hỏi AI nè</p>}
          </div>

          {aiResult && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-indigo-100 animate-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Gợi ý tốt nhất</div>
                {aiResult.item?.image_url && <img src={aiResult.item.image_url} alt={aiResult.item.name} className="w-40 h-40 object-cover rounded-3xl shadow-lg" />}
                <h3 className="text-3xl font-black text-gray-900">{aiResult.item?.name || 'Hông có gì luôn :('}</h3>
                <div className="bg-indigo-50 p-6 rounded-2xl relative">
                   <div className="absolute -top-3 left-4 bg-indigo-600 text-white p-1 rounded-full"><Sparkles size={14} /></div>
                   <p className="text-gray-700 leading-relaxed italic">"{aiResult.reason}"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
