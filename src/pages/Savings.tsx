"use client"

import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { useToast } from "../components/ToastContainer"
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2, DollarSign, X } from "lucide-react"
import SavingsGoalModal from "../components/SavingsGoalModal"
import { t } from "../utils/translations"

const Savings: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { savingsGoals, settings } = state
  const { showToast } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState<any>(null)
  const [addAmount, setAddAmount] = useState("")

  const calculateMonthsLeft = (targetDate: string, currentAmount: number, targetAmount: number) => {
    const today = new Date()
    const target = new Date(targetDate)
    const monthsLeft = Math.max(
      0,
      (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth(),
    )

    if (currentAmount >= targetAmount) return 0

    const remaining = targetAmount - currentAmount
    const monthlyRequired = monthsLeft > 0 ? remaining / monthsLeft : remaining

    return { monthsLeft, monthlyRequired }
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

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal)
    setShowModal(true)
  }

  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    dispatch({ type: "DELETE_SAVINGS_GOAL", payload: goalId })
    showToast({
      type: "success",
      title: "Goal Deleted",
      message: `"${goalTitle}" removed successfully`,
    })
  }

  const handleAddMoney = (goal: any) => {
    if (!addAmount || Number.parseFloat(addAmount) <= 0) {
      showToast({
        type: "error",
        title: "Invalid Amount",
        message: "Please enter a valid amount",
      })
      return
    }

    const updatedGoal = {
      ...goal,
      currentAmount: goal.currentAmount + Number.parseFloat(addAmount),
    }

    dispatch({ type: "UPDATE_SAVINGS_GOAL", payload: updatedGoal })
    showToast({
      type: "success",
      title: "Money Added",
      message: `${settings.currency} ${addAmount} added to ${goal.title}`,
    })

    setShowAddMoneyModal(null)
    setAddAmount("")
  }

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white dark:text-white text-gray-900 mb-2">
          {t("yourSavingsGoals", settings.language)}
        </h1>
        <p className="text-gray-400 dark:text-gray-400 text-gray-600">
          {t("trackProgressFinancialDreams", settings.language)}
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-primary to-teal-600 rounded-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-semibold mb-1">{t("totalSavings", settings.language)}</h3>
            <p className="text-2xl font-bold">
              {settings.currency} {totalSaved.toFixed(2)}
            </p>
            <p className="text-white/80 text-sm">
              of {settings.currency} {totalTarget.toFixed(2)} target
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
              style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white dark:text-white text-gray-900">
            {t("activeGoals", settings.language)} ({savingsGoals.length})
          </h3>
          <button
            onClick={() => {
              setEditingGoal(null)
              setShowModal(true)
            }}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Plus size={16} />
            <span className="font-medium">{t("addGoal", settings.language)}</span>
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-dark-surface dark:bg-dark-surface bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-400 dark:text-gray-400 text-gray-600 mb-2">
              {t("noSavingsGoalsYet", settings.language)}
            </p>
            <p className="text-sm text-gray-500 mb-4">{t("setFirstGoal", settings.language)}</p>
            <button
              onClick={() => {
                setEditingGoal(null)
                setShowModal(true)
              }}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              {t("createFirstGoal", settings.language)}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savingsGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const timeInfo = calculateMonthsLeft(goal.targetDate, goal.currentAmount, goal.targetAmount)
              const isCompleted = goal.currentAmount >= goal.targetAmount

              return (
                <div
                  key={goal.id}
                  className="bg-dark-surface dark:bg-dark-surface bg-white rounded-xl p-6 border border-dark-border dark:border-dark-border border-gray-200 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-white dark:text-white text-gray-900">{goal.title}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}
                        >
                          {goal.priority}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 dark:text-gray-400 text-gray-600 space-x-4">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                        {!isCompleted && typeof timeInfo === "object" && (
                          <div className="flex items-center">
                            <TrendingUp size={14} className="mr-1" />
                            {timeInfo.monthsLeft} months left
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="text-gray-400 hover:text-white dark:hover:text-white hover:text-gray-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id, goal.title)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300 dark:text-gray-300 text-gray-700">
                        {settings.currency} {goal.currentAmount.toFixed(2)} saved
                      </span>
                      <span className="text-gray-300 dark:text-gray-300 text-gray-700">
                        {settings.currency} {goal.targetAmount.toFixed(2)} target
                      </span>
                    </div>
                    <div className="bg-gray-700 dark:bg-gray-700 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-green-500" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400 dark:text-gray-400 text-gray-600">
                        {progress.toFixed(1)}% complete
                      </span>
                      {isCompleted ? (
                        <span className="text-green-400 font-medium">Goal Achieved! 🎉</span>
                      ) : typeof timeInfo === "object" && timeInfo.monthsLeft > 0 ? (
                        <span className="text-gray-400 dark:text-gray-400 text-gray-600">
                          {settings.currency} {timeInfo.monthlyRequired.toFixed(2)}/month needed
                        </span>
                      ) : (
                        <span className="text-red-400">Target date passed</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAddMoneyModal(goal)}
                      className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Money
                    </button>
                    <button className="flex-1 bg-gray-700 dark:bg-gray-700 bg-gray-200 hover:bg-gray-600 dark:hover:bg-gray-600 hover:bg-gray-300 text-white dark:text-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Savings Goal Modal */}
      {showModal && (
        <SavingsGoalModal
          goal={editingGoal}
          onClose={() => {
            setShowModal(false)
            setEditingGoal(null)
          }}
        />
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface dark:bg-dark-surface bg-white rounded-2xl p-6 w-full max-w-md border border-dark-border dark:border-dark-border border-gray-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white dark:text-white text-gray-900">Add Money</h2>
              <button
                onClick={() => setShowAddMoneyModal(null)}
                className="text-gray-400 hover:text-white dark:hover:text-white hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
                Adding to:{" "}
                <span className="font-semibold text-white dark:text-white text-gray-900">
                  {showAddMoneyModal.title}
                </span>
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">
                Current: {settings.currency} {showAddMoneyModal.currentAmount.toFixed(2)} / {settings.currency}{" "}
                {showAddMoneyModal.targetAmount.toFixed(2)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Amount to Add ({settings.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="100.00"
                className="w-full p-3 bg-gray-700 dark:bg-gray-700 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-xl text-white dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddMoneyModal(null)}
                className="flex-1 bg-gray-700 dark:bg-gray-700 bg-gray-200 hover:bg-gray-600 dark:hover:bg-gray-600 hover:bg-gray-300 text-white dark:text-white text-gray-900 py-3 px-4 rounded-xl font-medium transition-colors"
              >
                {t("cancel", settings.language)}
              </button>
              <button
                onClick={() => handleAddMoney(showAddMoneyModal)}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Add Money
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Savings
