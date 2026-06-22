import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReading, setNewReading] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch CSV data from GitHub
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch raw CSV from GitHub
      const response = await fetch(
        'https://raw.githubusercontent.com/bbarna123/bgreadings/main/data/readings.csv'
      );
      const csv = await response.text();
      
      // Parse CSV
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',');
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
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load blood sugar readings. Make sure the data/readings.csv file exists.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReading = (e) => {
    e.preventDefault();
    const reading = parseInt(newReading);
    
    if (!reading || reading < 20 || reading > 600) {
      alert('Please enter a valid blood sugar reading (20-600 mg/dL)');
      return;
    }

    const timestamp = new Date().toISOString();
    const newEntry = {
      timestamp,
      reading_mg_dl: reading,
      notes,
      displayTime: new Date(timestamp).toLocaleString(),
      shortTime: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add to data
    const updated = [...data, newEntry].slice(-20);
    setData(updated);

    // Reset form
    setNewReading('');
    setNotes('');

    alert('Reading added! To persist to GitHub, you need to use the API endpoint. See README for instructions.');
  };

  const stats = data.length > 0 ? {
    average: Math.round(data.reduce((sum, d) => sum + d.reading_mg_dl, 0) / data.length),
    min: Math.min(...data.map(d => d.reading_mg_dl)),
    max: Math.max(...data.map(d => d.reading_mg_dl))
  } : null;

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Blood Sugar Readings</h1>
        <p>Track and visualize your blood glucose levels</p>
      </header>

      <main className="container">
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

        {/* Add Reading Form */}
        <div className="form-container">
          <h2>Add New Reading</h2>
          <form onSubmit={handleAddReading}>
            <div className="form-group">
              <label htmlFor="reading">Blood Sugar Reading (mg/dL)</label>
              <input
                id="reading"
                type="number"
                value={newReading}
                onChange={(e) => setNewReading(e.target.value)}
                placeholder="Enter reading (e.g., 120)"
                min="20"
                max="600"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes (optional)</label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., After breakfast, Before lunch"
              />
            </div>
            <button type="submit" className="submit-btn">Add Reading</button>
          </form>
        </div>

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
                {[...data].reverse().map((reading, idx) => (
                  <tr key={idx}>
                    <td>{reading.displayTime}</td>
                    <td className={reading.reading_mg_dl > 180 ? 'high' : reading.reading_mg_dl < 70 ? 'low' : 'normal'}>
                      {reading.reading_mg_dl}
                    </td>
                    <td>{reading.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;