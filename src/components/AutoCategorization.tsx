import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ToastContainer';
import { Brain, Check, X, Tag } from 'lucide-react';

interface SuggestedTransaction {
  id: string;
  description: string;
  amount: number;
  suggestedCategory: string;
  confidence: number;
  originalCategory?: string;
}

const AutoCategorization: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { transactions } = state;
  const { showToast } = useToast();
  
  const [suggestions, setSuggestions] = useState<SuggestedTransaction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const categoryKeywords = {
    'Food': ['restaurant', 'cafe', 'food', 'lunch', 'dinner', 'breakfast', 'mcdonald', 'kfc', 'pizza', 'starbucks', 'grab food', 'foodpanda'],
    'Transport': ['grab', 'uber', 'taxi', 'bus', 'train', 'petrol', 'gas', 'parking', 'toll', 'car', 'motorcycle'],
    'Shopping': ['mall', 'store', 'shop', 'amazon', 'lazada', 'shopee', 'clothing', 'shoes', 'electronics'],
    'Entertainment': ['movie', 'cinema', 'game', 'spotify', 'netflix', 'youtube', 'concert', 'club', 'bar'],
    'Utilities': ['electric', 'water', 'internet', 'phone', 'wifi', 'bill', 'utility', 'astro', 'unifi'],
    'Healthcare': ['hospital', 'clinic', 'doctor', 'pharmacy', 'medicine', 'dental', 'medical'],
    'Education': ['school', 'university', 'course', 'book', 'tuition', 'education', 'training'],
    'Rent': ['rent', 'rental', 'apartment', 'house', 'condo', 'room'],
  };

  const suggestCategory = (description: string): { category: string; confidence: number } => {
    const desc = description.toLowerCase();
    let bestMatch = { category: 'Other', confidence: 0 };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (desc.includes(keyword)) {
          const confidence = keyword.length / desc.length * 100;
          if (confidence > bestMatch.confidence) {
            bestMatch = { category, confidence: Math.min(confidence, 95) };
          }
        }
      }
    }

    return bestMatch;
  };

  const analyzeTransactions = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const uncategorizedTransactions = transactions.filter(t => 
        t.category === 'Other' || !t.category
      );

      const newSuggestions = uncategorizedTransactions.map(transaction => {
        const suggestion = suggestCategory(transaction.description);
        return {
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          suggestedCategory: suggestion.category,
          confidence: suggestion.confidence,
          originalCategory: transaction.category,
        };
      }).filter(s => s.confidence > 20); // Only show suggestions with reasonable confidence

      setSuggestions(newSuggestions);
      setIsAnalyzing(false);

      if (newSuggestions.length === 0) {
        showToast({
          type: 'info',
          title: 'No Suggestions',
          message: 'All transactions are already well categorized!',
        });
      }
    }, 2000);
  };

  const applySuggestion = (suggestion: SuggestedTransaction) => {
    const transaction = transactions.find(t => t.id === suggestion.id);
    if (transaction) {
      const updatedTransaction = {
        ...transaction,
        category: suggestion.suggestedCategory,
      };
      
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      showToast({
        type: 'success',
        title: 'Category Updated',
        message: `Transaction categorized as ${suggestion.suggestedCategory}`,
      });
    }
  };

  const rejectSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const applyAllSuggestions = () => {
    suggestions.forEach(suggestion => {
      const transaction = transactions.find(t => t.id === suggestion.id);
      if (transaction) {
        const updatedTransaction = {
          ...transaction,
          category: suggestion.suggestedCategory,
        };
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
      }
    });

    setSuggestions([]);
    showToast({
      type: 'success',
      title: 'All Suggestions Applied',
      message: `Updated ${suggestions.length} transactions`,
    });
  };

  if (suggestions.length === 0 && !isAnalyzing) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border">
        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Brain size={24} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Smart Categorization
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Let AI analyze your transactions and suggest better categories
          </p>
          <button
            onClick={analyzeTransactions}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Transactions'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Brain size={20} className="mr-2 text-primary" />
          Categorization Suggestions ({suggestions.length})
        </h3>
        {suggestions.length > 1 && (
          <button
            onClick={applyAllSuggestions}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Apply All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {suggestion.description}
              </p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  RM {suggestion.amount.toFixed(2)}
                </span>
                <div className="flex items-center space-x-2">
                  <Tag size={14} className="text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {suggestion.suggestedCategory}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({suggestion.confidence.toFixed(0)}% confidence)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => applySuggestion(suggestion)}
                className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors"
                title="Apply suggestion"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => rejectSuggestion(suggestion.id)}
                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors"
                title="Reject suggestion"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoCategorization;