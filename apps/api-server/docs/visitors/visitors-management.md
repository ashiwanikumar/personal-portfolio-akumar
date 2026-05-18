# Visitors Management System (Backend)

## Overview

The Visitors Management System backend provides robust analytics, real-time tracking, and management of website visitors for the SSChouhan platform. It exposes secure RESTful APIs for tracking, analyzing, and managing visitor data, supporting both public tracking and admin analytics.

---

## Features

- **Real-time Visitor Tracking**: Track and analyze live visitor activity.
- **Comprehensive Analytics**: Geographic, source, device, and event-based analytics.
- **Session & Event Tracking**: Custom event and session analytics.
- **Bulk Data Operations**: Paginated queries and efficient data aggregation.
- **Security**: Role-based access for analytics endpoints; public endpoints for tracking only.

---

## Data Model

Visitor records are stored in MongoDB using the following schema (simplified):

```js
{
  sessionId: String,         // Unique session identifier
  fingerprint: String,       // Device/browser fingerprint
  ip: String,                // IP address
  country: String,
  countryCode: String,
  city: String,
  region: String,
  latitude: Number,
  longitude: Number,
  timezone: String,
  isp: String,
  browser: String,
  browserVersion: String,
  os: String,
  osVersion: String,
  device: String,
  deviceType: "mobile" | "tablet" | "desktop" | "unknown",
  screenResolution: String,
  url: String,               // Visited URL
  path: String,              // URL path
  referrer: String,
  referrerDomain: String,
  utm_source: String,        // Traffic source
  utm_medium: String,
  utm_campaign: String,
  utm_term: String,
  utm_content: String,
  eventType: String,         // Custom event type
  eventName: String,         // Custom event name
  eventData: Object,         // Custom event data
  userAgent: String,
  language: String,
  cookieEnabled: Boolean,
  javascriptEnabled: Boolean,
  pageLoadTime: Number,
  connectionType: String,
  meta: Object,              // Additional metadata
  isBot: Boolean,
  isUnique: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

All analytics endpoints require authentication and super admin privileges. Tracking endpoints are public.

### Analytics & Management (Protected)
- `GET /api/visitors/paginated` — Paginated visitor list with search
- `GET /api/visitors/analytics/overview` — Analytics overview (totals, top countries/sources)
- `GET /api/visitors/analytics/urls` — URL performance analytics
- `GET /api/visitors/analytics/geographic` — Geographic distribution
- `GET /api/visitors/analytics/sources` — Traffic source analytics
- `GET /api/visitors/analytics/realtime` — Real-time activity (last 24h)
- `GET /api/visitors/analytics/events` — Custom event analytics

### Tracking (Public)
- `POST /api/visitors/track` — Comprehensive visitor tracking (all metadata, events, UTM, etc.)
- `POST /api/visitors/page-view` — Simplified page view tracking

---

## Technical Details

- **Pagination & Search**: Supports pagination and search by country or IP.
- **Aggregation**: Uses MongoDB aggregation for analytics (grouping by URL, country, source, etc.).
- **Session & Event Handling**: Tracks sessions, custom events, and page views.
- **Bot Detection**: Identifies bots via user-agent patterns.
- **Geo & Device Enrichment**: Enriches records with geolocation and device info.
- **Indexes**: Multiple indexes for fast queries (createdAt, country, source, sessionId, etc.).
- **Security**: Analytics endpoints require authentication and super admin role.

---

## Example: Tracking a Visitor

```http
POST /api/visitors/track
Content-Type: application/json

{
  "url": "https://example.com/page",
  "referrer": "https://google.com",
  "screenResolution": "1920x1080",
  "sessionId": "...",
  "fingerprint": "...",
  "utm_source": "google",
  "eventType": "custom_event",
  "eventName": "signup",
  "eventData": { "plan": "pro" }
}
```

---

## Security & Privacy

- **Role-based Access**: Only super admins can access analytics endpoints.
- **Data Protection**: Sensitive data is protected and not exposed via public endpoints.
- **Bot Filtering**: Automated bot traffic is flagged and can be filtered.
- **GDPR Compliance**: Supports anonymization and data minimization.

---

## File Locations

- **Routes**: `server/src/routes/visitor/visitor.js`
- **Controllers**: `server/src/controllers/visitor/visitorController.js`
- **Services**: `server/src/services/visitor/visitorService.js`
- **Model**: `server/src/models/visitor/visitor.js`

---

*For more details, see the respective source files or contact the backend team.*
