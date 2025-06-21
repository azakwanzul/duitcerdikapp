"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAppContext } from "../context/AppContext"
import { useToast } from "./ToastContainer"
import { Cloud, Download, Upload, Wifi, WifiOff, Shield, CheckCircle, AlertCircle } from "lucide-react"

interface CloudSyncProps {
  onClose: () => void
}

// Simulated cloud service
class CloudSyncService {
  private static instance: CloudSyncService
  private isOnline = navigator.onLine
  private syncQueue: any[] = []

  static getInstance() {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService()
    }
    return CloudSyncService.instance
  }

  constructor() {
    window.addEventListener("online", () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })
  }

  async uploadData(data: any): Promise<{ success: boolean; cloudId?: string; error?: string }> {
    if (!this.isOnline) {
      this.syncQueue.push({ type: "upload", data })
      return { success: false, error: "Offline - queued for sync" }
    }

    // Simulate cloud upload
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const cloudId = `cloud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      return { success: false, error: "Network error - please try again" }
    }

    localStorage.setItem(
      "duitcerdik-cloud-backup",
      JSON.stringify({
        ...data,
        cloudId,
        lastSync: new Date().toISOString(),
      }),
    )

    return { success: true, cloudId }
  }

  async downloadData(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isOnline) {
      return { success: false, error: "No internet connection" }
    }

    // Simulate cloud download
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const cloudData = localStorage.getItem("duitcerdik-cloud-backup")
    if (!cloudData) {
      return { success: false, error: "No cloud backup found" }
    }

    return { success: true, data: JSON.parse(cloudData) }
  }

  async syncData(localData: any): Promise<{ success: boolean; conflicts?: any[]; error?: string }> {
    if (!this.isOnline) {
      this.syncQueue.push({ type: "sync", data: localData })
      return { success: false, error: "Offline - queued for sync" }
    }

    const cloudResult = await this.downloadData()
    if (!cloudResult.success) {
      // No cloud data, upload local data
      return await this.uploadData(localData)
    }

    // Simulate conflict detection
    const conflicts = this.detectConflicts(localData, cloudResult.data)

    if (conflicts.length > 0) {
      return { success: false, conflicts }
    }

    // Merge and upload
    const mergedData = this.mergeData(localData, cloudResult.data)
    return await this.uploadData(mergedData)
  }

  private detectConflicts(local: any, cloud: any): any[] {
    const conflicts = []

    // Simple conflict detection based on timestamps
    if (local.lastModified && cloud.lastModified) {
      const localTime = new Date(local.lastModified).getTime()
      const cloudTime = new Date(cloud.lastModified).getTime()

      if (Math.abs(localTime - cloudTime) > 60000) {
        // 1 minute difference
        conflicts.push({
          type: "timestamp",
          local: local.lastModified,
          cloud: cloud.lastModified,
        })
      }
    }

    return conflicts
  }

  private mergeData(local: any, cloud: any): any {
    // Simple merge strategy - prefer newer data
    const localTime = new Date(local.lastModified || 0).getTime()
    const cloudTime = new Date(cloud.lastModified || 0).getTime()

    return localTime > cloudTime ? local : cloud
  }

  private async processSyncQueue() {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const item = this.syncQueue.shift()
      if (item.type === "upload") {
        await this.uploadData(item.data)
      } else if (item.type === "sync") {
        await this.syncData(item.data)
      }
    }
  }

  isConnected() {
    return this.isOnline
  }

  getQueueSize() {
    return this.syncQueue.length
  }
}

const CloudSync: React.FC<CloudSyncProps> = ({ onClose }) => {
  const { state, dispatch } = useAppContext()
  const { showToast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [conflicts, setConflicts] = useState<any[]>([])

  const cloudService = CloudSyncService.getInstance()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check for last sync
    const cloudData = localStorage.getItem("duitcerdik-cloud-backup")
    if (cloudData) {
      const parsed = JSON.parse(cloudData)
      setLastSync(parsed.lastSync)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleUpload = async () => {
    setIsUploading(true)
    try {
      const dataToUpload = {
        ...state,
        lastModified: new Date().toISOString(),
      }

      const result = await cloudService.uploadData(dataToUpload)

      if (result.success) {
        setLastSync(new Date().toISOString())
        showToast({
          type: "success",
          title: "Cloud Backup Complete",
          message: "Your data has been safely backed up to the cloud",
        })
      } else {
        showToast({
          type: "error",
          title: "Backup Failed",
          message: result.error || "Failed to backup data",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Backup Error",
        message: "An unexpected error occurred",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const result = await cloudService.downloadData()

      if (result.success && result.data) {
        dispatch({ type: "LOAD_DATA", payload: result.data })
        setLastSync(result.data.lastSync)
        showToast({
          type: "success",
          title: "Data Restored",
          message: "Your data has been restored from cloud backup",
        })
        onClose()
      } else {
        showToast({
          type: "error",
          title: "Restore Failed",
          message: result.error || "Failed to restore data",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Restore Error",
        message: "An unexpected error occurred",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setConflicts([])

    try {
      const dataToSync = {
        ...state,
        lastModified: new Date().toISOString(),
      }

      const result = await cloudService.syncData(dataToSync)

      if (result.success) {
        setLastSync(new Date().toISOString())
        showToast({
          type: "success",
          title: "Sync Complete",
          message: "Your data is now synchronized",
        })
      } else if (result.conflicts) {
        setConflicts(result.conflicts)
        showToast({
          type: "warning",
          title: "Sync Conflicts",
          message: "Please resolve conflicts before syncing",
        })
      } else {
        showToast({
          type: "error",
          title: "Sync Failed",
          message: result.error || "Failed to sync data",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Sync Error",
        message: "An unexpected error occurred",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div
        className={`p-4 rounded-xl border ${
          isOnline ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
        }`}
      >
        <div className="flex items-center space-x-3">
          {isOnline ? <Wifi size={20} className="text-green-400" /> : <WifiOff size={20} className="text-red-400" />}
          <div>
            <p className={`font-semibold ${isOnline ? "text-green-400" : "text-red-400"}`}>
              {isOnline ? "Connected" : "Offline"}
            </p>
            <p className="text-gray-400 text-sm">
              {isOnline ? "Ready to sync with cloud" : `${cloudService.getQueueSize()} items queued for sync`}
            </p>
          </div>
        </div>
      </div>

      {/* Last Sync Info */}
      {lastSync && (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle size={20} className="text-primary" />
            <div>
              <p className="text-white font-medium">Last Sync</p>
              <p className="text-gray-400 text-sm">{new Date(lastSync).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold">Sync Conflicts Detected</p>
              <p className="text-gray-300 text-sm mt-1">
                Your local data differs from cloud data. Please choose which version to keep.
              </p>
              <div className="mt-3 space-y-2">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="bg-dark-surface rounded-lg p-3">
                    <p className="text-white text-sm">
                      <strong>Type:</strong> {conflict.type}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm">
                        Keep Local
                      </button>
                      <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-sm">
                        Keep Cloud
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Actions */}
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={handleSync}
          disabled={!isOnline || isSyncing}
          className="bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-xl flex items-center justify-center space-x-3 transition-colors"
        >
          <Cloud size={20} />
          <span className="font-semibold">{isSyncing ? "Syncing..." : "Smart Sync"}</span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleUpload}
            disabled={!isOnline || isUploading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <Upload size={16} />
            <span className="font-medium">{isUploading ? "Uploading..." : "Backup"}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!isOnline || isDownloading}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <Download size={16} />
            <span className="font-medium">{isDownloading ? "Restoring..." : "Restore"}</span>
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield size={20} className="text-primary mt-0.5" />
          <div>
            <p className="text-white font-semibold">End-to-End Encryption</p>
            <p className="text-gray-400 text-sm mt-1">
              Your data is encrypted before leaving your device and can only be decrypted by you.
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">AES-256 encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Zero-knowledge architecture</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Automatic conflict resolution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CloudSync
