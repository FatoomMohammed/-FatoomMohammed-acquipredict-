// src/components/WhatIfModal.jsx
import React, { useState } from 'react'
import { predictRisk } from '../riskEngine'

function riskColor(level) {
  if (level === 'High') return '#e63946'
  if (level === 'Medium') return '#f4a300'
  return '#2a9d8f'
}

export default function WhatIfModal({ project, onClose, role, onLogAudit }) {
  // Local editable copy of the project - sliders change this only, never original DB data
  const [sim, setSim] = useState({ ...project })
  const [logged, setLogged] = useState(false)

  const original = predictRisk(project)
  const simulated = predictRisk(sim)
  const riskChange = Math.round((simulated.risk - original.risk) * 10) / 10
  const daysChange = Math.round((simulated.predicted_delay_days - original.predicted_delay_days) * 10) / 10

  const isViewer = role === 'Viewer'

  function update(field, value) {
    if (isViewer) return
    setSim((prev) => ({ ...prev, [field]: Number(value) }))
    setLogged(false)
  }

  // Handle logging the simulation
  async function handleLogSimulation() {
    if (isViewer || !onLogAudit) return
    await onLogAudit(
      'What-if simulation run',
      `${project.name}: risk ${original.risk}% -> ${simulated.risk}% (${original.predicted_delay_days}d -> ${simulated.predicted_delay_days}d)`
    )
    setLogged(true)
  }

  function handleClose() {
    // If the simulation changed and wasn't explicitly logged yet, log it automatically
    if (!isViewer && !logged && (original.risk !== simulated.risk || original.predicted_delay_days !== simulated.predicted_delay_days) && onLogAudit) {
      onLogAudit(
        'What-if simulation run',
        `${project.name}: risk ${original.risk}% -> ${simulated.risk}% (${original.predicted_delay_days}d -> ${simulated.predicted_delay_days}d)`
      )
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>What-If Simulator — {project.name}</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {isViewer && (
          <div className="viewer-notice-banner">
            👁️ <strong>Viewer Mode:</strong> Sliders are disabled. Only Administrators and Field Officers can simulate scenarios.
          </div>
        )}

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
            <input
              type="range"
              min="0"
              max="200"
              disabled={isViewer}
              value={sim.approval_delay_days || 0}
              onChange={(e) => update('approval_delay_days', e.target.value)}
            />
          </label>

          <label>
            Compensation completed (%): <strong>{sim.compensation_pct}</strong>
            <input
              type="range"
              min="0"
              max="100"
              disabled={isViewer}
              value={sim.compensation_pct || 0}
              onChange={(e) => update('compensation_pct', e.target.value)}
            />
          </label>

          <label>
            Legal disputes (count): <strong>{sim.legal_disputes}</strong>
            <input
              type="range"
              min="0"
              max="10"
              disabled={isViewer}
              value={sim.legal_disputes || 0}
              onChange={(e) => update('legal_disputes', e.target.value)}
            />
          </label>

          <label>
            R&amp;R completed (%): <strong>{sim.rr_completion_pct}</strong>
            <input
              type="range"
              min="0"
              max="100"
              disabled={isViewer}
              value={sim.rr_completion_pct || 0}
              onChange={(e) => update('rr_completion_pct', e.target.value)}
            />
          </label>

          <label>
            Avg. department response (days): <strong>{sim.avg_response_days}</strong>
            <input
              type="range"
              min="0"
              max="60"
              disabled={isViewer}
              value={sim.avg_response_days || 0}
              onChange={(e) => update('avg_response_days', e.target.value)}
            />
          </label>
        </div>

        <div className="whatif-drivers">
          <strong>Simulated top drivers:</strong>
          <ul>
            {simulated.top_drivers.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>

        {!isViewer && (
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleLogSimulation}
              disabled={logged || (original.risk === simulated.risk && original.predicted_delay_days === simulated.predicted_delay_days)}
            >
              {logged ? '✓ Simulation Logged' : 'Log Simulation to Audit'}
            </button>
            <button className="btn" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
