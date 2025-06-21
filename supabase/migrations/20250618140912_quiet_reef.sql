/*
  # Create purchased rewards table for gamification rewards

  1. New Tables
    - `purchased_rewards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `reward_id` (text, identifier for the reward type)
      - `title` (text)
      - `description` (text)
      - `cost` (integer, points spent)
      - `purchased_at` (timestamp)
      - `is_active` (boolean, whether the reward is currently active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `purchased_rewards` table
    - Add policies for authenticated users to manage their own purchased rewards
*/

CREATE TABLE IF NOT EXISTS purchased_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reward_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  cost integer NOT NULL CHECK (cost > 0),
  purchased_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE purchased_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchased rewards"
  ON purchased_rewards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchased rewards"
  ON purchased_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchased rewards"
  ON purchased_rewards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchased rewards"
  ON purchased_rewards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS purchased_rewards_user_id_idx ON purchased_rewards(user_id);
CREATE INDEX IF NOT EXISTS purchased_rewards_user_id_active_idx ON purchased_rewards(user_id, is_active);