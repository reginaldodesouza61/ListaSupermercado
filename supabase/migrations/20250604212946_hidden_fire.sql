/*
  # Initial schema for Grocery List App

  1. New Tables
    - `profiles` - User profiles
    - `grocery_lists` - Shopping lists
    - `grocery_items` - Items in shopping lists
    - `shared_lists` - Tracks which lists are shared with which users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for shared lists access
*/

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create grocery lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  shared BOOLEAN DEFAULT false NOT NULL
);

-- Create grocery items table
CREATE TABLE IF NOT EXISTS grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  purchased BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create shared lists table
CREATE TABLE IF NOT EXISTS shared_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(list_id, shared_with)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Grocery lists policies
CREATE POLICY "Users can view their own lists"
  ON grocery_lists FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view lists shared with them"
  ON grocery_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shared_lists
      WHERE shared_lists.list_id = grocery_lists.id
      AND shared_lists.shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own lists"
  ON grocery_lists FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own lists"
  ON grocery_lists FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own lists"
  ON grocery_lists FOR DELETE
  USING (auth.uid() = created_by);

-- Grocery items policies
CREATE POLICY "Users can view items in their own lists"
  ON grocery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
      AND grocery_lists.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view items in lists shared with them"
  ON grocery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shared_lists
      WHERE shared_lists.list_id = grocery_items.list_id
      AND shared_lists.shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can insert items in their own lists"
  ON grocery_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
      AND grocery_lists.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their own lists"
  ON grocery_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
      AND grocery_lists.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update items in lists shared with them"
  ON grocery_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shared_lists
      WHERE shared_lists.list_id = grocery_items.list_id
      AND shared_lists.shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their own lists"
  ON grocery_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
      AND grocery_lists.created_by = auth.uid()
    )
  );

-- Shared lists policies
CREATE POLICY "Users can view sharing of their own lists"
  ON shared_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = shared_lists.list_id
      AND grocery_lists.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can see lists shared with them"
  ON shared_lists FOR SELECT
  USING (shared_lists.shared_with = auth.uid());

CREATE POLICY "Users can share their own lists"
  ON shared_lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = shared_lists.list_id
      AND grocery_lists.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete sharing of their own lists"
  ON shared_lists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = shared_lists.list_id
      AND grocery_lists.created_by = auth.uid()
    )
  );

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER set_grocery_lists_updated_at
  BEFORE UPDATE ON grocery_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_grocery_items_updated_at
  BEFORE UPDATE ON grocery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();