import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ToastContainer';
import { X, DollarSign, Calendar, FileText, Tag, Percent } from 'lucide-react';

interface LiabilitiesModalProps {
  onClose: () => void;
  liability?: any;
}

const LiabilitiesModal: React.FC<LiabilitiesModalProps> = ({ onClose, liability }) => {
  const { supabaseActions } = useAppContext();
  const { showToast } = useToast();
  
  const [name, setName] = useState(liability?.name || '');
  const [type, setType] = useState(liability?.type || 'loan');
  const [currentBalance, setCurrentBalance] = useState(liability?.currentBalance?.toString() || '');
  const [originalAmount, setOriginalAmount] = useState(liability?.originalAmount?.toString() || '');
  const [interestRate, setInterestRate] = useState(liability?.interestRate?.toString() || '');
  const [dueDate, setDueDate] = useState(liability?.dueDate || '');

  const liabilityTypes = [
    { value: 'loan', label: 'Personal Loan' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'mortgage', label: 'Mortgage' },
    { value: 'student_loan', label: 'Student Loan' },
    { value: 'car_loan', label: 'Car Loan' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !currentBalance) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    const liabilityData = {
      id: liability?.id || Date.now().toString(),
      name,
      type,
      currentBalance: parseFloat(currentBalance),
      originalAmount: originalAmount ? parseFloat(originalAmount) : undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      dueDate: dueDate || undefined,
    };

    try {
      if (liability) {
        await supabaseActions.updateLiability(liabilityData);
      } else {
        await supabaseActions.saveLiability(liabilityData);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the supabaseActions
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface rounded-2xl p-6 w-full max-w-md border border-dark-border animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {liability ? 'Edit Liability' : 'Add Liability'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText size={16} className="inline mr-2" />
              Liability Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Credit Card Debt, Car Loan"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Tag size={16} className="inline mr-2" />
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            >
              {liabilityTypes.map(liabilityType => (
                <option key={liabilityType.value} value={liabilityType.value}>
                  {liabilityType.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Current Balance (RM)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              required
              placeholder="5000.00"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Original Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Original Amount (RM) - Optional
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={originalAmount}
              onChange={(e) => setOriginalAmount(e.target.value)}
              placeholder="10000.00"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Percent size={16} className="inline mr-2" />
              Interest Rate (%) - Optional
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="18.00"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Due Date - Optional
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {liability ? 'Update Liability' : 'Add Liability'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiabilitiesModal;