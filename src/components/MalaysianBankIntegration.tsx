"use client"

import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { useToast } from "./ToastContainer"
import { Building2, Plus, FolderSyncIcon as Sync, Trash2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { formatCurrency } from "../utils/currency"

interface BankConnectionModalProps {
  onClose: () => void
  account?: any
}

const BankConnectionModal: React.FC<BankConnectionModalProps> = ({ onClose, account }) => {
  const { dispatch, state } = useAppContext()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    bankName: account?.bankName || "",
    accountType: account?.accountType || "savings",
    accountNumber: account?.accountNumber || "",
    balance: account?.balance?.toString() || "",
    username: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const malaysianBanks = [
    "Maybank",
    "CIMB Bank",
    "Public Bank",
    "RHB Bank",
    "Hong Leong Bank",
    "AmBank",
    "Bank Islam",
    "Bank Rakyat",
    "OCBC Bank",
    "Standard Chartered",
    "HSBC Bank",
    "UOB Bank",
    "Affin Bank",
    "Alliance Bank",
    "Bank Muamalat",
  ]

  const accountTypes = [
    { value: "savings", label: "Savings Account" },
    { value: "current", label: "Current Account" },
    { value: "credit", label: "Credit Card" },
  ]

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.bankName || !formData.accountNumber || !formData.username || !formData.password) {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields",
      })
      return
    }

    setIsConnecting(true)

    // Simulate bank connection process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    try {
      const bankAccount = {
        id: account?.id || Date.now().toString(),
        bankName: formData.bankName,
        accountType: formData.accountType as any,
        accountNumber: formData.accountNumber,
        balance: Number.parseFloat(formData.balance) || 0,
        isConnected: true,
        lastSyncDate: new Date().toISOString(),
        currency: state.settings.currency,
      }

      if (account) {
        dispatch({ type: "UPDATE_BANK_ACCOUNT", payload: bankAccount })
        showToast({
          type: "success",
          title: "Account Updated",
          message: `${formData.bankName} account updated successfully`,
        })
      } else {
        dispatch({ type: "ADD_BANK_ACCOUNT", payload: bankAccount })
        showToast({
          type: "success",
          title: "Bank Connected",
          message: `Successfully connected to ${formData.bankName}`,
        })
      }

      onClose()
    } catch (error) {
      showToast({
        type: "error",
        title: "Connection Failed",
        message: "Unable to connect to bank. Please check your credentials.",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface rounded-2xl p-6 w-full max-w-md border border-dark-border animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{account ? "Update Bank Account" : "Connect Bank Account"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bank</label>
            <select
              value={formData.bankName}
              onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              required
            >
              <option value="">Select your bank</option>
              {malaysianBanks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountType: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="1234567890"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Balance (RM)</label>
            <input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData((prev) => ({ ...prev, balance: e.target.value }))}
              placeholder="1000.00"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {!account && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Online Banking Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Your online banking username"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Your online banking password"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle size={20} className="text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-300 font-semibold mb-1">Security Notice</h4>
                    <p className="text-blue-200 text-sm">
                      Your banking credentials are encrypted and stored securely. We use bank-grade security to protect
                      your information.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isConnecting}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <span>{account ? "Update Account" : "Connect Bank"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

const MalaysianBankIntegration: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { bankAccounts, settings } = state
  const { showToast } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [syncingAccounts, setSyncingAccounts] = useState<Set<string>>(new Set())

  const handleSyncAccount = async (accountId: string, bankName: string) => {
    setSyncingAccounts((prev) => new Set(prev).add(accountId))

    // Simulate transaction sync
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      // Generate mock transactions
      const mockTransactions = [
        {
          id: Date.now().toString() + "1",
          type: "expense" as const,
          category: "Food",
          amount: 25.5,
          description: "KFC Malaysia",
          date: new Date().toISOString().split("T")[0],
          bankAccountId: accountId,
          isAutoImported: true,
        },
        {
          id: Date.now().toString() + "2",
          type: "income" as const,
          category: "Salary",
          amount: 3500.0,
          description: "Monthly Salary",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          bankAccountId: accountId,
          isAutoImported: true,
        },
      ]

      dispatch({
        type: "SYNC_BANK_TRANSACTIONS",
        payload: { accountId, transactions: mockTransactions },
      })

      showToast({
        type: "success",
        title: "Sync Complete",
        message: `${mockTransactions.length} new transactions imported from ${bankName}`,
      })
    } catch (error) {
      showToast({
        type: "error",
        title: "Sync Failed",
        message: `Unable to sync transactions from ${bankName}`,
      })
    } finally {
      setSyncingAccounts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(accountId)
        return newSet
      })
    }
  }

  const handleEditAccount = (account: any) => {
    setEditingAccount(account)
    setShowModal(true)
  }

  const handleDeleteAccount = (accountId: string, bankName: string) => {
    dispatch({ type: "DELETE_BANK_ACCOUNT", payload: accountId })
    showToast({
      type: "success",
      title: "Account Removed",
      message: `${bankName} account disconnected`,
    })
  }

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Building2 size={20} className="mr-2" />
          Bank Accounts ({bankAccounts.length} connected)
        </h3>
        <button
          onClick={() => {
            setEditingAccount(null)
            setShowModal(true)
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Connect Bank</span>
        </button>
      </div>

      {/* Total Balance */}
      {bankAccounts.length > 0 && (
        <div className="bg-gradient-to-r from-primary to-teal-600 rounded-xl p-6">
          <div className="text-white">
            <h4 className="text-lg font-semibold mb-1">Total Balance</h4>
            <p className="text-3xl font-bold">{formatCurrency(totalBalance, settings.currency)}</p>
            <p className="text-white/80 text-sm">
              Across {bankAccounts.length} account{bankAccounts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Bank Accounts List */}
      {bankAccounts.length > 0 ? (
        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 rounded-full p-3">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">{account.bankName}</h5>
                    <p className="text-gray-400 text-sm">
                      {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
                    </p>
                    <p className="text-gray-500 text-xs">****{account.accountNumber.slice(-4)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{formatCurrency(account.balance, settings.currency)}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircle size={12} className="text-green-400" />
                    <span className="text-green-400 text-xs">Connected</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Last sync: {account.lastSyncDate ? new Date(account.lastSyncDate).toLocaleDateString() : "Never"}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncAccount(account.id, account.bankName)}
                    disabled={syncingAccounts.has(account.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors disabled:opacity-50"
                  >
                    {syncingAccounts.has(account.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Sync size={14} />
                        <span>Sync</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleEditAccount(account)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <Building2 size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteAccount(account.id, account.bankName)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-dark-surface rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Building2 size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-400 mb-2">No bank accounts connected</p>
          <p className="text-sm text-gray-500 mb-4">
            Connect your Malaysian bank accounts to automatically import transactions
          </p>
          <button
            onClick={() => {
              setEditingAccount(null)
              setShowModal(true)
            }}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Connect Your First Bank
          </button>
        </div>
      )}

      {/* Supported Banks */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <h4 className="font-semibold text-white mb-3">Supported Malaysian Banks</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-400">
          <div>• Maybank</div>
          <div>• CIMB Bank</div>
          <div>• Public Bank</div>
          <div>• RHB Bank</div>
          <div>• Hong Leong Bank</div>
          <div>• AmBank</div>
          <div>• Bank Islam</div>
          <div>• Bank Rakyat</div>
          <div>• OCBC Bank</div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          More banks coming soon. All connections are secured with bank-grade encryption.
        </p>
      </div>

      {/* Connection Modal */}
      {showModal && (
        <BankConnectionModal
          account={editingAccount}
          onClose={() => {
            setShowModal(false)
            setEditingAccount(null)
          }}
        />
      )}
    </div>
  )
}

export default MalaysianBankIntegration
