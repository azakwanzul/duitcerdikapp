import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { TrendingUp, Calendar, Lightbulb, Award, AlertCircle, Target, DollarSign, Plus, Edit, Trash2 } from "lucide-react"
import { XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from "recharts"
import SpendingCategoryChart from "../components/SpendingCategoryChart"
import { formatCurrency } from "../utils/currency"
import { t } from "../utils/translations"
import LiabilitiesModal from "../components/LiabilitiesModal"

const Insights: React.FC = () => {
  const { state, supabaseActions } = useAppContext()
  const { transactions, settings, budgets, savingsGoals, bankAccounts, liabilities } = state
  const [showLiabilityModal, setShowLiabilityModal] = useState(false)
  const [editingLiability, setEditingLiability] = useState<any>(null)

  // Generate monthly spending data for the last 6 months
  const generateMonthlyData = () => {
    const months = []
    const currentDate = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      const monthlyExpenses = transactions
        .filter((t) => {
          try {
            const transactionDate = new Date(t.date)
            return (
              t.type === "expense" &&
              transactionDate.getMonth() === date.getMonth() &&
              transactionDate.getFullYear() === date.getFullYear() &&
              !isNaN(transactionDate.getTime())
            )
          } catch {
            return false
          }
        })
        .reduce((total, t) => total + (t.amount || 0), 0)

      const monthlyIncome = transactions
        .filter((t) => {
          try {
            const transactionDate = new Date(t.date)
            return (
              t.type === "income" &&
              transactionDate.getMonth() === date.getMonth() &&
              transactionDate.getFullYear() === date.getFullYear() &&
              !isNaN(transactionDate.getTime())
            )
          } catch {
            return false
          }
        })
        .reduce((total, t) => total + (t.amount || 0), 0)

      months.push({
        month: monthName,
        expenses: monthlyExpenses,
        income: monthlyIncome,
        savings: monthlyIncome - monthlyExpenses,
      })
    }

    return months
  }

  // Generate weekend vs weekday spending
  const generateWeekendData = () => {
    let weekdaySpending = 0
    let weekendSpending = 0

    transactions.forEach((transaction) => {
      if (transaction.type === "expense" && transaction.amount) {
        try {
          const date = new Date(transaction.date)
          if (!isNaN(date.getTime())) {
            const dayOfWeek = date.getDay()

            if (dayOfWeek === 0 || dayOfWeek === 6) {
              // Sunday or Saturday
              weekendSpending += transaction.amount
            } else {
              weekdaySpending += transaction.amount
            }
          }
        } catch {
          // Skip invalid dates
        }
      }
    })

    return [
      { name: t("weekdays", settings.language), value: weekdaySpending, color: "#00695C" },
      { name: t("weekends", settings.language), value: weekendSpending, color: "#FFC107" },
    ]
  }

  // Generate category breakdown
  const generateCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount
      }
    })

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }

  // Calculate financial health score
  const calculateFinancialHealthScore = () => {
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    let score = 0

    // Savings rate (40 points max)
    if (savingsRate >= 20) score += 40
    else if (savingsRate >= 10) score += 30
    else if (savingsRate >= 5) score += 20
    else if (savingsRate > 0) score += 10

    // Budget adherence (30 points max)
    const budgetAdherence = budgets.length > 0 ? 30 : 0
    score += budgetAdherence

    // Goal setting (20 points max)
    const goalSetting = savingsGoals.length > 0 ? 20 : 0
    score += goalSetting

    // Transaction tracking (10 points max)
    const transactionTracking = transactions.length > 10 ? 10 : Math.floor(transactions.length)
    score += transactionTracking

    return Math.min(score, 100)
  }

  // Calculate net worth
  const calculateNetWorth = () => {
    // Assets
    const bankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0)
    const savingsBalance = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const totalAssets = bankBalance + savingsBalance

    // Liabilities
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0)

    // Net Worth
    return totalAssets - totalLiabilities
  }

  // Generate personalized tips
  const generateTips = () => {
    const categoryTotals: { [key: string]: number } = {}
    let totalExpenses = 0

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount
        totalExpenses += transaction.amount
      }
    })

    const tips = []

    // Check for high food spending
    if (categoryTotals["Food"] > totalExpenses * 0.3) {
      tips.push({
        icon: "🍽️",
        title: t("foodSpendingAlert", settings.language),
        description: t("foodSpendingAlertDesc", settings.language),
        type: "warning",
        impact: "High",
      })
    }

    // Check for entertainment spending
    if (categoryTotals["Entertainment"] > 300) {
      tips.push({
        icon: "🎭",
        title: t("entertainmentBudget", settings.language),
        description: t("entertainmentBudgetDesc", settings.language),
        type: "tip",
        impact: "Medium",
      })
    }

    // Check for transport costs
    if (categoryTotals["Transport"] > 400) {
      tips.push({
        icon: "🚗",
        title: t("transportOptimization", settings.language),
        description: t("transportOptimizationDesc", settings.language),
        type: "tip",
        impact: "Medium",
      })
    }

    // Savings goal achievement
    const completedGoals = savingsGoals.filter((goal) => goal.currentAmount >= goal.targetAmount)
    if (completedGoals.length > 0) {
      tips.push({
        icon: "🎯",
        title: t("goalAchievement", settings.language),
        description: `${t("congratulations", settings.language)}! ${t("youveCompleted", settings.language)} ${completedGoals.length} ${t("savingsGoal", settings.language)}${completedGoals.length > 1 ? "s" : ""}!`,
        type: "achievement",
        impact: "High",
      })
    }

    // General savings tip
    if (tips.length === 0) {
      tips.push({
        icon: "💰",
        title: t("savingsGoal", settings.language),
        description: t("generalSavingsTip", settings.language),
        type: "achievement",
        impact: "High",
      })
    }

    return tips
  }

  const handleEditLiability = (liability: any) => {
    setEditingLiability(liability);
    setShowLiabilityModal(true);
  };

  const handleDeleteLiability = async (liabilityId: string) => {
    await supabaseActions.deleteLiability(liabilityId);
  };

  const monthlyData = generateMonthlyData()
  const weekendData = generateWeekendData()
  const categoryData = generateCategoryData()
  const tips = generateTips()
  const financialHealthScore = calculateFinancialHealthScore()
  const netWorth = calculateNetWorth()

  const totalWeekendSpending = weekendData.reduce((sum, item) => sum + item.value, 0)

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return t("excellent", settings.language)
    if (score >= 60) return t("good", settings.language)
    if (score >= 40) return t("fair", settings.language)
    return t("needsImprovement", settings.language)
  }

  const getNetWorthColor = (amount: number) => {
    if (amount > 0) return "text-green-500"
    if (amount === 0) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("financialInsights", settings.language)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t("understandSpendingPatterns", settings.language)}</p>
      </div>

      {/* Financial Health Score */}
      <div className="bg-gradient-to-br from-primary to-teal-600 rounded-xl p-6 text-white animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t("financialHealthScore", settings.language)}</h3>
          <Target size={24} />
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.3)" strokeWidth="6" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="white"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - financialHealthScore / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{financialHealthScore}</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">{getHealthScoreLabel(financialHealthScore)}</p>
            <p className="text-white/80">{t("basedOnFinancialHabits", settings.language)}</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>
                  {t("savingsRate", settings.language)}:{" "}
                  {savingsGoals.length > 0 ? t("good", settings.language) : t("setGoals", settings.language)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>
                  {t("budgetTracking", settings.language)}:{" "}
                  {budgets.length > 0 ? t("active", settings.language) : t("setBudgets", settings.language)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Worth Tracker */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <DollarSign size={20} className="mr-2" />
            Net Worth Tracker
          </h3>
          <button
            onClick={() => {
              setEditingLiability(null);
              setShowLiabilityModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Liability</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm">Total Assets</p>
            <p className="text-xl font-bold text-green-400">
              {formatCurrency(
                bankAccounts.reduce((sum, account) => sum + account.balance, 0) +
                savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0),
                settings.currency
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">Bank accounts + Savings goals</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">Total Liabilities</p>
            <p className="text-xl font-bold text-red-400">
              {formatCurrency(
                liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0),
                settings.currency
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">Loans + Credit cards + Other debts</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm">Net Worth</p>
            <p className={`text-xl font-bold ${getNetWorthColor(netWorth)}`}>
              {formatCurrency(netWorth, settings.currency)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Assets - Liabilities</p>
          </div>
        </div>

        {/* Liabilities List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Your Liabilities</h4>
          
          {liabilities.length === 0 ? (
            <div className="text-center py-6 bg-gray-700/30 rounded-xl">
              <p className="text-gray-400">No liabilities added yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your debts to track your net worth accurately</p>
            </div>
          ) : (
            <div className="space-y-2">
              {liabilities.map((liability) => (
                <div key={liability.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{liability.name}</p>
                    <div className="flex items-center text-sm text-gray-400 space-x-3">
                      <span className="capitalize">{liability.type.replace('_', ' ')}</span>
                      {liability.interestRate && <span>{liability.interestRate}% interest</span>}
                      {liability.dueDate && (
                        <span>Due: {new Date(liability.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-red-400 font-semibold">
                        {formatCurrency(liability.currentBalance, settings.currency)}
                      </p>
                      {liability.originalAmount && (
                        <p className="text-xs text-gray-500">
                          of {formatCurrency(liability.originalAmount, settings.currency)}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditLiability(liability)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLiability(liability.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend Analysis */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2" />
          {t("incomeVsExpensesTrend", settings.language)}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value, settings.currency), name]}
                contentStyle={{
                  backgroundColor: settings.darkMode ? "#1E1E1E" : "#fff",
                  border: `1px solid ${settings.darkMode ? "#2D2D2D" : "#e5e7eb"}`,
                  borderRadius: "8px",
                  color: settings.darkMode ? "#fff" : "#000",
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={3}
                name={t("income", settings.language)}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                strokeWidth={3}
                name={t("expense", settings.language)}
              />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#00695C"
                strokeWidth={3}
                name={t("netSavings", settings.language)}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Category Analysis */}
      <div className="animate-slide-up">
        <SpendingCategoryChart type="bar" period="month" />
      </div>

      {/* Weekend vs Weekday Spending */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar size={20} className="mr-2" />
          {t("weekendVsWeekdaySpending", settings.language)}
        </h3>
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weekendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {weekendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value, settings.currency),
                    t("amount", settings.language),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex-1">
            {weekendData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(item.value, settings.currency)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {totalWeekendSpending > 0 ? ((item.value / totalWeekendSpending) * 100).toFixed(1) : "0"}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("topSpendingCategories", settings.language)}
        </h3>
        <div className="space-y-3">
          {categoryData.map((category, index) => {
            const maxAmount = Math.max(...categoryData.map((c) => c.amount))
            const percentage = (category.amount / maxAmount) * 100

            return (
              <div key={category.category} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {t(category.category.toLowerCase(), settings.language) || category.category}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatCurrency(category.amount, settings.currency)}
                    </span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Personalized Tips */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-gray-200 dark:border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lightbulb size={20} className="mr-2" />
          {t("personalizedTipsInsights", settings.language)}
        </h3>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                tip.type === "warning"
                  ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"
                  : tip.type === "achievement"
                    ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30"
                    : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{tip.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-semibold ${
                        tip.type === "warning"
                          ? "text-red-700 dark:text-red-400"
                          : tip.type === "achievement"
                            ? "text-green-700 dark:text-green-400"
                            : "text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {tip.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tip.impact === "High"
                          ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                          : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {tip.impact} Impact
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{tip.description}</p>
                </div>
                {tip.type === "warning" && <AlertCircle size={20} className="text-red-600 dark:text-red-400" />}
                {tip.type === "achievement" && <Award size={20} className="text-green-600 dark:text-green-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-br from-primary to-teal-600 rounded-xl p-6 text-white animate-slide-up">
        <h3 className="text-lg font-semibold mb-2">{t("yourFinancialJourney", settings.language)}</h3>
        <p className="text-white/80 mb-4">{t("financialJourneyDesc", settings.language)}</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{transactions.length}</p>
            <p className="text-white/80 text-sm">{t("transactions", settings.language)}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{new Set(transactions.map((t) => t.category)).size}</p>
            <p className="text-white/80 text-sm">{t("categories", settings.language)}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {transactions.length > 0
                ? Math.max(
                    1,
                    Math.ceil(
                      (new Date().getTime() - new Date(transactions[0]?.date || new Date()).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )
                : 0}
            </p>
            <p className="text-white/80 text-sm">{t("daysTracking", settings.language)}</p>
          </div>
        </div>
      </div>

      {/* Liability Modal */}
      {showLiabilityModal && (
        <LiabilitiesModal
          liability={editingLiability}
          onClose={() => {
            setShowLiabilityModal(false);
            setEditingLiability(null);
          }}
        />
      )}
    </div>
  )
}

export default Insights