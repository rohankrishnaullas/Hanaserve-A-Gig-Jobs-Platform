import React, { useState, useEffect } from 'react';
import { getMatchesForProvider, getJobRequests, updateJobRequest } from '../utils/storage';
import { logEvent } from '../utils/appInsights';
import './JobNotifications.css';

// Dummy data generators
const generateDummyJobMatches = () => [
  {
    id: 'dummy_job_1',
    description: 'Dog walker needed for energetic golden retriever',
    requesterName: 'Priya Sharma',
    location: { city: 'Koramangala, Bangalore' },
    rate: { min: 150, max: 250, suggested: 200 },
    category: 'Pet Care',
    date: 'Tomorrow, 3:00 PM',
    matchScore: 95
  },
  {
    id: 'dummy_job_2',
    description: 'Math tutor for high school student',
    requesterName: 'Rajesh Kumar',
    location: { city: 'Bandra, Mumbai' },
    rate: { min: 300, max: 500, suggested: 400 },
    category: 'Tutoring',
    date: 'This weekend',
    matchScore: 88
  },
  {
    id: 'dummy_job_3',
    description: 'House cleaning service needed',
    requesterName: 'Anjali Patel',
    location: { city: 'Connaught Place, Delhi' },
    rate: { min: 200, max: 350, suggested: 300 },
    category: 'Cleaning',
    date: 'Friday morning',
    matchScore: 82
  },
  {
    id: 'dummy_job_4',
    description: 'Help with furniture moving',
    requesterName: 'Vikram Singh',
    location: { city: 'Whitefield, Bangalore' },
    rate: { min: 400, max: 600, suggested: 500 },
    category: 'Moving',
    date: 'Next week',
    matchScore: 78
  }
];

const generateDummyProviderMatches = () => [
  {
    id: 'dummy_prov_1',
    name: 'Arjun Reddy',
    skills: ['Dog Walking', 'Pet Sitting', 'Pet Care'],
    rating: 4.8,
    experience: '3 years',
    location: { city: 'Indiranagar, Bangalore' },
    rate: { min: 150, max: 250, suggested: 200 },
    matchScore: 92
  },
  {
    id: 'dummy_prov_2',
    name: 'Meera Iyer',
    skills: ['Math Tutoring', 'Science Tutoring', 'Test Prep'],
    rating: 4.9,
    experience: '5 years',
    location: { city: 'Powai, Mumbai' },
    rate: { min: 300, max: 500, suggested: 400 },
    matchScore: 89
  },
  {
    id: 'dummy_prov_3',
    name: 'Rahul Gupta',
    skills: ['House Cleaning', 'Deep Cleaning', 'Organization'],
    rating: 4.7,
    experience: '2 years',
    location: { city: 'Hauz Khas, Delhi' },
    rate: { min: 200, max: 350, suggested: 300 },
    matchScore: 85
  },
  {
    id: 'dummy_prov_4',
    name: 'Kavita Deshmukh',
    skills: ['Furniture Moving', 'Packing', 'Heavy Lifting'],
    rating: 4.6,
    experience: '4 years',
    location: { city: 'Jayanagar, Bangalore' },
    rate: { min: 400, max: 650, suggested: 500 },
    matchScore: 81
  }
];

const JobNotifications = ({ providerId }) => {
  const [matchMode, setMatchMode] = useState('hire'); // 'hire' | 'work'
  const [notifications, setNotifications] = useState([]);
  const [dummyJobMatches] = useState(generateDummyJobMatches());
  const [dummyProviderMatches] = useState(generateDummyProviderMatches());

  const loadNotifications = () => {
    if (!providerId) return;
    
    const matches = getMatchesForProvider(providerId);
    const allJobs = getJobRequests();
    
    const notificationsWithJobs = matches.map(match => {
      const job = allJobs.find(j => j.id === match.jobId);
      return { ...match, job };
    }).filter(n => n.job && n.job.status === 'open');
    
    setNotifications(notificationsWithJobs);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [providerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const acceptJob = (match) => {
    const timestamp = new Date().toISOString();
    
    // Log job acceptance event (async)
    logEvent('JobAccepted', {
      jobId: match.jobId || match.id,
      providerId: providerId,
      timestamp: timestamp,
      jobCategory: match.job?.category || match.category,
      jobRate: match.job?.rate?.suggested || match.rate?.suggested,
      matchScore: match.score || match.matchScore
    });
    
    // Update job status (only for real jobs)
    if (match.jobId) {
      updateJobRequest(match.jobId, { 
        status: 'accepted',
        acceptedProviderId: providerId,
        acceptedAt: timestamp
      });
      setNotifications(prev => prev.filter(n => n.id !== match.id));
    }
    
    // Show success message
    alert(`You've accepted the job! Contact details will be shared soon.`);
  };

  const contactProvider = (provider) => {
    logEvent('ProviderContacted', {
      providerId: provider.id,
      providerName: provider.name,
      matchScore: provider.matchScore
    });
    
    alert(`You've contacted ${provider.name}! They will receive your request shortly.`);
  };

  const getDisplayMatches = () => {
    if (matchMode === 'hire') {
      // Show providers available for hire
      return dummyProviderMatches;
    } else {
      // Combine real and dummy job matches
      const realJobs = notifications.map(n => ({
        id: n.id,
        description: n.job?.description,
        requesterName: n.job?.requesterName || 'Someone',
        location: n.job?.location || { city: 'Nearby' },
        rate: n.job?.rate || { min: 10, max: 20, suggested: 15 },
        category: n.job?.category || 'General',
        matchScore: n.score || 75,
        isReal: true
      }));
      
      return [...realJobs, ...dummyJobMatches];
    }
  };

  const displayMatches = getDisplayMatches();

  if (!providerId) {
    return (
      <div className="job-notifications">
        <p>Please complete your setup first.</p>
      </div>
    );
  }

  return (
    <div className="job-notifications">
      <div className="matches-header">
        <h2>⭐ Matches</h2>
        <div className="match-mode-toggle">
          <button
            className={`mode-button ${matchMode === 'work' ? 'active' : ''}`}
            onClick={() => setMatchMode('work')}
          >
            💼 Looking for Work
          </button>
          <button
            className={`mode-button ${matchMode === 'hire' ? 'active' : ''}`}
            onClick={() => setMatchMode('hire')}
          >
            🔍 Looking to Hire
          </button>
        </div>
      </div>

      {displayMatches.length === 0 ? (
        <div className="no-notifications">
          <h3>No matches found</h3>
          <p>
            {matchMode === 'hire'
              ? "We'll show you service providers as they become available!"
              : "We'll notify you when someone needs your services nearby!"}
          </p>
        </div>
      ) : (
        <>
          <p className="notification-count">
            {displayMatches.length} {matchMode === 'hire' ? 'provider' : 'job'}
            {displayMatches.length > 1 ? 's' : ''} available
          </p>
          
          <div className="notifications-list">
            {matchMode === 'hire' ? (
              // Show provider matches
              displayMatches.map((provider) => (
                <div key={provider.id} className="notification-card provider-card">
                  <div className="notification-header">
                    <h3>{provider.name}</h3>
                    <span className="match-badge">{provider.matchScore}% match</span>
                  </div>
                  
                  <div className="notification-details">
                    <p><strong>Skills:</strong> {provider.skills.join(', ')}</p>
                    <p><strong>Rating:</strong> ⭐ {provider.rating}/5.0</p>
                    <p><strong>Experience:</strong> {provider.experience}</p>
                    <p><strong>Location:</strong> {provider.location.city}</p>
                    <p><strong>Rate:</strong> ₹{provider.rate.min}-₹{provider.rate.max}/hour</p>
                  </div>
                  
                  <div className="notification-actions">
                    <button 
                      className="accept-button"
                      onClick={() => contactProvider(provider)}
                    >
                      Contact Provider
                    </button>
                    <button 
                      className="decline-button"
                      onClick={() => {}}
                    >
                      Not Interested
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Show job matches
              displayMatches.map((job) => (
                <div key={job.id} className="notification-card">
                  <div className="notification-header">
                    <h3>{job.description}</h3>
                    <div className="header-badges">
                      <span className="rate-badge">₹{job.rate?.suggested || 150}/hour</span>
                      {job.matchScore && (
                        <span className="match-badge">{job.matchScore}% match</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="notification-details">
                    <p><strong>Requested by:</strong> {job.requesterName}</p>
                    <p><strong>Location:</strong> {job.location?.city || 'Nearby'}</p>
                    {job.date && <p><strong>When:</strong> {job.date}</p>}
                    <p><strong>Rate:</strong> ₹{job.rate?.min || 100}-₹{job.rate?.max || 200}/hour</p>
                    {job.category && <p><strong>Category:</strong> {job.category}</p>}
                  </div>
                  
                  <div className="notification-actions">
                    <button 
                      className="accept-button"
                      onClick={() => acceptJob(job)}
                    >
                      Accept Job
                    </button>
                    <button 
                      className="decline-button"
                      onClick={() => {}}
                    >
                      Not Interested
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default JobNotifications;
