// src/App.jsx
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { predictRisk } from './riskEngine'
import './App.css'

function riskColor(level) {
  if (level === 'High') return '#e63946'
  if (level === 'Medium') return '#f4a300'
  return '#2a9d8f'
}

// ---------------------------------------------------------------------
// What-If Simulator Modal
// ---------------------------------------------------------------------
function WhatIfModal({ project, onClose }) {
  // Local editable copy of the project - sliders change this only,
  // never the original data.
  const [sim, setSim] = useState({ ...project })

  const original = predictRisk(project)
  const simulated = predictRisk(sim)
  const riskChange = Math.round((simulated.risk - original.risk) * 10) / 10
  const daysChange = Math.round((simulated.predicted_delay_days - original.predicted_delay_days) * 10) / 10

  function update(field, value) {
    setSim((prev) => ({ ...prev, [field]: Number(value) }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>What-If Simulator — {project.name}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="whatif-compare">
          <div className="whatif-box">
            <span className="whatif-label">Current</span>
            <span className="whatif-risk" style={{ color: riskColor(original.level) }}>
              {original.risk}% · {original.level}
            </span>
            <span className="whatif-days">{original.predicted_delay_days} days</span>
          </div>
          <div className="whatif-arrow">→</div>
          <div className="whatif-box">
            <span className="whatif-label">Simulated</span>
            <span className="whatif-risk" style={{ color: riskColor(simulated.level) }}>
              {simulated.risk}% · {simulated.level}
            </span>
            <span className="whatif-days">{simulated.predicted_delay_days} days</span>
          </div>
          <div className="whatif-box whatif-delta">
            <span className="whatif-label">Change</span>
            <span className={riskChange <= 0 ? 'delta-good' : 'delta-bad'}>
              {riskChange > 0 ? '+' : ''}{riskChange}% risk
            </span>
            <span className={daysChange <= 0 ? 'delta-good' : 'delta-bad'}>
              {daysChange > 0 ? '+' : ''}{daysChange} days
            </span>
          </div>
        </div>

        <div className="sliders">
          <label>
            Approval delay (days): <strong>{sim.approval_delay_days}</strong>
            <input type="range" min="0" max="200" value={sim.approval_delay_days || 0}
              onChange={(e) => update('approval_delay_days', e.target.value)} />
          </label>

          <label>
            Compensation completed (%): <strong>{sim.compensation_pct}</strong>
            <input type="range" min="0" max="100" value={sim.compensation_pct || 0}
              onChange={(e) => update('compensation_pct', e.target.value)} />
          </label>

          <label>
            Legal disputes (count): <strong>{sim.legal_disputes}</strong>
            <input type="range" min="0" max="10" value={sim.legal_disputes || 0}
              onChange={(e) => update('legal_disputes', e.target.value)} />
          </label>

          <label>
            R&amp;R completed (%): <strong>{sim.rr_completion_pct}</strong>
            <input type="range" min="0" max="100" value={sim.rr_completion_pct || 0}
              onChange={(e) => update('rr_completion_pct', e.target.value)} />
          </label>

          <label>
            Avg. department response (days): <strong>{sim.avg_response_days}</strong>
            <input type="range" min="0" max="60" value={sim.avg_response_days || 0}
              onChange={(e) => update('avg_response_days', e.target.value)} />
          </label>
        </div>

        <div className="whatif-drivers">
          <strong>Simulated top drivers:</strong>
          <ul>
            {simulated.top_drivers.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------
function App() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeProject, setActiveProject] = useState(null) // for the modal

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('projects').select('*')
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      const scored = data.map((p) => ({ ...p, ...predictRisk(p) }))
      scored.sort((a, b) => b.risk - a.risk)
      setProjects(scored)
      setLoading(false)
    }
    load()
  }, [])

  const counts = {
    High: projects.filter((p) => p.level === 'High').length,
    Medium: projects.filter((p) => p.level === 'Medium').length,
    Low: projects.filter((p) => p.level === 'Low').length,
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AcquiPredict</h1>
        <p className="tagline">Predict · Explain · Simulate · Prioritize · Act</p>
      </header>

      {error && <p className="error">Error: {error}</p>}
      {loading && <p className="loading">Loading projects…</p>}

      {!loading && !error && (
        <>
          <div className="stats-bar">
            <div className="stat stat-high">
              <span className="stat-num">{counts.High}</span>
              <span className="stat-label">High Risk</span>
            </div>
            <div className="stat stat-medium">
              <span className="stat-num">{counts.Medium}</span>
              <span className="stat-label">Medium Risk</span>
            </div>
            <div className="stat stat-low">
              <span className="stat-num">{counts.Low}</span>
              <span className="stat-label">Low Risk</span>
            </div>
          </div>

          <div className="project-grid">
            {projects.map((p) => (
              <div
                key={p.id}
                className="project-card"
                style={{ borderLeftColor: riskColor(p.level) }}
                onClick={() => setActiveProject(p)}
              >
                <div className="card-top">
                  <h3>{p.name}</h3>
                  <span className="risk-badge" style={{ background: riskColor(p.level) }}>
                    {p.level} · {p.risk}%
                  </span>
                </div>
                <p className="card-sub">{p.district}, {p.state} — {p.infrastructure_type}</p>
                <p className="card-stage">Stage: {p.acquisition_stage}</p>
                <p className="card-days">Predicted delay: {p.predicted_delay_days} days</p>
                <div className="drivers">
                  <strong>Top drivers:</strong>
                  <ul>
                    {p.top_drivers.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
                <p className="card-hint">Click to run what-if simulation →</p>
              </div>
            ))}
          </div>
        </>
      )}

      {activeProject && (
        <WhatIfModal project={activeProject} onClose={() => setActiveProject(null)} />
      )}
    </div>
  )
}

export default App
