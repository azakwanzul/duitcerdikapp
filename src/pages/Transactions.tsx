"use client"

import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { useToast } from "../components/ToastContainer"
import {
  Plus,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Repeat,
} from "lucide-react"
import TransactionModal from "../components/TransactionModal"
import RecurringTransactionModal from "../components/RecurringTransactionModal"
import AutoCategorization from "../components/AutoCategorization"
import CSVImport from "../components/CSVImport"
import { t } from "../utils/translations"

const Transactions: React.FC = () => {
  const { state, supabaseActions } = useAppContext()
  const { transactions, settings } = state
  const { showToast } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [showAutoCategorizationModal, setShowAutoCategorizationModal] = useState(false)
  const [showCSVImportModal, setShowCSVImportModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const categories = Array.from(new Set(transactions.map((t) => t.category)))

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = !filterCategory || transaction.category === filterCategory
    const matchesSearch =
      !searchTerm ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesType && matchesCategory && matchesSearch
  })

  const sortedTransactions = filteredTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const handleDeleteTransaction = async (transactionId: string, description: string) => {
    try {
      await supabaseActions.deleteTransaction(transactionId)
    } catch (error) {
      // Error handling is done in the supabaseActions
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("trackYourIncomeExpenses", settings.language)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t("manageFinancialTransactions", settings.language)}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up">
        <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-green-300 dark:text-green-300 text-green-700">
              {t("totalIncome", settings.language)}
            </h3>
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <p className="text-xl font-bold text-green-400 dark:text-green-400 text-green-700">
            {settings.currency} {totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-red-300 dark:text-red-300 text-red-700">
              {t("totalExpenses", settings.language)}
            </h3>
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <p className="text-xl font-bold text-red-400 dark:text-red-400 text-red-700">
            {settings.currency} {totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Smart Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
        <button
          onClick={() => setShowAutoCategorizationModal(true)}
          className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border hover:border-primary/50 transition-colors text-left"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {t("smartCategorization", settings.language)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("letAISuggestCategories", settings.language)}</p>
        </button>

        <button
          onClick={() => setShowCSVImportModal(true)}
          className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border hover:border-primary/50 transition-colors text-left"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t("importFromCSV", settings.language)}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("uploadBankStatements", settings.language)}</p>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 animate-slide-up">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchTransactions", settings.language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | "income" | "expense")}
            className="flex-1 p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">{t("allTypes", settings.language)}</option>
            <option value="income">{t("income", settings.language)}</option>
            <option value="expense">{t("expense", settings.language)}</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">{t("allCategories", settings.language)}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("transactions", settings.language)} ({sortedTransactions.length})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowRecurringModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors text-sm"
            >
              <Repeat size={14} />
              <span>{t("recurring", settings.language)}</span>
            </button>
            <Filter size={20} className="text-gray-400" />
          </div>
        </div>

        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-dark-surface rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <DollarSign size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">{t("noTransactionsFound", settings.language)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || filterType !== "all" || filterCategory
                ? t("tryAdjustingFilters", settings.language)
                : t("addFirstTransaction", settings.language)}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === "income" ? "bg-green-500/20" : "bg-red-500/20"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp size={20} className="text-green-400" />
                      ) : (
                        <TrendingDown size={20} className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">{transaction.category}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{transaction.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar size={12} className="mr-1" />
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "income" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {settings.currency} {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingTransaction(null)
          setShowModal(true)
        }}
        className="fixed bottom-24 right-6 bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 z-10"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setShowModal(false)
            setEditingTransaction(null)
          }}
        />
      )}

      {showRecurringModal && <RecurringTransactionModal onClose={() => setShowRecurringModal(false)} />}

      {showAutoCategorizationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 w-full max-w-2xl border border-gray-200 dark:border-dark-border animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("smartCategorization", settings.language)}
              </h2>
              <button
                onClick={() => setShowAutoCategorizationModal(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <AutoCategorization />
          </div>
        </div>
      )}

      {showCSVImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 w-full max-w-2xl border border-gray-200 dark:border-dark-border animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("importFromCSV", settings.language)}
              </h2>
              <button
                onClick={() => setShowCSVImportModal(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <CSVImport />
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions