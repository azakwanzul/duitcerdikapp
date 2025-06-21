/*
  # Create bank accounts table

  1. New Tables
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `bank_name` (text)
      - `account_type` (text)
      - `account_number` (text)
      - `balance` (numeric)
      - `is_connected` (boolean)
      - `last_sync_date` (timestamp)
      - `currency` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bank_accounts` table
    - Add policies for authenticated users to manage their own bank accounts
*/

CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bank_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('savings', 'current', 'credit')),
  account_number text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  is_connected boolean DEFAULT true,
  last_sync_date timestamptz,
  currency text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts"
  ON bank_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS bank_accounts_user_id_idx ON bank_accounts(user_id);