import type React from "react"
import { Calendar, TrendingDown, AlertCircle } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { formatCurrency } from "../utils/currency"
import { t } from "../utils/translations"

const DailyBudgetTracker: React.FC = () => {
  const { state } = useAppContext()
  const { transactions, monthlyBudget, settings } = state

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const currentDay = today.getDate()

  // Calculate days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysRemaining = daysInMonth - currentDay + 1

  // Calculate monthly spending so far
  const monthlySpent = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        t.type === "expense" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    })
    .reduce((total, t) => total + t.amount, 0)

  // Calculate today's spending
  const todaySpent = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return t.type === "expense" && transactionDate.toDateString() === today.toDateString()
    })
    .reduce((total, t) => total + t.amount, 0)

  // Calculate daily budget
  const remainingBudget = monthlyBudget - monthlySpent
  const dailyBudget = remainingBudget / daysRemaining
  const dailyBudgetOriginal = monthlyBudget / daysInMonth

  // Determine status
  let status: "safe" | "caution" | "danger" = "safe"
  let statusColor = "text-green-600 dark:text-green-400"
  let bgColor = "bg-green-50 dark:bg-green-500/10"
  let borderColor = "border-green-200 dark:border-green-500/30"

  if (todaySpent > dailyBudget * 1.5) {
    status = "danger"
    statusColor = "text-red-600 dark:text-red-400"
    bgColor = "bg-red-50 dark:bg-red-500/10"
    borderColor = "border-red-200 dark:border-red-500/30"
  } else if (todaySpent > dailyBudget) {
    status = "caution"
    statusColor = "text-yellow-600 dark:text-yellow-400"
    bgColor = "bg-yellow-50 dark:bg-yellow-500/10"
    borderColor = "border-yellow-200 dark:border-yellow-500/30"
  }

  const getStatusMessage = () => {
    if (status === "danger") return t("significantlyExceededBudget", settings.language)
    if (status === "caution") return t("overRecommendedSpending", settings.language)
    return t("onTrackDailyBudget", settings.language)
  }

  const getStatusIcon = () => {
    if (status === "danger") return <AlertCircle size={20} className={statusColor} />
    if (status === "caution") return <TrendingDown size={20} className={statusColor} />
    return <Calendar size={20} className={statusColor} />
  }

  return (
    <div className={`rounded-xl p-6 border ${bgColor} ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          {getStatusIcon()}
          <span className="ml-2">{t("dailyBudgetTracker", settings.language)}</span>
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("today", settings.language)}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("todaysBudget", settings.language)}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(Math.max(0, dailyBudget), settings.currency)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("todaysSpending", settings.language)}</p>
          <p className={`text-xl font-bold ${statusColor}`}>{formatCurrency(todaySpent, settings.currency)}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">{t("dailyProgress", settings.language)}</span>
          <span className={statusColor}>{dailyBudget > 0 ? ((todaySpent / dailyBudget) * 100).toFixed(0) : 0}%</span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              status === "danger" ? "bg-red-500" : status === "caution" ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{
              width: `${dailyBudget > 0 ? Math.min((todaySpent / dailyBudget) * 100, 100) : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className={`text-sm font-medium ${statusColor}`}>{getStatusMessage()}</p>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <span>
              {t("daysRemaining", settings.language)}: {daysRemaining}
            </span>
          </div>
          <div>
            <span>
              {t("budgetLeft", settings.language)}: {formatCurrency(Math.max(0, remainingBudget), settings.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyBudgetTracker
