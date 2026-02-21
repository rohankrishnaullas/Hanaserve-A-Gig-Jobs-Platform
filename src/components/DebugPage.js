import React, { useState, useEffect } from 'react';
import { getProviders, getJobRequests, getAllMatches, getAllConversations } from '../utils/storage';
import './DebugPage.css';

const DebugPage = () => {
  const [providers, setProviders] = useState([]);
  const [jobRequests, setJobRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('providers');

  const loadData = () => {
    setProviders(getProviders());
    setJobRequests(getJobRequests());
    setMatches(getAllMatches());
    setConversations(getAllConversations());
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearAllData = () => {
    if (window.confirm('Clear all localStorage data? This cannot be undone.')) {
      localStorage.clear();
      loadData();
    }
  };

  return (
    <div className="debug-page">
      <div className="debug-header">
        <h2>🔧 Debug Console</h2>
        <button onClick={loadData} className="refresh-btn">🔄 Refresh</button>
        <button onClick={clearAllData} className="clear-btn">🗑️ Clear All</button>
      </div>

      <div className="debug-tabs">
        <button 
          className={activeTab === 'providers' ? 'active' : ''} 
          onClick={() => setActiveTab('providers')}
        >
          Providers ({providers.length})
        </button>
        <button 
          className={activeTab === 'requests' ? 'active' : ''} 
          onClick={() => setActiveTab('requests')}
        >
          Job Requests ({jobRequests.length})
        </button>
        <button 
          className={activeTab === 'matches' ? 'active' : ''} 
          onClick={() => setActiveTab('matches')}
        >
          Matches ({matches.length})
        </button>
        <button 
          className={activeTab === 'conversations' ? 'active' : ''} 
          onClick={() => setActiveTab('conversations')}
        >
          Conversations ({conversations.length})
        </button>
      </div>

      <div className="debug-content">
        {activeTab === 'providers' && (
          <div className="data-section">
            <h3>Service Providers</h3>
            {providers.length === 0 ? (
              <p className="empty-state">No providers registered yet.</p>
            ) : (
              providers.map(provider => (
                <div key={provider.id} className="data-card">
                  <h4>{provider.name || 'Unnamed'}</h4>
                  <p><strong>ID:</strong> {provider.id}</p>
                  <p><strong>Skills:</strong> {provider.skills?.join(', ') || 'None'}</p>
                  <p><strong>Location:</strong> {provider.location?.city || 'Not set'}</p>
                  <p><strong>Created:</strong> {new Date(provider.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="data-section">
            <h3>Job Requests</h3>
            {jobRequests.length === 0 ? (
              <p className="empty-state">No job requests yet.</p>
            ) : (
              jobRequests.map(request => (
                <div key={request.id} className="data-card">
                  <h4>{request.requesterName || 'Anonymous'}</h4>
                  <p><strong>Description:</strong> {request.description}</p>
                  <p><strong>Rate:</strong> ${request.rate?.suggested}/hr</p>
                  <p><strong>Status:</strong> {request.status}</p>
                  <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="data-section">
            <h3>Job Matches</h3>
            {matches.length === 0 ? (
              <p className="empty-state">No matches yet.</p>
            ) : (
              matches.map(match => (
                <div key={match.id} className="data-card">
                  <p><strong>Job:</strong> {match.jobId}</p>
                  <p><strong>Provider:</strong> {match.providerId}</p>
                  <p><strong>Match Score:</strong> {match.matchScore}%</p>
                  <p><strong>Status:</strong> {match.status}</p>
                  <p><strong>Created:</strong> {new Date(match.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="data-section">
            <h3>Conversation Records</h3>
            {conversations.length === 0 ? (
              <p className="empty-state">No conversation records yet.</p>
            ) : (
              conversations.map(conv => (
                <div key={conv.id} className="data-card">
                  <h4>{conv.role === 'provider' ? '👷 Provider' : '🙋 Requester'}</h4>
                  <p><strong>User:</strong> {conv.userId}</p>
                  <p><strong>Transcript:</strong> {conv.transcript?.substring(0, 200)}...</p>
                  <p><strong>Analysis:</strong> {JSON.stringify(conv.analysis).substring(0, 100)}...</p>
                  <p><strong>Duration:</strong> {conv.durationMs}ms</p>
                  <p><strong>Created:</strong> {new Date(conv.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPage;
