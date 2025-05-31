import "./App.css"
import Header from "./components/Header"
import Settings from "./components/Settings"
import TodaysUsage from "./components/TodaysUsage"
import HistoricalData from "./components/HistoricalData"
import CollapsibleSection from "./components/CollapsibleSection"
import WebActivities from "./components/WebActivities"
import ProductiveSites from "./components/ProductiveSites"
import UnproductiveSites from "./components/UnproductiveSites"

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="content">
        <Settings />
        <TodaysUsage />
        <HistoricalData />
        <CollapsibleSection title="All Web Activities" content={<WebActivities />} />
        <CollapsibleSection title="Productive Sites" content={<ProductiveSites />} />
        <CollapsibleSection title="Unproductive Sites" content={<UnproductiveSites />} />
      </div>
    </div>
  )
}

export default App
