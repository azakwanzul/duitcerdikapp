/*
  # Create budgets table

  1. New Tables
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `category` (text)
      - `amount` (numeric)
      - `period` (text, 'monthly' or 'weekly')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `budgets` table
    - Add policies for authenticated users to manage their own budgets
*/

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  period text NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate category budgets per user
CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_category_unique ON budgets(user_id, category);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON budgets(user_id);