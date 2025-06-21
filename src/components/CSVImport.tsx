import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ToastContainer';
import { Upload, FileText, Download, AlertCircle } from 'lucide-react';

interface CSVTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
}

const CSVImport: React.FC = () => {
  const { dispatch } = useAppContext();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<CSVTransaction[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const downloadTemplate = () => {
    const template = `Date,Description,Amount,Type,Category
2024-01-15,Lunch at Restaurant,25.50,expense,Food
2024-01-15,Salary Payment,3500.00,income,Salary
2024-01-16,Grab Ride,12.30,expense,Transport
2024-01-16,Coffee,8.90,expense,Food`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'duitcerdik-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Template Downloaded',
      message: 'CSV template has been downloaded to your device',
    });
  };

  const parseCSV = (csvText: string): CSVTransaction[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredHeaders = ['date', 'description', 'amount', 'type'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const transactions: CSVTransaction[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < 4) continue;
      
      const transaction: CSVTransaction = {
        date: values[headers.indexOf('date')],
        description: values[headers.indexOf('description')],
        amount: parseFloat(values[headers.indexOf('amount')]) || 0,
        type: values[headers.indexOf('type')].toLowerCase() as 'income' | 'expense',
        category: values[headers.indexOf('category')] || 'Other',
      };

      // Validate transaction
      if (!transaction.date || !transaction.description || transaction.amount <= 0) {
        continue;
      }

      if (!['income', 'expense'].includes(transaction.type)) {
        transaction.type = 'expense';
      }

      transactions.push(transaction);
    }

    return transactions;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showToast({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload a CSV file',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const text = await file.text();
      const transactions = parseCSV(text);
      
      if (transactions.length === 0) {
        throw new Error('No valid transactions found in the CSV file');
      }

      setPreviewData(transactions);
      setShowPreview(true);
      
      showToast({
        type: 'success',
        title: 'File Processed',
        message: `Found ${transactions.length} transactions. Review and import.`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Failed to process CSV file',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const importTransactions = () => {
    previewData.forEach(transaction => {
      const newTransaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: transaction.type,
        category: transaction.category || 'Other',
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      };
      
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    });

    showToast({
      type: 'success',
      title: 'Import Successful',
      message: `${previewData.length} transactions imported successfully`,
    });

    setPreviewData([]);
    setShowPreview(false);
  };

  const cancelImport = () => {
    setPreviewData([]);
    setShowPreview(false);
  };

  if (showPreview) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preview Import ({previewData.length} transactions)
        </h3>
        
        <div className="max-h-64 overflow-y-auto mb-4">
          <div className="space-y-2">
            {previewData.slice(0, 10).map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transaction.date} • {transaction.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}RM {transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {previewData.length > 10 && (
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                ... and {previewData.length - 10} more transactions
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={importTransactions}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Import All Transactions
          </button>
          <button
            onClick={cancelImport}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Upload size={20} className="mr-2" />
        Import Transactions from CSV
      </h3>

      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-1">CSV Format Requirements</h4>
              <ul className="text-blue-700 dark:text-blue-200 text-sm space-y-1">
                <li>• Required columns: Date, Description, Amount, Type</li>
                <li>• Optional column: Category</li>
                <li>• Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
                <li>• Type: "income" or "expense"</li>
                <li>• Amount: positive numbers only</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={downloadTemplate}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Download Template</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FileText size={16} />
            <span>{isProcessing ? 'Processing...' : 'Upload CSV File'}</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CSVImport;