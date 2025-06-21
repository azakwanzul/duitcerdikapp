"use client"

import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../components/ToastContainer"
import {
  User,
  Bell,
  Globe,
  DollarSign,
  Download,
  Upload,
  Trash2,
  Shield,
  ChevronRight,
  Edit,
  LogOut,
  Palette,
  BarChart3,
  Tags,
  Sparkles,
} from "lucide-react"
import { CURRENCIES } from "../utils/currency"
import { LANGUAGES, t } from "../utils/translations"
import BillReminders from "../components/BillReminders"

const Settings: React.FC = () => {
  const { state, dispatch, supabaseActions } = useAppContext()
  const { signOut, updateProfile } = useAuth()
  const { user, settings } = state
  const { showToast } = useToast()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [showCurrencyModal, setShowCurrencyModal] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showBillReminders, setShowBillReminders] = useState(false)

  const [profileData, setProfileData] = useState(
    user || {
      id: "",
      name: "",
      email: "",
      occupation: "",
      monthlyIncome: 0,
    },
  )

  const handleProfileUpdate = async () => {
    const { error } = await updateProfile(profileData)
    if (!error) {
      dispatch({ type: "UPDATE_USER", payload: profileData })
      setEditingProfile(false)
      showToast({
        type: "success",
        title: t("profileUpdated", settings.language),
        message: t("profileUpdatedMessage", settings.language),
      })
    } else {
      showToast({
        type: "error",
        title: t("profileUpdated", settings.language),
        message: error.message || "Failed to update profile.",
      })
    }
  }

  const handleSettingToggle = (setting: keyof typeof settings) => {
    const updatedSettings = { ...settings, [setting]: !settings[setting] }
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { [setting]: !settings[setting] },
    })
    supabaseActions.updateSettings(updatedSettings)
    showToast({
      type: "info",
      title: t("settingUpdated", settings.language),
      message: `${setting} ${!settings[setting] ? "enabled" : "disabled"}`,
    })
  }

  const handleCurrencyChange = (newCurrency: string) => {
    const oldCurrency = settings.currency
    const updatedSettings = { ...settings, currency: newCurrency }
    dispatch({
      type: "CHANGE_CURRENCY",
      payload: { oldCurrency, newCurrency },
    })
    supabaseActions.updateSettings(updatedSettings)
    setShowCurrencyModal(false)
    showToast({
      type: "success",
      title: t("currencyUpdated", settings.language),
      message:
        t("currencyChangedTo", settings.language) + " " + CURRENCIES[newCurrency as keyof typeof CURRENCIES]?.name,
    })
  }

  const handleLanguageChange = (newLanguage: string) => {
    const updatedSettings = { ...settings, language: newLanguage }
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { language: newLanguage },
    })
    supabaseActions.updateSettings(updatedSettings)
    setShowLanguageModal(false)
    showToast({
      type: "success",
      title: t("languageUpdated", settings.language),
      message: t("languageChangedTo", settings.language) + " " + LANGUAGES[newLanguage as keyof typeof LANGUAGES],
    })
  }

  const handleExportData = () => {
    const dataToExport = {
      user: state.user,
      transactions: state.transactions,
      savingsGoals: state.savingsGoals,
      budgets: state.budgets,
      bills: state.bills,
      settings: state.settings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `duitcerdik-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showToast({
      type: "success",
      title: t("dataExported", settings.language),
      message: t("dataExportedMessage", settings.language),
    })
  }

  const handleDeleteAllData = () => {
    localStorage.removeItem("duitcerdik-data")
    setShowDeleteConfirm(false)

    showToast({
      type: "success",
      title: t("dataDeleted", settings.language),
      message: t("dataDeletedMessage", settings.language),
    })

    // Reload the page to reset state
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleLogout = async () => {
    try {
      const { error } = await signOut()
      
      if (error) {
        showToast({
          type: "error",
          title: "Logout Error",
          message: error.message,
        })
      } else {
        showToast({
          type: "info",
          title: t("loggedOut", settings.language),
          message: t("loggedOutMessage", settings.language),
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Logout Error",
        message: "An unexpected error occurred during logout",
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">{t("settings", settings.language)}</h1>
        <p className="text-gray-400">{t("manageAccountPreferences", settings.language)}</p>
      </div>

      {/* User Profile Section */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <User size={20} className="mr-2" />
            {t("userProfile", settings.language)}
          </h3>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Edit size={20} />
          </button>
        </div>

        {editingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t("name", settings.language)}</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t("email", settings.language)}</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("occupation", settings.language)}
              </label>
              <input
                type="text"
                value={profileData.occupation}
                onChange={(e) => setProfileData((prev) => ({ ...prev, occupation: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("monthlyIncome", settings.language)} ({settings.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={profileData.monthlyIncome}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, monthlyIncome: Number.parseFloat(e.target.value) || 0 }))
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleProfileUpdate}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {t("save", settings.language)}
              </button>
              <button
                onClick={() => {
                  setEditingProfile(false)
                  setProfileData(user || { id: "", name: "", email: "", occupation: "", monthlyIncome: 0 })
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {t("cancel", settings.language)}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">{t("name", settings.language)}</span>
              <span className="text-white">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t("email", settings.language)}</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t("occupation", settings.language)}</span>
              <span className="text-white">{user?.occupation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t("monthlyIncome", settings.language)}</span>
              <span className="text-white">
                {settings.currency} {user?.monthlyIncome?.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* App Preferences */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-white mb-4">{t("appPreferences", settings.language)}</h3>

        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-gray-400" />
              <div>
                <p className="text-white font-medium">{t("notifications", settings.language)}</p>
                <p className="text-gray-400 text-sm">{t("receiveSpendingAlerts", settings.language)}</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingToggle("notifications")}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                settings.notifications ? "bg-primary" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  settings.notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Bill Reminders */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-gray-400" />
              <div>
                <p className="text-white font-medium">Bill Reminders</p>
                <p className="text-gray-400 text-sm">Get notified about upcoming bills</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingToggle("billReminders")}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                settings.billReminders ? "bg-primary" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  settings.billReminders ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Language */}
          <button onClick={() => setShowLanguageModal(true)} className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Globe size={20} className="text-gray-400" />
              <div className="text-left">
                <p className="text-white font-medium">{t("language", settings.language)}</p>
                <p className="text-gray-400 text-sm">{t("choosePreferredLanguage", settings.language)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">{LANGUAGES[settings.language as keyof typeof LANGUAGES]}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>

          {/* Currency */}
          <button onClick={() => setShowCurrencyModal(true)} className="w-full flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <DollarSign size={20} className="text-gray-400" />
              <div className="text-left">
                <p className="text-white font-medium">{t("currency", settings.language)}</p>
                <p className="text-gray-400 text-sm">{t("defaultCurrencyTransactions", settings.language)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">
                {settings.currency} - {CURRENCIES[settings.currency as keyof typeof CURRENCIES]?.name}
              </span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      {/* Financial Management */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-white mb-4">Financial Management</h3>

        <div className="space-y-3">
          <button
            onClick={() => setShowBillReminders(true)}
            className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-gray-400" />
              <div className="text-left">
                <p className="text-white font-medium">Bill Reminders</p>
                <p className="text-gray-400 text-sm">Manage your bill reminders and due dates</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-white mb-4">{t("dataManagement", settings.language)}</h3>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Download size={20} className="text-gray-400" />
              <div className="text-left">
                <p className="text-white font-medium">{t("exportData", settings.language)}</p>
                <p className="text-gray-400 text-sm">{t("downloadDataAsJSON", settings.language)}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors">
            <div className="flex items-center space-x-3">
              <Upload size={20} className="text-gray-400" />
              <div className="text-left">
                <p className="text-white font-medium">{t("importData", settings.language)}</p>
                <p className="text-gray-400 text-sm">{t("uploadRestoreBackup", settings.language)}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between p-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl transition-colors border border-red-600/30"
          >
            <div className="flex items-center space-x-3">
              <Trash2 size={20} className="text-red-400" />
              <div className="text-left">
                <p className="text-red-400 font-medium">{t("deleteAllData", settings.language)}</p>
                <p className="text-red-300 text-sm">{t("permanentlyRemoveData", settings.language)}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-white mb-4">{t("account", settings.language)}</h3>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
        >
          <div className="flex items-center space-x-3">
            <LogOut size={20} className="text-gray-400" />
            <div className="text-left">
              <p className="text-white font-medium">{t("logout", settings.language)}</p>
              <p className="text-gray-400 text-sm">{t("signOutAccount", settings.language)}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Privacy */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border animate-slide-up">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield size={20} className="mr-2" />
          {t("privacySecurity", settings.language)}
        </h3>

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-primary font-semibold mb-2">{t("privacyPromise", settings.language)}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{t("privacyPromiseDescription", settings.language)}</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">{t("localDataStorage", settings.language)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">{t("noDataTransmission", settings.language)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">{t("openSourceTransparent", settings.language)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface rounded-2xl p-6 w-full max-w-md border border-dark-border animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-4">{t("selectCurrency", settings.language)}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => handleCurrencyChange(code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    settings.currency === code
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium text-white">
                      {info.symbol} {code}
                    </p>
                    <p className="text-sm text-gray-400">{info.name}</p>
                  </div>
                  {settings.currency === code && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCurrencyModal(false)}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {t("cancel", settings.language)}
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface rounded-2xl p-6 w-full max-w-md border border-dark-border animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-4">{t("selectLanguage", settings.language)}</h3>
            <div className="space-y-2">
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    settings.language === code
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <span className="font-medium text-white">{name}</span>
                  {settings.language === code && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {t("cancel", settings.language)}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface rounded-2xl p-6 w-full max-w-md border border-dark-border animate-scale-in">
            <div className="text-center">
              <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("deleteAllData", settings.language)}</h3>
              <p className="text-gray-400 mb-6">{t("deleteConfirmationMessage", settings.language)}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  {t("cancel", settings.language)}
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  {t("deleteAll", settings.language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Reminders Modal */}
      {showBillReminders && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface rounded-2xl p-6 w-full max-w-4xl border border-dark-border animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Bill Reminders</h2>
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
    </div>
  )
}

export default Settings