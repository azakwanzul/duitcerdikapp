/*
  # Enable Realtime for all tables

  1. Enable Realtime
    - Enable realtime for all user data tables
    - This allows real-time synchronization across devices

  2. Security
    - Realtime respects existing RLS policies
    - Users will only receive updates for their own data
*/

-- Enable realtime for all user data tables
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE savings_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE recurring_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE liabilities;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE bank_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;