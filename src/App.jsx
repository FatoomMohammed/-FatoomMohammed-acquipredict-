// src/App.jsx
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { predictRisk } from './riskEngine'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import NewCaseForm from './components/NewCaseForm'
import GisMap from './components/GisMap'
import Analytics from './components/Analytics'
import Alerts from './components/Alerts'
import AuditLog from './components/AuditLog'
import ModelInfo from './components/ModelInfo'
import Login from './components/Login'
import WhatIfModal from './components/WhatIfModal'
import './App.css'

const ROLE_MAP = {
  'admin@test.com': 'Administrator',
  'officer@test.com': 'Field Officer',
  'fieldofficer@test.com': 'Field Officer',
}

function deriveRole(user) {
  if (!user || !user.email) return 'Viewer'
  return ROLE_MAP[user.email.toLowerCase()] || 'Viewer'
}

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeProject, setActiveProject] = useState(null) // for What-If modal
  const [user, setUser] = useState(null)

  const role = deriveRole(user)

  // Load and score all projects from Supabase
  async function loadProjects() {
    try {
      const { data, error: err } = await supabase.from('projects').select('*')
      if (err) throw err

      const scored = (data || []).map((p) => ({ ...p, ...predictRisk(p) }))
      scored.sort((a, b) => b.risk - a.risk)
      setProjects(scored)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load projects from Supabase.')
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadProjects()
  }, [])

  // Supabase Auth listener & session restore
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Universal audit logging helper
  async function logAuditAction(action, detail) {
    try {
      await supabase.from('audit_log').insert([
        {
          role,
          action,
          detail,
        },
      ])
    } catch (err) {
      console.warn('Failed to insert audit log entry:', err)
    }
  }

  // Sign out handler
  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="app">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        role={role}
        onSignOut={handleSignOut}
      />

      {error && <p className="error">Error: {error}</p>}
      {loading && <p className="loading">Loading projects from database…</p>}

      {!loading && !error && (
        <main className="tab-content">
          {activeTab === 'Dashboard' && (
            <Dashboard
              projects={projects}
              onSelectProject={setActiveProject}
              role={role}
              onLogAudit={logAuditAction}
            />
          )}

          {activeTab === 'New Case' && (
            <NewCaseForm
              role={role}
              onCaseAdded={loadProjects}
              onNavigateToDashboard={() => setActiveTab('Dashboard')}
            />
          )}

          {activeTab === 'Map' && (
            <GisMap
              projects={projects}
              onSelectProject={setActiveProject}
            />
          )}

          {activeTab === 'Analytics' && (
            <Analytics projects={projects} />
          )}

          {activeTab === 'Alerts' && (
            <Alerts
              projects={projects}
              onSelectProject={setActiveProject}
            />
          )}

          {activeTab === 'Audit Log' && (
            <AuditLog
              projects={projects}
              role={role}
              onLogAudit={logAuditAction}
            />
          )}

          {activeTab === 'Model Info' && (
            <ModelInfo />
          )}

          {activeTab === 'Login' && (
            <Login
              user={user}
              role={role}
              onAuthSuccess={(authedUser) => {
                setUser(authedUser)
                setActiveTab('Dashboard')
              }}
              onSignOut={handleSignOut}
            />
          )}
        </main>
      )}

      {/* What-If Simulator Modal */}
      {activeProject && (
        <WhatIfModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          role={role}
          onLogAudit={logAuditAction}
        />
      )}
    </div>
  )
}

export default App
