"use client"

import { useState, useEffect } from "react"
import "./TodaysUsage.css"

function TodaysUsage() {
  const [todayData, setTodayData] = useState({})
  const [totalTime, setTotalTime] = useState(0)
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
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

        const total = Object.values(todayDomains).reduce((sum, time) => sum + time, 0)
        setTotalTime(total)
      } catch (error) {
        console.error("Error loading today data:", error)
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

  const getTopSite = () => {
    const domains = Object.keys(todayData)
    if (domains.length === 0) return null
    return domains.reduce((top, domain) => (todayData[domain] > todayData[top] ? domain : top))
  }

  const getPercentage = (domain) => {
    if (totalTime === 0) return 0
    return Math.round((todayData[domain] / totalTime) * 100)
  }

  const getSiteCategory = (domain) => {
    if (productiveSites.includes(domain)) return "productive"
    if (unproductiveSites.includes(domain)) return "unproductive"
    return "uncategorized"
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "productive":
        return "#10b981" // Green
      case "unproductive":
        return "#ef4444" // Red
      default:
        return "#6b7280" // Gray
    }
  }

  const getChartSegments = () => {
    const sortedData = Object.entries(todayData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    let currentAngle = 0
    return sortedData.map(([domain, time], index) => {
      const percentage = (time / totalTime) * 100
      const angle = (percentage / 100) * 360
      const category = getSiteCategory(domain)

      const segment = {
        domain,
        time,
        percentage: Math.round(percentage),
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: getCategoryColor(category),
        category,
      }
      currentAngle += angle
      return segment
    })
  }

  const createConicGradient = () => {
    const segments = getChartSegments()
    if (segments.length === 0) return "conic-gradient(#e5e7eb 0deg 360deg)"

    const gradientStops = []
    segments.forEach((segment) => {
      gradientStops.push(`${segment.color} ${segment.startAngle}deg ${segment.endAngle}deg`)
    })

    return `conic-gradient(${gradientStops.join(", ")})`
  }

  const getSegmentFromAngle = (angle) => {
    const segments = getChartSegments()
    return segments.find((segment) => angle >= segment.startAngle && angle <= segment.endAngle)
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = e.clientX - centerX
    const y = e.clientY - centerY

    let angle = Math.atan2(y, x) * (180 / Math.PI)
    angle = (angle + 90 + 360) % 360

    const distance = Math.sqrt(x * x + y * y)
    const outerRadius = 100
    const innerRadius = 60

    if (distance >= innerRadius && distance <= outerRadius) {
      const segment = getSegmentFromAngle(angle)
      setHoveredSegment(segment)
      setMousePosition({ x: e.clientX, y: e.clientY })
    } else {
      setHoveredSegment(null)
    }
  }

  const handleMouseLeave = () => {
    setHoveredSegment(null)
  }

  const getProductivityStats = () => {
    let productiveTime = 0
    let unproductiveTime = 0
    let uncategorizedTime = 0

    Object.entries(todayData).forEach(([domain, time]) => {
      const category = getSiteCategory(domain)
      if (category === "productive") productiveTime += time
      else if (category === "unproductive") unproductiveTime += time
      else uncategorizedTime += time
    })

    return { productiveTime, unproductiveTime, uncategorizedTime }
  }

  const topSite = getTopSite()
  const hasData = Object.keys(todayData).length > 0
  const { productiveTime, unproductiveTime, uncategorizedTime } = getProductivityStats()

  return (
    <div className="card">
      <div className="todays-usage-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <polyline
            points="12,6 12,12 16,14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Today's Usage
      </div>

      {hasData ? (
        <div className="usage-content">
          <div className="donut-chart-container">
            <div
              className="donut-chart"
              style={{ background: createConicGradient() }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="donut-center">
                <div className="top-site">{hoveredSegment ? hoveredSegment.domain : topSite}</div>
                <div className="percentage">{hoveredSegment ? hoveredSegment.percentage : getPercentage(topSite)}%</div>
                {hoveredSegment && (
                  <div className={`category-badge ${hoveredSegment.category}`}>{hoveredSegment.category}</div>
                )}
              </div>
            </div>
          </div>

          {/* Productivity Summary */}
          <div className="productivity-summary">
            <div className="summary-item productive">
              <div className="summary-indicator"></div>
              <span className="summary-label">Productive</span>
              <span className="summary-time">{formatTime(productiveTime)}</span>
            </div>
            <div className="summary-item unproductive">
              <div className="summary-indicator"></div>
              <span className="summary-label">Unproductive</span>
              <span className="summary-time">{formatTime(unproductiveTime)}</span>
            </div>
            <div className="summary-item uncategorized">
              <div className="summary-indicator"></div>
              <span className="summary-label">Uncategorized</span>
              <span className="summary-time">{formatTime(uncategorizedTime)}</span>
            </div>
          </div>

          {/* Tooltip */}
          {hoveredSegment && (
            <div
              className="chart-tooltip"
              style={{
                position: "fixed",
                left: mousePosition.x + 10,
                top: mousePosition.y - 10,
                zIndex: 1000,
                pointerEvents: "none",
              }}
            >
              <div className="tooltip-content">
                <div className="tooltip-domain">{hoveredSegment.domain}</div>
                <div className="tooltip-time">{formatTime(hoveredSegment.time)}</div>
                <div className="tooltip-percentage">{hoveredSegment.percentage}%</div>
                <div className={`tooltip-category ${hoveredSegment.category}`}>{hoveredSegment.category}</div>
              </div>
            </div>
          )}

          <div className="usage-list">
            {Object.entries(todayData)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([domain, time]) => {
                const category = getSiteCategory(domain)
                return (
                  <div key={domain} className="usage-item">
                    <div className="usage-item-left">
                      <div className="color-indicator" style={{ backgroundColor: getCategoryColor(category) }}></div>
                      <span className="domain">{domain}</span>
                      <span className={`category-tag ${category}`}>
                        {category === "productive" ? "P" : category === "unproductive" ? "U" : "?"}
                      </span>
                    </div>
                    <span className="time">{formatTime(time)}</span>
                  </div>
                )
              })}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className="empty-state-text">No activity tracked today</div>
          <div className="empty-state-subtext">Start browsing to see your usage</div>
        </div>
      )}
    </div>
  )
}

export default TodaysUsage
