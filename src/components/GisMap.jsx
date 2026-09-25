// src/components/GisMap.jsx
import React, { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'

function riskColor(level) {
  if (level === 'High') return '#e63946'
  if (level === 'Medium') return '#f4a300'
  return '#2a9d8f'
}

// Static coordinate lookup for major Indian districts & state capitals
const DISTRICT_COORDS = {
  // Maharashtra
  'nagpur': [21.1458, 79.0882],
  'pune': [18.5204, 73.8567],
  'solapur': [17.6599, 75.9064],
  'mumbai': [19.0760, 72.8777],
  'mumbai suburban': [19.1136, 72.8697],
  'thane': [19.2183, 72.9781],
  'nashik': [19.9975, 73.7898],
  'aurangabad': [19.8762, 75.3433],
  'chhatrapati sambhajinagar': [19.8762, 75.3433],
  'kolhapur': [16.7050, 74.2433],
  'amravati': [20.9374, 77.7796],

  // Telangana
  'hyderabad': [17.3850, 78.4867],
  'karimnagar': [18.4386, 79.1288],
  'warangal': [17.9784, 79.5941],
  'rangareddy': [17.4399, 78.4983],
  'medak': [18.0461, 78.2616],
  'khammam': [17.2473, 80.1514],
  'nizamabad': [18.6725, 78.0941],

  // Gujarat
  'ahmedabad': [23.0225, 72.5714],
  'gandhinagar': [23.2156, 72.6369],
  'surat': [21.1702, 72.8311],
  'vadodara': [22.3072, 73.1812],
  'rajkot': [22.3039, 70.8022],

  // Karnataka
  'bengaluru': [12.9716, 77.5946],
  'bangalore': [12.9716, 77.5946],
  'mysuru': [12.2958, 76.6394],
  'mysore': [12.2958, 76.6394],
  'belagavi': [15.8497, 74.4977],
  'hubballi': [15.3647, 75.1240],
  'mangaluru': [12.9141, 74.8560],

  // Tamil Nadu
  'chennai': [13.0827, 80.2707],
  'coimbatore': [11.0168, 76.9558],
  'madurai': [9.9252, 78.1198],
  'salem': [11.6643, 78.1460],
  'tiruchirappalli': [10.7905, 78.7047],

  // Uttar Pradesh
  'lucknow': [26.8467, 80.9462],
  'kanpur': [26.4499, 80.3319],
  'varanasi': [25.3176, 82.9739],
  'noida': [28.5355, 77.3910],
  'greater noida': [28.4744, 77.5040],
  'agra': [27.1767, 78.0081],
  'prayagraj': [25.4358, 81.8463],
  'gorakhpur': [26.7606, 83.3732],

  // Rajasthan
  'jaipur': [26.9124, 75.7873],
  'jodhpur': [26.2389, 73.0243],
  'udaipur': [24.5854, 73.7125],
  'kota': [25.2138, 75.8648],

  // Madhya Pradesh
  'bhopal': [23.2599, 77.4126],
  'indore': [22.7196, 75.8577],
  'jabalpur': [23.1815, 79.9864],
  'gwalior': [26.2183, 78.1828],

  // Andhra Pradesh
  'visakhapatnam': [17.6868, 83.2185],
  'vijayawada': [16.5062, 80.6480],
  'amaravati': [16.5131, 80.5165],
  'guntur': [16.3067, 80.4365],

  // Bihar
  'patna': [25.5941, 85.1376],
  'gaya': [24.7914, 85.0002],

  // West Bengal
  'kolkata': [22.5726, 88.3639],
  'siliguri': [26.7271, 88.3953],
  'durgapur': [23.5204, 87.3119],

  // Delhi / NCR / Haryana / Punjab
  'delhi': [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  'gurugram': [28.4595, 77.0266],
  'faridabad': [28.4089, 77.3178],
  'chandigarh': [30.7333, 76.7794],
  'ludhiana': [30.9010, 75.8573],
  'amritsar': [31.6340, 74.8723],

  // Odisha / Jharkhand / Chhattisgarh
  'bhubaneswar': [20.2961, 85.8245],
  'cuttack': [20.4625, 85.8830],
  'ranchi': [23.3441, 85.3096],
  'jamshedpur': [22.8046, 86.2029],
  'raipur': [21.2514, 81.6296],

  // Kerala
  'thiruvananthapuram': [8.5241, 76.9366],
  'kochi': [9.9312, 76.2673],
  'kozhikode': [11.2588, 75.7804],

  // Assam
  'guwahati': [26.1445, 91.7362],
}

// Fallback state capitals / central coords
const STATE_COORDS = {
  'andhra pradesh': [16.5062, 80.6480],
  'assam': [26.1445, 91.7362],
  'bihar': [25.5941, 85.1376],
  'chhattisgarh': [21.2514, 81.6296],
  'delhi': [28.6139, 77.2090],
  'goa': [15.2993, 74.1240],
  'gujarat': [23.2156, 72.6369],
  'haryana': [30.7333, 76.7794],
  'himachal pradesh': [31.1048, 77.1734],
  'jharkhand': [23.3441, 85.3096],
  'karnataka': [12.9716, 77.5946],
  'kerala': [8.5241, 76.9366],
  'madhya pradesh': [23.2599, 77.4126],
  'maharashtra': [19.0760, 72.8777],
  'odisha': [20.2961, 85.8245],
  'punjab': [30.7333, 76.7794],
  'rajasthan': [26.9124, 75.7873],
  'tamil nadu': [13.0827, 80.2707],
  'telangana': [17.3850, 78.4867],
  'uttar pradesh': [26.8467, 80.9462],
  'uttarakhand': [30.3165, 78.0322],
  'west bengal': [22.5726, 88.3639],
}

// Deterministic jitter helper so overlapping pins spread slightly
function getJitter(id) {
  let hash = 0
  const str = String(id || 'default')
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const latOffset = ((Math.abs(hash) % 20) - 10) * 0.015
  const lngOffset = ((Math.abs(hash >> 3) % 20) - 10) * 0.015
  return [latOffset, lngOffset]
}

export default function GisMap({ projects, onSelectProject }) {
  const [levelFilter, setLevelFilter] = useState('ALL')

  // Filter projects by risk level
  const filtered = projects.filter((p) => {
    if (levelFilter === 'ALL') return true
    return p.level === levelFilter
  })

  // Resolve coordinate for each project
  const mappedProjects = filtered.map((p) => {
    const distKey = (p.district || '').trim().toLowerCase()
    const stateKey = (p.state || '').trim().toLowerCase()

    let baseCoord = DISTRICT_COORDS[distKey] || STATE_COORDS[stateKey] || [21.5, 78.9]
    const [dLat, dLng] = getJitter(p.id || p.name)

    return {
      ...p,
      lat: baseCoord[0] + dLat,
      lng: baseCoord[1] + dLng,
    }
  })

  return (
    <div className="gis-map-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>GIS Land Acquisition Risk Map</h2>
          <p className="page-desc">
            Geographic distribution of land acquisition projects color-coded by predicted delay risk level.
          </p>
        </div>

        <div className="map-filter-controls">
          <label style={{ fontSize: '0.85rem', color: '#9fb3c8', marginRight: '8px' }}>
            Filter by Risk:
          </label>
          <select
            className="filter-select"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="ALL">All Projects ({projects.length})</option>
            <option value="High">High Risk ({projects.filter((p) => p.level === 'High').length})</option>
            <option value="Medium">Medium Risk ({projects.filter((p) => p.level === 'Medium').length})</option>
            <option value="Low">Low Risk ({projects.filter((p) => p.level === 'Low').length})</option>
          </select>
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend-bar">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#e63946' }}></span>
          High Risk (&ge;66%)
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#f4a300' }}></span>
          Medium Risk (33–65%)
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#2a9d8f' }}></span>
          Low Risk (&lt;33%)
        </span>
        <span className="legend-item" style={{ marginLeft: 'auto', color: '#9fb3c8' }}>
          Plotted: <strong>{mappedProjects.length}</strong> locations
        </span>
      </div>

      {/* React Leaflet Map */}
      <div className="map-container-wrapper">
        <MapContainer
          center={[22.0, 79.5]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '620px', width: '100%', borderRadius: '12px', background: '#0f1b2d' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mappedProjects.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={10}
              pathOptions={{
                fillColor: riskColor(p.level),
                color: '#ffffff',
                weight: 2,
                fillOpacity: 0.9,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <strong>{p.name}</strong> ({p.level} · {p.risk}%)
              </Tooltip>

              <Popup>
                <div className="map-popup-card">
                  <h4 style={{ margin: '0 0 6px', color: '#101a29' }}>{p.name}</h4>
                  <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#334155' }}>
                    <strong>Location:</strong> {p.district}, {p.state}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#334155' }}>
                    <strong>Sector:</strong> {p.infrastructure_type}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#334155' }}>
                    <strong>Stage:</strong> {p.acquisition_stage}
                  </p>

                  <div style={{ margin: '8px 0', padding: '6px', background: '#f8fafc', borderRadius: '6px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        background: riskColor(p.level),
                      }}
                    >
                      {p.level} Risk: {p.risk}%
                    </span>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                      Predicted delay: <strong>{p.predicted_delay_days} days</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#334155', margin: '6px 0' }}>
                    <strong>Top Drivers:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                      {p.top_drivers?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="btn btn-sm"
                    style={{ width: '100%', marginTop: '6px', padding: '6px 10px' }}
                    onClick={() => onSelectProject(p)}
                  >
                    Simulate What-If →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
