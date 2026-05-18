# Ask SSChouhan Analytics APIs

This document provides comprehensive documentation for the analytics APIs available for the Ask SSChouhan citizen query system.

## Overview

The analytics APIs provide detailed insights into citizen query submissions, including duplicate detection, submission patterns, geographical distribution, device usage, and citizen demographics.

## Authentication

All analytics endpoints require authentication and super admin privileges:
- **Authentication**: Required (`authCheck` middleware)
- **Authorization**: Super Admin only (`superAdminCheck` middleware)

## Base URL

```
GET /api/citizen-services/ask-sschouhan/analytics/{endpoint}
```

## Analytics Endpoints

### 1. Duplicate Analytics

**Endpoint**: `GET /api/citizen-services/ask-sschouhan/analytics/duplicates`

**Description**: Identifies and analyzes duplicate submissions based on email, phone, and subject similarity.

**Query Parameters**:
- `timeRange` (optional): Time range for analysis (`7d`, `30d`, `90d`, `1y`). Default: `30d`

**Response**:
```json
{
  "analytics": {
    "totalDuplicateSubmissions": 25,
    "uniqueDuplicateUsers": 15,
    "duplicateGroups": 8,
    "duplicateBreakdown": [
      {
        "email": "user@example.com",
        "phone": "9876543210",
        "subject": "Road Repair Request",
        "count": 3,
        "submissions": [
          {
            "id": "query_id_1",
            "submittedAt": "2024-01-15T10:30:00Z",
            "status": "pending"
          }
        ]
      }
    ]
  },
  "status": "success"
}
```

### 2. Submission Time Analytics

**Endpoint**: `GET /api/citizen-services/ask-sschouhan/analytics/submission-times`

**Description**: Analyzes submission patterns by time of day, day of week, and identifies peak submission times.

**Query Parameters**:
- `timeRange` (optional): Time range for analysis (`7d`, `30d`, `90d`, `1y`). Default: `30d`
- `groupBy` (optional): Grouping interval (`hour`, `day`, `week`). Default: `hour`

**Response**:
```json
{
  "analytics": {
    "timeDistribution": [
      {
        "_id": {
          "hour": 14,
          "day": 2
        },
        "count": 45
      }
    ],
    "peakSubmissionTimes": [
      {
        "_id": 14,
        "count": 156
      }
    ],
    "totalSubmissions": 1250,
    "averageSubmissionsPerDay": 41.67
  },
  "status": "success"
}
```

### 3. District Analytics

**Endpoint**: `GET /api/citizen-services/ask-sschouhan/analytics/districts`

**Description**: Provides geographical analysis of submissions by state and district.

**Query Parameters**:
- `state` (optional): Filter by specific state
- `timeRange` (optional): Time range for analysis (`7d`, `30d`, `90d`, `1y`). Default: `30d`

**Response**:
```json
{
  "analytics": {
    "districtBreakdown": [
      {
        "state": "Maharashtra",
        "district": "Mumbai",
        "totalSubmissions": 150,
        "resolved": 120,
        "pending": 30,
        "resolutionRate": 80.0,
        "categories": ["infrastructure", "healthcare", "education"]
      }
    ],
    "stateBreakdown": [
      {
        "state": "Maharashtra",
        "totalSubmissions": 500,
        "resolved": 400,
        "pending": 100,
        "resolutionRate": 80.0
      }
    ],
    "topDistricts": [...],
    "topStates": [...]
  },
  "status": "success"
}
```

### 4. Device Analytics

**Endpoint**: `GET /api/citizen-services/ask-sschouhan/analytics/devices`

**Description**: Analyzes device types, browsers, operating systems, and screen sizes used for submissions.

**Query Parameters**:
- `timeRange` (optional): Time range for analysis (`7d`, `30d`, `90d`, `1y`). Default: `30d`

**Response**:
```json
{
  "analytics": {
    "deviceTypes": [
      {
        "_id": "mobile",
        "count": 850
      },
      {
        "_id": "desktop",
        "count": 350
      }
    ],
    "browsers": [
      {
        "_id": "Chrome",
        "count": 600
      }
    ],
    "operatingSystems": [
      {
        "_id": "Android",
        "count": 500
      }
    ],
    "screenSizes": [
      {
        "_id": {
          "width": 375,
          "height": 667
        },
        "count": 300
      }
    ],
    "totalWithDeviceInfo": 1200
  },
  "status": "success"
}
```

### 5. Citizen Profile Analytics

**Endpoint**: `GET /api/citizen-services/ask-sschouhan/analytics/citizen-profiles`

**Description**: Analyzes citizen demographics including age groups, gender, occupation, education, and special groups.

**Query Parameters**:
- `timeRange` (optional): Time range for analysis (`7d`, `30d`, `90d`, `1y`). Default: `30d`

**Response**:
```json
{
  "analytics": {
    "ageGroups": [
      {
        "_id": "30-49",
        "count": 450,
        "avgAge": 38.5
      }
    ],
    "genderDistribution": [
      {
        "_id": "male",
        "count": 600
      }
    ],
    "topOccupations": [
      {
        "_id": "Farmer",
        "count": 200
      }
    ],
    "educationLevels": [
      {
        "_id": "secondary",
        "count": 300
      }
    ],
    "specialGroups": {
      "farmers": 200,
      "students": 150,
      "seniorCitizens": 50,
      "disabled": 25
    }
  },
  "status": "success"
}
```

### 6. Analytics Dashboard

**Endpoint**: `GET /api/citizen-services/ask-sschouhan/analytics/dashboard`

**Description**: Comprehensive dashboard with overview statistics, category breakdown, state breakdown, and daily trends.

**Query Parameters**:
- `timeRange` (optional): Time range for analysis (`7d`, `30d`, `90d`, `1y`). Default: `30d`

**Response**:
```json
{
  "dashboard": {
    "overview": {
      "totalSubmissions": 1250,
      "resolved": 1000,
      "pending": 200,
      "escalated": 50,
      "resolutionRate": 80.0,
      "avgResponseTime": 24
    },
    "categoryBreakdown": [
      {
        "category": "agriculture",
        "count": 300,
        "resolved": 250,
        "resolutionRate": 83.33
      }
    ],
    "stateBreakdown": [
      {
        "state": "Maharashtra",
        "count": 500,
        "resolved": 400,
        "resolutionRate": 80.0
      }
    ],
    "dailyTrend": [
      {
        "date": "2024-01-15",
        "submissions": 45
      }
    ]
  },
  "status": "success"
}
```

### 7. Trend Analytics

**Endpoint**: `GET /api/citizen-services/ask-sschouhan/analytics/trends`

**Description**: Provides trend analysis for various metrics over time with different intervals.

**Query Parameters**:
- `metric` (optional): Metric to analyze (`submissions`, `resolved`, `escalated`, `urgent`). Default: `submissions`
- `timeRange` (optional): Time range for analysis (`7d`, `30d`, `90d`, `1y`). Default: `30d`
- `interval` (optional): Time interval (`hour`, `day`, `week`, `month`). Default: `day`

**Response**:
```json
{
  "analytics": {
    "metric": "submissions",
    "interval": "day",
    "timeRange": "30d",
    "trend": [
      {
        "date": "2024-01-15",
        "count": 45
      }
    ],
    "total": 1250,
    "average": 41.67
  },
  "status": "success"
}
```

## Time Range Options

All analytics endpoints support the following time range options:

- `7d`: Last 7 days
- `30d`: Last 30 days (default)
- `90d`: Last 90 days
- `1y`: Last 1 year

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "status": "error"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (super admin access required)
- `500`: Internal Server Error

## Usage Examples

### Get duplicate submissions for the last 7 days
```bash
curl -X GET "http://localhost:3000/api/citizen-services/ask-sschouhan/analytics/duplicates?timeRange=7d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get submission time analytics grouped by day
```bash
curl -X GET "http://localhost:3000/api/citizen-services/ask-sschouhan/analytics/submission-times?timeRange=30d&groupBy=day" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get district analytics for Maharashtra
```bash
curl -X GET "http://localhost:3000/api/citizen-services/ask-sschouhan/analytics/districts?state=Maharashtra&timeRange=90d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get trend analytics for resolved queries
```bash
curl -X GET "http://localhost:3000/api/citizen-services/ask-sschouhan/analytics/trends?metric=resolved&interval=week&timeRange=90d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Data Privacy

- All analytics data is aggregated and anonymized
- No personally identifiable information is exposed in analytics responses
- Analytics are based on existing query data and respect data privacy regulations
- Access is restricted to super admin users only

## Performance Considerations

- Analytics queries use MongoDB aggregation pipelines for optimal performance
- Large datasets are processed efficiently using database indexes
- Time range filters help limit data processing scope
- Consider caching analytics results for frequently accessed data

## Integration Notes

- All endpoints return JSON responses
- Consistent error handling across all endpoints
- Query parameters are optional with sensible defaults
- Responses include metadata for easy integration with frontend dashboards 