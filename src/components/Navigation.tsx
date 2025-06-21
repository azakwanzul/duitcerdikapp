import type React from "react"
import { NavLink } from "react-router-dom"
import { Home, Receipt, Target, Calculator, TrendingUp, Settings, PieChart, Trophy } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { t } from "../utils/translations"

const Navigation: React.FC = () => {
  const { state } = useAppContext()
  const { settings } = state

  const navItems = [
    { path: "/", icon: Home, label: t("home", settings.language) },
    { path: "/transactions", icon: Receipt, label: t("transactions", settings.language) },
    { path: "/savings", icon: Target, label: t("goals", settings.language)},
    { path: "/budget", icon: PieChart, label: t("budget", settings.language) },
    { path: "/simulator", icon: Calculator, label: t("simulator", settings.language) },
    { path: "/insights", icon: TrendingUp, label: t("insights", settings.language) },
    { path: "/settings", icon: Settings, label: t("settings", settings.language) },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border z-40 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-2 max-w-screen-xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive ? "text-primary bg-primary/10" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            <span className="text-xs font-medium truncate w-full text-center leading-tight mt-1 hidden sm:block">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navigation