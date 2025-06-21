import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';

const BudgetAlerts: React.FC = () => {
  const { state } = useAppContext();
  const { budgets, transactions, settings } = state;

  const calculateSpending = (category: string, period: 'monthly' | 'weekly') => {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'monthly') {
      startDate.setDate(1);
    } else {
      startDate.setDate(now.getDate() - 7);
    }

    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === category &&
        new Date(t.date) >= startDate &&
        new Date(t.date) <= now
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const alerts = budgets.map(budget => {
    const spent = calculateSpending(budget.category, budget.period);
    const percentage = (spent / budget.amount) * 100;
    
    let alertType: 'success' | 'warning' | 'danger' = 'success';
    let message = '';
    let icon = CheckCircle;
    
    if (percentage >= 100) {
      alertType = 'danger';
      message = `You've exceeded your ${budget.category} budget by ${formatCurrency(spent - budget.amount, settings.currency)}`;
      icon = AlertTriangle;
    } else if (percentage >= 90) {
      alertType = 'danger';
      message = `You're at ${percentage.toFixed(0)}% of your ${budget.category} budget`;
      icon = AlertTriangle;
    } else if (percentage >= 75) {
      alertType = 'warning';
      message = `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget`;
      icon = AlertCircle;
    } else {
      return null; // No alert needed
    }

    return {
      id: budget.id,
      category: budget.category,
      type: alertType,
      message,
      icon,
      percentage,
      spent,
      budget: budget.amount,
    };
  }).filter(Boolean);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Budget Alerts</h3>
      {alerts.map((alert) => {
        const Icon = alert!.icon;
        return (
          <div
            key={alert!.id}
            className={`p-4 rounded-xl border ${
              alert!.type === 'danger'
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              <Icon
                size={20}
                className={
                  alert!.type === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                }
              />
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    alert!.type === 'danger' ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'
                  }`}
                >
                  {alert!.message}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Spent: {formatCurrency(alert!.spent, settings.currency)} of {formatCurrency(alert!.budget, settings.currency)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetAlerts;