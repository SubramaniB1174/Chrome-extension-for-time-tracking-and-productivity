"use client"

import { useState, useEffect } from "react"

function ProductiveSites() {
  const [addSite, setAddSite] = useState("")
  const [removeSite, setRemoveSite] = useState("")
  const [productiveSites, setProductiveSites] = useState([])
  const [todayData, setTodayData] = useState({})

  useEffect(() => {
    const loadData = () => {
      try {
        const productive = JSON.parse(localStorage.getItem("productive") || "[]")
        const todayDomains = JSON.parse(localStorage.getItem("today_domains") || "{}")
        setProductiveSites(productive)
        setTodayData(todayDomains)
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

  const handleAddSite = (e) => {
    e.preventDefault()
    if (addSite.trim() && !productiveSites.includes(addSite.trim())) {
      const newSites = [...productiveSites, addSite.trim()]
      localStorage.setItem("productive", JSON.stringify(newSites))
      setProductiveSites(newSites)
      setAddSite("")
    }
  }

  const handleRemoveSite = (e) => {
    e.preventDefault()
    if (removeSite.trim() && productiveSites.includes(removeSite.trim())) {
      const newSites = productiveSites.filter((site) => site !== removeSite.trim())
      localStorage.setItem("productive", JSON.stringify(newSites))
      setProductiveSites(newSites)
      setRemoveSite("")
    }
  }

  const getProductiveUsage = () => {
    return productiveSites
      .map((site) => ({
        site,
        time: todayData[site] || 0,
      }))
      .filter((item) => item.time > 0)
  }

  const productiveUsage = getProductiveUsage()

  return (
    <div style={{ padding: "16px" }}>
      <div className="input-group">
        <input
          type="text"
          placeholder="Add site to list"
          value={addSite}
          onChange={(e) => setAddSite(e.target.value)}
        />
        <button className="action-btn add" onClick={handleAddSite}>
          +
        </button>
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="Remove site from list"
          value={removeSite}
          onChange={(e) => setRemoveSite(e.target.value)}
        />
        <button className="action-btn remove" onClick={handleRemoveSite}>
          -
        </button>
      </div>

      {productiveUsage.length > 0 ? (
        <div className="activity-list">
          {productiveUsage.map(({ site, time }) => (
            <div key={site} className="activity-item">
              <span className="domain">{site}</span>
              <span className="time">{formatTime(time)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <div className="empty-state-text">No productive sites added</div>
        </div>
      )}

      {productiveSites.length > 0 && (
        <div style={{ marginTop: "16px", padding: "12px", background: "#f8f9fa", borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Productive Sites List:</div>
          <div style={{ fontSize: "14px", color: "#374151" }}>{productiveSites.join(", ")}</div>
        </div>
      )}
    </div>
  )
}

export default ProductiveSites
