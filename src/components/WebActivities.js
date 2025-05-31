"use client"

import { useState, useEffect } from "react"

function WebActivities() {
  const [todayData, setTodayData] = useState({})
  const [productiveSites, setProductiveSites] = useState([])
  const [unproductiveSites, setUnproductiveSites] = useState([])

  useEffect(() => {
    const loadData = () => {
      try {
        const todayDomains = JSON.parse(localStorage.getItem("today_domains") || "{}")
        const productive = JSON.parse(localStorage.getItem("productive") || "[]")
        const unproductive = JSON.parse(localStorage.getItem("unproductive") || "[]")

        setTodayData(todayDomains)
        setProductiveSites(productive)
        setUnproductiveSites(unproductive)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
    const interval = setInterval(loadData, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds) => {
    if (!seconds) return "0s"

    if (seconds < 60) {
      return `${seconds}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    }
  }

  const getSiteCategory = (domain) => {
    if (productiveSites.includes(domain)) return "productive"
    if (unproductiveSites.includes(domain)) return "unproductive"
    return "uncategorized"
  }

  const hasData = Object.keys(todayData).length > 0

  if (!hasData) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <div className="empty-state-text">No web activity recorded</div>
      </div>
    )
  }

  return (
    <div style={{ padding: "16px" }}>
      <div className="activity-list">
        {Object.entries(todayData)
          .sort(([, a], [, b]) => b - a)
          .map(([domain, time]) => {
            const category = getSiteCategory(domain)
            return (
              <div key={domain} className="activity-item">
                <div className="usage-item-left">
                  <span className="domain">{domain}</span>
                  <span className={`category-tag ${category}`}>
                    {category === "productive"
                      ? "Productive"
                      : category === "unproductive"
                        ? "Unproductive"
                        : "Uncategorized"}
                  </span>
                </div>
                <span className="time">{formatTime(time)}</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default WebActivities
