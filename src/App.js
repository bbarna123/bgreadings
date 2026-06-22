import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch CSV data from GitHub
  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Add timestamp to bust cache
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://raw.githubusercontent.com/bbarna123/bgreadings/main/data/readings.csv?t=${timestamp}`
      );
      const csv = await response.text();
      
      // Parse CSV
      const lines = csv.trim().split('\n');
      const readings = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          timestamp: values[0],
          reading_mg_dl: parseInt(values[1]),
          notes: values[2] || ''
        };
      });

      // Sort by timestamp and get last 20
      const sorted = readings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const last20 = sorted.slice(-20);

      // Format for display
      const formattedData = last20.map(r => ({
        ...r,
        displayTime: new Date(r.timestamp).toLocaleString(),
        shortTime: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      setData(formattedData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load blood sugar readings.');
    } finally {
      setLoading(false);
    }
  };

  const stats = data.length > 0 ? {
    average: Math.round(data.reduce((sum, d) => sum + d.reading_mg_dl, 0) / data.length),
    min: Math.min(...data.map(d => d.reading_mg_dl)),
    max: Math.max(...data.map(d => d.reading_mg_dl))
  } : null;

  const getReadingStatus = (reading) => {
    if (reading > 180) return { color: '#d32f2f', status: 'High' };
    if (reading < 70) return { color: '#f57c00', status: 'Low' };
    return { color: '#388e3c', status: 'Normal' };
  };

  const latestReading = data.length > 0 ? data[data.length - 1] : null;
  const latestStatus = latestReading ? getReadingStatus(latestReading.reading_mg_dl) : null;

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Blood Sugar Readings</h1>
        <p>Track and visualize your blood glucose levels</p>
        <p className="update-time">
          {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
        </p>
      </header>

      <main className="container">
        {/* Latest Reading - Top Bar */}
        {latestReading && latestStatus && (
          <div className="latest-bar" style={{ borderLeftColor: latestStatus.color }}>
            <div className="latest-info">
              <span className="latest-label">Latest Reading:</span>
              <span className="latest-value" style={{ color: latestStatus.color }}>
                {latestReading.reading_mg_dl} mg/dL
              </span>
              <span className="latest-status" style={{ color: latestStatus.color }}>
                ({latestStatus.status})
              </span>
              {latestReading.notes && (
                <span className="latest-notes">• {latestReading.notes}</span>
              )}
            </div>
            <span className="latest-time">{latestReading.shortTime}</span>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="stats">
            <div className="stat-card">
              <span className="stat-label">Average</span>
              <span className="stat-value">{stats.average} mg/dL</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Min</span>
              <span className="stat-value">{stats.min} mg/dL</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Max</span>
              <span className="stat-value">{stats.max} mg/dL</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Readings</span>
              <span className="stat-value">{data.length}</span>
            </div>
          </div>
        )}

        {/* Chart */}
        {loading ? (
          <p className="loading">Loading data...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : data.length > 0 ? (
          <div className="chart-container">
            <h2>Last 20 Readings</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shortTime" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[60, 200]}
                  label={{ value: 'mg/dL', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f9f9f9', border: '1px solid #ccc' }}
                  formatter={(value) => `${value} mg/dL`}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.displayTime;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reading_mg_dl" 
                  stroke="#8884d8" 
                  dot={{ fill: '#8884d8', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Blood Sugar (mg/dL)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="no-data">No data available</p>
        )}

        {/* Recent Readings Table */}
        {data.length > 0 && (
          <div className="table-container">
            <h2>Recent Readings</h2>
            <table className="readings-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Reading (mg/dL)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((reading, idx) => {
                  const status = getReadingStatus(reading.reading_mg_dl);
                  return (
                    <tr key={idx}>
                      <td>{reading.displayTime}</td>
                      <td style={{ color: status.color, fontWeight: 600 }}>
                        {reading.reading_mg_dl}
                      </td>
                      <td>{reading.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;