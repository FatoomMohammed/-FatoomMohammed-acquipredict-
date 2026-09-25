// src/components/Dashboard.jsx
import React, { useState, useMemo } from 'react'

function riskColor(level) {
  if (level === 'High') return '#e63946'
  if (level === 'Medium') return '#f4a300'
  return '#2a9d8f'
}

export default function Dashboard({ projects, onSelectProject, role, onLogAudit }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('ALL')
  const [selectedLevel, setSelectedLevel] = useState('ALL')
  const [selectedStage, setSelectedStage] = useState('ALL')

  // Extract unique states for the dropdown
  const uniqueStates = useMemo(() => {
    const states = new Set(projects.map((p) => p.state).filter(Boolean))
    return Array.from(states).sort()
  }, [projects])

  // Extract unique stages
  const uniqueStages = useMemo(() => {
    const stages = new Set(projects.map((p) => p.acquisition_stage).filter(Boolean))
    return Array.from(stages).sort()
  }, [projects])

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Text search in name or district
      const matchesSearch =
        !searchTerm.trim() ||
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.district && p.district.toLowerCase().includes(searchTerm.toLowerCase()))

      // State filter
      const matchesState = selectedState === 'ALL' || p.state === selectedState

      // Risk level filter
      const matchesLevel = selectedLevel === 'ALL' || p.level === selectedLevel

      // Stage filter
      const matchesStage = selectedStage === 'ALL' || p.acquisition_stage === selectedStage

      return matchesSearch && matchesState && matchesLevel && matchesStage
    })
  }, [projects, searchTerm, selectedState, selectedLevel, selectedStage])

  // Risk counts for stats bar based on filtered projects
  const counts = {
    High: filteredProjects.filter((p) => p.level === 'High').length,
    Medium: filteredProjects.filter((p) => p.level === 'Medium').length,
    Low: filteredProjects.filter((p) => p.level === 'Low').length,
  }

  // Client-side CSV export
  function handleExportCsv() {
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

    const rows = filteredProjects.map((p) => [
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
    link.setAttribute('download', `AcquiPredict_Filtered_Projects_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    if (onLogAudit) {
      onLogAudit('CSV exported', `Exported ${filteredProjects.length} projects as CSV (${role})`)
    }
  }

  function handleResetFilters() {
    setSearchTerm('')
    setSelectedState('ALL')
    setSelectedLevel('ALL')
    setSelectedStage('ALL')
  }

  const hasActiveFilters =
    searchTerm || selectedState !== 'ALL' || selectedLevel !== 'ALL' || selectedStage !== 'ALL'

  return (
    <div className="dashboard-page">
      {/* Stats Bar */}
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

      {/* Filter and Search Controls */}
      <div className="filter-panel">
        <div className="search-box">
          <input
            type="text"
            className="input-search"
            placeholder="Search by project name or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdowns">
          <select
            className="filter-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            aria-label="Filter by state"
          >
            <option value="ALL">All States ({uniqueStates.length})</option>
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            aria-label="Filter by risk level"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="High">High Risk (≥66%)</option>
            <option value="Medium">Medium Risk (33–65%)</option>
            <option value="Low">Low Risk (&lt;33%)</option>
          </select>

          <select
            className="filter-select"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            aria-label="Filter by acquisition stage"
          >
            <option value="ALL">All Stages</option>
            {uniqueStages.map((stg) => (
              <option key={stg} value={stg}>
                {stg}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}

          {/* Export CSV button - only visible for Administrator */}
          {role === 'Administrator' && (
            <button
              className="btn btn-sm btn-export"
              onClick={handleExportCsv}
              title="Download currently filtered projects as CSV"
            >
              📥 Export CSV ({filteredProjects.length})
            </button>
          )}
        </div>
      </div>

      <div className="filter-summary">
        <span>
          Showing <strong>{filteredProjects.length}</strong> of <strong>{projects.length}</strong> projects
        </span>
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <h3>No matching projects found</h3>
          <p>Try adjusting your search query or relaxing your filter criteria.</p>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="project-card"
              style={{ borderLeftColor: riskColor(p.level) }}
              onClick={() => onSelectProject(p)}
            >
              <div className="card-top">
                <h3>{p.name}</h3>
                <span className="risk-badge" style={{ background: riskColor(p.level) }}>
                  {p.level} · {p.risk}%
                </span>
              </div>
              <p className="card-sub">
                {p.district}, {p.state} — {p.infrastructure_type}
              </p>
              <p className="card-stage">Stage: {p.acquisition_stage}</p>
              <p className="card-days">Predicted delay: {p.predicted_delay_days} days</p>
              <p className="card-docs">
                Docs: <strong>{p.doc_complete_pct}% complete</strong> ({5 - (p.missing_docs?.length || 0)}/5)
              </p>
              <div className="drivers">
                <strong>Top drivers:</strong>
                <ul>
                  {p.top_drivers.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <p className="card-hint">
                {role === 'Viewer' ? 'Click to inspect case details →' : 'Click to run what-if simulation →'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
