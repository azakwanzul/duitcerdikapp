import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastContainer';

export interface UserData {
  transactions: any[];
  recurringTransactions: any[];
  savingsGoals: any[];
  budgets: any[];
  bills: any[];
  challenges: any[];
  liabilities: any[];
  notifications: any[];
  bankAccounts: any[];
  purchasedRewards: any[];
  settings: any;
  monthlyBudget: number;
  userProfile?: any;
}

export function useSupabaseData() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserData>({
    transactions: [],
    recurringTransactions: [],
    savingsGoals: [],
    budgets: [],
    bills: [],
    challenges: [],
    liabilities: [],
    notifications: [],
    bankAccounts: [],
    purchasedRewards: [],
    settings: {
      darkMode: true,
      notifications: true,
      currency: 'RM',
      language: 'en',
    },
    monthlyBudget: 3000,
  });

  // Define the default settings object
  const defaultSettings = {
    darkMode: true,
    notifications: true,
    currency: 'RM',
    language: 'en',
    autoCategorizationEnabled: true,
    budgetAlerts: true,
    billReminders: true,
    receiptScanning: true,
  };

  // Load user data from Supabase
  const loadUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load user profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      // Load transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Load recurring transactions
      const { data: recurringTransactions, error: recurringError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recurringError) throw recurringError;

      // Load savings goals
      const { data: savingsGoals, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Load budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (budgetsError) throw budgetsError;

      // Load bills
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (billsError) throw billsError;

      // Load challenges
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // Load liabilities
      const { data: liabilities, error: liabilitiesError } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (liabilitiesError) throw liabilitiesError;

      // Load notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      // Load bank accounts
      const { data: bankAccounts, error: bankAccountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bankAccountsError) throw bankAccountsError;

      // Load purchased rewards
      const { data: purchasedRewards, error: rewardsError } = await supabase
        .from('purchased_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (rewardsError && rewardsError.code !== 'PGRST116') throw rewardsError;

      // Load user settings - use maybeSingle() to handle missing settings gracefully
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) throw settingsError;

      setData({
        transactions: transactions || [],
        recurringTransactions: recurringTransactions?.map(rt => ({
          id: rt.id,
          type: rt.type,
          category: rt.category,
          amount: rt.amount,
          description: rt.description,
          frequency: rt.frequency,
          startDate: rt.start_date,
          isActive: rt.is_active,
          lastProcessed: rt.last_processed,
        })) || [],
        savingsGoals: savingsGoals?.map(goal => ({
          id: goal.id,
          title: goal.title,
          targetAmount: goal.target_amount,
          currentAmount: goal.current_amount,
          targetDate: goal.target_date,
          priority: goal.priority,
        })) || [],
        budgets: budgets || [],
        bills: bills?.map(bill => ({
          id: bill.id,
          name: bill.name,
          amount: bill.amount,
          dueDate: bill.due_date,
          frequency: bill.frequency,
          category: bill.category,
          isRecurring: bill.is_recurring,
          isPaid: bill.is_paid,
          reminderDays: bill.reminder_days,
          bankAccountId: bill.bank_account_id,
          notes: bill.notes,
        })) || [],
        challenges: challenges?.map(challenge => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          type: challenge.type,
          target: challenge.target,
          progress: challenge.progress,
          startDate: challenge.start_date,
          endDate: challenge.end_date,
          isActive: challenge.is_active,
          reward: challenge.reward,
        })) || [],
        liabilities: liabilities?.map(liability => ({
          id: liability.id,
          name: liability.name,
          type: liability.type,
          currentBalance: liability.current_balance,
          originalAmount: liability.original_amount,
          interestRate: liability.interest_rate,
          dueDate: liability.due_date,
        })) || [],
        notifications: notifications?.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.is_read,
          createdAt: notification.created_at,
        })) || [],
        bankAccounts: bankAccounts?.map(account => ({
          id: account.id,
          bankName: account.bank_name,
          accountType: account.account_type,
          accountNumber: account.account_number,
          balance: account.balance,
          isConnected: account.is_connected,
          lastSyncDate: account.last_sync_date,
          currency: account.currency,
        })) || [],
        purchasedRewards: purchasedRewards?.map(reward => ({
          id: reward.id,
          rewardId: reward.reward_id,
          title: reward.title,
          description: reward.description,
          cost: reward.cost,
          purchasedAt: reward.purchased_at,
          isActive: reward.is_active,
        })) || [],
        settings: settings ? {
          ...defaultSettings,
          darkMode: settings.dark_mode ?? defaultSettings.darkMode,
          notifications: settings.notifications ?? defaultSettings.notifications,
          currency: settings.currency ?? defaultSettings.currency,
          language: settings.language ?? defaultSettings.language,
        } : { ...defaultSettings },
        monthlyBudget: 3000,
        userProfile: userProfile || null,
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      showToast({
        type: 'error',
        title: 'Data Load Error',
        message: 'Failed to load your data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Save transaction
  const saveTransaction = async (transaction: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
        });

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Transaction Saved',
        message: 'Transaction has been saved to the cloud',
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      showToast({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save transaction. Please try again.',
      });
    }
  };

  // Update transaction
  const updateTransaction = async (transaction: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Transaction Updated',
        message: 'Transaction has been updated',
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update transaction. Please try again.',
      });
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Transaction Deleted',
        message: 'Transaction has been deleted',
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showToast({
        type: 'error',
        title: 'Delete Error',
        message: 'Failed to delete transaction. Please try again.',
      });
    }
  };

  // Save recurring transaction
  const saveRecurringTransaction = async (recurringTransaction: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
          type: recurringTransaction.type,
          category: recurringTransaction.category,
          amount: recurringTransaction.amount,
          description: recurringTransaction.description,
          frequency: recurringTransaction.frequency,
          start_date: recurringTransaction.startDate,
          is_active: recurringTransaction.isActive,
        });

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Recurring Transaction Saved',
        message: 'Recurring transaction has been saved',
      });
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
      showToast({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save recurring transaction. Please try again.',
      });
    }
  };

  // Update recurring transaction
  const updateRecurringTransaction = async (recurringTransaction: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({
          type: recurringTransaction.type,
          category: recurringTransaction.category,
          amount: recurringTransaction.amount,
          description: recurringTransaction.description,
          frequency: recurringTransaction.frequency,
          start_date: recurringTransaction.startDate,
          is_active: recurringTransaction.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recurringTransaction.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Recurring Transaction Updated',
        message: 'Recurring transaction has been updated',
      });
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update recurring transaction. Please try again.',
      });
    }
  };

  // Delete recurring transaction
  const deleteRecurringTransaction = async (recurringTransactionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', recurringTransactionId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Recurring Transaction Deleted',
        message: 'Recurring transaction has been deleted',
      });
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      showToast({
        type: 'error',
        title: 'Delete Error',
        message: 'Failed to delete recurring transaction. Please try again.',
      });
    }
  };

  // Save savings goal
  const saveSavingsGoal = async (goal: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          target_date: goal.targetDate,
          priority: goal.priority,
        });

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Goal Saved',
        message: 'Savings goal has been saved to the cloud',
      });
    } catch (error) {
      console.error('Error saving savings goal:', error);
      showToast({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save savings goal. Please try again.',
      });
    }
  };

  // Update savings goal
  const updateSavingsGoal = async (goal: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({
          title: goal.title,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          target_date: goal.targetDate,
          priority: goal.priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Goal Updated',
        message: 'Savings goal has been updated',
      });
    } catch (error) {
      console.error('Error updating savings goal:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update savings goal. Please try again.',
      });
    }
  };

  // Delete savings goal
  const deleteSavingsGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Goal Deleted',
        message: 'Savings goal has been deleted',
      });
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      showToast({
        type: 'error',
        title: 'Delete Error',
        message: 'Failed to delete savings goal. Please try again.',
      });
    }
  };

  // Save budget
  const saveBudget = async (budget: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category: budget.category,
          amount: budget.amount,
          period: budget.period,
        });

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Budget Saved',
        message: 'Budget has been saved to the cloud',
      });
    } catch (error) {
      console.error('Error saving budget:', error);
      showToast({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save budget. Please try again.',
      });
    }
  };

  // Update budget
  const updateBudget = async (budget: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .update({
          category: budget.category,
          amount: budget.amount,
          period: budget.period,
          updated_at: new Date().toISOString(),
        })
        .eq('id', budget.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Budget Updated',
        message: 'Budget has been updated',
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update budget. Please try again.',
      });
    }
  };

  // Delete budget
  const deleteBudget = async (budgetId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Budget Deleted',
        message: 'Budget has been deleted',
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      showToast({
        type: 'error',
        title: 'Delete Error',
        message: 'Failed to delete budget. Please try again.',
      });
    }
  };

  // Save bill
  const saveBill = async (bill: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bills')
        .insert({
          user_id: user.id,
          name: bill.name,
          amount: bill.amount,
          due_date: bill.dueDate,
          frequency: bill.frequency,
          category: bill.category,
          is_recurring: bill.isRecurring,
          is_paid: bill.isPaid,
          reminder_days: bill.reminderDays,
          bank_account_id: bill.bankAccountId,
          notes: bill.notes,
        });

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Bill Saved',
        message: 'Bill has been saved',
      });
    } catch (error) {
      console.error('Error saving bill:', error);
      showToast({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save bill. Please try again.',
      });
    }
  };

  // Update bill
  const updateBill = async (bill: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bills')
        .update({
          name: bill.name,
          amount: bill.amount,
          due_date: bill.dueDate,
          frequency: bill.frequency,
          category: bill.category,
          is_recurring: bill.isRecurring,
          is_paid: bill.isPaid,
          reminder_days: bill.reminderDays,
          bank_account_id: bill.bankAccountId,
          notes: bill.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bill.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Bill Updated',
        message: 'Bill has been updated',
      });
    } catch (error) {
      console.error('Error updating bill:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update bill. Please try again.',
      });
    }
  };

  // Delete bill
  const deleteBill = async (billId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', billId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Bill Deleted',
        message: 'Bill has been deleted',
      });
    } catch (error) {
      console.error('Error deleting bill:', error);
      showToast({
        type: 'error',
        title: 'Delete Error',
        message: 'Failed to delete bill. Please try again.',
      });
    }
  };

  // Mark bill as paid
  const markBillPaid = async (billId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bills')
        .update({
          is_paid: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', billId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Bill Marked as Paid',
        message: 'Bill has been marked as paid',
      });
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to mark bill as paid. Please try again.',
      });
    }
  };

  // Save challenge
  const saveChallenge = async (challenge: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .insert({
          user_id: user.id,
          title: challenge.title,
          description: challenge.description,
          type: challenge.type,
          target: challenge.target,
          progress: challenge.progress,
          start_date: challenge.startDate,
          end_date: challenge.endDate,
          is_active: challenge.isActive,
          reward: challenge.reward,
        });

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Challenge Saved',
        message: 'Challenge has been saved',
      });
    } catch (error) {
      console.error('Error saving challenge:', error);
      showToast({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save challenge. Please try again.',
      });
    }
  };

  // Update challenge
  const updateChallenge = async (challenge: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .update({
          title: challenge.title,
          description: challenge.description,
          type: challenge.type,
          target: challenge.target,
          progress: challenge.progress,
          start_date: challenge.startDate,
          end_date: challenge.endDate,
          is_active: challenge.isActive,
          reward: challenge.reward,
          updated_at: new Date().toISOString(),
        })
        .eq('id', challenge.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Challenge Updated',
        message: 'Challenge has been updated',
      });
    } catch (error) {
      console.error('Error updating challenge:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update challenge. Please try again.',
      });
    }
  };

  // Delete challenge
  const deleteChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Challenge Deleted',
        message: 'Challenge has been deleted',
      });
    } catch (error) {
      console.error('Error deleting challenge:', error);
      showToast({
        type: 'error',
        title: 'Delete Error',
        message: 'Failed to delete challenge. Please try again.',
      });
    }
  };

  // Save liability
  const saveLiability = async (liability: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('liabilities')
        .insert({
          user_id: user.id,
          name: liability.name,
          type: liability.type,
          current_balance: liability.currentBalance,
          original_amount: liability.originalAmount,
          interest_rate: liability.interestRate,
          due_date: liability.dueDate,
        });

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Liability Saved',
        message: 'Liability has been saved',
      });
    } catch (error) {
      console.error('Error saving liability:', error);
      showToast({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save liability. Please try again.',
      });
    }
  };

  // Update liability
  const updateLiability = async (liability: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('liabilities')
        .update({
          name: liability.name,
          type: liability.type,
          current_balance: liability.currentBalance,
          original_amount: liability.originalAmount,
          interest_rate: liability.interestRate,
          due_date: liability.dueDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', liability.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Liability Updated',
        message: 'Liability has been updated',
      });
    } catch (error) {
      console.error('Error updating liability:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update liability. Please try again.',
      });
    }
  };

  // Delete liability
  const deleteLiability = async (liabilityId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('liabilities')
        .delete()
        .eq('id', liabilityId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'Liability Deleted',
        message: 'Liability has been deleted',
      });
    } catch (error) {
      console.error('Error deleting liability:', error);
      showToast({
        type: 'error',
        title: 'Delete Error',
        message: 'Failed to delete liability. Please try again.',
      });
    }
  };

  // Create notification
  const createNotification = async (notification: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
        });

      if (error) throw error;
      await loadUserData();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadUserData();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      await loadUserData();

      showToast({
        type: 'success',
        title: 'All Notifications Read',
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to mark notifications as read. Please try again.',
      });
    }
  };

  // Update user settings
  const updateSettings = async (newSettings: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          dark_mode: newSettings.darkMode,
          notifications: newSettings.notifications,
          currency: newSettings.currency,
          language: newSettings.language,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error) throw error;
      await loadUserData();
      showToast({
        type: 'success',
        title: 'Settings Updated',
        message: 'Your settings have been saved',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update settings. Please try again.',
      });
    }
  };

  // Load data when user changes
  useEffect(() => {
    loadUserData();
  }, [user]);

  return {
    data,
    loading,
    loadUserData,
    saveTransaction,
    updateTransaction,
    deleteTransaction,
    saveRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    saveSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    saveBudget,
    updateBudget,
    deleteBudget,
    saveBill,
    updateBill,
    deleteBill,
    markBillPaid,
    saveChallenge,
    updateChallenge,
    deleteChallenge,
    saveLiability,
    updateLiability,
    deleteLiability,
    createNotification,
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,
    updateSettings,
  };
}