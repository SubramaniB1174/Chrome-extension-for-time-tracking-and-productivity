"use client"

import { useState, useEffect } from "react"
import "./Settings.css"

function Settings() {
  const [isTracking, setIsTracking] = useState(true)
  const [inactivityInterval, setInactivityInterval] = useState("300")
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    // Load settings from localStorage
    const tracking = localStorage.getItem("is_tracking")
    const interval = localStorage.getItem("inactivity_interval")

    if (tracking !== null) {
      setIsTracking(JSON.parse(tracking))
    }
    if (interval) {
      setInactivityInterval(interval)
    }

    // Initialize historical data storage
    initializeHistoricalData()
  }, [])

  const initializeHistoricalData = () => {
    if (!localStorage.getItem("historical_data")) {
      localStorage.setItem("historical_data", JSON.stringify({}))
    }
  }

  const handleInactivityChange = (e) => {
    const value = e.target.value
    setInactivityInterval(value)
    localStorage.setItem("inactivity_interval", value)
  }

  const toggleTracking = () => {
    const newTracking = !isTracking
    setIsTracking(newTracking)
    localStorage.setItem("is_tracking", JSON.stringify(newTracking))
  }

  const saveCurrentDayData = () => {
    try {
      const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
      const todayData = JSON.parse(localStorage.getItem("today_domains") || "{}")
      const historicalData = JSON.parse(localStorage.getItem("historical_data") || "{}")

      // Save today's data to historical data
      historicalData[today] = {
        ...todayData,
        date: today,
        totalTime: Object.values(todayData).reduce((sum, time) => sum + time, 0),
        savedAt: new Date().toISOString(),
      }

      localStorage.setItem("historical_data", JSON.stringify(historicalData))
      alert("Today's data saved successfully!")
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Error saving data. Please try again.")
    }
  }

  const exportToExcel = () => {
    try {
      const historicalData = JSON.parse(localStorage.getItem("historical_data") || "{}")
      const todayData = JSON.parse(localStorage.getItem("today_domains") || "{}")
      const productiveSites = JSON.parse(localStorage.getItem("productive") || "[]")
      const unproductiveSites = JSON.parse(localStorage.getItem("unproductive") || "[]")

      // Include today's data if not already saved
      const today = new Date().toISOString().split("T")[0]
      if (!historicalData[today] && Object.keys(todayData).length > 0) {
        historicalData[today] = {
          ...todayData,
          date: today,
          totalTime: Object.values(todayData).reduce((sum, time) => sum + time, 0),
          savedAt: new Date().toISOString(),
        }
      }

      if (Object.keys(historicalData).length === 0) {
        alert("No data to export. Start browsing to collect data!")
        return
      }

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,"

      // Add header
      csvContent += "Date,Website,Time (seconds),Time (formatted),Category,Total Daily Time\n"

      // Add data rows
      Object.entries(historicalData)
        .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort by date descending
        .forEach(([date, dayData]) => {
          const { totalTime, savedAt, ...websites } = dayData

          Object.entries(websites).forEach(([website, timeSpent]) => {
            const formattedTime = formatTime(timeSpent)
            const category = productiveSites.includes(website)
              ? "Productive"
              : unproductiveSites.includes(website)
                ? "Unproductive"
                : "Uncategorized"
            const totalDailyTime = formatTime(totalTime || 0)

            csvContent += `${date},${website},${timeSpent},${formattedTime},${category},${totalDailyTime}\n`
          })
        })

      // Create and download file
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `productivity_data_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert("Data exported successfully!")
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Error exporting data. Please try again.")
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return "0s"
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    }
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.setItem("domains", JSON.stringify({}))
      localStorage.setItem("today_domains", JSON.stringify({}))
      localStorage.setItem("productive", JSON.stringify([]))
      localStorage.setItem("unproductive", JSON.stringify([]))
      localStorage.setItem("historical_data", JSON.stringify({}))
      alert("All data cleared successfully!")
    }
  }

  const getHistoricalDataCount = () => {
    try {
      const historicalData = JSON.parse(localStorage.getItem("historical_data") || "{}")
      return Object.keys(historicalData).length
    } catch {
      return 0
    }
  }

  return (
    <div className="card">
      <div className="settings-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="settings-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          Settings
          <span className="status-badge">Active</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={`chevron ${isExpanded ? "expanded" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {isExpanded && (
        <div className="settings-content">
          <div className="setting-item">
            <label className="setting-label">Stop tracking after</label>
            <select value={inactivityInterval} onChange={handleInactivityChange} className="setting-select">
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
              <option value="900">15 minutes</option>
              <option value="1800">30 minutes</option>
              <option value="3600">1 hour</option>
              <option value="86400">Infinite</option>
            </select>
            <span className="setting-suffix">of inactivity</span>
          </div>

          <div className="data-info">
            <span className="data-count">Historical data: {getHistoricalDataCount()} days</span>
          </div>

          <div className="settings-actions">
            <button className="btn btn-secondary" onClick={toggleTracking}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                <rect x="14" y="4" width="4" height="16" fill="currentColor" />
              </svg>
              {isTracking ? "Pause Tracking" : "Resume Tracking"}
            </button>

            <button className="btn btn-primary" onClick={saveCurrentDayData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 21H5a2 2 0 0 0-2-2V5a2 2 0 0 0 2-2h11l5 5v11a2 2 0 0 0 2 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="17,2 17,8 7,8 7,21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="7,3 7,8 15,8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Save Today
            </button>
          </div>

          <div className="settings-actions">
            <button className="btn btn-success" onClick={exportToExcel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14,2 14,8 20,8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="16"
                  y1="13"
                  x2="8"
                  y2="13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="16"
                  y1="17"
                  x2="8"
                  y2="17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="10,9 9,9 8,9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export Excel
            </button>

            <button className="btn btn-danger" onClick={clearAllData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Clear Data
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
