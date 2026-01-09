
export type Category = 'food' | 'drink' | 'nail' | 'hair' | 'hangout' | 'travel';

export interface Item {
  id: string;
  user_id: string;
  category: Category;
  name: string;
  note?: string;
  mood: string[];
  budget: string;
  weather: string[];
  image_url?: string;
  created_at: string;
}

export interface SuggestionParams {
  mood: string;
  budget: string;
  weather: string;
}

export interface AISuggestionResponse {
  item: Item | null;
  reason: string;
}
