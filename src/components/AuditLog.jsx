// src/components/AuditLog.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AuditLog({ projects, role, onLogAudit }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadLogs() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('audit_log')
        .select('*')
        .order('ts', { ascending: false })
        .limit(100)

      if (err) throw err
      setLogs(data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch audit log entries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  function getActionBadgeStyle(action) {
    if (action === 'Case created') return { background: '#2a9d8f', color: '#101a29' }
    if (action === 'What-if simulation run') return { background: '#f4a300', color: '#101a29' }
    if (action === 'CSV exported') return { background: '#f2c94c', color: '#101a29' }
    return { background: '#26374f', color: '#e8ecf1' }
  }

  function formatTimestamp(ts) {
    if (!ts) return '—'
    const date = new Date(ts)
    return isNaN(date.getTime()) ? ts : date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // Client-side CSV export
  async function handleExportCsv() {
    if (role !== 'Administrator') return

    const headers = [
      'Project',
      'State',
      'District',
      'Infrastructure',
      'Stage',
      'Risk Score',
      'Risk Level',
      'Predicted Delay Days',
      'Document Completeness',
      'Main Risk Factor',
    ]

    const rows = projects.map((p) => [
      p.name || '',
      p.state || '',
      p.district || '',
      p.infrastructure_type || '',
      p.acquisition_stage || '',
      p.risk ?? '',
      p.level || '',
      p.predicted_delay_days ?? '',
      `${p.doc_complete_pct ?? 0}%`,
      p.top_drivers?.[0] || 'None',
    ])

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `AcquiPredict_Portfolio_Export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Log the CSV export to audit log and refresh table
    if (onLogAudit) {
      await onLogAudit('CSV exported', `Exported all ${projects.length} projects as CSV (${role})`)
      loadLogs()
    }
  }

  return (
    <div className="audit-log-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>System Audit Trail &amp; Governance Log</h2>
          <p className="page-desc">
            Immutable tracking of statutory case registrations, what-if scenario simulations, and analytical exports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadLogs} disabled={loading}>
            🔄 Refresh Trail
          </button>
          {role === 'Administrator' && (
            <button className="btn btn-sm" onClick={handleExportCsv} title="Export CSV of projects">
              📥 Export CSV
            </button>
          )}
        </div>
      </div>

      {error && <div className="form-error-banner">⚠️ {error}</div>}

      {loading ? (
        <p className="loading">Loading audit records from Supabase...</p>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <h3>No audit entries recorded yet</h3>
          <p>Actions like case registration, what-if simulations, or data exports will automatically appear here.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Timestamp</th>
                <th style={{ width: '130px' }}>Actor Role</th>
                <th style={{ width: '180px' }}>Action</th>
                <th>Event Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', color: '#9fb3c8', fontSize: '0.8rem' }}>
                    {formatTimestamp(log.ts)}
                  </td>
                  <td>
                    <span className={`role-badge ${log.role === 'Administrator' ? 'badge-role-admin' : log.role === 'Field Officer' ? 'badge-role-officer' : 'badge-role-viewer'}`}>
                      {log.role || 'System'}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        ...getActionBadgeStyle(log.action),
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ color: '#d7dee6', fontSize: '0.84rem' }}>
                    {log.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
