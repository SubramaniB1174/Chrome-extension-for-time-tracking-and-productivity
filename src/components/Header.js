import "./Header.css"

function Header() {
  return (
    <div className="header">
      <div className="header-content">
        <div className="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="header-text">
          <h1 className="header-title">Productivity Tracker</h1>
          <p className="header-subtitle">Monitor your web activity</p>
        </div>
      </div>
    </div>
  )
}

export default Header
