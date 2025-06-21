"use client"

import type React from "react"
import { useState } from "react"
import { Calculator, DollarSign, Plane, Smartphone, GraduationCap, Home, TrendingUp, Target, Calendar } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { formatCurrency } from "../utils/currency"
import { t } from "../utils/translations"

const Simulator: React.FC = () => {
  const { state } = useAppContext()
  const { settings, savingsGoals } = state

  const [activeTab, setActiveTab] = useState<"lifestyle" | "compound">("lifestyle")
  const [monthlyIncome, setMonthlyIncome] = useState(3500)
  const [expenses, setExpenses] = useState({
    rent: 800,
    food: 600,
    transport: 300,
    utilities: 150,
    entertainment: 200,
    shopping: 250,
    other: 100,
  })
  const [savingsRate, setSavingsRate] = useState(20)

  // Compound Interest Calculator State
  const [principal, setPrincipal] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [annualRate, setAnnualRate] = useState(7)
  const [years, setYears] = useState(10)

  const totalExpenses = Object.values(expenses).reduce((sum, expense) => sum + expense, 0)
  const suggestedSavings = (monthlyIncome * savingsRate) / 100
  const netIncome = monthlyIncome - totalExpenses - suggestedSavings
  const funMoney = Math.max(0, netIncome)

  // Compound Interest Calculation
  const calculateCompoundInterest = () => {
    const monthlyRate = annualRate / 100 / 12
    const totalMonths = years * 12

    // Future value of initial principal
    const futureValuePrincipal = principal * Math.pow(1 + monthlyRate, totalMonths)

    // Future value of monthly contributions (annuity)
    const futureValueContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)

    const totalValue = futureValuePrincipal + futureValueContributions
    const totalContributions = principal + monthlyContribution * totalMonths
    const totalInterest = totalValue - totalContributions

    return {
      totalValue,
      totalContributions,
      totalInterest,
      monthlyBreakdown: Array.from({ length: Math.min(years, 10) }, (_, i) => {
        const year = i + 1
        const months = year * 12
        const yearlyValue =
          principal * Math.pow(1 + monthlyRate, months) +
          monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
        return {
          year,
          value: yearlyValue,
        }
      }),
    }
  }

  const compoundResults = calculateCompoundInterest()

  const updateExpense = (category: string, value: number) => {
    setExpenses((prev) => ({ ...prev, [category]: value }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const calculateMonthsToSave = (targetAmount: number, currentAmount: number) => {
    if (suggestedSavings <= 0) return 0
    const remaining = Math.max(0, targetAmount - currentAmount)
    return Math.ceil(remaining / suggestedSavings)
  }

  const renderLifestyleSimulator = () => (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calculator size={20} className="mr-2" />
          {t("yourMonthlyBudget", settings.language)}
        </h3>

        {/* Monthly Income */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t("monthlyIncome", settings.language)} ({settings.currency})
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number.parseInt(e.target.value) || 0)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Expenses */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-white">{t("monthlyExpenses", settings.language)}</h4>
          {Object.entries(expenses).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between">
              <label className="text-gray-300 capitalize">{t(category, settings.language)}</label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">{settings.currency}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => updateExpense(category, Number.parseInt(e.target.value) || 0)}
                  className="w-20 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Savings Rate */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t("savingsRate", settings.language)} ({savingsRate}%)
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={savingsRate}
            onChange={(e) => setSavingsRate(Number.parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <DollarSign size={20} className="mr-2" />
          {t("yourFinancialSummary", settings.language)}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">{t("totalExpenses", settings.language)}</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses, settings.currency)}</p>
          </div>
          <div className="bg-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">{t("suggestedSavings", settings.language)}</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(suggestedSavings, settings.currency)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary to-teal-600 rounded-xl p-4 text-white">
          <p className="text-white/80 text-sm">{t("availableFunMoney", settings.language)}</p>
          <p className="text-2xl font-bold">{formatCurrency(funMoney, settings.currency)}</p>
          <p className="text-white/80 text-sm mt-1">
            {funMoney < 0 ? t("youreOverspending", settings.language) : t("greatMoneyLeftFun", settings.language)}
          </p>
        </div>
      </div>

      {/* Your Savings Goals */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target size={20} className="mr-2" />
          Your Savings Goals
        </h3>

        {savingsGoals.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-400 mb-2">No savings goals set yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create savings goals to see how long it will take to achieve them with your current savings rate
            </p>
          </div>
        ) : suggestedSavings <= 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">Increase your savings rate to see goal timelines</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((goal) => {
              const monthsToSave = calculateMonthsToSave(goal.targetAmount, goal.currentAmount)
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const isCompleted = goal.currentAmount >= goal.targetAmount

              return (
                <div
                  key={goal.id}
                  className={`rounded-xl p-4 border transition-all duration-200 hover:scale-105 ${
                    isCompleted 
                      ? "bg-green-500/10 border-green-500/30" 
                      : monthsToSave <= 12 
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-yellow-500/10 border-yellow-500/30"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500/20"
                          : monthsToSave <= 12
                            ? "bg-blue-500/20"
                            : "bg-yellow-500/20"
                      }`}
                    >
                      <Target size={24} className={
                        isCompleted
                          ? "text-green-400"
                          : monthsToSave <= 12
                            ? "text-blue-400"
                            : "text-yellow-400"
                      } />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{goal.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </span>
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar size={12} className="mr-1" />
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-green-500" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-white">{formatCurrency(goal.targetAmount, settings.currency)}</p>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(goal.currentAmount, settings.currency)} saved
                        </p>
                      </div>
                      <div className="text-right">
                        {isCompleted ? (
                          <p className="text-green-400 text-sm font-medium">Goal Achieved! 🎉</p>
                        ) : (
                          <>
                            <p className={`text-sm font-medium ${
                              monthsToSave <= 12 ? "text-blue-400" : "text-yellow-400"
                            }`}>
                              {monthsToSave} months to save
                            </p>
                            <p className="text-xs text-gray-400">
                              at {formatCurrency(suggestedSavings, settings.currency)}/month
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  const renderCompoundInterest = () => (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2" />
          {t("compoundInterestCalculator", settings.language)}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("initialInvestment", settings.language)} ({settings.currency})
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number.parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("monthlyContribution", settings.language)} ({settings.currency})
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number.parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("annualInterestRate", settings.language)} (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number.parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("investmentPeriodYears", settings.language)}
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number.parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">{t("investmentResults", settings.language)}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-primary to-teal-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-sm">{t("finalAmount", settings.language)}</p>
            <p className="text-2xl font-bold">{formatCurrency(compoundResults.totalValue, settings.currency)}</p>
          </div>

          <div className="bg-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">{t("totalContributions", settings.language)}</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(compoundResults.totalContributions, settings.currency)}
            </p>
          </div>

          <div className="bg-green-500/20 rounded-xl p-4">
            <p className="text-green-400 text-sm">{t("interestEarned", settings.language)}</p>
            <p className="text-xl font-bold text-green-300">
              {formatCurrency(compoundResults.totalInterest, settings.currency)}
            </p>
          </div>
        </div>

        {/* Yearly Breakdown */}
        <div>
          <h4 className="font-semibold text-white mb-3">{t("yearlyGrowth", settings.language)}</h4>
          <div className="space-y-2">
            {compoundResults.monthlyBreakdown.map((item) => (
              <div key={item.year} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">
                  {t("year", settings.language)} {item.year}
                </span>
                <span className="font-semibold text-white">{formatCurrency(item.value, settings.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">{t("financialSimulator", settings.language)}</h1>
        <p className="text-gray-400">{t("planLifestyleSeeAfford", settings.language)}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-surface rounded-xl p-1 border border-dark-border animate-slide-up">
        <button
          onClick={() => setActiveTab("lifestyle")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === "lifestyle" ? "bg-primary text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          {t("lifestyleSimulator", settings.language)}
        </button>
        <button
          onClick={() => setActiveTab("compound")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === "compound" ? "bg-primary text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          {t("compoundInterest", settings.language)}
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up">
        {activeTab === "lifestyle" && renderLifestyleSimulator()}
        {activeTab === "compound" && renderCompoundInterest()}
      </div>
    </div>
  )
}

export default Simulator