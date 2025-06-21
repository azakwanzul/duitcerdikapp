"use client"

import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { useToast } from "./ToastContainer"
import { Calendar, Bell, Plus, Edit, Trash2, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { formatCurrency } from "../utils/currency"

interface BillModalProps {
  bill?: any
  onClose: () => void
}

const BillModal: React.FC<BillModalProps> = ({ bill, onClose }) => {
  const { dispatch, state } = useAppContext()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: bill?.name || "",
    amount: bill?.amount?.toString() || "",
    dueDate: bill?.dueDate || "",
    frequency: bill?.frequency || "monthly",
    category: bill?.category || "Utilities",
    isRecurring: bill?.isRecurring ?? true,
    reminderDays: bill?.reminderDays?.toString() || "3",
    bankAccountId: bill?.bankAccountId || "",
    notes: bill?.notes || "",
  })

  const categories = ["Utilities", "Rent", "Insurance", "Subscription", "Loan", "Credit Card", "Other"]
  const frequencies = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
    { value: "one-time", label: "One-time" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.amount || !formData.dueDate) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields",
      })
      return
    }

    const billData = {
      id: bill?.id || Date.now().toString(),
      name: formData.name,
      amount: Number.parseFloat(formData.amount),
      dueDate: formData.dueDate,
      frequency: formData.frequency as any,
      category: formData.category,
      isRecurring: formData.isRecurring,
      isPaid: bill?.isPaid || false,
      reminderDays: Number.parseInt(formData.reminderDays),
      bankAccountId: formData.bankAccountId || undefined,
      notes: formData.notes,
    }

    if (bill) {
      dispatch({ type: "UPDATE_BILL", payload: billData })
      showToast({
        type: "success",
        title: "Bill Updated",
        message: `${formData.name} updated successfully`,
      })
    } else {
      dispatch({ type: "ADD_BILL", payload: billData })
      showToast({
        type: "success",
        title: "Bill Added",
        message: `${formData.name} reminder created`,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface rounded-2xl p-6 w-full max-w-md border border-dark-border animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{bill ? "Edit Bill" : "Add Bill Reminder"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bill Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Electricity Bill, Netflix Subscription"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount (RM)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="100.00"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reminder (days before)</label>
            <input
              type="number"
              min="0"
              max="30"
              value={formData.reminderDays}
              onChange={(e) => setFormData((prev) => ({ ...prev, reminderDays: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {state.bankAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bank Account (Optional)</label>
              <select
                value={formData.bankAccountId}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankAccountId: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Select account</option>
                {state.bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} - {account.accountNumber.slice(-4)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this bill"
              rows={3}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData((prev) => ({ ...prev, isRecurring: e.target.checked }))}
              className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
            />
            <label htmlFor="isRecurring" className="text-gray-300">
              This is a recurring bill
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            {bill ? "Update Bill" : "Add Bill Reminder"}
          </button>
        </form>
      </div>
    </div>
  )
}

const BillReminders: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { bills, settings } = state
  const { showToast } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingBill, setEditingBill] = useState<any>(null)

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getBillStatus = (bill: any) => {
    if (bill.isPaid) return "paid"

    const daysUntil = getDaysUntilDue(bill.dueDate)

    if (daysUntil < 0) return "overdue"
    if (daysUntil <= bill.reminderDays) return "due-soon"
    return "upcoming"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-400 bg-green-500/20 border-green-500/30"
      case "overdue":
        return "text-red-400 bg-red-500/20 border-red-500/30"
      case "due-soon":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={16} />
      case "overdue":
        return <AlertTriangle size={16} />
      case "due-soon":
        return <Clock size={16} />
      default:
        return <Calendar size={16} />
    }
  }

  const handleMarkPaid = (billId: string, billName: string) => {
    dispatch({ type: "MARK_BILL_PAID", payload: billId })
    showToast({
      type: "success",
      title: "Bill Marked as Paid",
      message: `${billName} has been marked as paid`,
    })
  }

  const handleEditBill = (bill: any) => {
    setEditingBill(bill)
    setShowModal(true)
  }

  const handleDeleteBill = (billId: string, billName: string) => {
    dispatch({ type: "DELETE_BILL", payload: billId })
    showToast({
      type: "success",
      title: "Bill Deleted",
      message: `${billName} reminder removed`,
    })
  }

  const upcomingBills = bills
    .filter((bill) => !bill.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const paidBills = bills.filter((bill) => bill.isPaid)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Bell size={20} className="mr-2" />
          Bill Reminders ({upcomingBills.length} pending)
        </h3>
        <button
          onClick={() => {
            setEditingBill(null)
            setShowModal(true)
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Add Bill</span>
        </button>
      </div>

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-300">Upcoming Bills</h4>
          {upcomingBills.map((bill) => {
            const status = getBillStatus(bill)
            const daysUntil = getDaysUntilDue(bill.dueDate)

            return (
              <div
                key={bill.id}
                className="bg-dark-surface rounded-xl p-4 border border-dark-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-semibold text-white">{bill.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(status)}
                          <span>
                            {status === "paid"
                              ? "Paid"
                              : status === "overdue"
                                ? `${Math.abs(daysUntil)} days overdue`
                                : status === "due-soon"
                                  ? `Due in ${daysUntil} days`
                                  : `Due in ${daysUntil} days`}
                          </span>
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{formatCurrency(bill.amount, settings.currency)}</span>
                      <span>{bill.category}</span>
                      <span>{new Date(bill.dueDate).toLocaleDateString()}</span>
                    </div>

                    {bill.notes && <p className="text-sm text-gray-500 mt-1">{bill.notes}</p>}
                  </div>

                  <div className="flex space-x-2">
                    {!bill.isPaid && (
                      <button
                        onClick={() => handleMarkPaid(bill.id, bill.name)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Mark as paid"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditBill(bill)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Edit bill"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill.id, bill.name)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete bill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-dark-surface rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-400 mb-2">No upcoming bills</p>
          <p className="text-sm text-gray-500 mb-4">Add bill reminders to stay on top of your payments</p>
          <button
            onClick={() => {
              setEditingBill(null)
              setShowModal(true)
            }}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add Your First Bill
          </button>
        </div>
      )}

      {/* Recently Paid Bills */}
      {paidBills.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-300">Recently Paid</h4>
          <div className="space-y-2">
            {paidBills.slice(0, 3).map((bill) => (
              <div key={bill.id} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={16} className="text-green-400" />
                  <div>
                    <p className="text-white font-medium">{bill.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatCurrency(bill.amount, settings.currency)} • {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Paid</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {showModal && (
        <BillModal
          bill={editingBill}
          onClose={() => {
            setShowModal(false)
            setEditingBill(null)
          }}
        />
      )}
    </div>
  )
}

export default BillReminders
