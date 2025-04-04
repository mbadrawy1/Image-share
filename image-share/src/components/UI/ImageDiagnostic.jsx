import React, { useState, useEffect } from 'react';
import { generateImageUrlCandidates, NO_IMAGE_SVG } from '../../utils/imageUtils';

/**
 * Component for diagnosing image loading issues
 * Shows all possible URLs and their loading status
 */
const ImageDiagnostic = ({ img, onUrlSuccess }) => {
  const [urlStatuses, setUrlStatuses] = useState([]);
  const [expandedInfo, setExpandedInfo] = useState(false);
  
  useEffect(() => {
    if (!img) return;
    
    // Generate all possible URLs for this image
    const urls = generateImageUrlCandidates(img);
    
    // Initialize all URLs as "loading"
    setUrlStatuses(urls.map(url => ({ 
      url, 
      status: 'loading',
      error: null
    })));
    
    // Test each URL by loading an image
    urls.forEach((url, index) => {
      const testImg = new Image();
      
      testImg.onload = () => {
        setUrlStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[index] = { 
            ...newStatuses[index], 
            status: 'success' 
          };
          
          // Notify parent of successful URL
          if (onUrlSuccess && url !== NO_IMAGE_SVG) {
            onUrlSuccess(url);
          }
          
          return newStatuses;
        });
      };
      
      testImg.onerror = (e) => {
        setUrlStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[index] = { 
            ...newStatuses[index], 
            status: 'error',
            error: e.type 
          };
          return newStatuses;
        });
      };
      
      // Start loading the image
      testImg.src = url;
    });
  }, [img]);
  
  if (!img || urlStatuses.length === 0) {
    return <div style={{ padding: '10px', color: '#999' }}>No image data available</div>;
  }
  
  // Count success and failures
  const success = urlStatuses.filter(item => item.status === 'success').length;
  const failed = urlStatuses.filter(item => item.status === 'error').length;
  const loading = urlStatuses.filter(item => item.status === 'loading').length;
  
  return (
    <div style={{ 
      border: '1px solid #eee', 
      borderRadius: '4px', 
      padding: '10px',
      margin: '10px 0',
      fontSize: '12px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <div>
          <strong>Image URL Diagnostic:</strong> {success} working, {failed} failed, {loading} loading
        </div>
        <button 
          onClick={() => setExpandedInfo(!expandedInfo)}
          style={{
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '2px 8px',
            cursor: 'pointer'
          }}
        >
          {expandedInfo ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {expandedInfo && (
        <div>
          <div style={{ fontWeight: 'bold', marginTop: '5px' }}>Image Properties:</div>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '5px', 
            borderRadius: '3px',
            overflow: 'auto',
            maxHeight: '100px'
          }}>
            {JSON.stringify(img, null, 2)}
          </pre>
          
          <div style={{ fontWeight: 'bold', marginTop: '5px' }}>URL Status:</div>
          <ul style={{ 
            margin: '5px 0', 
            padding: '0', 
            listStyle: 'none' 
          }}>
            {urlStatuses.map((item, idx) => (
              <li 
                key={idx} 
                style={{ 
                  padding: '3px 5px',
                  borderRadius: '3px',
                  marginBottom: '3px',
                  background: 
                    item.status === 'success' ? '#d4edda' : 
                    item.status === 'error' ? '#f8d7da' : 
                    '#fff3cd',
                  color: 
                    item.status === 'success' ? '#155724' : 
                    item.status === 'error' ? '#721c24' : 
                    '#856404',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ wordBreak: 'break-all' }}>{item.url}</span>
                <span style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
                  {item.status === 'success' ? '✅ Working' : 
                   item.status === 'error' ? '❌ Failed' : 
                   '⏳ Loading'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageDiagnostic; 