'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [names, setNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const router = useRouter()

  // Simple password - in production, use proper authentication
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'valentine2024'

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchNames()
    }
  }, [])

  const fetchNames = async () => {
    try {
      setLoading(true)
      // Try simple API first, then fallback to original
      let response = await fetch('/api/names-simple');
      if (!response.ok) {
        response = await fetch('/api/names');
      }
      
      if (response.ok) {
        const data = await response.json()
        setNames(data.names || [])
        console.log('Names with button stats:', data.names);
      } else {
        setError('Failed to fetch names')
      }
    } catch (err) {
      setError('Error fetching names')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
      fetchNames()
    } else {
      setError('Invalid password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuth')
    setPassword('')
  }

  const exportData = () => {
    const dataStr = JSON.stringify(names, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `valentine-names-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const clearData = async () => {
    if (confirm('Are you sure you want to clear all names? This cannot be undone.')) {
      try {
        // Try simple API first
        let response = await fetch('/api/names-simple', { method: 'DELETE' });
        if (!response.ok) {
          response = await fetch('/api/names', { method: 'DELETE' });
        }
        
        if (response.ok) {
          setNames([])
          alert('All names cleared successfully')
        } else {
          setError('Failed to clear names')
        }
      } catch (err) {
        setError('Error clearing names')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        fontFamily: 'Georgia, "Times New Roman", serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h2 style={{
            textAlign: 'center',
            color: '#2d1b3d',
            marginBottom: '30px',
            fontSize: '1.8rem'
          }}>
            Admin Login 💝
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ff6b9d',
                borderRadius: '10px',
                fontSize: '16px',
                marginBottom: '20px',
                outline: 'none'
              }}
            />
            {error && (
              <div style={{
                color: '#e11d48',
                marginBottom: '15px',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(145deg, #ff6b9d 0%, #ff8fab 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      fontFamily: 'Georgia, "Times New Roman", serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <h1 style={{
              color: '#2d1b3d',
              fontSize: '2rem',
              margin: 0
            }}>
              Valentine Names Admin 💕
            </h1>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={exportData}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Export Data 📊
              </button>
              <button
                onClick={clearData}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Clear All 🗑️
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(145deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Logout 🚪
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>Loading names...</div>
            </div>
          ) : error ? (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          ) : (
            <div>
              <div style={{
          background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>Total Names: {names.length}</strong>
        </div>

        {/* Button Statistics Section */}
        {names.some(name => name.noPresses !== undefined || name.yesPressed !== undefined) && (
          <div style={{
            background: 'linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 100%)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#1e293b',
              marginBottom: '15px',
              fontSize: '1.2rem'
            }}>
              Button Press Statistics 📊
            </h3>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{
                  background: 'linear-gradient(145deg, #f8fafc 0%, #e5e7eb 100%)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10
                }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>No Presses</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Yes Pressed</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {names.filter(name => name.noPresses !== undefined || name.yesPressed !== undefined).map((entry, index) => (
                    <tr key={entry.id} style={{
                      background: index % 2 === 0 ? 'white' : '#f9fafb'
                    }}>
                      <td style={{ 
                        padding: '12px', 
                        borderBottom: '1px solid #e5e7eb',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}>
                        {entry.name}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        borderBottom: '1px solid #e5e7eb',
                        color: entry.noPresses > 0 ? '#dc2626' : '#6b7280'
                      }}>
                        {entry.noPresses || 0}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <span style={{
                          background: entry.yesPressed ? 'linear-gradient(145deg, #10b981 0%, #059669 100%)' : 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {entry.yesPressed ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        borderBottom: '1px solid #e5e7eb',
                        color: '#6b7280',
                        fontSize: '0.9rem'
                      }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {names.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            No data yet. Share your Valentine's Day website to start collecting names and button statistics! 💝
          </div>
        )}

        {names.length > 0 && (
                <div style={{
                  maxHeight: '600px',
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead style={{
                      background: 'linear-gradient(145deg, #f3f4f6 0%, #e5e7eb 100%)',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10
                    }}>
                      <tr>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>#</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Time</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {names.map((entry, index) => (
                        <tr key={entry.id} style={{
                          borderBottom: '1px solid #f3f4f6',
                          background: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}>
                          <td style={{ padding: '12px 15px' }}>{index + 1}</td>
                          <td style={{ padding: '12px 15px', fontWeight: '600', color: '#2d1b3d' }}>
                            {entry.name}
                          </td>
                          <td style={{ padding: '12px 15px', color: '#6b7280' }}>
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '12px 15px', color: '#6b7280' }}>
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
