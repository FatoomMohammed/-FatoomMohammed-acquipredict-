// src/components/NewCaseForm.jsx
import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { predictRisk, analyzeLegalText } from '../riskEngine'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

const INFRASTRUCTURE_TYPES = [
  'National Highway',
  'Metro / Rail',
  'Water Infrastructure',
  'Energy / Power',
  'Industrial Corridor',
  'Airport',
  'Urban Development',
  'Port / Logistics',
]

const ACQUISITION_STAGES = [
  'Planning',
  'Notification',
  'Land Verification',
  'Compensation Processing',
  'R&R Processing',
  'Legal Review',
  'Acquisition',
  'Award / Possession',
  'Acquisition Complete',
]

function riskColor(level) {
  if (level === 'High') return '#e63946'
  if (level === 'Medium') return '#f4a300'
  return '#2a9d8f'
}

export default function NewCaseForm({ role, onCaseAdded, onNavigateToDashboard }) {
  const isViewer = role === 'Viewer'

  const initialForm = {
    name: '',
    state: 'Telangana',
    district: '',
    infrastructure_type: 'National Highway',
    acquisition_stage: 'Land Verification',
    approval_delay_days: 0,
    compensation_pct: 0,
    legal_disputes: 0,
    land_dispute_flag: 0,
    rr_completion_pct: 0,
    avg_response_days: 0,
    land_area_acres: 0,
    affected_families: 0,
    ownership_doc: 1,
    land_record: 1,
    compensation_doc: 1,
    approval_doc: 1,
    notification_doc: 1,
    legal_text: '',
  }

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdResult, setCreatedResult] = useState(null)

  // Real-time legal text risk analysis preview
  const legalAnalysis = analyzeLegalText(form.legal_text)

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isViewer) return

    if (!form.name.trim()) {
      setError('Please provide a Project Name.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        name: form.name.trim(),
        state: form.state,
        district: form.district.trim() || 'General',
        infrastructure_type: form.infrastructure_type,
        acquisition_stage: form.acquisition_stage,
        approval_delay_days: Number(form.approval_delay_days) || 0,
        compensation_pct: Number(form.compensation_pct) || 0,
        legal_disputes: Number(form.legal_disputes) || 0,
        land_dispute_flag: Number(form.land_dispute_flag) || 0,
        rr_completion_pct: Number(form.rr_completion_pct) || 0,
        avg_response_days: Number(form.avg_response_days) || 0,
        land_area_acres: Number(form.land_area_acres) || 0,
        affected_families: Number(form.affected_families) || 0,
        ownership_doc: form.ownership_doc ? 1 : 0,
        land_record: form.land_record ? 1 : 0,
        compensation_doc: form.compensation_doc ? 1 : 0,
        approval_doc: form.approval_doc ? 1 : 0,
        notification_doc: form.notification_doc ? 1 : 0,
        legal_text: form.legal_text?.trim() || null,
      }

      // 1. Insert into Supabase "projects" table
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([payload])
        .select()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // 2. Log to audit_log
      await supabase.from('audit_log').insert([
        {
          role: role,
          action: 'Case created',
          detail: `Case created: "${payload.name}" in ${payload.district}, ${payload.state} (${payload.infrastructure_type})`,
        },
      ])

      // 3. Calculate immediate risk score using predictRisk()
      const riskAssessment = predictRisk(payload)
      setCreatedResult({
        project: payload,
        score: riskAssessment,
      })

      // Refresh parent projects list
      if (onCaseAdded) {
        onCaseAdded()
      }
    } catch (err) {
      setError(err.message || 'Failed to create new case. Please check Supabase permissions.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(initialForm)
    setCreatedResult(null)
    setError(null)
  }

  return (
    <div className="new-case-page">
      <div className="page-header">
        <h2>Register New Land Acquisition Case</h2>
        <p className="page-desc">
          Input statutory case details, document availability, and operational metrics.
          AcquiPredict computes explainable risk immediately upon registration.
        </p>
      </div>

      {isViewer && (
        <div className="viewer-notice-banner">
          👁️ <strong>Viewer Mode:</strong> You have read-only access. Case creation is restricted to Administrators and Field Officers.
        </div>
      )}

      {error && <div className="form-error-banner">⚠️ {error}</div>}

      {/* Immediate Result Card if successfully created */}
      {createdResult && (
        <div className="case-result-card" style={{ borderLeftColor: riskColor(createdResult.score.level) }}>
          <div className="result-header">
            <div>
              <span className="success-badge">✓ Case Successfully Registered &amp; Scored</span>
              <h3>{createdResult.project.name}</h3>
              <p className="card-sub">
                {createdResult.project.district}, {createdResult.project.state} — {createdResult.project.infrastructure_type}
              </p>
            </div>
            <div className="result-risk-box">
              <span className="risk-badge" style={{ background: riskColor(createdResult.score.level), fontSize: '0.9rem' }}>
                {createdResult.score.level} Risk · {createdResult.score.risk}%
              </span>
              <span className="result-delay">{createdResult.score.predicted_delay_days} days predicted delay</span>
            </div>
          </div>

          <div className="result-grid">
            <div className="result-col">
              <h4>Top Risk Drivers:</h4>
              <ul>
                {createdResult.score.top_drivers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="result-col">
              <h4>Prescriptive Actions:</h4>
              <ul>
                {createdResult.score.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="result-footer">
            <span>
              Document Completeness: <strong>{createdResult.score.doc_complete_pct}%</strong>
              {createdResult.score.missing_docs?.length > 0 && ` (Missing: ${createdResult.score.missing_docs.join(', ')})`}
            </span>
            <div className="result-actions">
              <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                Register Another Case
              </button>
              <button className="btn btn-sm" onClick={onNavigateToDashboard}>
                View on Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Registration Form */}
      {!createdResult && (
        <form className="case-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">1. Project &amp; Jurisdiction Information</h3>
            <div className="form-row">
              <div className="form-group flex-2">
                <label>
                  Project Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  disabled={isViewer}
                  placeholder="e.g. NH-65 Solapur-Hyderabad Highway Expansion"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label>State</label>
                <select
                  disabled={isViewer}
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-1">
                <label>District</label>
                <input
                  type="text"
                  disabled={isViewer}
                  placeholder="e.g. Solapur"
                  value={form.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Infrastructure Sector</label>
                <select
                  disabled={isViewer}
                  value={form.infrastructure_type}
                  onChange={(e) => handleChange('infrastructure_type', e.target.value)}
                >
                  {INFRASTRUCTURE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Current Acquisition Stage</label>
                <select
                  disabled={isViewer}
                  value={form.acquisition_stage}
                  onChange={(e) => handleChange('acquisition_stage', e.target.value)}
                >
                  {ACQUISITION_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">2. Operational &amp; Delay Parameters</h3>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Approval Delay (days)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  disabled={isViewer}
                  value={form.approval_delay_days}
                  onChange={(e) => handleChange('approval_delay_days', e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label>Compensation Disbursed (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={isViewer}
                  value={form.compensation_pct}
                  onChange={(e) => handleChange('compensation_pct', e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label>R&amp;R Completed (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={isViewer}
                  value={form.rr_completion_pct}
                  onChange={(e) => handleChange('rr_completion_pct', e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label>Dept. Response (days)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  disabled={isViewer}
                  value={form.avg_response_days}
                  onChange={(e) => handleChange('avg_response_days', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Legal Disputes (count)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  disabled={isViewer}
                  value={form.legal_disputes}
                  onChange={(e) => handleChange('legal_disputes', e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label>Land Ownership Dispute</label>
                <select
                  disabled={isViewer}
                  value={form.land_dispute_flag}
                  onChange={(e) => handleChange('land_dispute_flag', Number(e.target.value))}
                >
                  <option value={0}>No Dispute</option>
                  <option value={1}>Yes (Active Dispute / Title Contested)</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Land Area (Acres)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  disabled={isViewer}
                  value={form.land_area_acres}
                  onChange={(e) => handleChange('land_area_acres', e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label>Affected Families</label>
                <input
                  type="number"
                  min="0"
                  disabled={isViewer}
                  value={form.affected_families}
                  onChange={(e) => handleChange('affected_families', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">3. Statutory Document Verification</h3>
            <p className="section-desc">
              Uncheck any document that has not yet been submitted or verified.
            </p>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  disabled={isViewer}
                  checked={form.ownership_doc === 1}
                  onChange={(e) => handleChange('ownership_doc', e.target.checked ? 1 : 0)}
                />
                <span>Ownership Title Document</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  disabled={isViewer}
                  checked={form.land_record === 1}
                  onChange={(e) => handleChange('land_record', e.target.checked ? 1 : 0)}
                />
                <span>Updated Revenue Land Records</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  disabled={isViewer}
                  checked={form.compensation_doc === 1}
                  onChange={(e) => handleChange('compensation_doc', e.target.checked ? 1 : 0)}
                />
                <span>Compensation Award Sanction</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  disabled={isViewer}
                  checked={form.approval_doc === 1}
                  onChange={(e) => handleChange('approval_doc', e.target.checked ? 1 : 0)}
                />
                <span>Statutory Clearances (Forest/Env)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  disabled={isViewer}
                  checked={form.notification_doc === 1}
                  onChange={(e) => handleChange('notification_doc', e.target.checked ? 1 : 0)}
                />
                <span>Sec 4/11 Gazette Notification</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">4. Legal Dispute Notes &amp; Court Petitions (Optional)</h3>
            <p className="section-desc">
              NLP signal detector highlights high-severity terms like injunctions, stay orders, or high court appeals.
            </p>
            <textarea
              rows="3"
              disabled={isViewer}
              className="legal-textarea"
              placeholder="e.g. Writ petition filed in High Court seeking stay order on award compensation disbursement..."
              value={form.legal_text}
              onChange={(e) => handleChange('legal_text', e.target.value)}
            />

            {form.legal_text?.trim() && (
              <div className="legal-preview-bar">
                <span>
                  Legal Risk Signal: <strong>{legalAnalysis.legal_risk_level} ({legalAnalysis.legal_risk_score}%)</strong>
                </span>
                {legalAnalysis.matched_high_severity.length > 0 && (
                  <span className="pill-high">
                    High severity terms: {legalAnalysis.matched_high_severity.join(', ')}
                  </span>
                )}
                {legalAnalysis.matched_medium_severity.length > 0 && (
                  <span className="pill-med">
                    Medium severity terms: {legalAnalysis.matched_medium_severity.join(', ')}
                  </span>
                )}
                {legalAnalysis.matched_resolution_terms.length > 0 && (
                  <span className="pill-resolved">
                    Resolution terms: {legalAnalysis.matched_resolution_terms.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Clear
            </button>
            <button type="submit" className="btn" disabled={isViewer || submitting}>
              {submitting ? 'Registering & Scoring Case...' : 'Submit & Calculate Risk'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
