/*
  # Create bills table

  1. New Tables
    - `bills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `amount` (numeric)
      - `due_date` (date)
      - `frequency` (text)
      - `category` (text)
      - `is_recurring` (boolean)
      - `is_paid` (boolean)
      - `reminder_days` (integer)
      - `bank_account_id` (uuid)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bills` table
    - Add policies for authenticated users to manage their own bills
*/

CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one-time')),
  category text NOT NULL,
  is_recurring boolean DEFAULT true,
  is_paid boolean DEFAULT false,
  reminder_days integer DEFAULT 3,
  bank_account_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bills"
  ON bills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills"
  ON bills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills"
  ON bills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills"
  ON bills
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS bills_user_id_idx ON bills(user_id);