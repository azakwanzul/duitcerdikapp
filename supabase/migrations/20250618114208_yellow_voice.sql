/*
  # Create liabilities table for net worth tracking

  1. New Tables
    - `liabilities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `type` (text, e.g., 'loan', 'credit_card', 'mortgage')
      - `current_balance` (numeric)
      - `original_amount` (numeric, nullable)
      - `interest_rate` (numeric, nullable)
      - `due_date` (date, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `liabilities` table
    - Add policies for authenticated users to manage their own liabilities
*/

CREATE TABLE IF NOT EXISTS liabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('loan', 'credit_card', 'mortgage', 'student_loan', 'car_loan', 'other')),
  current_balance numeric NOT NULL CHECK (current_balance >= 0),
  original_amount numeric,
  interest_rate numeric,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own liabilities"
  ON liabilities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own liabilities"
  ON liabilities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own liabilities"
  ON liabilities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own liabilities"
  ON liabilities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS liabilities_user_id_idx ON liabilities(user_id);