"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode, useEffect } from "react"
import { convertCurrency } from "../utils/currency"
import { useAuth } from "./AuthContext"
import { useSupabaseData } from "../hooks/useSupabaseData"

export interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  amount: number
  description: string
  date: string
  receiptImage?: string
  bankAccountId?: string
  isAutoImported?: boolean
}

export interface RecurringTransaction {
  id: string
  type: "income" | "expense"
  category: string
  amount: number
  description: string
  frequency: "daily" | "weekly" | "monthly"
  startDate: string
  isActive: boolean
  lastProcessed?: string
}

export interface SavingsGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  priority: "low" | "medium" | "high"
}

export interface Budget {
  id: string
  category: string
  amount: number
  period: "monthly" | "weekly"
}

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  frequency: "monthly" | "quarterly" | "yearly" | "one-time"
  category: string
  isRecurring: boolean
  isPaid: boolean
  reminderDays: number
  bankAccountId?: string
  notes?: string
}

export interface User {
  id: string
  name: string
  email: string
  occupation: string
  monthlyIncome: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: "savings" | "spending" | "no-spend"
  target: number
  progress: number
  startDate: string
  endDate: string
  isActive: boolean
  reward?: string
}

export interface Liability {
  id: string
  name: string
  type: "loan" | "credit_card" | "mortgage" | "student_loan" | "car_loan" | "other"
  currentBalance: number
  originalAmount?: number
  interestRate?: number
  dueDate?: string
}

export interface Notification {
  id: string
  type: "bill_due" | "budget_alert" | "goal_achieved" | "achievement_unlocked" | "recurring_transaction" | "bank_sync" | "general"
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface BankAccount {
  id: string
  bankName: string
  accountType: string
  accountNumber: string
  balance: number
  isConnected: boolean
  lastSyncDate?: string
  currency: string
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  savingsGoals: SavingsGoal[]
  budgets: Budget[]
  bills: Bill[]
  challenges: Challenge[]
  liabilities: Liability[]
  notifications: Notification[]
  bankAccounts: BankAccount[]
  monthlyBudget: number
  settings: {
    darkMode: boolean
    notifications: boolean
    currency: string
    language: string
    autoCategorizationEnabled: boolean
    budgetAlerts: boolean
    billReminders: boolean
    receiptScanning: boolean
  }
}

type AppAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_RECURRING_TRANSACTION"; payload: RecurringTransaction }
  | { type: "UPDATE_RECURRING_TRANSACTION"; payload: RecurringTransaction }
  | { type: "DELETE_RECURRING_TRANSACTION"; payload: string }
  | { type: "PROCESS_RECURRING_TRANSACTIONS" }
  | { type: "ADD_SAVINGS_GOAL"; payload: SavingsGoal }
  | { type: "UPDATE_SAVINGS_GOAL"; payload: SavingsGoal }
  | { type: "DELETE_SAVINGS_GOAL"; payload: string }
  | { type: "ADD_BUDGET"; payload: Budget }
  | { type: "UPDATE_BUDGET"; payload: Budget }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "ADD_BILL"; payload: Bill }
  | { type: "UPDATE_BILL"; payload: Bill }
  | { type: "DELETE_BILL"; payload: string }
  | { type: "MARK_BILL_PAID"; payload: string }
  | { type: "ADD_CHALLENGE"; payload: Challenge }
  | { type: "UPDATE_CHALLENGE"; payload: Challenge }
  | { type: "DELETE_CHALLENGE"; payload: string }
  | { type: "ADD_LIABILITY"; payload: Liability }
  | { type: "UPDATE_LIABILITY"; payload: Liability }
  | { type: "DELETE_LIABILITY"; payload: string }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "DELETE_NOTIFICATION"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppState["settings"]> }
  | { type: "SET_MONTHLY_BUDGET"; payload: number }
  | { type: "LOAD_DATA"; payload: Partial<AppState> }
  | { type: "CHANGE_CURRENCY"; payload: { oldCurrency: string; newCurrency: string } }

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  transactions: [],
  recurringTransactions: [],
  savingsGoals: [],
  budgets: [],
  bills: [],
  challenges: [],
  liabilities: [],
  notifications: [],
  bankAccounts: [],
  monthlyBudget: 3000,
  settings: {
    darkMode: true,
    notifications: true,
    currency: "RM",
    language: "en",
    autoCategorizationEnabled: true,
    budgetAlerts: true,
    billReminders: true,
    receiptScanning: true,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState

  switch (action.type) {
    case "LOGIN":
      newState = {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      }
      break
    case "LOGOUT":
      // Reset to initial state but keep settings
      newState = {
        ...initialState,
        settings: {
          ...initialState.settings,
          darkMode: state.settings.darkMode,
          language: state.settings.language,
        },
      }
      break
    case "UPDATE_USER":
      newState = {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
      break
    case "ADD_TRANSACTION":
      newState = {
        ...state,
        transactions: [...state.transactions, action.payload],
      }
      break
    case "UPDATE_TRANSACTION":
      newState = {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      }
      break
    case "DELETE_TRANSACTION":
      newState = {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      }
      break
    case "ADD_RECURRING_TRANSACTION":
      newState = {
        ...state,
        recurringTransactions: [...state.recurringTransactions, action.payload],
      }
      break
    case "UPDATE_RECURRING_TRANSACTION":
      newState = {
        ...state,
        recurringTransactions: state.recurringTransactions.map((rt) =>
          rt.id === action.payload.id ? action.payload : rt,
        ),
      }
      break
    case "DELETE_RECURRING_TRANSACTION":
      newState = {
        ...state,
        recurringTransactions: state.recurringTransactions.filter((rt) => rt.id !== action.payload),
      }
      break
    case "PROCESS_RECURRING_TRANSACTIONS":
      // This would be handled by Supabase triggers or scheduled functions
      newState = state
      break
    case "ADD_SAVINGS_GOAL":
      newState = {
        ...state,
        savingsGoals: [...state.savingsGoals, action.payload],
      }
      break
    case "UPDATE_SAVINGS_GOAL":
      newState = {
        ...state,
        savingsGoals: state.savingsGoals.map((goal) => (goal.id === action.payload.id ? action.payload : goal)),
      }
      break
    case "DELETE_SAVINGS_GOAL":
      newState = {
        ...state,
        savingsGoals: state.savingsGoals.filter((goal) => goal.id !== action.payload),
      }
      break
    case "ADD_BUDGET":
      newState = {
        ...state,
        budgets: [...state.budgets, action.payload],
      }
      break
    case "UPDATE_BUDGET":
      newState = {
        ...state,
        budgets: state.budgets.map((budget) => (budget.id === action.payload.id ? action.payload : budget)),
      }
      break
    case "DELETE_BUDGET":
      newState = {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.payload),
      }
      break
    case "ADD_BILL":
      newState = {
        ...state,
        bills: [...state.bills, action.payload],
      }
      break
    case "UPDATE_BILL":
      newState = {
        ...state,
        bills: state.bills.map((bill) => (bill.id === action.payload.id ? action.payload : bill)),
      }
      break
    case "DELETE_BILL":
      newState = {
        ...state,
        bills: state.bills.filter((bill) => bill.id !== action.payload),
      }
      break
    case "MARK_BILL_PAID":
      newState = {
        ...state,
        bills: state.bills.map((bill) => (bill.id === action.payload ? { ...bill, isPaid: true } : bill)),
      }
      break
    case "ADD_CHALLENGE":
      newState = {
        ...state,
        challenges: [...state.challenges, action.payload],
      }
      break
    case "UPDATE_CHALLENGE":
      newState = {
        ...state,
        challenges: state.challenges.map((challenge) =>
          challenge.id === action.payload.id ? action.payload : challenge,
        ),
      }
      break
    case "DELETE_CHALLENGE":
      newState = {
        ...state,
        challenges: state.challenges.filter((challenge) => challenge.id !== action.payload),
      }
      break
    case "ADD_LIABILITY":
      newState = {
        ...state,
        liabilities: [...state.liabilities, action.payload],
      }
      break
    case "UPDATE_LIABILITY":
      newState = {
        ...state,
        liabilities: state.liabilities.map((liability) =>
          liability.id === action.payload.id ? action.payload : liability,
        ),
      }
      break
    case "DELETE_LIABILITY":
      newState = {
        ...state,
        liabilities: state.liabilities.filter((liability) => liability.id !== action.payload),
      }
      break
    case "ADD_NOTIFICATION":
      newState = {
        ...state,
        notifications: [...state.notifications, action.payload],
      }
      break
    case "MARK_NOTIFICATION_READ":
      newState = {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload ? { ...notification, isRead: true } : notification,
        ),
      }
      break
    case "DELETE_NOTIFICATION":
      newState = {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.payload),
      }
      break
    case "UPDATE_SETTINGS":
      newState = {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }
      break
    case "SET_MONTHLY_BUDGET":
      newState = {
        ...state,
        monthlyBudget: action.payload,
      }
      break
    case "LOAD_DATA":
      newState = {
        ...state,
        ...action.payload,
        settings: { ...state.settings, ...(action.payload.settings || {}) },
      }
      break
    case "CHANGE_CURRENCY":
      const { oldCurrency, newCurrency } = action.payload

      // Convert all monetary values
      const convertedTransactions = state.transactions.map((t) => ({
        ...t,
        amount: convertCurrency(t.amount, oldCurrency, newCurrency),
      }))

      const convertedRecurringTransactions = state.recurringTransactions.map((rt) => ({
        ...rt,
        amount: convertCurrency(rt.amount, oldCurrency, newCurrency),
      }))

      const convertedSavingsGoals = state.savingsGoals.map((goal) => ({
        ...goal,
        targetAmount: convertCurrency(goal.targetAmount, oldCurrency, newCurrency),
        currentAmount: convertCurrency(goal.currentAmount, oldCurrency, newCurrency),
      }))

      const convertedBudgets = state.budgets.map((budget) => ({
        ...budget,
        amount: convertCurrency(budget.amount, oldCurrency, newCurrency),
      }))

      const convertedBills = state.bills.map((bill) => ({
        ...bill,
        amount: convertCurrency(bill.amount, oldCurrency, newCurrency),
      }))

      const convertedChallenges = state.challenges.map((challenge) => ({
        ...challenge,
        target: convertCurrency(challenge.target, oldCurrency, newCurrency),
        progress: convertCurrency(challenge.progress, oldCurrency, newCurrency),
      }))

      const convertedLiabilities = state.liabilities.map((liability) => ({
        ...liability,
        currentBalance: convertCurrency(liability.currentBalance, oldCurrency, newCurrency),
        originalAmount: liability.originalAmount ? convertCurrency(liability.originalAmount, oldCurrency, newCurrency) : undefined,
      }))

      const convertedBankAccounts = state.bankAccounts.map((account) => ({
        ...account,
        balance: convertCurrency(account.balance, oldCurrency, newCurrency),
      }))

      const convertedMonthlyBudget = convertCurrency(state.monthlyBudget, oldCurrency, newCurrency)
      const convertedUser = state.user
        ? {
            ...state.user,
            monthlyIncome: convertCurrency(state.user.monthlyIncome, oldCurrency, newCurrency),
          }
        : null

      newState = {
        ...state,
        transactions: convertedTransactions,
        recurringTransactions: convertedRecurringTransactions,
        savingsGoals: convertedSavingsGoals,
        budgets: convertedBudgets,
        bills: convertedBills,
        challenges: convertedChallenges,
        liabilities: convertedLiabilities,
        bankAccounts: convertedBankAccounts,
        monthlyBudget: convertedMonthlyBudget,
        user: convertedUser,
        settings: { ...state.settings, currency: newCurrency },
      }
      break
    default:
      return state
  }

  return newState
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  supabaseActions: any
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { user } = useAuth()
  const supabaseActions = useSupabaseData()

  // Sync Supabase data with local state
  useEffect(() => {
    if (user && supabaseActions.data) {
      dispatch({
        type: "LOAD_DATA",
        payload: {
          transactions: supabaseActions.data.transactions,
          recurringTransactions: supabaseActions.data.recurringTransactions,
          savingsGoals: supabaseActions.data.savingsGoals,
          budgets: supabaseActions.data.budgets,
          bills: supabaseActions.data.bills,
          challenges: supabaseActions.data.challenges,
          liabilities: supabaseActions.data.liabilities,
          notifications: supabaseActions.data.notifications,
          bankAccounts: supabaseActions.data.bankAccounts,
          settings: {
            ...supabaseActions.data.settings,
          },
          monthlyBudget: supabaseActions.data.monthlyBudget,
          isAuthenticated: true,
          user: supabaseActions.data.userProfile
            ? {
                id: supabaseActions.data.userProfile.id,
                name: supabaseActions.data.userProfile.name,
                email: supabaseActions.data.userProfile.email,
                occupation: supabaseActions.data.userProfile.occupation,
                monthlyIncome: supabaseActions.data.userProfile.monthly_income,
              }
            : {
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            occupation: user.user_metadata?.occupation || '',
            monthlyIncome: user.user_metadata?.monthlyIncome || 0,
          },
        },
      })
    } else if (!user) {
      // User logged out, reset state
      dispatch({ type: "LOGOUT" })
    }
  }, [user, supabaseActions.data, dispatch])

  // Apply theme changes to document
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add("dark")
      document.body.className = "bg-dark text-white"
    } else {
      document.documentElement.classList.remove("dark")
      document.body.className = "bg-gray-50 text-gray-900"
    }
  }, [state.settings.darkMode])

  return (
    <AppContext.Provider value={{ state, dispatch, supabaseActions }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}