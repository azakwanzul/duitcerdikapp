import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ToastContainer';
import { X, DollarSign, Calendar, FileText, Tag, Repeat, Clock } from 'lucide-react';

interface RecurringTransactionModalProps {
  onClose: () => void;
  transaction?: any;
}

const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({ onClose, transaction }) => {
  const { supabaseActions } = useAppContext();
  const { showToast } = useToast();
  
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [category, setCategory] = useState(transaction?.category || '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(transaction?.frequency || 'monthly');
  const [startDate, setStartDate] = useState(transaction?.startDate || new Date().toISOString().split('T')[0]);

  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];
  const expenseCategories = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Other'];

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount || !description) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    const recurringData = {
      id: transaction?.id || Date.now().toString(),
      type,
      category,
      amount: parseFloat(amount),
      description,
      frequency,
      startDate,
      isActive: true,
    };

    try {
      if (transaction) {
        await supabaseActions.updateRecurringTransaction(recurringData);
      } else {
        await supabaseActions.saveRecurringTransaction(recurringData);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the supabaseActions
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface dark:bg-dark-surface bg-white rounded-2xl p-6 w-full max-w-md border border-dark-border dark:border-dark-border border-gray-200 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white dark:text-white text-gray-900">
            {transaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white dark:hover:text-white hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type Toggle */}
          <div className="flex bg-gray-700 dark:bg-gray-700 bg-gray-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                type === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 dark:text-gray-300 text-gray-700 hover:text-white dark:hover:text-white hover:text-gray-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                type === 'income'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 dark:text-gray-300 text-gray-700 hover:text-white dark:hover:text-white hover:text-gray-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <Tag size={16} className="inline mr-2" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select category</option>
              {currentCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Amount (RM)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="What is this for?"
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <Repeat size={16} className="inline mr-2" />
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    frequency === freq
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 dark:bg-gray-700 bg-gray-200 text-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
              type === 'income'
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {transaction ? 'Update' : 'Create'} Recurring {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecurringTransactionModal;