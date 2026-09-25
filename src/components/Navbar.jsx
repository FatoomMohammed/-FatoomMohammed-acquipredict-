// src/components/Navbar.jsx
import React from 'react'

const TABS = [
  'Dashboard',
  'New Case',
  'Map',
  'Analytics',
  'Alerts',
  'Audit Log',
  'Model Info',
  'Login',
]

export default function Navbar({ activeTab, setActiveTab, user, role, onSignOut }) {
  function getRoleBadgeClass(r) {
    if (r === 'Administrator') return 'badge-role-admin'
    if (r === 'Field Officer') return 'badge-role-officer'
    return 'badge-role-viewer'
  }

  return (
    <header className="app-header">
      <div className="header-top-row">
        <div className="branding" onClick={() => setActiveTab('Dashboard')} style={{ cursor: 'pointer' }}>
          <h1>AcquiPredict</h1>
          <p className="tagline">Predict · Explain · Simulate · Prioritize · Act</p>
        </div>

        <div className="user-role-card">
          <div className="role-meta">
            <span className="user-email-label">
              {user?.email ? user.email : 'Guest / Not Authenticated'}
            </span>
            <span className={`role-badge ${getRoleBadgeClass(role)}`}>
              {role}
            </span>
          </div>

          {user ? (
            <button className="btn btn-secondary btn-sm" onClick={onSignOut} title="Sign Out">
              Sign Out
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('Login')}
              title="Sign In"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Main Navigation">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>
  )
}
