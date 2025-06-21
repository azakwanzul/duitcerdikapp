import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ToastContainer';
import { X, Target, DollarSign, Tag } from 'lucide-react';

interface BudgetModalProps {
  onClose: () => void;
  budget?: any;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ onClose, budget }) => {
  const { supabaseActions } = useAppContext();
  const { showToast } = useToast();
  
  const [category, setCategory] = useState(budget?.category || '');
  const [amount, setAmount] = useState(budget?.amount?.toString() || '');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>(budget?.period || 'monthly');

  const categories = [
    'Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 
    'Shopping', 'Healthcare', 'Education', 'Insurance', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    const budgetData = {
      id: budget?.id || Date.now().toString(),
      category,
      amount: parseFloat(amount),
      period,
    };

    try {
      if (budget) {
        await supabaseActions.updateBudget(budgetData);
      } else {
        await supabaseActions.saveBudget(budgetData);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the supabaseActions
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface dark:bg-dark-surface bg-white rounded-2xl p-6 w-full max-w-md border border-dark-border dark:border-dark-border border-gray-200 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white dark:text-white text-gray-900">
            {budget ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white dark:hover:text-white hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Budget Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="500.00"
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <Target size={16} className="inline mr-2" />
              Budget Period
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['monthly', 'weekly'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    period === p
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 dark:bg-gray-700 bg-gray-200 text-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {budget ? 'Update Budget' : 'Create Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;