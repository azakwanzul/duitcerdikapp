/*
  # Add gamification fields to users table

  1. Changes
    - Add `total_points` (numeric)
    - Add `current_level` (integer)
    - Add `best_streak` (integer)

  2. Security
    - No additional policies needed as existing user policies cover these fields
*/

-- Add gamification fields to the users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_points numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS best_streak integer DEFAULT 0;