"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { FixedSizeList as List } from "react-window"
import { useAppContext } from "../context/AppContext"
import { TrendingUp, TrendingDown, Calendar, Edit, Trash2 } from "lucide-react"
import { formatCurrency } from "../utils/currency"
import { SwipeableCard, HapticFeedback } from "./EnhancedMobileUX"

interface VirtualizedTransactionListProps {
  onEditTransaction: (transaction: any) => void
  onDeleteTransaction: (transactionId: string, description: string) => void
  filterType?: "all" | "income" | "expense"
  filterCategory?: string
  searchTerm?: string
  pageSize?: number
}

interface TransactionItemProps {
  index: number
  style: React.CSSProperties
  data: {
    transactions: any[]
    onEdit: (transaction: any) => void
    onDelete: (id: string, description: string) => void
    currency: string
  }
}

const TransactionItem: React.FC<TransactionItemProps> = ({ index, style, data }) => {
  const { transactions, onEdit, onDelete, currency } = data
  const transaction = transactions[index]

  if (!transaction) return null

  const handleSwipeLeft = () => {
    onDelete(transaction.id, transaction.description)
  }

  const handleSwipeRight = () => {
    onEdit(transaction)
  }

  return (
    <div style={style} className="px-4 py-2">
      <SwipeableCard
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className="bg-dark-surface rounded-xl p-4 border border-dark-border hover:border-primary/50 transition-colors"
      >
        <HapticFeedback type="light">
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
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold truncate">{transaction.category}</p>
                <p className="text-gray-400 text-sm truncate">{transaction.description}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar size={12} className="mr-1" />
                  {new Date(transaction.date).toLocaleDateString()}
                  {transaction.isAutoImported && (
                    <span className="ml-2 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">Auto</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className={`text-lg font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount, currency)}
                </p>
                {transaction.bankAccountId && <p className="text-xs text-gray-500">Bank Import</p>}
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(transaction)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(transaction.id, transaction.description)}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </HapticFeedback>
      </SwipeableCard>
    </div>
  )
}

const VirtualizedTransactionList: React.FC<VirtualizedTransactionListProps> = ({
  onEditTransaction,
  onDeleteTransaction,
  filterType = "all",
  filterCategory = "",
  searchTerm = "",
  pageSize = 50,
}) => {
  const { state } = useAppContext()
  const { transactions, settings } = state
  const [currentPage, setCurrentPage] = useState(0)

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesType = filterType === "all" || transaction.type === filterType
        const matchesCategory = !filterCategory || transaction.category === filterCategory
        const matchesSearch =
          !searchTerm ||
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesType && matchesCategory && matchesSearch
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, filterType, filterCategory, searchTerm])

  // Paginate transactions for better performance
  const paginatedTransactions = useMemo(() => {
    const startIndex = currentPage * pageSize
    const endIndex = startIndex + pageSize
    return filteredTransactions.slice(0, endIndex)
  }, [filteredTransactions, currentPage, pageSize])

  const itemData = useMemo(
    () => ({
      transactions: paginatedTransactions,
      onEdit: onEditTransaction,
      onDelete: onDeleteTransaction,
      currency: settings.currency,
    }),
    [paginatedTransactions, onEditTransaction, onDeleteTransaction, settings.currency],
  )

  const loadMore = useCallback(() => {
    if (paginatedTransactions.length < filteredTransactions.length) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [paginatedTransactions.length, filteredTransactions.length])

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(0)
  }, [filterType, filterCategory, searchTerm])

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 dark:bg-dark-surface rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={24} className="text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
        <p className="text-sm text-gray-500 mt-1">
          {searchTerm || filterType !== "all" || filterCategory
            ? "Try adjusting your filters"
            : "Add your first transaction to get started"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Transaction Stats */}
      <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{filteredTransactions.length}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {filteredTransactions.filter((t) => t.type === "income").length}
            </p>
            <p className="text-gray-400 text-sm">Income</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">
              {filteredTransactions.filter((t) => t.type === "expense").length}
            </p>
            <p className="text-gray-400 text-sm">Expenses</p>
          </div>
        </div>
      </div>

      {/* Virtualized List */}
      <div className="bg-dark-surface rounded-xl border border-dark-border overflow-hidden">
        <List
          height={600} // Fixed height for virtualization
          itemCount={paginatedTransactions.length}
          itemSize={100} // Height of each transaction item
          itemData={itemData}
          overscanCount={5} // Render extra items for smooth scrolling
        >
          {TransactionItem}
        </List>
      </div>

      {/* Load More Button */}
      {paginatedTransactions.length < filteredTransactions.length && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Load More ({filteredTransactions.length - paginatedTransactions.length} remaining)
          </button>
        </div>
      )}

      {/* Performance Info */}
      <div className="text-center text-gray-500 text-sm">
        Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
        {filteredTransactions.length > 100 && (
          <span className="block mt-1">
            ⚡ Optimized for {filteredTransactions.length.toLocaleString()} transactions
          </span>
        )}
      </div>
    </div>
  )
}

export default VirtualizedTransactionList
