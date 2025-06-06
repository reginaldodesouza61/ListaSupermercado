import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AuthState, User } from '../types';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  getUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || null,
        },
        session: data.session,
      });
    }

    return { error };
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || null,
        },
        session: data.session,
      });
    }

    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  getUser: async () => {
    set({ loading: true });
    
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        set({
          user: {
            id: userData.user.id,
            email: userData.user.email || '',
            name: userData.user.user_metadata?.name || null,
          },
          session: data.session,
        });
      }
    }
    
    set({ loading: false });
  },
}));