# Backend Architecture for Hanaserve Gig Jobs App

## Current State
- **Storage**: localStorage (client-side only, no persistence across devices)
- **Matching**: Client-side algorithm
- **Limitations**: No real-time updates, no cross-device sync, no actual marketplace

## Recommended Azure Architecture

### 1. **Backend API** (Choose one)
- **Azure Functions** (Serverless, pay-per-use) ⭐ RECOMMENDED
- Azure App Service (Always-on web API)
- Azure Container Apps (Containerized microservices)

### 2. **Database** (Choose one)
- **Azure Cosmos DB** (NoSQL, globally distributed) ⭐ RECOMMENDED
  - Best for: Real-time updates, scalability, geospatial queries
  - Collections: `providers`, `requesters`, `jobs`, `matches`, `notifications`
- Azure SQL Database (Relational)
- Azure Database for PostgreSQL

### 3. **Real-Time Updates**
- **Azure SignalR Service** ⭐ RECOMMENDED
  - Push notifications to providers when new jobs match
  - Real-time job status updates
- Alternative: WebSockets in Azure App Service

### 4. **Storage**
- Azure Blob Storage (for voice recordings, profile images)

### 5. **Search & Matching**
- Azure Cognitive Search (for skill matching, location-based search)
- Custom geospatial queries in Cosmos DB

---

## Database Schema

### Cosmos DB Collections

#### 1. **Providers Collection**
```json
{
  "id": "provider_123",
  "type": "provider",
  "userId": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "skills": ["dog walking", "pet sitting", "gardening"],
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749],
    "city": "San Francisco",
    "state": "CA"
  },
  "availability": {
    "daysOfWeek": ["Monday", "Tuesday", "Wednesday"],
    "timeSlots": ["morning", "afternoon"]
  },
  "rating": 4.8,
  "completedJobs": 45,
  "createdAt": "2025-12-20T10:00:00Z",
  "lastActive": "2025-12-20T15:30:00Z",
  "fcmToken": "device_push_notification_token"
}
```

#### 2. **Requesters Collection**
```json
{
  "id": "requester_456",
  "type": "requester",
  "userId": "user_456",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "location": {
    "type": "Point",
    "coordinates": [-122.4184, 37.7750],
    "city": "San Francisco",
    "state": "CA"
  },
  "createdAt": "2025-12-20T09:00:00Z"
}
```

#### 3. **Jobs Collection**
```json
{
  "id": "job_789",
  "type": "job",
  "requesterId": "requester_456",
  "requesterName": "Jane Smith",
  "title": "Dog Walking Needed",
  "description": "Need someone to walk my golden retriever for 30 minutes",
  "skills": ["dog walking"],
  "location": {
    "type": "Point",
    "coordinates": [-122.4184, 37.7750],
    "address": "123 Main St, San Francisco, CA"
  },
  "urgency": "immediate", // immediate, today, this-week, flexible
  "estimatedDuration": 30, // minutes
  "estimatedRate": 25.00, // per hour
  "status": "pending", // pending, matched, in-progress, completed, cancelled
  "createdAt": "2025-12-20T14:00:00Z",
  "expiresAt": "2025-12-20T18:00:00Z",
  "matchedProviderId": null,
  "acceptedAt": null,
  "completedAt": null
}
```

#### 4. **Matches Collection**
```json
{
  "id": "match_101",
  "type": "match",
  "jobId": "job_789",
  "providerId": "provider_123",
  "providerName": "John Doe",
  "matchScore": 0.95,
  "distance": 1.2, // miles
  "notificationSent": true,
  "notifiedAt": "2025-12-20T14:01:00Z",
  "status": "pending", // pending, accepted, declined, expired
  "createdAt": "2025-12-20T14:01:00Z"
}
```

#### 5. **Notifications Collection**
```json
{
  "id": "notification_202",
  "type": "notification",
  "userId": "provider_123",
  "jobId": "job_789",
  "matchId": "match_101",
  "message": "New job nearby: Dog Walking",
  "read": false,
  "createdAt": "2025-12-20T14:01:00Z"
}
```

---

## API Endpoints (Azure Functions)

### Provider Endpoints
- `POST /api/providers` - Register new provider
- `GET /api/providers/{id}` - Get provider profile
- `PUT /api/providers/{id}` - Update provider profile
- `GET /api/providers/{id}/matches` - Get pending job matches
- `POST /api/providers/{id}/accept-job` - Accept a job

### Requester Endpoints
- `POST /api/requesters` - Register new requester
- `POST /api/jobs` - Create new job request
- `GET /api/jobs/{id}` - Get job details
- `GET /api/requesters/{id}/jobs` - Get all jobs by requester

### Matching Endpoint
- `POST /api/jobs/{id}/find-matches` - Trigger matching algorithm

### Notification Endpoints
- `GET /api/notifications/{userId}` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read

---

## Matching Algorithm Logic

### Location in: `api/jobs/find-matches` Azure Function

```javascript
// Pseudocode for matching algorithm
async function findMatches(jobId) {
  const job = await cosmosDB.jobs.findById(jobId);
  
  // 1. Find providers with matching skills
  const providersWithSkills = await cosmosDB.providers.find({
    skills: { $in: job.skills },
    lastActive: { $gte: Date.now() - 30 * 24 * 60 * 60 * 1000 } // Active in last 30 days
  });
  
  // 2. Filter by distance (within 10 miles)
  const nearbyProviders = providersWithSkills.filter(provider => {
    const distance = calculateDistance(
      job.location.coordinates,
      provider.location.coordinates
    );
    return distance <= 10; // miles
  });
  
  // 3. Calculate match scores
  const matches = nearbyProviders.map(provider => {
    const score = calculateMatchScore(job, provider);
    const distance = calculateDistance(
      job.location.coordinates,
      provider.location.coordinates
    );
    
    return {
      jobId: job.id,
      providerId: provider.id,
      providerName: provider.name,
      matchScore: score,
      distance: distance,
      status: 'pending'
    };
  });
  
  // 4. Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);
  
  // 5. Save matches to database
  await cosmosDB.matches.insertMany(matches);
  
  // 6. Send notifications via SignalR
  for (const match of matches) {
    await sendNotification(match.providerId, {
      type: 'new_job',
      jobId: job.id,
      matchId: match.id,
      message: `New job nearby: ${job.title}`
    });
  }
  
  return matches;
}

function calculateMatchScore(job, provider) {
  let score = 0;
  
  // Skill match (40%)
  const matchingSkills = job.skills.filter(skill => 
    provider.skills.includes(skill)
  );
  score += (matchingSkills.length / job.skills.length) * 0.4;
  
  // Distance (30%) - closer is better
  const distance = calculateDistance(
    job.location.coordinates,
    provider.location.coordinates
  );
  const distanceScore = Math.max(0, 1 - (distance / 10)); // Max 10 miles
  score += distanceScore * 0.3;
  
  // Provider rating (20%)
  score += (provider.rating / 5) * 0.2;
  
  // Availability (10%)
  const isAvailable = checkAvailability(provider, job);
  score += isAvailable ? 0.1 : 0;
  
  return score;
}
```

---

## Real-Time Updates Flow

### When a job is posted:
1. Requester creates job via `POST /api/jobs`
2. Azure Function saves job to Cosmos DB
3. Azure Function triggers matching: `findMatches(jobId)`
4. Matching algorithm finds suitable providers
5. **SignalR sends push notifications** to matched providers
6. Providers see notification in real-time on their app

### When a provider opens the app:
1. App calls `GET /api/providers/{id}/matches`
2. Returns pending matches from database
3. Provider can accept/decline each match

---

## Implementation Steps

### Phase 1: Basic Backend (Start Here)
1. Create Azure Function App (Node.js/TypeScript)
2. Set up Cosmos DB with collections
3. Create API endpoints:
   - POST /api/providers
   - POST /api/jobs
   - POST /api/jobs/{id}/find-matches
   - GET /api/providers/{id}/matches

### Phase 2: Real-Time Features
1. Add Azure SignalR Service
2. Implement push notifications
3. Add WebSocket connection to React app

### Phase 3: Advanced Features
1. Add Azure Cognitive Search for better matching
2. Implement payment processing (Stripe API)
3. Add rating & review system
4. Add chat/messaging between requester and provider

---

## Frontend Changes Needed

### Update API Service Layer

Create `src/services/apiService.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071/api';

export const createProvider = async (providerData) => {
  const response = await fetch(`${API_BASE_URL}/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(providerData)
  });
  return response.json();
};

export const createJob = async (jobData) => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  });
  return response.json();
};

export const getProviderMatches = async (providerId) => {
  const response = await fetch(`${API_BASE_URL}/providers/${providerId}/matches`);
  return response.json();
};

export const acceptJob = async (providerId, matchId) => {
  const response = await fetch(`${API_BASE_URL}/providers/${providerId}/accept-job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId })
  });
  return response.json();
};
```

### Add SignalR Connection

```javascript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl(process.env.REACT_APP_SIGNALR_URL)
  .withAutomaticReconnect()
  .build();

connection.on('newJobMatch', (match) => {
  // Show notification to provider
  showNotification(`New job nearby: ${match.jobTitle}`);
});

connection.start();
```

---

## Cost Estimate (Azure Free Tier)

- **Azure Functions**: 1M executions/month FREE
- **Cosmos DB**: 1000 RU/s FREE (enough for ~10K users)
- **SignalR Service**: 20 concurrent connections FREE
- **Blob Storage**: 5 GB FREE

**Estimated monthly cost for 1000 active users: $0-10**

---

## Quick Start with Azure Functions

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Create function app
func init GigJobsAPI --typescript
cd GigJobsAPI

# Create HTTP trigger function
func new --name CreateJob --template "HTTP trigger"

# Run locally
func start
```

Let me know if you want me to create the actual Azure Functions backend code!
