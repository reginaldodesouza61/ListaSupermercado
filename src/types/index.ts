export interface GroceryItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchased: boolean;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryList {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  shared: boolean;
  sharedWith: string[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}