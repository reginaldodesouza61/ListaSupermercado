import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { GroceryItem, GroceryList } from '../types';
import { calculateTotalPrice } from '../lib/utils';

interface GroceryStore {
  lists: GroceryList[];
  currentList: GroceryList | null;
  items: GroceryItem[];
  loading: boolean;
  error: string | null;

  fetchLists: () => Promise<void>;
  createList: (name: string) => Promise<string | null>;
  fetchItems: (listId: string) => Promise<void>;
  addItem: (listId: string, product: string, quantity: number, unitPrice: number) => Promise<void>;
  updateItem: (id: string, data: Partial<GroceryItem>) => Promise<void>;
  togglePurchased: (id: string, purchased: boolean) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setCurrentList: (list: GroceryList | null) => void;
  shareList: (listId: string, email: string) => Promise<{ error: any | null }>;
  renameList: (listId: string, newName: string) => Promise<void>;
}

export const useGroceryStore = create<GroceryStore>((set, get) => ({
  lists: [],
  currentList: null,
  items: [],
  loading: false,
  error: null,

  fetchLists: async () => {
    set({ loading: true, error: null });
    try {
      const { data: listsData, error: listsError } = await supabase
        .from('grocery_lists')
        .select('*')
        .order('created_at', { ascending: false });
      if (listsError) throw listsError;

      // Fetch shared lists
      const { data: sharedData, error: sharedError } = await supabase
        .from('shared_lists')
        .select(`
          list_id,
          grocery_lists (*)
        `)
        .order('created_at', { ascending: false });
      if (sharedError) throw sharedError;

      const allListsRaw = [
        ...(listsData || []),
        ...(sharedData?.map(shared => shared.grocery_lists) || [])
      ].filter((list): list is GroceryList => !!list);

      // Remove duplicatas pelo id
      const allLists = allListsRaw.filter(
        (list, idx, arr) => arr.findIndex(l => l.id === list.id) === idx
      );

      console.log('Listas retornadas:', allLists);
      set({ lists: allLists, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createList: async (name) => {
    set({ loading: true, error: null });
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('grocery_lists')
        .insert([{ 
          name,
          created_by: userData.user.id
        }])
        .select()
        .single();
      if (error) {
        console.log('Erro Supabase:', error);
        throw error;
      }
      // Após criar, sincronize com o banco para evitar duplicidade
      await get().fetchLists();
      set({ currentList: data as GroceryList, loading: false });
      return data.id;
    } catch (error: any) {
      console.log('Erro ao criar lista:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  fetchItems: async (listId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Buscando itens para a lista:', listId);
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      console.log('Itens retornados:', data);

      // Conversão dos campos snake_case para camelCase
      const items = (data || []).map(item => ({
        ...item,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
      }));

      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addItem: async (listId: string, product: string, quantity: number, unitPrice: number) => {
    set({ loading: true, error: null });
    try {
      const totalPrice = calculateTotalPrice(quantity, unitPrice);
      const { data, error } = await supabase
        .from('grocery_items')
        .insert([{
          list_id: listId,
          product,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice
        }])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        items: [ 
          {
            ...data,
            unitPrice: data.unit_price,
            totalPrice: data.total_price,
          } as GroceryItem,
          ...state.items
        ],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateItem: async (id: string, data: Partial<GroceryItem>) => {
    set({ loading: true, error: null });
    try {
      // Converte para snake_case antes de enviar ao banco
      const updateData: any = { ...data };
      if (updateData.unitPrice !== undefined) {
        updateData.unit_price = updateData.unitPrice;
        delete updateData.unitPrice;
      }
      if (updateData.totalPrice !== undefined) {
        updateData.total_price = updateData.totalPrice;
        delete updateData.totalPrice;
      }

      const { error } = await supabase
        .from('grocery_items')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, ...data } : item
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  togglePurchased: async (id: string, purchased: boolean) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update({ purchased })
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, purchased } : item
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        items: state.items.filter(item => item.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentList: (list: GroceryList | null) => {
    set({ currentList: list });
    console.log('Lista selecionada:', list);
  },

  shareList: async (listId: string, email: string) => {
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      if (userError) {
        return { error: 'User not found' };
      }
      // Then create the share record
      const { error: shareError } = await supabase
        .from('shared_lists')
        .insert([{
          list_id: listId,
          shared_with: userData.id
        }]);
      if (shareError) {
        return { error: shareError };
      }
      // Update the list to mark it as shared
      await supabase
        .from('grocery_lists')
        .update({ shared: true })
        .eq('id', listId);

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  renameList: async (listId: string, newName: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('grocery_lists')
        .update({ name: newName })
        .eq('id', listId);
      if (error) throw error;
      // Atualiza o estado local
      set((state) => ({
        lists: state.lists.map(list =>
          list.id === listId ? { ...list, name: newName } : list
        ),
        currentList: state.currentList && state.currentList.id === listId
          ? { ...state.currentList, name: newName }
          : state.currentList,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));