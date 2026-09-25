// src/components/Analytics.jsx
import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'

const RISK_COLORS = {
  High: '#e63946',
  Medium: '#f4a300',
  Low: '#2a9d8f',
}

// Custom dark tooltip for recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#16243b',
          border: '1px solid #26374f',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          color: '#e8ecf1',
          fontSize: '0.85rem',
        }}
      >
        <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#f2c94c' }}>{label}</p>
        <p style={{ margin: 0, color: '#9fb3c8' }}>
          {payload[0].name}: <strong>{payload[0].value}</strong>
        </p>
      </div>
    )
  }
  return null
}

export default function Analytics({ projects }) {
  // Stat Card metrics
  const stats = useMemo(() => {
    if (!projects.length) {
      return { avgDocs: 0, avgRisk: 0, total: 0, highRisk: 0 }
    }
    const totalDocs = projects.reduce((acc, p) => acc + (p.doc_complete_pct || 0), 0)
    const totalRisk = projects.reduce((acc, p) => acc + (p.risk || 0), 0)
    const high = projects.filter((p) => p.level === 'High').length

    return {
      avgDocs: Math.round((totalDocs / projects.length) * 10) / 10,
      avgRisk: Math.round((totalRisk / projects.length) * 10) / 10,
      total: projects.length,
      highRisk: high,
    }
  }, [projects])

  // Chart (a): Project Count by Risk Level
  const riskLevelData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 }
    projects.forEach((p) => {
      if (counts[p.level] !== undefined) counts[p.level]++
    })
    return [
      { name: 'High Risk', count: counts.High, color: RISK_COLORS.High },
      { name: 'Medium Risk', count: counts.Medium, color: RISK_COLORS.Medium },
      { name: 'Low Risk', count: counts.Low, color: RISK_COLORS.Low },
    ]
  }, [projects])

  // Chart (b): Average Risk by Acquisition Stage
  const stageData = useMemo(() => {
    const map = {}
    projects.forEach((p) => {
      const stg = p.acquisition_stage || 'Unknown'
      if (!map[stg]) map[stg] = { sum: 0, count: 0 }
      map[stg].sum += p.risk || 0
      map[stg].count++
    })

    return Object.entries(map).map(([stage, d]) => ({
      stage,
      avgRisk: Math.round((d.sum / d.count) * 10) / 10,
      count: d.count,
    }))
  }, [projects])

  // Chart (c): Average Risk by Infrastructure Type
  const infraData = useMemo(() => {
    const map = {}
    projects.forEach((p) => {
      const infra = p.infrastructure_type || 'General'
      if (!map[infra]) map[infra] = { sum: 0, count: 0 }
      map[infra].sum += p.risk || 0
      map[infra].count++
    })

    return Object.entries(map).map(([infra, d]) => ({
      infra,
      avgRisk: Math.round((d.sum / d.count) * 10) / 10,
      count: d.count,
    }))
  }, [projects])

  // Chart (d): Top Risk Drivers Frequency Across All Projects
  const driversData = useMemo(() => {
    const counts = {}
    projects.forEach((p) => {
      if (Array.isArray(p.top_drivers)) {
        p.top_drivers.forEach((driver) => {
          if (driver && driver !== 'No major risk signal detected') {
            counts[driver] = (counts[driver] || 0) + 1
          }
        })
      }
    })

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([driver, frequency]) => ({
        driver,
        frequency,
      }))
  }, [projects])

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>Portfolio Risk &amp; Delay Analytics</h2>
        <p className="page-desc">
          Aggregated quantitative risk distribution, bottleneck analysis across stages, infrastructure sectors, and systemic delay drivers.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-bar" style={{ marginBottom: '32px' }}>
        <div className="stat" style={{ borderTopColor: '#f2c94c' }}>
          <span className="stat-num" style={{ color: '#f2c94c' }}>{stats.avgDocs}%</span>
          <span className="stat-label">Avg Document Completeness</span>
        </div>
        <div className="stat stat-high">
          <span className="stat-num" style={{ color: '#e63946' }}>{stats.highRisk}</span>
          <span className="stat-label">High-Risk Bottlenecks</span>
        </div>
        <div className="stat" style={{ borderTopColor: '#9fb3c8' }}>
          <span className="stat-num">{stats.avgRisk}%</span>
          <span className="stat-label">Portfolio Average Risk</span>
        </div>
        <div className="stat" style={{ borderTopColor: '#2a9d8f' }}>
          <span className="stat-num" style={{ color: '#2a9d8f' }}>{stats.total}</span>
          <span className="stat-label">Total Monitored Projects</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        {/* Chart (a): Risk Level Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Project Count by Risk Level</h3>
            <span className="chart-subtitle">Early warning distribution</span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskLevelData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid stroke="#26374f" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#9fb3c8" tick={{ fill: '#9fb3c8', fontSize: 12 }} />
                <YAxis stroke="#9fb3c8" tick={{ fill: '#9fb3c8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Projects" radius={[6, 6, 0, 0]}>
                  {riskLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart (b): Average Risk by Acquisition Stage */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Average Risk by Acquisition Stage (%)</h3>
            <span className="chart-subtitle">Delay vulnerability along the pipeline</span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid stroke="#26374f" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="stage"
                  stroke="#9fb3c8"
                  tick={{ fill: '#9fb3c8', fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#9fb3c8" tick={{ fill: '#9fb3c8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgRisk" name="Avg Risk %" fill="#f4a300" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart (c): Average Risk by Infrastructure Type */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Average Risk by Infrastructure Sector (%)</h3>
            <span className="chart-subtitle">Comparative sector risk profile</span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={infraData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid stroke="#26374f" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="infra"
                  stroke="#9fb3c8"
                  tick={{ fill: '#9fb3c8', fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#9fb3c8" tick={{ fill: '#9fb3c8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgRisk" name="Avg Risk %" fill="#2a9d8f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart (d): Top Risk Drivers Frequency */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Top Risk Drivers Across Projects</h3>
            <span className="chart-subtitle">Most prevalent root cause signals</span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={driversData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
              >
                <CartesianGrid stroke="#26374f" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#9fb3c8" tick={{ fill: '#9fb3c8', fontSize: 12 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="driver"
                  stroke="#9fb3c8"
                  tick={{ fill: '#9fb3c8', fontSize: 11 }}
                  width={150}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="frequency" name="Projects Affected" fill="#f2c94c" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
