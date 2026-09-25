// src/components/Alerts.jsx
import React from 'react'
import { analyzeLegalText } from '../riskEngine'

export default function Alerts({ projects, onSelectProject }) {
  const highRiskProjects = projects.filter((p) => p.level === 'High')

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>🚨</span>
          <div>
            <h2>Critical Land Acquisition Delay Alerts</h2>
            <p className="page-desc">
              Immediate escalation queue for projects exceeding the 66% risk threshold (120+ days predicted delay).
              Review top drivers and prescriptive mitigation actions below.
            </p>
          </div>
        </div>
      </div>

      {highRiskProjects.length === 0 ? (
        <div className="empty-state" style={{ borderColor: '#2a9d8f' }}>
          <span style={{ fontSize: '2.5rem' }}>✅</span>
          <h3 style={{ color: '#2a9d8f' }}>No High-Risk Alerts Detected</h3>
          <p>
            All currently registered land acquisition projects are operating within acceptable low-to-medium risk thresholds.
          </p>
        </div>
      ) : (
        <div className="alerts-list">
          <div className="alerts-summary-banner">
            <span>
              <strong>{highRiskProjects.length} critical case{highRiskProjects.length > 1 ? 's' : ''}</strong> require urgent departmental intervention.
            </span>
          </div>

          {highRiskProjects.map((p) => {
            const legalReport = p.legal_text ? analyzeLegalText(p.legal_text) : null

            return (
              <div key={p.id} className="alert-card">
                <div className="alert-card-header">
                  <div>
                    <div className="alert-card-tags">
                      <span className="urgent-badge">CRITICAL ACTION REQUIRED</span>
                      <span className="stage-badge">{p.acquisition_stage}</span>
                      <span className="infra-badge">{p.infrastructure_type}</span>
                    </div>
                    <h3 className="alert-project-title">{p.name}</h3>
                    <p className="card-sub">
                      📍 {p.district}, {p.state} &bull; Affected Families: <strong>{p.affected_families || 0}</strong> &bull; Area: <strong>{p.land_area_acres || 0} Acres</strong>
                    </p>
                  </div>

                  <div className="alert-score-box">
                    <div className="alert-score-val">{p.risk}%</div>
                    <div className="alert-score-label">Risk Probability</div>
                    <div className="alert-delay-val">+{p.predicted_delay_days} days delay</div>
                  </div>
                </div>

                <div className="alert-body-grid">
                  {/* Top Drivers Column */}
                  <div className="alert-section-box">
                    <h4>⚠️ Primary Delay Drivers</h4>
                    <ul className="alert-drivers-list">
                      {p.top_drivers.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>

                    {/* Document gap callout */}
                    <div className="alert-docs-callout">
                      <span>Document Completeness: <strong>{p.doc_complete_pct}%</strong></span>
                      {p.missing_docs && p.missing_docs.length > 0 && (
                        <p className="missing-docs-text">
                          Missing: {p.missing_docs.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recommendations Column */}
                  <div className="alert-section-box">
                    <h4>📋 Prescriptive Remediation Actions</h4>
                    <ul className="alert-recommendations-list">
                      {p.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>

                    {/* Legal text alert if present */}
                    {legalReport && (
                      <div className="alert-legal-callout">
                        <span>Legal Text Risk Signal: <strong>{legalReport.legal_risk_level} ({legalReport.legal_risk_score}%)</strong></span>
                        {legalReport.matched_high_severity.length > 0 && (
                          <p className="legal-terms-text">
                            Detected High Severity: {legalReport.matched_high_severity.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="alert-card-footer">
                  <span className="alert-status-text">
                    Current stage: <strong>{p.acquisition_stage}</strong> &bull; Approval delay: {p.approval_delay_days || 0}d &bull; Compensation disbursed: {p.compensation_pct || 0}%
                  </span>
                  <button className="btn btn-sm" onClick={() => onSelectProject(p)}>
                    Simulate What-If Mitigation →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
