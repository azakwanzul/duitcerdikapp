"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import SplashScreen from "./components/SplashScreen"
import OnboardingFlow from "./components/OnboardingFlow"
import AuthForm from "./components/AuthForm"
import Dashboard from "./pages/Dashboard"
import Transactions from "./pages/Transactions"
import Savings from "./pages/Savings"
import Budget from "./pages/Budget"
import Simulator from "./pages/Simulator"
import Insights from "./pages/Insights"
import Settings from "./pages/Settings"
import Navigation from "./components/Navigation"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { AppProvider, useAppContext } from "./context/AppContext"
import { ToastProvider } from "./components/ToastContainer"
import { useSupabaseData } from "./hooks/useSupabaseData"

function AppContent() {
  const { user, loading: authLoading } = useAuth()
  const { state, dispatch } = useAppContext()
  const { data: supabaseData, loading: dataLoading } = useSupabaseData()
  const [isLoading, setIsLoading] = useState(true)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const onboardingComplete = localStorage.getItem("duitcerdik-onboarding-complete")
    setHasSeenOnboarding(!!onboardingComplete)

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem("duitcerdik-onboarding-complete", "true")
    setHasSeenOnboarding(true)
  }

  if (isLoading || authLoading) {
    return <SplashScreen />
  }

  if (!hasSeenOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  if (!user) {
    return <AuthForm />
  }

  if (dataLoading) {
    return <SplashScreen />
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark dark:bg-dark bg-gray-50 text-white dark:text-white text-gray-900">
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App