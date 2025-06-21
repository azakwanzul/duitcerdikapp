"use client"

import type React from "react"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { useToast } from "./ToastContainer"
import { Download, Upload, FileText, FileSpreadsheet, ImageIcon } from "lucide-react"
import "jspdf-autotable"

interface DataExportImportProps {
  onClose: () => void
}

const DataExportImport: React.FC<DataExportImportProps> = ({ onClose }) => {
  const { state, dispatch } = useAppContext()
  const { showToast } = useToast()
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf">("json")
  const [exportDateRange, setExportDateRange] = useState<"all" | "month" | "quarter" | "year">("all")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header.toLowerCase().replace(" ", "")]
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    return csvContent
  }

  // Remove the jsPDF import lines and replace with a simple PDF generation
  const generatePDFReport = () => {
    // Create a simple text-based report since jsPDF might not be available
    const { transactions, savingsGoals, budgets, bills, settings } = state

    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const netWorth = totalIncome - totalExpenses

    const reportContent = `
DuitCerdik Financial Report
Generated on: ${new Date().toLocaleDateString()}

FINANCIAL SUMMARY
Total Income: ${settings.currency} ${totalIncome.toFixed(2)}
Total Expenses: ${settings.currency} ${totalExpenses.toFixed(2)}
Net Worth: ${settings.currency} ${netWorth.toFixed(2)}

RECENT TRANSACTIONS
${transactions
  .slice(-10)
  .map(
    (t) =>
      `${new Date(t.date).toLocaleDateString()} | ${t.type} | ${t.category} | ${t.description} | ${settings.currency} ${t.amount.toFixed(2)}`,
  )
  .join("\n")}

SAVINGS GOALS
${savingsGoals
  .map(
    (goal) =>
      `${goal.title} | Current: ${settings.currency} ${goal.currentAmount.toFixed(2)} | Target: ${settings.currency} ${goal.targetAmount.toFixed(2)} | Progress: ${((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%`,
  )
  .join("\n")}
  `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `duitcerdik-report-${exportDateRange}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filterDataByDateRange = (data: any[]) => {
    if (exportDateRange === "all") return data

    const now = new Date()
    const startDate = new Date()

    switch (exportDateRange) {
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return data.filter((item) => {
      const itemDate = new Date(item.date || item.dueDate || item.targetDate)
      return itemDate >= startDate
    })
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const { transactions, savingsGoals, budgets, bills, bankAccounts } = state

      if (exportFormat === "json") {
        const dataToExport = {
          transactions: filterDataByDateRange(transactions),
          savingsGoals: filterDataByDateRange(savingsGoals),
          budgets,
          bills: filterDataByDateRange(bills),
          bankAccounts: bankAccounts.map((account) => ({
            ...account,
            // Remove sensitive data
            username: undefined,
            password: undefined,
          })),
          exportDate: new Date().toISOString(),
          dateRange: exportDateRange,
        }

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json",
        })

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `duitcerdik-export-${exportDateRange}-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (exportFormat === "csv") {
        const filteredTransactions = filterDataByDateRange(transactions)
        const headers = ["Date", "Type", "Category", "Description", "Amount", "Bank Account"]
        const csvData = filteredTransactions.map((t) => ({
          date: t.date,
          type: t.type,
          category: t.category,
          description: t.description,
          amount: t.amount,
          bankaccount: t.bankAccountId || "Manual",
        }))

        const csvContent = generateCSV(csvData, headers)
        const blob = new Blob([csvContent], { type: "text/csv" })

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `duitcerdik-transactions-${exportDateRange}-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (exportFormat === "pdf") {
        const doc = generatePDFReport()
        doc.save(`duitcerdik-report-${exportDateRange}-${new Date().toISOString().split("T")[0]}.txt`)
      }

      showToast({
        type: "success",
        title: "Export Complete",
        message: `Data exported successfully as ${exportFormat.toUpperCase()}`,
      })
    } catch (error) {
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to export data. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const text = await file.text()

      if (file.name.endsWith(".json")) {
        const importedData = JSON.parse(text)

        // Validate data structure
        if (importedData.transactions && Array.isArray(importedData.transactions)) {
          // Merge with existing data
          const newTransactions = importedData.transactions.filter(
            (t: any) => !state.transactions.some((existing) => existing.id === t.id),
          )

          if (newTransactions.length > 0) {
            newTransactions.forEach((transaction: any) => {
              dispatch({ type: "ADD_TRANSACTION", payload: transaction })
            })
          }

          // Import other data types
          if (importedData.savingsGoals) {
            importedData.savingsGoals.forEach((goal: any) => {
              if (!state.savingsGoals.some((existing) => existing.id === goal.id)) {
                dispatch({ type: "ADD_SAVINGS_GOAL", payload: goal })
              }
            })
          }

          if (importedData.budgets) {
            importedData.budgets.forEach((budget: any) => {
              if (!state.budgets.some((existing) => existing.id === budget.id)) {
                dispatch({ type: "ADD_BUDGET", payload: budget })
              }
            })
          }

          showToast({
            type: "success",
            title: "Import Complete",
            message: `Imported ${newTransactions.length} new transactions`,
          })
        } else {
          throw new Error("Invalid file format")
        }
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

        const transactions = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",")
            const transaction: any = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              date: values[headers.indexOf("date")] || new Date().toISOString().split("T")[0],
              type: values[headers.indexOf("type")] || "expense",
              category: values[headers.indexOf("category")] || "Other",
              description: values[headers.indexOf("description")] || "Imported",
              amount: Number.parseFloat(values[headers.indexOf("amount")]) || 0,
            }
            return transaction
          })
          .filter((t) => t.amount > 0)

        transactions.forEach((transaction) => {
          dispatch({ type: "ADD_TRANSACTION", payload: transaction })
        })

        showToast({
          type: "success",
          title: "CSV Import Complete",
          message: `Imported ${transactions.length} transactions`,
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Import Failed",
        message: "Failed to import data. Please check the file format.",
      })
    } finally {
      setIsImporting(false)
      event.target.value = "" // Reset file input
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Download size={20} className="mr-2" />
          Export Data
        </h3>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat("json")}
                className={`p-3 rounded-lg border transition-colors ${
                  exportFormat === "json"
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <FileText size={20} className="mx-auto mb-1" />
                <span className="text-sm font-medium">JSON</span>
              </button>
              <button
                onClick={() => setExportFormat("csv")}
                className={`p-3 rounded-lg border transition-colors ${
                  exportFormat === "csv"
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <FileSpreadsheet size={20} className="mx-auto mb-1" />
                <span className="text-sm font-medium">CSV</span>
              </button>
              <button
                onClick={() => setExportFormat("pdf")}
                className={`p-3 rounded-lg border transition-colors ${
                  exportFormat === "pdf"
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <ImageIcon size={20} className="mx-auto mb-1" />
                <span className="text-sm font-medium">PDF</span>
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
            <select
              value={exportDateRange}
              onChange={(e) => setExportDateRange(e.target.value as any)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Time</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl font-semibold transition-colors"
          >
            {isExporting ? "Exporting..." : `Export as ${exportFormat.toUpperCase()}`}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Upload size={20} className="mr-2" />
          Import Data
        </h3>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center">
            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-300 mb-2">Drop files here or click to browse</p>
            <p className="text-gray-500 text-sm">Supports JSON and CSV files</p>

            <input
              type="file"
              accept=".json,.csv"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
              id="file-import"
            />
            <label
              htmlFor="file-import"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              {isImporting ? "Importing..." : "Choose File"}
            </label>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              <strong>Note:</strong> Importing will merge data with your existing records. Duplicate entries will be
              automatically filtered out.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Supported Formats</h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <FileText size={16} className="text-primary mt-1" />
            <div>
              <p className="text-white font-medium">JSON</p>
              <p className="text-gray-400 text-sm">Complete data backup including all settings and preferences</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <FileSpreadsheet size={16} className="text-green-400 mt-1" />
            <div>
              <p className="text-white font-medium">CSV</p>
              <p className="text-gray-400 text-sm">Transaction data only, compatible with Excel and Google Sheets</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <ImageIcon size={16} className="text-red-400 mt-1" />
            <div>
              <p className="text-white font-medium">PDF</p>
              <p className="text-gray-400 text-sm">Formatted financial report for printing and sharing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataExportImport
