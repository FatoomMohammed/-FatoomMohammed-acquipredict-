// src/components/ModelInfo.jsx
import React from 'react'

export default function ModelInfo() {
  return (
    <div className="model-info-page">
      <div className="page-header">
        <h2>Risk Engine &amp; Predictive Model Architecture</h2>
        <p className="page-desc">
          Technical specification of AcquiPredict's domain-calibrated explainability engine, parameter weights, and statutory calibration.
        </p>
      </div>

      {/* Mandatory Honesty Note Callout */}
      <div className="honesty-note-callout">
        <div className="honesty-badge">TRANSPARENCY &amp; ETHICAL DISCLOSURE</div>
        <p className="honesty-text">
          "This prototype currently uses a domain-calibrated formula rather than a model trained on authorized historical land-acquisition records, because such records were not available for the prototype. The architecture is designed to be extended with a trained model with no changes to the surrounding application."
        </p>
      </div>

      {/* Core Formula Section */}
      <div className="model-card">
        <h3>1. Mathematical Formulation</h3>
        <p>
          AcquiPredict translates composite statutory and operational bottlenecks into a normalized Risk Index (0–100%) calibrated against a maximum critical delay horizon of <strong>180 days</strong> (6 months beyond statutory schedule):
        </p>

        <div className="formula-box">
          <code>
            Risk % = min(100, Math.round((Predicted Delay Days / 180) * 1000) / 10)
          </code>
        </div>

        <p>Where <code>Predicted Delay Days</code> is determined via a multi-factor regression equation:</p>

        <div className="formula-box">
          <code>
            Predicted Days = Math.max(0, 0.75 &times; approval_delay_days + 1.35 &times; (legal_disputes &times; 30) + 42 &times; land_dispute_flag - 0.55 &times; compensation_pct - 0.45 &times; rr_completion_pct + 1.1 &times; avg_response_days + 0.018 &times; affected_families + 14 &times; missing_document_count + stage_effect)
          </code>
        </div>
      </div>

      {/* Risk Thresholds */}
      <div className="model-card">
        <h3>2. Decision Thresholds &amp; Officer Action Levels</h3>
        <table className="data-table" style={{ marginTop: '12px' }}>
          <thead>
            <tr>
              <th>Risk Level</th>
              <th>Risk Score Range</th>
              <th>Predicted Delay Horizon</th>
              <th>Recommended Departmental Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="risk-badge" style={{ background: '#2a9d8f' }}>Low Risk</span>
              </td>
              <td><strong>&lt; 33.0%</strong></td>
              <td>0 – 59 days</td>
              <td>Routine monthly progress tracking; standard statutory clearance timeline.</td>
            </tr>
            <tr>
              <td>
                <span className="risk-badge" style={{ background: '#f4a300' }}>Medium Risk</span>
              </td>
              <td><strong>33.0% – 65.9%</strong></td>
              <td>60 – 118 days</td>
              <td>Inter-departmental coordination; expedite pending compensation awards or R&amp;R milestones.</td>
            </tr>
            <tr>
              <td>
                <span className="risk-badge" style={{ background: '#e63946' }}>High Risk</span>
              </td>
              <td><strong>&ge; 66.0%</strong></td>
              <td>119 – 180+ days</td>
              <td>Immediate administrative escalation; priority legal review; fast-track dispute settlement.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Feature Coefficients Breakdown */}
      <div className="model-card">
        <h3>3. Calibrated Feature Weights &amp; Rationale</h3>
        <p>
          Parameters were calibrated following the statutory bottlenecks outlined in the RFCTLARR Act, 2013 and MoRTH/BhoomiRashi delay patterns:
        </p>
        <table className="data-table" style={{ marginTop: '12px' }}>
          <thead>
            <tr>
              <th>Signal Parameter</th>
              <th>Weight / Coefficient</th>
              <th>Direction</th>
              <th>Domain Rationale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>approval_delay_days</code></td>
              <td>+0.75 days per day</td>
              <td>Delay Driver</td>
              <td>Statutory clearances (Forest, Environment, MoEFCC) cascade directly into schedule slip.</td>
            </tr>
            <tr>
              <td><code>legal_disputes</code></td>
              <td>+40.5 days per dispute</td>
              <td>Delay Driver</td>
              <td>Court hearings, counter-affidavits, and registry notices typically stall proceedings by 1–2 months.</td>
            </tr>
            <tr>
              <td><code>land_dispute_flag</code></td>
              <td>+42.0 days</td>
              <td>Delay Driver</td>
              <td>Title conflict or contested family ownership halts Section 11 award declaration until resolved.</td>
            </tr>
            <tr>
              <td><code>compensation_pct</code></td>
              <td>-0.55 days per %</td>
              <td>Mitigating Factor</td>
              <td>Prompt compensation disbursement directly minimizes landholder resistance and possession refusal.</td>
            </tr>
            <tr>
              <td><code>rr_completion_pct</code></td>
              <td>-0.45 days per %</td>
              <td>Mitigating Factor</td>
              <td>Resettlement &amp; Rehabilitation delivery satisfies statutory prerequisites for physical possession.</td>
            </tr>
            <tr>
              <td><code>avg_response_days</code></td>
              <td>+1.1 days per day</td>
              <td>Delay Driver</td>
              <td>Slow revenue and sub-divisional magistrate (SDM) inter-agency correspondence adds latency.</td>
            </tr>
            <tr>
              <td><code>affected_families</code></td>
              <td>+0.018 days per family</td>
              <td>Delay Driver</td>
              <td>Larger populations multiply grievance hearings, survey verifications, and award notices.</td>
            </tr>
            <tr>
              <td><code>missing_document_count</code></td>
              <td>+14.0 days per doc</td>
              <td>Delay Driver</td>
              <td>Missing ownership records, gazette notifications, or valuation reports stall file progress.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Acquisition Stage Baseline Adjustments */}
      <div className="model-card">
        <h3>4. Acquisition Stage Baselines</h3>
        <p>Each lifecycle stage introduces intrinsic variance based on statutory milestones:</p>
        <div className="stage-badges-grid">
          <div className="stage-chip">Legal Review: <strong>+18 days</strong></div>
          <div className="stage-chip">Compensation Processing: <strong>+15 days</strong></div>
          <div className="stage-chip">Land Verification: <strong>+10 days</strong></div>
          <div className="stage-chip">R&amp;R Processing: <strong>+12 days</strong></div>
          <div className="stage-chip">Acquisition: <strong>+12 days</strong></div>
          <div className="stage-chip">Award / Possession: <strong>+8 days</strong></div>
          <div className="stage-chip">Notification: <strong>+5 days</strong></div>
          <div className="stage-chip">Planning: <strong>0 days</strong></div>
          <div className="stage-chip" style={{ borderColor: '#2a9d8f' }}>Complete: <strong>-8 days</strong></div>
        </div>
      </div>

      {/* NLP Legal Risk Signal */}
      <div className="model-card">
        <h3>5. Heuristic Legal Risk NLP Signal</h3>
        <p>
          AcquiPredict also implements <code>analyzeLegalText()</code> to evaluate free-text litigation filings, SDM orders, and petitions:
        </p>
        <ul>
          <li><strong>High-Severity Triggers (+25 pts each):</strong> <em>stay order, injunction, high court, supreme court, writ petition, litigation, encroachment dispute, title dispute, ownership dispute, compensation withheld, possession denied, appeal filed</em>.</li>
          <li><strong>Medium-Severity Triggers (+10 pts each):</strong> <em>objection, grievance, delay, pending hearing, notice issued, compensation delay, survey dispute, boundary dispute</em>.</li>
          <li><strong>Mitigating Terms (-20 pts each):</strong> <em>resolved, withdrawn, settled, dismissed, compensation disbursed, possession granted</em>.</li>
        </ul>
      </div>
    </div>
  )
}
