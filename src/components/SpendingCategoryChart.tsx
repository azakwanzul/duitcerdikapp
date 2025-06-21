import type React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { useAppContext } from "../context/AppContext"
import { formatCurrency } from "../utils/currency"
import { t } from "../utils/translations"

interface SpendingCategoryChartProps {
  type?: "pie" | "bar"
  period?: "month" | "week" | "all"
}

const SpendingCategoryChart: React.FC<SpendingCategoryChartProps> = ({ type = "pie", period = "month" }) => {
  const { state } = useAppContext()
  const { transactions, settings } = state

  const getFilteredTransactions = () => {
    const now = new Date()
    const startDate = new Date()

    if (period === "month") {
      startDate.setDate(1)
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 7)
    } else {
      return transactions.filter((t) => t.type === "expense")
    }

    return transactions.filter((t) => t.type === "expense" && new Date(t.date) >= startDate && new Date(t.date) <= now)
  }

  const filteredTransactions = getFilteredTransactions()

  const categoryData = filteredTransactions.reduce(
    (acc, transaction) => {
      const category = transaction.category
      acc[category] = (acc[category] || 0) + transaction.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(categoryData)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Show top 8 categories

  const colors = [
    "#00695C",
    "#FFC107",
    "#FF5722",
    "#2196F3",
    "#9C27B0",
    "#4CAF50",
    "#FF9800",
    "#795548",
    "#607D8B",
    "#E91E63",
  ]

  function getCategoryColor(category: string): string {
    const categoryColors: Record<string, string> = {
      Food: "#FF5722",
      Transport: "#2196F3",
      Rent: "#9C27B0",
      Utilities: "#4CAF50",
      Entertainment: "#FF9800",
      Shopping: "#E91E63",
      Healthcare: "#795548",
      Education: "#607D8B",
      Insurance: "#00695C",
      Other: "#FFC107",
    }
    return categoryColors[category] || colors[Math.floor(Math.random() * colors.length)]
  }

  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0)

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-dark-border">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("spendingByCategory", settings.language)}
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">{t("noSpendingData", settings.language)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-dark-border">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t("spendingByCategory", settings.language)} (
        {period === "month"
          ? t("thisMonth", settings.language)
          : period === "week"
            ? t("thisWeek", settings.language)
            : t("allTime", settings.language)}
        )
      </h3>

      {type === "pie" ? (
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="w-full max-w-xs lg:w-48 h-48 mx-auto lg:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
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

          <div className="flex-1 w-full space-y-2 sm:space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.value, settings.currency)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {((item.value / totalSpent) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value, settings.currency),
                  t("amount", settings.language),
                ]}
                contentStyle={{
                  backgroundColor: "#1E1E1E",
                  border: "1px solid #2D2D2D",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default SpendingCategoryChart
