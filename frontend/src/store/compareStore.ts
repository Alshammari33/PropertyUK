import { create } from 'zustand';
import { Property } from '../api/client';

interface CompareStore {
  compareList: Property[];
  addToCompare: (property: Property) => void;
  removeFromCompare: (propertyId: number) => void;
  clearCompare: () => void;
  isInCompare: (propertyId: number) => boolean;
}

const useCompareStore = create<CompareStore>((set, get) => ({
  compareList: [],

  addToCompare: (property: Property) => {
    const { compareList } = get();
    if (compareList.length >= 4) {
      return;
    }
    if (compareList.some((p) => p.id === property.id)) {
      return;
    }
    set({ compareList: [...compareList, property] });
  },

  removeFromCompare: (propertyId: number) => {
    set((state) => ({
      compareList: state.compareList.filter((p) => p.id !== propertyId),
    }));
  },

  clearCompare: () => {
    set({ compareList: [] });
  },

  isInCompare: (propertyId: number) => {
    return get().compareList.some((p) => p.id === propertyId);
  },
}));

export default useCompareStore;
