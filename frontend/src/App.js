import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Configure axios to send credentials (cookies) with requests
axios.defaults.withCredentials = true;

function App() {
  const [partNumber, setPartNumber] = useState('');
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [expandedPrices, setExpandedPrices] = useState({});

  // Load existing components on mount
  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/components`);
      if (response.data.success) {
        setComponents(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading components:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!partNumber.trim()) {
      setError('Please enter a part number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_URL}/api/search`, {
        partNumber: partNumber.trim()
      });

      if (response.data.success) {
        setSuccess(response.data.message || 'Component found and saved successfully!');
        setPartNumber('');
        
        // Reload components to show updated data
        await loadComponents();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search component. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all search history? This will delete the Excel file.')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/api/components`);
      if (response.data.success) {
        setComponents([]);
        setSuccess('Search history cleared successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to clear history. Please try again.');
      console.error('Clear history error:', err);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/export`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Components.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess('Excel file downloaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to export Excel file. Please try again.');
      console.error('Export error:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      setError('Please upload an image (JPG, PNG, GIF) or text file (TXT)');
      return;
    }

    // Enhanced validation matching backend logic
    const isValidPartNumber = (t) => {
      if (!t || typeof t !== 'string') return false;
      const s = t.trim().toUpperCase();
      if (s.length < 3 || s.length > 40) return false;
      if (!/[A-Z]/.test(s) || !/[0-9]/.test(s)) return false;
      
      // Exclude common false positives
      const excludePatterns = [
        /^\d{4}$/, /^\d{1,3}$/, /^[A-Z]{1,3}$/, /^[A-Z]{1,2}\d{1,2}$/,
        /^\d{4}-\d{2}-\d{2}$/, /^REF\d+$/i, /^ITEM\d+$/i, /^PART\d+$/i,
        /^\d{6,8}$/, /^[A-Z]{2,4}$/
      ];
      if (excludePatterns.some(p => p.test(s))) return false;
      
      // Valid part number patterns
      const validPatterns = [
        /^[A-Z]{2,8}\d{2,8}[A-Z]?(\-[A-Z0-9]+)*$/,
        /^[A-Z]\d{1,2}[A-Z]{1,4}\d{1,6}(\-[A-Z0-9]+)*$/,
        /^[A-Z]{2,6}\d{4,6}[A-Z]?(\-[A-Z0-9]+)*$/,
        /^[A-Z]{2,6}\d{2,6}(\/[A-Z0-9]+)*$/,
        /^[A-Z]{2,6}\d{2,6}(\.[A-Z0-9]+)*$/,
        /^[A-Z]{3,8}\d{2,6}[A-Z]{0,4}(\-?\d+)?$/
      ];
      return validPatterns.some(p => p.test(s));
    };

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const rawParts = response.data.partNumbers || [];
        // Filter out invalid entries and keep valid part numbers only
        const partNumbers = rawParts.filter(p => p && p.trim() && isValidPartNumber(p));
        
        if (partNumbers.length === 0) {
          setError('No valid part numbers found in the uploaded file. Please ensure the image/file contains readable part numbers (e.g., LM358, 1N4148, NE555).');
          setUploading(false);
          return;
        }

        setSuccess(`Found ${partNumbers.length} part number(s). Searching...`);
        
        let successCount = 0;
        let failCount = 0;
        
        for (const partNum of partNumbers) {
          try {
            await axios.post(`${API_URL}/api/search`, { partNumber: partNum.trim() });
            successCount++;
          } catch (err) {
            failCount++;
            console.error(`Failed to search ${partNum}:`, err);
          }
        }

        await loadComponents();
        
        setSuccess(`Successfully processed ${successCount} part number(s). ${failCount > 0 ? `${failCount} failed.` : ''}`);
        setTimeout(() => setSuccess(null), 5000);
        
        setFileInputKey(prev => prev + 1);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process uploaded file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Parse price string and display vertically
  const renderPriceTiers = (priceString, index) => {
    if (!priceString || priceString === '-' || priceString === 'N/A') {
      return <span>-</span>;
    }

    // Parse format: "5 ₹40.0600, 10 ₹24.8400, 100 ₹19.0100"
    const pairs = priceString.split(',').map(s => s.trim());
    const tiers = [];
    
    pairs.forEach(pair => {
      // Match pattern: "5 ₹40.0600" or "10 $24.8400"
      const match = pair.match(/(\d+)\s*([₹$])([\d,.]+)/);
      if (match) {
        tiers.push({
          quantity: match[1],
          currency: match[2],
          price: match[3]
        });
      }
    });

    if (tiers.length === 0) {
      return <span>{priceString}</span>;
    }

    const isExpanded = expandedPrices[index];
    const initialDisplay = 2; // Show first 2 prices
    const displayTiers = isExpanded ? tiers : tiers.slice(0, initialDisplay);
    const hasMore = tiers.length > initialDisplay;

    return (
      <div style={{ background: 'white' }}>
        {displayTiers.map((tier, idx) => (
          <div key={idx} style={{ marginBottom: '4px' }}>
            {tier.quantity} {tier.currency}{tier.price}
          </div>
        ))}
        {hasMore && (
          <button
            onClick={() => setExpandedPrices(prev => ({ ...prev, [index]: !prev[index] }))}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              background: 'white',
              color: 'black',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isExpanded ? 'Show Less' : `Show More (${tiers.length - initialDisplay} more)`}
          </button>
        )}
      </div>
    );
  };

  const handleExportOne = async (onePartNumber) => {
    if (!onePartNumber || !onePartNumber.trim()) {
      setError('Invalid part number');
      return;
    }

    try {
      const encodedPartNumber = encodeURIComponent(onePartNumber.trim());
      const response = await axios.get(`${API_URL}/api/export/${encodedPartNumber}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${onePartNumber.trim()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Excel file for ${onePartNumber} downloaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to export';
      setError(`${errorMessage} (${onePartNumber})`);
      console.error('Export one error:', err);
    }
  };

  return (
    <div className="app">
      {/* Main Header */}
      <header className="main-header">
        <div className="header-content">
          <div>
            <h1 className="company-title">Semicon Ventures</h1>
            <p className="header-subtitle">Advanced Component Search & Analysis Platform</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <header className="header">
            <h1>🔍 Component Search System</h1>
            <p className="subtitle">Search and extract component data from FindChips</p>
          </header>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="input-group">
              <input
                type="text"
                className="search-input"
                placeholder="Enter part number (e.g., LM358, 1N4148W-TP)"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                disabled={loading || uploading}
              />
              <button 
                type="submit" 
                className="search-button"
                disabled={loading || uploading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          <div className="upload-export-group">
            <div className="file-upload-wrapper">
              <label htmlFor="file-upload" className="file-upload-label">
                <span className="upload-icon">📁</span>
                {uploading ? 'Processing...' : 'Upload Image/File'}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*,.txt,.pdf"
                onChange={handleFileUpload}
                disabled={loading || uploading}
                key={fileInputKey}
                style={{ display: 'none' }}
              />
            </div>
            
            <button
              onClick={handleExportExcel}
              className="export-button"
              disabled={components.length === 0 || loading || uploading}
            >
              <span className="export-icon">📥</span>
              Export to Excel
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              {success}
            </div>
          )}
        </div>

        <div className="components-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Stored Components ({components.length})</h2>
            {components.length > 0 && (
              <button 
                onClick={handleClearHistory}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#cc0000'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ff4444'}
              >
                🗑️ Clear History
              </button>
            )}
          </div>
          
          {components.length === 0 ? (
            <div className="empty-state">
              <p>No components stored yet. Search for a component to get started!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="components-table">
                <thead>
                  <tr>
                    <th>Part Number</th>
                    <th>Manufacturer</th>
                    <th>Description</th>
                    <th style={{minWidth: '200px'}}>Price (Qty Break)</th>
                    <th>Available Stock</th>
                    <th>Distributor</th>
                    <th>Datasheet</th>
                    <th style={{textAlign:'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((component, index) => (
                    <tr key={index}>
                      <td className="part-number">{component.partNumber || '-'}</td>
                      <td>{component.manufacturer || '-'}</td>
                      <td className="description">
                        {component.description || '-'}
                      </td>
                      <td className="price-column">
                        {renderPriceTiers(component.lowestPrice, index)}
                      </td>
                      <td className="stock-column">{component.availableStock || '-'}</td>
                      <td>{component.distributor || '-'}</td>
                      <td>
                        {component.datasheetLink ? (
                          <a 
                            href={component.datasheetLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="link"
                          >
                            View →
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{textAlign:'right'}}>
                        {component.partNumber ? (
                          <button
                            onClick={() => handleExportOne(component.partNumber)}
                            className="row-export-btn"
                            title="Export this part to Excel"
                          >
                            Export
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

          <footer className="footer">
            <p className="terms">
              <strong>Terms of Use & Data License:</strong> This data is collected for academic use only. 
              No redistribution or commercial use without proper authorization. Data extracted from FindChips 
              may be subject to their terms of service. Use responsibly and respect rate limits.
            </p>
          </footer>
        </div>
      </main>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#about" className="footer-link">About Us</a>
            <a href="#services" className="footer-link">Services</a>
            <a href="#contact" className="footer-link">Contact</a>
            <a href="#privacy" className="footer-link">Privacy Policy</a>
            <a href="#terms" className="footer-link">Terms of Service</a>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Semicon Ventures. All rights reserved. | Advanced Component Search & Analysis Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
