"use client"

import { useState, useEffect } from "react"
import "./CollapsibleSection.css"

function CollapsibleSection({ title, content }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [count, setCount] = useState("0 sites")

  useEffect(() => {
    const updateCount = () => {
      try {
        if (title === "All Web Activities") {
          const todayDomains = JSON.parse(localStorage.getItem("today_domains") || "{}")
          const siteCount = Object.keys(todayDomains).length
          setCount(`${siteCount} sites`)
        } else if (title === "Productive Sites") {
          const productiveSites = JSON.parse(localStorage.getItem("productive") || "[]")
          setCount(`${productiveSites.length} sites`)
        } else if (title === "Unproductive Sites") {
          const unproductiveSites = JSON.parse(localStorage.getItem("unproductive") || "[]")
          setCount(`${unproductiveSites.length} sites`)
        }
      } catch (error) {
        setCount("0 sites")
      }
    }

    updateCount()
    const interval = setInterval(updateCount, 1000)
    return () => clearInterval(interval)
  }, [title])

  return (
    <div className="card">
      <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="section-title">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={`section-chevron ${isExpanded ? "expanded" : ""}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {title}
          <span className="section-count">{count}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isExpanded && <div className="section-content">{content}</div>}
    </div>
  )
}

export default CollapsibleSection
