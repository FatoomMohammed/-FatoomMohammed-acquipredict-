// src/components/Login.jsx
import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login({ user, role, onAuthSuccess, onSignOut }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // Handle standard password sign-in
  async function handleSignIn(e) {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInErr) throw signInErr

      setMessage('Successfully authenticated!')
      if (onAuthSuccess) onAuthSuccess(data.user)
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle test account registration (Sign Up)
  async function handleSignUp(e) {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpErr) throw signUpErr

      if (data.session) {
        setMessage('Account created and signed in successfully!')
        if (onAuthSuccess) onAuthSuccess(data.user)
      } else {
        setMessage('Registration submitted! If email confirmation is enabled on Supabase, check your inbox.')
      }
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  // Quick-fill helper for hackathon presentation / evaluation
  async function handleDemoRoleLogin(demoEmail, demoPass) {
    setEmail(demoEmail)
    setPassword(demoPass)
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      // First attempt to sign in
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      })

      if (!signInErr && data.user) {
        setMessage(`Logged in as ${demoEmail}`)
        if (onAuthSuccess) onAuthSuccess(data.user)
        return
      }

      // If user doesn't exist in Supabase yet, create test account automatically
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPass,
      })

      if (signUpErr) {
        throw new Error(signUpErr.message)
      }

      if (signUpData.user) {
        // Try signing in again immediately
        const { data: retryData, error: retryErr } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPass,
        })
        if (!retryErr && retryData.user) {
          setMessage(`Created and logged into demo account: ${demoEmail}`)
          if (onAuthSuccess) onAuthSuccess(retryData.user)
        } else {
          setMessage(`Demo account created for ${demoEmail}. You can now sign in.`)
        }
      }
    } catch (err) {
      setError(err.message || 'Demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Role-Based Authentication</h2>
        <p className="login-subtitle">
          AcquiPredict integrates Supabase Auth to govern operational permissions across land acquisition administrative tiers.
        </p>

        {user ? (
          <div className="logged-in-profile">
            <div className="profile-banner">
              <span className="profile-icon">👤</span>
              <div>
                <h4 style={{ margin: '0 0 4px', color: '#f2c94c' }}>Signed In</h4>
                <p style={{ margin: 0, color: '#e8ecf1' }}>{user.email}</p>
                <div style={{ marginTop: '6px' }}>
                  Current Role:{' '}
                  <span className={`role-badge ${role === 'Administrator' ? 'badge-role-admin' : role === 'Field Officer' ? 'badge-role-officer' : 'badge-role-viewer'}`}>
                    {role}
                  </span>
                </div>
              </div>
            </div>

            <div className="role-permissions-matrix">
              <h4>Active Role Permissions:</h4>
              <ul>
                <li>
                  {role === 'Administrator' ? '✅' : '❌'} <strong>Export Portfolio to CSV:</strong> {role === 'Administrator' ? 'Enabled' : 'Restricted (Admin only)'}
                </li>
                <li>
                  {role === 'Viewer' ? '❌' : '✅'} <strong>Create New Land Acquisition Cases:</strong> {role === 'Viewer' ? 'Disabled (Read-only)' : 'Enabled'}
                </li>
                <li>
                  {role === 'Viewer' ? '❌' : '✅'} <strong>Interactive What-If Simulation:</strong> {role === 'Viewer' ? 'Disabled (Read-only)' : 'Enabled'}
                </li>
                <li>
                  ✅ <strong>View Dashboard, Map, Analytics, and Alerts:</strong> Enabled for all roles
                </li>
              </ul>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }} onClick={onSignOut}>
              Sign Out of Session
            </button>
          </div>
        ) : (
          <>
            {error && <div className="form-error-banner">⚠️ {error}</div>}
            {message && <div className="form-success-banner">✓ {message}</div>}

            <form onSubmit={handleSignIn} className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. admin@test.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="login-buttons-row">
                <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={loading}
                  onClick={handleSignUp}
                  style={{ flex: 1 }}
                >
                  Create Test Account
                </button>
              </div>
            </form>

            {/* Quick Demo Switcher */}
            <div className="demo-accounts-box">
              <span className="demo-accounts-title">Quick Demo Login (Hackathon Evaluation):</span>
              <div className="demo-btn-group">
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => handleDemoRoleLogin('admin@test.com', 'admin12345')}
                >
                  <strong>admin@test.com</strong>
                  <span>Administrator (Full Access)</span>
                </button>

                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => handleDemoRoleLogin('officer@test.com', 'officer12345')}
                >
                  <strong>officer@test.com</strong>
                  <span>Field Officer (Add &amp; Simulate)</span>
                </button>

                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => handleDemoRoleLogin('viewer@test.com', 'viewer12345')}
                >
                  <strong>viewer@test.com</strong>
                  <span>Viewer (Read-Only)</span>
                </button>
              </div>
            </div>
          </>
        )}

        <div className="rbac-legend">
          <h4>Role Permission Hierarchy:</h4>
          <p>
            <strong>Administrator</strong> (<code>admin@test.com</code>): Full administrative capability — register new cases, run and log what-if simulations, download CSV exports.
          </p>
          <p>
            <strong>Field Officer</strong> (<code>officer@test.com</code>): Operational field level — register cases, simulate what-if scenarios, no data export.
          </p>
          <p>
            <strong>Viewer</strong> (All other accounts / Unauthenticated): Read-only exploration of dashboard, map, charts, and alerts.
          </p>
        </div>
      </div>
    </div>
  )
}
