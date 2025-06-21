"use client"

import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { useToast } from "../components/ToastContainer"
import { Plus, Target, Edit, Trash2, AlertTriangle } from "lucide-react"
import BudgetModal from "../components/BudgetModal"
import { formatCurrency } from "../utils/currency"
import { t } from "../utils/translations"

const Budget: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { budgets, transactions, settings } = state
  const { showToast } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)

  const handleDeleteBudget = (budgetId: string, categoryName: string) => {
    dispatch({ type: "DELETE_BUDGET", payload: budgetId })
    showToast({
      type: "success",
      title: t("budgetDeleted", settings.language),
      message: `${categoryName} ${t("budgetRemovedSuccessfully", settings.language)}`,
    })
  }

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget)
    setShowModal(true)
  }

  const calculateSpending = (category: string, period: "monthly" | "weekly") => {
    const now = new Date()
    const startDate = new Date()

    if (period === "monthly") {
      startDate.setDate(1) // Start of current month
    } else {
      startDate.setDate(now.getDate() - 7) // Last 7 days
    }

    return transactions
      .filter(
        (t) =>
          t.type === "expense" && t.category === category && new Date(t.date) >= startDate && new Date(t.date) <= now,
      )
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return { status: "over", color: "text-red-400", bgColor: "bg-red-500" }
    if (percentage >= 80) return { status: "warning", color: "text-yellow-400", bgColor: "bg-yellow-500" }
    return { status: "good", color: "text-green-400", bgColor: "bg-primary" }
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => {
    const spent = calculateSpending(budget.category, budget.period)
    return sum + spent
  }, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">{t("budgetManagement", settings.language)}</h1>
        <p className="text-gray-400">{t("setTrackSpendingLimits", settings.language)}</p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-primary to-teal-600 rounded-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-semibold mb-1">{t("totalBudgetOverview", settings.language)}</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent, settings.currency)}</p>
            <p className="text-white/80 text-sm">
              {t("of", settings.language)} {formatCurrency(totalBudget, settings.currency)}{" "}
              {t("budgeted", settings.language)}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-full p-4">
              <Target size={32} />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budgets List */}
      <div className="space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {t("categoryBudgets", settings.language)} ({budgets.length})
          </h3>
          <button
            onClick={() => {
              setEditingBudget(null)
              setShowModal(true)
            }}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Plus size={16} />
            <span className="font-medium">{t("addBudget", settings.language)}</span>
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-dark-surface rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-400 mb-2">{t("noBudgetsSet", settings.language)}</p>
            <p className="text-sm text-gray-500 mb-4">{t("createFirstBudget", settings.language)}</p>
            <button
              onClick={() => {
                setEditingBudget(null)
                setShowModal(true)
              }}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              {t("createFirstBudgetBtn", settings.language)}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = calculateSpending(budget.category, budget.period)
              const remaining = budget.amount - spent
              const percentage = (spent / budget.amount) * 100
              const status = getBudgetStatus(spent, budget.amount)

              return (
                <div
                  key={budget.id}
                  className="bg-dark-surface rounded-xl p-6 border border-dark-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">
                          {t(budget.category.toLowerCase(), settings.language)}
                        </h4>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          {t(budget.period, settings.language)}
                        </span>
                        {status.status === "over" && <AlertTriangle size={16} className="text-red-400" />}
                      </div>
                      <div className="flex items-center text-sm text-gray-400 space-x-4">
                        <span>
                          {t("budget", settings.language)}: {formatCurrency(budget.amount, settings.currency)}
                        </span>
                        <span>
                          {t("spent", settings.language)}: {formatCurrency(spent, settings.currency)}
                        </span>
                        <span className={remaining >= 0 ? "text-green-400" : "text-red-400"}>
                          {remaining >= 0 ? t("remaining", settings.language) : t("over", settings.language)}:{" "}
                          {formatCurrency(Math.abs(remaining), settings.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBudget(budget)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id, budget.category)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">
                        {percentage.toFixed(1)}% {t("used", settings.language)}
                      </span>
                      <span className={status.color}>
                        {status.status === "over"
                          ? t("overBudget", settings.language)
                          : status.status === "warning"
                            ? t("almostThere", settings.language)
                            : t("onTrack", settings.language)}
                      </span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${status.bgColor}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-400">{t("dailyAvg", settings.language)}</p>
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(
                          budget.period === "monthly" ? spent / new Date().getDate() : spent / 7,
                          settings.currency,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t("daysLeft", settings.language)}</p>
                      <p className="text-sm font-semibold text-white">
                        {budget.period === "monthly"
                          ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() -
                            new Date().getDate()
                          : 7 - (new Date().getDay() || 7)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t("transactions", settings.language)}</p>
                      <p className="text-sm font-semibold text-white">
                        {transactions.filter((t) => t.type === "expense" && t.category === budget.category).length}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={() => {
            setShowModal(false)
            setEditingBudget(null)
          }}
        />
      )}
    </div>
  )
}

export default Budget
