"use client"

import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { TrendingUp, TrendingDown, Target, Bell } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import TransactionModal from "../components/TransactionModal"
import BudgetAlerts from "../components/BudgetAlerts"
import DailyBudgetTracker from "../components/DailyBudgetTracker"
import SpendingCategoryChart from "../components/SpendingCategoryChart"
import BillReminders from "../components/BillReminders"
import NotificationCenter from "../components/NotificationCenter"
import { formatCurrency } from "../utils/currency"
import { t } from "../utils/translations"
import { useToast } from "../components/ToastContainer"

const Dashboard: React.FC = () => {
  const { state } = useAppContext()
  const { transactions, monthlyBudget, savingsGoals, user, settings, bills, notifications } = state
  const { showToast } = useToast()

  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showBillReminders, setShowBillReminders] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense")

  // Calculate this month's expenses
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthExpenses = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        t.type === "expense" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    })
    .reduce((total, t) => total + t.amount, 0)

  const thisMonthIncome = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        t.type === "income" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    })
    .reduce((total, t) => total + t.amount, 0)

  const budgetUsedPercentage = (thisMonthExpenses / monthlyBudget) * 100

  // Calculate savings progress
  const totalSavingsTarget = savingsGoals.reduce((total, goal) => total + goal.targetAmount, 0)
  const totalSavingsCurrent = savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0)
  const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0

  // Categorize expenses for needs vs wants
  const needsCategories = ["Rent", "Food", "Transport", "Utilities", "Insurance"]
  const needs = transactions
    .filter((t) => t.type === "expense" && needsCategories.includes(t.category))
    .reduce((total, t) => total + t.amount, 0)

  const wants = thisMonthExpenses - needs

  const needsWantsData = [
    { name: t("needs", settings.language), value: needs, color: "#00695C" },
    { name: t("wants", settings.language), value: wants, color: "#FFC107" },
  ]

  const recentTransactions = transactions.slice(-3)

  // Get upcoming bills
  const upcomingBills = bills
    .filter((bill) => !bill.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-32">
      {/* Header with Notifications */}
      <div className="animate-fade-in flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {t("welcomeBack", settings.language)}, {user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-400">{t("hereIsYourFinancialOverview", settings.language)}</p>
        </div>
        
        {/* Notifications Button */}
        <button
          onClick={() => setShowNotifications(true)}
          className="relative p-3 bg-dark-surface rounded-xl border border-dark-border hover:border-primary/50 transition-colors"
        >
          <Bell size={20} className="text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Budget Alerts */}
      {settings.budgetAlerts && (
        <div className="animate-slide-up">
          <BudgetAlerts />
        </div>
      )}

      {/* Daily Budget Tracker */}
      <div className="animate-slide-up">
        <DailyBudgetTracker />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
        {/* Monthly Spending */}
        <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-400">{t("monthlySpending", settings.language)}</h3>
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">
            {formatCurrency(thisMonthExpenses, settings.currency)}
          </p>
          <div className="mt-2">
            <div className="bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  budgetUsedPercentage > 90
                    ? "bg-red-500"
                    : budgetUsedPercentage > 70
                      ? "bg-yellow-500"
                      : "bg-primary"
                }`}
                style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {budgetUsedPercentage.toFixed(0)}% {t("of", settings.language)}{" "}
              {formatCurrency(monthlyBudget, settings.currency)}
            </p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-400">{t("monthlyIncome", settings.language)}</h3>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">
            {formatCurrency(thisMonthIncome, settings.currency)}
          </p>
          <p className="text-xs text-green-500 mt-1">
            {thisMonthIncome > 0 ? t("greatProgress", settings.language) : t("addYourIncome", settings.language)}
          </p>
        </div>
      </div>

      {/* Savings Progress */}
      <div className="bg-dark-surface rounded-xl p-4 sm:p-6 border border-dark-border animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">{t("savingsProgress", settings.language)}</h3>
          <Target size={20} className="text-primary" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="rgb(75, 85, 99)" strokeWidth="4" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#00695C"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - savingsProgress / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{savingsProgress.toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold">{formatCurrency(totalSavingsCurrent, settings.currency)}</p>
            <p className="text-gray-400 text-sm">
              {t("of", settings.language)} {formatCurrency(totalSavingsTarget, settings.currency)}{" "}
              {t("goal", settings.language)}
            </p>
          </div>
        </div>
      </div>

      {/* Bill Reminders */}
      {upcomingBills.length > 0 && (
        <div className="bg-dark-surface rounded-xl p-4 sm:p-6 border border-dark-border animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <Bell size={20} className="mr-2" />
              {t("upcomingBills", settings.language)}
            </h3>
            <button
              onClick={() => setShowBillReminders(true)}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {t("viewAll", settings.language)}
            </button>
          </div>
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const daysUntil = Math.ceil(
                (new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )
              return (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{bill.name}</p>
                    <p className="text-sm text-gray-400">
                      {t("dueIn", settings.language)} {daysUntil} {t("day", settings.language)}
                      {daysUntil !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-white font-semibold">{formatCurrency(bill.amount, settings.currency)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Spending Category Chart */}
      <div className="animate-slide-up">
        <SpendingCategoryChart type="pie" period="month" />
      </div>

      {/* Needs vs Wants */}
      {thisMonthExpenses > 0 && (
        <div className="bg-dark-surface rounded-xl p-4 sm:p-6 border border-dark-border animate-slide-up">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">{t("needsVsWants", settings.language)}</h3>
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="w-full max-w-xs lg:w-32 h-32 mx-auto lg:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={needsWantsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {needsWantsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 w-full lg:flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-gray-300">{t("needs", settings.language)}</span>
                </div>
                <span className="text-sm text-gray-300">{formatCurrency(needs, settings.currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="text-sm text-gray-300">{t("wants", settings.language)}</span>
                </div>
                <span className="text-sm text-gray-300">{formatCurrency(wants, settings.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="bg-dark-surface rounded-xl p-4 sm:p-6 border border-dark-border animate-slide-up">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
            {t("recentTransactions", settings.language)}
          </h3>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "income" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <TrendingUp size={16} className="text-green-400" />
                    ) : (
                      <TrendingDown size={16} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{transaction.category}</p>
                    <p className="text-gray-400 text-sm">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount, settings.currency)}
                  </p>
                  <p className="text-gray-400 text-sm">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showTransactionModal && (
        <TransactionModal transaction={{ type: transactionType }} onClose={() => setShowTransactionModal(false)} />
      )}

      {showBillReminders && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface rounded-2xl p-6 w-full max-w-4xl border border-dark-border animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t("billReminders", settings.language)}</h2>
              <button
                onClick={() => setShowBillReminders(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <BillReminders />
          </div>
        </div>
      )}

      {/* Notification Center Modal */}
      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
    </div>
  )
}

export default Dashboard