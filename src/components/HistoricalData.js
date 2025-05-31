"use client"

import { useState, useEffect } from "react"
import "./HistoricalData.css"

function HistoricalData() {
  const [historicalData, setHistoricalData] = useState({})
  const [selectedDate, setSelectedDate] = useState("")

  useEffect(() => {
    const loadHistoricalData = () => {
      try {
        const data = JSON.parse(localStorage.getItem("historical_data") || "{}")
        setHistoricalData(data)

        // Set most recent date as default
        const dates = Object.keys(data).sort().reverse()
        if (dates.length > 0 && !selectedDate) {
          setSelectedDate(dates[0])
        }
      } catch (error) {
        console.error("Error loading historical data:", error)
      }
    }

    loadHistoricalData()
    const interval = setInterval(loadHistoricalData, 5000)
    return () => clearInterval(interval)
  }, [selectedDate])

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

  const getDateData = () => {
    if (!selectedDate || !historicalData[selectedDate]) return {}
    const { totalTime, savedAt, date, ...websites } = historicalData[selectedDate]
    return websites
  }

  const getTotalTime = () => {
    if (!selectedDate || !historicalData[selectedDate]) return 0
    return historicalData[selectedDate].totalTime || 0
  }

  const dates = Object.keys(historicalData).sort().reverse()
  const dateData = getDateData()
  const totalTime = getTotalTime()

  if (dates.length === 0) {
    return (
      <div className="card">
        <div className="historical-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
          </svg>
          Historical Data
        </div>
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div className="empty-state-text">No historical data available</div>
          <div className="empty-state-subtext">Save daily data to view history</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="historical-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
        </svg>
        Historical Data
        <span className="data-count">{dates.length} days</span>
      </div>

      <div className="historical-content">
        <div className="date-selector">
          <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="date-select">
            {dates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        {Object.keys(dateData).length > 0 && (
          <>
            <div className="total-time">
              <span className="total-label">Total time:</span>
              <span className="total-value">{formatTime(totalTime)}</span>
            </div>

            <div className="historical-list">
              {Object.entries(dateData)
                .sort(([, a], [, b]) => b - a)
                .map(([domain, time]) => (
                  <div key={domain} className="historical-item">
                    <span className="domain">{domain}</span>
                    <span className="time">{formatTime(time)}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default HistoricalData
