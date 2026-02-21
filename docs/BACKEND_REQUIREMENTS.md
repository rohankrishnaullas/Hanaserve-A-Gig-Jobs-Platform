# Backend Requirements Document - Hanaserve Gig Jobs App

**Version:** 1.0
**Date:** January 2025
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [User Stories](#4-user-stories)
5. [API Contracts](#5-api-contracts)
6. [Security Requirements](#6-security-requirements)
7. [Data Validation Rules](#7-data-validation-rules)
8. [Business Rules](#8-business-rules)
9. [Testing Requirements](#9-testing-requirements)
10. [Glossary](#10-glossary)

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the requirements for building the backend API for the Hanaserve Gig Jobs App. The backend will replace the current localStorage-based implementation with a scalable, persistent, real-time system.

### 1.2 Scope

The backend will provide:
- User authentication and authorization
- Provider and requester profile management
- Job creation and management
- Intelligent matching algorithm
- Real-time notifications
- Location-based services

### 1.3 Current State

| Aspect | Current (v0.1) | Target (v1.0) |
|--------|----------------|---------------|
| Storage | localStorage | Cloud Database (Cosmos DB) |
| Matching | Client-side | Server-side API |
| Notifications | Polling | Real-time (SignalR/WebSocket) |
| Authentication | Session-only | JWT + OAuth |
| Multi-device | No | Yes |

---

## 2. Functional Requirements

### 2.1 Authentication & User Management

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-AUTH-001 | System shall support user registration with email and password | High | Password must be hashed |
| FR-AUTH-002 | System shall support Google OAuth authentication | High | Existing frontend support |
| FR-AUTH-003 | System shall issue JWT tokens upon successful authentication | High | Access + Refresh tokens |
| FR-AUTH-004 | System shall support token refresh without re-login | High | Refresh token validity: 30 days |
| FR-AUTH-005 | System shall support user logout (token invalidation) | Medium | Blacklist tokens on logout |
| FR-AUTH-006 | System shall support password reset via email | Medium | Token expires in 1 hour |
| FR-AUTH-007 | System shall track user sessions and last active timestamp | Low | For analytics |

### 2.2 Provider Management

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-PROV-001 | System shall allow users to register as service providers | High | |
| FR-PROV-002 | System shall store provider profile (name, skills, location, availability) | High | |
| FR-PROV-003 | System shall support adding/removing skills from provider profile | High | Max 20 skills |
| FR-PROV-004 | System shall store provider location with coordinates | High | Lat/Long |
| FR-PROV-005 | System shall support provider availability schedules | Medium | Days + time slots |
| FR-PROV-006 | System shall track provider rating and completed jobs count | Medium | |
| FR-PROV-007 | System shall allow providers to set their active/inactive status | Medium | |
| FR-PROV-008 | System shall store provider's device token for push notifications | High | FCM token |

### 2.3 Requester Management

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-REQ-001 | System shall allow users to register as service requesters | High | |
| FR-REQ-002 | System shall store requester profile (name, location, contact) | High | |
| FR-REQ-003 | System shall support users being both provider and requester | Medium | Dual role |
| FR-REQ-004 | System shall track requester's job history | Low | |

### 2.4 Job Management

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-JOB-001 | System shall allow requesters to create job requests | High | |
| FR-JOB-002 | System shall store job details (title, description, skills needed, location, urgency) | High | |
| FR-JOB-003 | System shall calculate suggested hourly rate based on job type | High | See rate table |
| FR-JOB-004 | System shall support job urgency levels (immediate, today, this-week, flexible) | High | |
| FR-JOB-005 | System shall set job expiration based on urgency | High | |
| FR-JOB-006 | System shall track job status (pending, matched, in-progress, completed, cancelled) | High | |
| FR-JOB-007 | System shall allow requesters to cancel pending jobs | Medium | |
| FR-JOB-008 | System shall allow requesters to mark jobs as completed | High | |
| FR-JOB-009 | System shall support job search and filtering | Low | |
| FR-JOB-010 | System shall automatically expire jobs past their expiration time | Medium | Background job |

### 2.5 Matching System

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-MATCH-001 | System shall find providers matching job skill requirements | High | Core feature |
| FR-MATCH-002 | System shall filter providers by proximity (configurable radius) | High | Default: 10km |
| FR-MATCH-003 | System shall calculate match score based on weighted factors | High | See scoring algorithm |
| FR-MATCH-004 | System shall rank matches by score (highest first) | High | |
| FR-MATCH-005 | System shall create match records for each potential provider | High | |
| FR-MATCH-006 | System shall notify matched providers of new job opportunities | High | Real-time |
| FR-MATCH-007 | System shall allow providers to accept or decline job matches | High | |
| FR-MATCH-008 | System shall assign job to first provider who accepts | High | First-come-first-served |
| FR-MATCH-009 | System shall notify requester when a provider accepts | High | |
| FR-MATCH-010 | System shall cancel remaining matches when job is assigned | Medium | |
| FR-MATCH-011 | System shall support match expiration (auto-decline after timeout) | Medium | Default: 30 minutes |

### 2.6 Notification System

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-NOTIF-001 | System shall send real-time notifications to users | High | SignalR/WebSocket |
| FR-NOTIF-002 | System shall store notification history | Medium | |
| FR-NOTIF-003 | System shall track read/unread status of notifications | Medium | |
| FR-NOTIF-004 | System shall support notification types: new_job, job_accepted, job_completed, job_cancelled | High | |
| FR-NOTIF-005 | System shall support push notifications to mobile devices | Low | Future: FCM |

### 2.7 Skill Management

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-SKILL-001 | System shall maintain a catalog of predefined skill categories | High | |
| FR-SKILL-002 | System shall support skill synonyms and related terms | High | For matching |
| FR-SKILL-003 | System shall suggest related skills based on user input | Medium | AI-assisted |
| FR-SKILL-004 | System shall extract skills from natural language job descriptions | High | NLP |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| NFR-PERF-001 | API response time for simple queries | < 200ms | 95th percentile |
| NFR-PERF-002 | API response time for matching algorithm | < 500ms | 95th percentile |
| NFR-PERF-003 | Real-time notification delivery | < 1 second | From trigger to client |
| NFR-PERF-004 | Concurrent users supported | 1,000 | Initial target |
| NFR-PERF-005 | Database query time | < 100ms | 95th percentile |

### 3.2 Scalability

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| NFR-SCALE-001 | Horizontal scaling capability | Yes | Stateless API design |
| NFR-SCALE-002 | Database auto-scaling | Yes | Cosmos DB RU scaling |
| NFR-SCALE-003 | Max providers in single match query | 10,000 | Within radius |
| NFR-SCALE-004 | Max concurrent WebSocket connections | 5,000 | Per SignalR unit |

### 3.3 Availability

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| NFR-AVAIL-001 | System uptime | 99.5% | Excluding maintenance |
| NFR-AVAIL-002 | Planned maintenance window | < 1 hour/month | |
| NFR-AVAIL-003 | Recovery Time Objective (RTO) | < 1 hour | |
| NFR-AVAIL-004 | Recovery Point Objective (RPO) | < 5 minutes | Data loss tolerance |

### 3.4 Security

| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-SEC-001 | All API endpoints must use HTTPS | TLS 1.2+ |
| NFR-SEC-002 | Passwords must be hashed using bcrypt or Argon2 | Cost factor >= 10 |
| NFR-SEC-003 | JWT tokens must expire | Access: 15min, Refresh: 30 days |
| NFR-SEC-004 | API must implement rate limiting | 100 req/min per user |
| NFR-SEC-005 | Sensitive data must be encrypted at rest | Azure managed keys |
| NFR-SEC-006 | All user input must be sanitized | Prevent injection attacks |
| NFR-SEC-007 | CORS must be configured for allowed origins only | |

### 3.5 Reliability

| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-REL-001 | API must handle failures gracefully | Return appropriate error codes |
| NFR-REL-002 | Database operations must be idempotent where possible | Prevent duplicates |
| NFR-REL-003 | Critical operations must be logged | Audit trail |
| NFR-REL-004 | System must retry failed notifications | Max 3 retries |

### 3.6 Observability

| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-OBS-001 | All API calls must be logged | Request/response, timing |
| NFR-OBS-002 | Application metrics must be collected | Application Insights |
| NFR-OBS-003 | Error rates must be monitored and alerted | > 1% triggers alert |
| NFR-OBS-004 | Health check endpoint must be available | /api/health |

---

## 4. User Stories

### 4.1 Provider Stories

#### US-PROV-001: Register as Provider
**As a** user
**I want to** register as a service provider
**So that** I can offer my skills and earn money

**Acceptance Criteria:**
- User can submit name, email, password, skills, and location
- Skills are validated against known categories
- Location coordinates are captured
- User receives confirmation of registration
- JWT token is returned for subsequent requests

#### US-PROV-002: Update Skills
**As a** provider
**I want to** add or remove skills from my profile
**So that** I receive relevant job matches

**Acceptance Criteria:**
- Provider can add skills from predefined list or custom text
- System suggests related skills
- Maximum 20 skills allowed
- Changes take effect immediately for matching

#### US-PROV-003: Receive Job Notifications
**As a** provider
**I want to** receive notifications when jobs match my skills nearby
**So that** I can respond quickly to opportunities

**Acceptance Criteria:**
- Notification appears within 1 second of job creation
- Notification shows job title, distance, and rate
- Provider can tap to view full job details
- Notification persists until acted upon

#### US-PROV-004: Accept Job
**As a** provider
**I want to** accept a job match
**So that** I can start working

**Acceptance Criteria:**
- One-click acceptance
- Immediate confirmation if successful
- Error message if job already taken
- Job details and requester contact displayed

### 4.2 Requester Stories

#### US-REQ-001: Create Job Request
**As a** requester
**I want to** create a job request by describing what I need
**So that** matching providers can help me

**Acceptance Criteria:**
- Can enter job description in natural language
- System extracts required skills
- System suggests hourly rate
- Can set urgency level
- Confirmation when job is posted

#### US-REQ-002: Track Job Status
**As a** requester
**I want to** see the status of my job request
**So that** I know when someone accepts

**Acceptance Criteria:**
- Real-time status updates
- See number of providers notified
- Notification when provider accepts
- Provider details shown upon match

#### US-REQ-003: Cancel Job
**As a** requester
**I want to** cancel a pending job request
**So that** providers aren't notified for jobs I no longer need

**Acceptance Criteria:**
- Can cancel before provider accepts
- All pending matches are cancelled
- Providers receive cancellation notice
- Job status updated to "cancelled"

---

## 5. API Contracts

### 5.1 Base URL
```
Production: https://api.hanaserve.com/api
Development: http://localhost:7071/api
```

### 5.2 Common Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Request-ID: <uuid>  (optional, for tracing)
```

### 5.3 Common Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-01-18T10:00:00Z",
    "requestId": "uuid"
  }
}
```

### 5.4 Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-18T10:00:00Z",
    "requestId": "uuid"
  }
}
```

### 5.5 Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "name": "John Doe",
  "role": "provider"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "provider",
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| EMAIL_EXISTS | 409 | Email already registered |
| INVALID_EMAIL | 400 | Email format invalid |
| WEAK_PASSWORD | 400 | Password doesn't meet requirements |
| INVALID_ROLE | 400 | Role must be 'provider' or 'requester' |

---

#### POST /api/auth/login
Authenticate user and get tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_CREDENTIALS | 401 | Email or password incorrect |
| ACCOUNT_LOCKED | 403 | Too many failed attempts |

---

#### POST /api/auth/google
Authenticate with Google OAuth.

**Request:**
```json
{
  "idToken": "google_id_token_from_client"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://...",
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 900,
    "isNewUser": false
  }
}
```

---

#### POST /api/auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

---

### 5.6 Provider Endpoints

#### POST /api/providers
Create or update provider profile.

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+919876543210",
  "skills": ["dog walking", "pet sitting", "gardening"],
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "city": "Bangalore",
    "state": "Karnataka",
    "address": "123 MG Road"
  },
  "availability": {
    "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "timeSlots": ["morning", "afternoon"]
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "providerId": "prov_abc123",
    "userId": "user_abc123",
    "name": "John Doe",
    "skills": ["dog walking", "pet sitting", "gardening"],
    "skillCategories": ["pet care"],
    "location": { ... },
    "availability": { ... },
    "rating": 0,
    "completedJobs": 0,
    "isActive": true,
    "createdAt": "2025-01-18T10:00:00Z"
  }
}
```

---

#### GET /api/providers/{providerId}
Get provider profile.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "providerId": "prov_abc123",
    "name": "John Doe",
    "skills": ["dog walking", "pet sitting"],
    "location": {
      "city": "Bangalore",
      "state": "Karnataka"
    },
    "rating": 4.5,
    "completedJobs": 12,
    "isActive": true
  }
}
```

---

#### GET /api/providers/{providerId}/matches
Get pending job matches for provider.

**Query Parameters:**
- `status` (optional): Filter by status (pending, accepted, declined)
- `limit` (optional): Max results (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "matchId": "match_xyz789",
        "jobId": "job_def456",
        "job": {
          "title": "Dog Walking Needed",
          "description": "Need someone to walk my labrador",
          "skills": ["dog walking"],
          "urgency": "today",
          "estimatedRate": 300,
          "estimatedDuration": 60,
          "location": {
            "city": "Bangalore",
            "distance": 2.5
          },
          "requesterName": "Jane Smith"
        },
        "matchScore": 0.85,
        "distance": 2.5,
        "status": "pending",
        "expiresAt": "2025-01-18T11:00:00Z",
        "createdAt": "2025-01-18T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

---

#### POST /api/providers/{providerId}/accept-match
Accept a job match.

**Request:**
```json
{
  "matchId": "match_xyz789"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "matchId": "match_xyz789",
    "jobId": "job_def456",
    "status": "accepted",
    "job": {
      "title": "Dog Walking Needed",
      "requesterName": "Jane Smith",
      "requesterPhone": "+919876543210",
      "location": {
        "address": "456 Park Street, Bangalore",
        "latitude": 12.9720,
        "longitude": 77.5950
      }
    },
    "acceptedAt": "2025-01-18T10:35:00Z"
  }
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| MATCH_NOT_FOUND | 404 | Match doesn't exist |
| MATCH_EXPIRED | 410 | Match has expired |
| JOB_ALREADY_TAKEN | 409 | Another provider accepted first |

---

#### POST /api/providers/{providerId}/decline-match
Decline a job match.

**Request:**
```json
{
  "matchId": "match_xyz789",
  "reason": "not_available"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "matchId": "match_xyz789",
    "status": "declined"
  }
}
```

---

### 5.7 Job Endpoints

#### POST /api/jobs
Create a new job request.

**Request:**
```json
{
  "title": "Dog Walking Needed",
  "description": "I need someone to walk my labrador for about an hour in the evening",
  "skills": ["dog walking"],
  "urgency": "today",
  "estimatedDuration": 60,
  "location": {
    "latitude": 12.9720,
    "longitude": 77.5950,
    "city": "Bangalore",
    "state": "Karnataka",
    "address": "456 Park Street"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "jobId": "job_def456",
    "requesterId": "req_abc123",
    "title": "Dog Walking Needed",
    "description": "I need someone to walk my labrador...",
    "skills": ["dog walking"],
    "skillCategories": ["pet care"],
    "urgency": "today",
    "estimatedDuration": 60,
    "estimatedRate": 300,
    "status": "pending",
    "location": { ... },
    "matchesFound": 5,
    "expiresAt": "2025-01-18T23:59:59Z",
    "createdAt": "2025-01-18T10:00:00Z"
  }
}
```

---

#### GET /api/jobs/{jobId}
Get job details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobId": "job_def456",
    "title": "Dog Walking Needed",
    "description": "...",
    "skills": ["dog walking"],
    "urgency": "today",
    "estimatedDuration": 60,
    "estimatedRate": 300,
    "status": "matched",
    "location": { ... },
    "requester": {
      "name": "Jane Smith"
    },
    "matchedProvider": {
      "providerId": "prov_abc123",
      "name": "John Doe",
      "phone": "+919876543210",
      "rating": 4.5
    },
    "createdAt": "2025-01-18T10:00:00Z",
    "matchedAt": "2025-01-18T10:35:00Z"
  }
}
```

---

#### GET /api/jobs
Get jobs for current user (as requester).

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Max results (default: 20)
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobs": [ ... ],
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### PUT /api/jobs/{jobId}/cancel
Cancel a pending job.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobId": "job_def456",
    "status": "cancelled",
    "cancelledAt": "2025-01-18T10:45:00Z"
  }
}
```

---

#### PUT /api/jobs/{jobId}/complete
Mark job as completed.

**Request:**
```json
{
  "rating": 5,
  "review": "Great service, very punctual!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobId": "job_def456",
    "status": "completed",
    "completedAt": "2025-01-18T12:00:00Z",
    "rating": 5
  }
}
```

---

### 5.8 Notification Endpoints

#### GET /api/notifications
Get notifications for current user.

**Query Parameters:**
- `unreadOnly` (optional): Only unread notifications (default: false)
- `limit` (optional): Max results (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notificationId": "notif_abc123",
        "type": "new_job",
        "title": "New Job Match",
        "message": "A new dog walking job is available nearby",
        "data": {
          "jobId": "job_def456",
          "matchId": "match_xyz789"
        },
        "read": false,
        "createdAt": "2025-01-18T10:30:00Z"
      }
    ],
    "unreadCount": 3,
    "total": 25
  }
}
```

---

#### PUT /api/notifications/{notificationId}/read
Mark notification as read.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notificationId": "notif_abc123",
    "read": true
  }
}
```

---

### 5.9 Skill Endpoints

#### GET /api/skills
Get available skill categories and terms.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "pet_care",
        "name": "Pet Care",
        "skills": ["dog walking", "pet sitting", "animal care", "dog care", "cat care", "pet feeding"]
      },
      {
        "id": "childcare",
        "name": "Childcare",
        "skills": ["babysitting", "child care", "tutoring", "homework help"]
      },
      {
        "id": "shopping",
        "name": "Shopping & Errands",
        "skills": ["grocery shopping", "errands", "shopping", "purchases"]
      },
      {
        "id": "companionship",
        "name": "Companionship",
        "skills": ["companionship", "elderly care", "visiting", "chatting"]
      },
      {
        "id": "tutoring",
        "name": "Tutoring",
        "skills": ["tutoring", "teaching", "homework help", "education"]
      },
      {
        "id": "cleaning",
        "name": "Cleaning",
        "skills": ["cleaning", "housekeeping", "tidying", "organizing"]
      },
      {
        "id": "delivery",
        "name": "Delivery",
        "skills": ["delivery", "pickup", "transport", "moving"]
      },
      {
        "id": "tech_help",
        "name": "Tech Help",
        "skills": ["computer help", "tech support", "phone help", "internet help"]
      }
    ]
  }
}
```

---

#### POST /api/skills/extract
Extract skills from natural language text.

**Request:**
```json
{
  "text": "I need someone to walk my dog and maybe help with some grocery shopping"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "extractedSkills": ["dog walking", "grocery shopping"],
    "categories": ["pet_care", "shopping"],
    "confidence": 0.9
  }
}
```

---

#### POST /api/skills/suggest
Get skill suggestions based on existing skills.

**Request:**
```json
{
  "skills": ["dog walking"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": ["pet sitting", "animal care", "cat care"],
    "basedOn": "pet_care"
  }
}
```

---

### 5.10 Utility Endpoints

#### GET /api/health
Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-18T10:00:00Z",
  "services": {
    "database": "healthy",
    "signalr": "healthy"
  }
}
```

---

#### POST /api/rates/calculate
Calculate suggested rate for a job.

**Request:**
```json
{
  "description": "I need someone to walk my dog",
  "skills": ["dog walking"],
  "duration": 60,
  "urgency": "immediate"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "currency": "INR",
    "hourlyRate": {
      "min": 200,
      "max": 400,
      "suggested": 300
    },
    "totalEstimate": {
      "min": 200,
      "max": 400,
      "suggested": 300
    },
    "factors": {
      "baseRate": 250,
      "urgencyMultiplier": 1.2,
      "skillComplexity": 1.0
    }
  }
}
```

---

## 6. Security Requirements

### 6.1 Authentication

| ID | Requirement | Implementation |
|----|-------------|----------------|
| SEC-AUTH-001 | All protected endpoints require valid JWT | Authorization header |
| SEC-AUTH-002 | JWT must contain user ID, role, and expiration | Standard claims |
| SEC-AUTH-003 | Access tokens expire in 15 minutes | Short-lived |
| SEC-AUTH-004 | Refresh tokens expire in 30 days | Stored securely |
| SEC-AUTH-005 | Failed login attempts tracked and limited | 5 attempts, 15 min lockout |

### 6.2 Authorization

| ID | Requirement | Implementation |
|----|-------------|----------------|
| SEC-AUTHZ-001 | Providers can only access their own matches | Middleware check |
| SEC-AUTHZ-002 | Requesters can only access their own jobs | Middleware check |
| SEC-AUTHZ-003 | Users can only modify their own profiles | Resource ownership |
| SEC-AUTHZ-004 | Admin endpoints require admin role | Role-based access |

### 6.3 Data Protection

| ID | Requirement | Implementation |
|----|-------------|----------------|
| SEC-DATA-001 | Passwords hashed with bcrypt (cost 12) | Never store plaintext |
| SEC-DATA-002 | PII encrypted at rest | Azure encryption |
| SEC-DATA-003 | Phone numbers partially masked in responses | Show last 4 digits only |
| SEC-DATA-004 | Location precision limited for privacy | 100m accuracy in lists |

### 6.4 Input Validation

| ID | Requirement | Implementation |
|----|-------------|----------------|
| SEC-INPUT-001 | All input must be validated | JSON Schema validation |
| SEC-INPUT-002 | SQL injection prevention | Parameterized queries |
| SEC-INPUT-003 | XSS prevention | Input sanitization |
| SEC-INPUT-004 | Request size limits | Max 1MB payload |

### 6.5 Rate Limiting

| ID | Requirement | Limit |
|----|-------------|-------|
| SEC-RATE-001 | General API calls | 100/minute per user |
| SEC-RATE-002 | Login attempts | 5/15 minutes per IP |
| SEC-RATE-003 | Registration | 3/hour per IP |
| SEC-RATE-004 | Job creation | 10/hour per user |

---

## 7. Data Validation Rules

### 7.1 User Data

| Field | Rules |
|-------|-------|
| email | Valid email format, max 255 chars, unique |
| password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| name | 2-100 chars, alphanumeric + spaces |
| phone | Valid phone format with country code |

### 7.2 Provider Data

| Field | Rules |
|-------|-------|
| skills | Array, 1-20 items, each 2-50 chars |
| location.latitude | -90 to 90 |
| location.longitude | -180 to 180 |
| location.city | 2-100 chars |
| availability.daysOfWeek | Array of valid day names |
| availability.timeSlots | Array: morning, afternoon, evening, night |

### 7.3 Job Data

| Field | Rules |
|-------|-------|
| title | 5-100 chars |
| description | 10-1000 chars |
| skills | Array, 1-5 items |
| urgency | Enum: immediate, today, this-week, flexible |
| estimatedDuration | 15-480 minutes |
| location | Required, valid coordinates |

### 7.4 Match Data

| Field | Rules |
|-------|-------|
| matchScore | 0.0 to 1.0 |
| distance | 0 to max radius (km) |
| status | Enum: pending, accepted, declined, expired |

---

## 8. Business Rules

### 8.1 Matching Algorithm

```
Match Score = (Skill Score × 0.40) + (Distance Score × 0.30) + (Rating Score × 0.20) + (Availability Score × 0.10)

Where:
- Skill Score = (matching skills / required skills)
- Distance Score = max(0, 1 - (distance / max_radius))
- Rating Score = provider_rating / 5.0
- Availability Score = 1.0 if available, 0.0 if not
```

### 8.2 Rate Calculation

| Job Category | Hourly Rate (INR) |
|--------------|-------------------|
| Tutoring | 400 - 800 (suggested: 600) |
| Babysitting | 300 - 500 (suggested: 400) |
| Pet Care | 200 - 400 (suggested: 300) |
| Companionship | 200 - 350 (suggested: 275) |
| Shopping/Errands | 200 - 300 (suggested: 250) |
| Cleaning | 300 - 500 (suggested: 400) |
| Tech Help | 400 - 800 (suggested: 500) |
| Default | 200 - 400 (suggested: 300) |

**Urgency Multiplier:**
- Immediate: 1.3x
- Today: 1.1x
- This Week: 1.0x
- Flexible: 0.9x

### 8.3 Job Expiration

| Urgency | Expires After |
|---------|---------------|
| Immediate | 4 hours |
| Today | End of day (midnight) |
| This Week | 7 days |
| Flexible | 14 days |

### 8.4 Match Expiration

- Individual matches expire 30 minutes after creation
- Expired matches auto-decline
- Provider can't accept expired matches

### 8.5 Distance Limits

- Default matching radius: 10 km
- Maximum matching radius: 50 km
- Providers outside radius not matched

---

## 9. Testing Requirements

### 9.1 Unit Testing

| Requirement | Coverage Target |
|-------------|-----------------|
| All API handlers | 80% |
| Matching algorithm | 95% |
| Validation functions | 90% |
| Utility functions | 85% |

### 9.2 Integration Testing

| Test Category | Description |
|---------------|-------------|
| Auth flow | Register, login, refresh, logout |
| Provider flow | Create profile, update, get matches, accept |
| Requester flow | Create job, track status, complete |
| Matching flow | Job creation triggers matching |
| Notification flow | Real-time delivery |

### 9.3 Load Testing

| Scenario | Target |
|----------|--------|
| Concurrent users | 1,000 users |
| Requests per second | 500 RPS |
| Match calculation | 100 jobs/minute with 10,000 providers |
| WebSocket connections | 5,000 concurrent |

### 9.4 Security Testing

| Test Type | Description |
|-----------|-------------|
| Authentication bypass | Test protected endpoints without token |
| Authorization bypass | Test accessing other users' resources |
| Injection attacks | SQL, NoSQL, XSS |
| Rate limiting | Verify limits enforced |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| Provider | User who offers services (e.g., dog walker) |
| Requester | User who needs services (e.g., dog owner) |
| Job | A service request created by a requester |
| Match | A potential assignment of a provider to a job |
| Skill | A service capability (e.g., "dog walking") |
| Skill Category | Grouping of related skills (e.g., "Pet Care") |
| Match Score | 0-1 rating of how well a provider fits a job |
| Urgency | How soon the job needs to be done |

---

## Appendix A: HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, DELETE |
| 201 | Successful POST (resource created) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 410 | Gone (expired resource) |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

---

## Appendix B: WebSocket Events

### Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_job_match` | `{ matchId, jobId, job, matchScore }` | New job matches provider |
| `job_accepted` | `{ jobId, providerId, provider }` | Provider accepted the job |
| `job_cancelled` | `{ jobId, reason }` | Job was cancelled |
| `match_expired` | `{ matchId }` | Match expired |

### Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe` | `{ userId }` | Subscribe to notifications |
| `unsubscribe` | `{ userId }` | Unsubscribe |
| `ping` | `{}` | Keep-alive |

---

*End of Document*
