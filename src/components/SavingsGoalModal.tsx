import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ToastContainer';
import { X, Target, DollarSign, Calendar, Flag } from 'lucide-react';

interface SavingsGoalModalProps {
  onClose: () => void;
  goal?: any;
}

const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({ onClose, goal }) => {
  const { supabaseActions } = useAppContext();
  const { showToast } = useToast();
  
  const [title, setTitle] = useState(goal?.title || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount?.toString() || '0');
  const [targetDate, setTargetDate] = useState(goal?.targetDate || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(goal?.priority || 'medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !targetAmount || !targetDate) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    const goalData = {
      id: goal?.id || Date.now().toString(),
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      targetDate,
      priority,
    };

    try {
      if (goal) {
        await supabaseActions.updateSavingsGoal(goalData);
      } else {
        await supabaseActions.saveSavingsGoal(goalData);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the supabaseActions
    }
  };

  const calculateMonthlyTarget = () => {
    if (!targetAmount || !targetDate || !currentAmount) return 0;
    
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount);
    const remaining = target - current;
    
    const today = new Date();
    const endDate = new Date(targetDate);
    const monthsLeft = Math.max(1, (endDate.getFullYear() - today.getFullYear()) * 12 + endDate.getMonth() - today.getMonth());
    
    return remaining / monthsLeft;
  };

  const monthlyTarget = calculateMonthlyTarget();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface dark:bg-dark-surface bg-white rounded-2xl p-6 w-full max-w-md border border-dark-border dark:border-dark-border border-gray-200 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white dark:text-white text-gray-900">
            {goal ? 'Edit Savings Goal' : 'Create Savings Goal'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white dark:hover:text-white hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <Target size={16} className="inline mr-2" />
              Goal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Japan Trip, Emergency Fund, New Laptop"
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Target Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              placeholder="5000.00"
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Current Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Current Amount (RM)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
              <Flag size={16} className="inline mr-2" />
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-600 text-white'
                        : p === 'medium'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-green-600 text-white'
                      : 'bg-gray-700 dark:bg-gray-700 bg-gray-200 text-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Target Preview */}
          {monthlyTarget > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <h4 className="text-primary font-semibold mb-2">Monthly Savings Target</h4>
              <p className="text-white dark:text-white text-gray-900 text-lg font-bold">RM {monthlyTarget.toFixed(2)}</p>
              <p className="text-gray-400 dark:text-gray-400 text-gray-600 text-sm">
                You need to save this amount monthly to reach your goal on time
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {goal ? 'Update Goal' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SavingsGoalModal;