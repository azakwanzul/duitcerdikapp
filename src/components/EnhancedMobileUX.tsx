"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useAppContext } from "../context/AppContext"
import { Plus, ArrowUp, Zap } from "lucide-react"

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ children, onSwipeLeft, onSwipeRight, className = "" }) => {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const threshold = 100

    if (currentX > threshold && onSwipeRight) {
      onSwipeRight()
    } else if (currentX < -threshold && onSwipeLeft) {
      onSwipeLeft()
    }

    setCurrentX(0)
    setIsDragging(false)
  }

  return (
    <div
      ref={cardRef}
      className={`transform transition-transform duration-200 ${className}`}
      style={{
        transform: isDragging ? `translateX(${currentX}px)` : "translateX(0px)",
        opacity: isDragging ? Math.max(0.7, 1 - Math.abs(currentX) / 200) : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && startY > 0) {
      const currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - startY)
      setPullDistance(Math.min(distance, 100))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
    setStartY(0)
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, 60 - pullDistance)}px)`,
        }}
      >
        {pullDistance > 0 && (
          <div className="flex items-center space-x-2 text-primary">
            <div
              className={`transition-transform duration-200 ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                transform: `rotate(${Math.min(pullDistance * 3, 180)}deg)`,
              }}
            >
              <ArrowUp size={20} />
            </div>
            <span className="text-sm font-medium">
              {isRefreshing ? "Refreshing..." : pullDistance > 60 ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        )}
      </div>

      <div style={{ paddingTop: `${pullDistance}px` }}>{children}</div>
    </div>
  )
}

interface QuickActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onClick, color = "bg-primary" }) => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button
      className={`${color} hover:opacity-90 text-white p-4 rounded-2xl flex flex-col items-center space-y-2 transition-all duration-200 transform ${
        isPressed ? "scale-95" : "scale-100"
      } active:scale-95 shadow-lg`}
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div className="text-2xl">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

interface FloatingActionMenuProps {
  isOpen: boolean
  onToggle: () => void
  actions: Array<{
    icon: React.ReactNode
    label: string
    onClick: () => void
    color?: string
  }>
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ isOpen, onToggle, actions }) => {
  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Action buttons */}
      <div
        className={`flex flex-col space-y-3 mb-4 transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center space-x-3"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
            }}
          >
            <span className="bg-dark-surface text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
              {action.label}
            </span>
            <button
              onClick={() => {
                action.onClick()
                onToggle()
              }}
              className={`${action.color || "bg-primary"} hover:opacity-90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110`}
            >
              {action.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={onToggle}
        className={`bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform ${
          isOpen ? "rotate-45 scale-110" : "rotate-0 scale-100"
        }`}
      >
        <Plus size={24} />
      </button>
    </div>
  )
}

interface HapticFeedbackProps {
  children: React.ReactNode
  type?: "light" | "medium" | "heavy"
}

const HapticFeedback: React.FC<HapticFeedbackProps> = ({ children, type = "light" }) => {
  const triggerHaptic = () => {
    if ("vibrate" in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      }
      navigator.vibrate(patterns[type])
    }
  }

  return (
    <div onTouchStart={triggerHaptic} onClick={triggerHaptic}>
      {children}
    </div>
  )
}

interface EnhancedMobileUXProps {
  children: React.ReactNode
  onQuickExpense?: () => void
  onQuickIncome?: () => void
  onRefresh?: () => Promise<void>
}

const EnhancedMobileUX: React.FC<EnhancedMobileUXProps> = ({
  children,
  onQuickExpense,
  onQuickIncome,
  onRefresh,
}) => {
  const [isFABOpen, setIsFABOpen] = useState(false)
  const { state } = useAppContext()

  const quickActions = [
    {
      icon: <Plus size={20} />,
      label: "Add Expense",
      onClick: onQuickExpense || (() => {}),
      color: "bg-red-600",
    },
    {
      icon: <Zap size={20} />,
      label: "Add Income",
      onClick: onQuickIncome || (() => {}),
      color: "bg-green-600",
    },
  ]

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    }
  }

  return (
    <div className="relative h-full">
      {onRefresh ? <PullToRefresh onRefresh={handleRefresh}>{children}</PullToRefresh> : children}

      {/* Floating Action Menu */}
      <FloatingActionMenu isOpen={isFABOpen} onToggle={() => setIsFABOpen(!isFABOpen)} actions={quickActions} />

      {/* Overlay to close FAB when clicking outside */}
      {isFABOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsFABOpen(false)} />}
    </div>
  )
}

export { SwipeableCard, PullToRefresh, QuickActionButton, FloatingActionMenu, HapticFeedback, EnhancedMobileUX }