# Technical Information Collector

A comprehensive utility for collecting detailed technical information from HTTP requests and client devices.

## 📁 Folder Structure

```
technical-info-collector/
├── technicalInfoCollector.js      # Main utility functions
├── advancedTechnicalInfoCollector.js  # Advanced collector with enhanced features
├── geoLocationService.js          # IP geolocation service with multiple providers
├── client-collector.js            # Client-side collection utilities
├── test-integration.js            # Integration tests
├── advanced-example-usage.js      # Advanced usage examples
└── README.md                      # This documentation
```

## 🚀 Features

- **Advanced Browser Detection**: Detects Chrome, Firefox, Safari, Edge, Opera, Brave, and more
- **Device Fingerprinting**: Creates unique device fingerprints for analytics
- **Security Threat Detection**: Identifies bots, proxies, VPNs, and suspicious patterns
- **Network Analysis**: Collects IP, location, ISP, and ASN information
- **Performance Metrics**: Screen resolution, pixel ratio, and device capabilities
- **UTM Tracking**: Automatic UTM parameter collection
- **Middleware Support**: Express.js middleware for easy integration
- **Geolocation Services**: Multiple IP geolocation providers with fallbacks

## 📖 Quick Start

### Basic Usage

```javascript
const { collectTechnicalInfo } = require('./utils/technical-info-collector/technicalInfoCollector');

// In your controller
app.post('/contact', (req, res) => {
  const technicalInfo = collectTechnicalInfo(req, req.body.deviceInfo);
  
  // Save to database
  const contact = new Contact({
    ...req.body,
    technicalInfo
  });
  
  contact.save();
});
```

### Using Advanced Collector

```javascript
const { collectAdvancedTechnicalInfo } = require('./utils/technical-info-collector/advancedTechnicalInfoCollector');

// In your controller
app.post('/contact', async (req, res) => {
  const technicalInfo = await collectAdvancedTechnicalInfo(req, req.body.deviceInfo);
  
  // Save to database with enhanced technical info
  const contact = new Contact({
    ...req.body,
    technicalInfo
  });
  
  contact.save();
});
```

### Using Geolocation Service

```javascript
const GeoLocationService = require('./utils/technical-info-collector/geoLocationService');

// Get geolocation data for an IP
const geoData = await GeoLocationService.getGeoLocationData('8.8.8.8');
console.log('ISP:', geoData.isp);
console.log('Country:', geoData.country);
console.log('City:', geoData.city);

// Get device and location info from request
const deviceAndLocation = await GeoLocationService.getDeviceAndLocationInfo(req);
```

### Using Middleware

```javascript
const { technicalInfoMiddleware } = require('./utils/technical-info-collector/technicalInfoCollector');

// Apply to specific routes
app.post('/contact', technicalInfoMiddleware, (req, res) => {
  // req.technicalInfo is now available
  const contact = new Contact({
    ...req.body,
    technicalInfo: req.technicalInfo
  });
});
```

## 🔧 API Reference

### `collectTechnicalInfo(req, clientDeviceInfo)`

Collects comprehensive technical information from an HTTP request.

**Parameters:**

- `req` (Object): Express request object
- `clientDeviceInfo` (Object, optional): Client-side device information

**Returns:**
```javascript
{
  ip: {
    ipv4: "192.168.1.1",
    ipv6: "2001:db8::1"
  },
  location: {
    country: "India",
    countryCode: "IN",
    region: "Maharashtra",
    city: "Mumbai",
    postal: "400001",
    coordinates: null,
    timezone: "Asia/Kolkata"
  },
  network: {
    isp: "BSNL",
    organization: "BSNL",
    asn: "AS9829",
    domain: "example.com"
  },
  browser: {
    userAgent: "Mozilla/5.0...",
    language: "en-US,en;q=0.9",
    name: "Chrome",
    version: "120.0",
    engine: "Blink"
  },
  device: {
    type: "mobile",
    model: "iPhone 14",
    vendor: "Apple",
    os: {
      name: "iOS",
      version: "17.0"
    },
    screen: {
      width: 390,
      height: 844,
      pixelRatio: 3
    }
  },
  security: {
    isProxy: false,
    isVPN: false,
    isTor: false,
    isBot: false,
    isSuspicious: false,
    riskScore: 5,
    flags: []
  },
  fingerprint: "a1b2c3d4e5f6...",
  metadata: {
    collectedAt: "2024-01-15T10:30:00Z",
    referrer: "https://google.com",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "winter2024",
    formVersion: "1.0",
    submissionMethod: "web"
  }
}
```

### `collectAdvancedTechnicalInfo(req, clientDeviceInfo)`

Advanced version with enhanced security detection, fingerprinting, and geolocation.

**Features:**
- Enhanced bot detection
- Advanced security threat analysis
- Device fingerprinting with uniqueness scoring
- Network quality analysis
- Privacy preference detection
- WebRTC leak detection

### `GeoLocationService`

Provides IP geolocation services with multiple fallback providers.

**Methods:**
- `getGeoLocationData(ip)` - Get comprehensive geolocation data
- `getDeviceAndLocationInfo(req)` - Get device and location info from request
- `extractIPAddress(req)` - Extract IP address from request
- `parseUserAgent(userAgent)` - Parse user agent string
- `testServices()` - Test all geolocation services

**Geolocation Providers:**
1. **ip-api.com** (Primary)
2. **ipapi.co** (Fallback 1)
3. **ipinfo.io** (Fallback 2)

### `technicalInfoMiddleware(req, res, next)`

Express middleware that automatically collects technical information and attaches it to the request object.

**Usage:**
```javascript
app.use('/api', technicalInfoMiddleware);

// In your route handler
app.post('/contact', (req, res) => {
  console.log(req.technicalInfo); // Technical info is available here
});
```

## 🔒 Security Features

### Threat Detection
- **Bot Detection**: Identifies automated requests and crawlers
- **Proxy/VPN Detection**: Detects proxy servers and VPN connections
- **Tor Detection**: Identifies Tor network connections
- **Risk Scoring**: 0-100 risk assessment based on multiple factors

### Device Fingerprinting
- **Canvas Fingerprinting**: Unique device identification
- **WebGL Fingerprinting**: Graphics card identification
- **Audio Fingerprinting**: Audio context identification
- **Font Detection**: Installed font enumeration

## 📊 Analytics Features

### Browser Statistics
- Usage patterns across browsers
- Version distribution
- Engine detection

### Device Statistics
- Mobile vs desktop vs tablet usage
- Operating system distribution
- Screen resolution analytics

### Geographic Analysis
- Country and region-based analytics
- ISP distribution
- Network quality metrics

### Security Analytics
- Threat patterns and risk distribution
- Bot activity monitoring
- Proxy/VPN usage tracking

## 🛠️ Installation & Setup

### Prerequisites
```bash
npm install axios ua-parser-js
```

### Basic Setup
```javascript
// In your main app file
const { technicalInfoMiddleware } = require('./utils/technical-info-collector/technicalInfoCollector');

// Apply middleware to routes that need technical info
app.use('/api/forms', technicalInfoMiddleware);
```

### Advanced Setup
```javascript
// For enhanced security and analytics
const { advancedTechnicalInfoMiddleware } = require('./utils/technical-info-collector/advancedTechnicalInfoCollector');

// Apply with options
app.use('/api', advancedTechnicalInfoMiddleware({
  cache: true,
  rateLimit: true,
  respectPrivacy: true
}));
```

## 📝 Examples

### Contact Form Integration
```javascript
app.post('/api/contact', async (req, res) => {
  const technicalInfo = await collectAdvancedTechnicalInfo(req, req.body.deviceInfo);
  
  // Check security threats
  if (technicalInfo.security.riskScore > 80) {
    return res.status(403).json({ error: 'Security check failed' });
  }
  
  // Save contact with technical context
  const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    technicalInfo: {
      fingerprint: technicalInfo.fingerprint.hash,
      location: technicalInfo.network.location,
      device: technicalInfo.device.type,
      browser: technicalInfo.browser.name,
      security: {
        riskScore: technicalInfo.security.riskScore,
        flags: technicalInfo.security.flags
      }
    }
  });
  
  await contact.save();
  res.json({ success: true });
});
```

### Newsletter Signup with Geolocation
```javascript
app.post('/api/newsletter', async (req, res) => {
  const geoData = await GeoLocationService.getGeoLocationData(req.ip);
  
  const subscriber = new NewsletterSubscriber({
    email: req.body.email,
    preferences: req.body.preferences,
    location: {
      country: geoData.country,
      city: geoData.city,
      isp: geoData.isp
    },
    device: {
      type: req.body.deviceInfo?.type || 'unknown',
      browser: req.body.deviceInfo?.browser || 'unknown'
    }
  });
  
  await subscriber.save();
  res.json({ success: true });
});
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: Custom geolocation service URLs
GEO_IP_API_URL=http://ip-api.com/json/
GEO_IPAPI_URL=https://ipapi.co/
GEO_IPINFO_URL=https://ipinfo.io/

# Optional: Rate limiting
TECH_INFO_RATE_LIMIT=100
TECH_INFO_RATE_WINDOW=60000
```

### Middleware Options
```javascript
const options = {
  cache: true,                    // Enable caching
  cacheTimeout: 300000,          // Cache timeout (5 minutes)
  rateLimit: true,               // Enable rate limiting
  rateLimitWindow: 60000,        // Rate limit window (1 minute)
  rateLimitMax: 100,             // Max requests per window
  respectPrivacy: true           // Respect DNT and GPC headers
};
```

## 🧪 Testing

### Test Geolocation Services
```javascript
const GeoLocationService = require('./utils/technical-info-collector/geoLocationService');

// Test all services
const results = await GeoLocationService.testServices();
console.log('Test Results:', results);
```

### Test Technical Info Collection
```javascript
const { collectAdvancedTechnicalInfo } = require('./utils/technical-info-collector/advancedTechnicalInfoCollector');

// Mock request
const mockRequest = {
  ip: '8.8.8.8',
  headers: {
    'user-agent': 'Mozilla/5.0...',
    'accept-language': 'en-US,en;q=0.9'
  }
};

const technicalInfo = await collectAdvancedTechnicalInfo(mockRequest);
console.log('Technical Info:', technicalInfo);
```

## 📚 Additional Resources

- [IP-API Documentation](http://ip-api.com/docs/)
- [IPAPI.co Documentation](https://ipapi.co/api/)
- [IPInfo.io Documentation](https://ipinfo.io/developers)
- [UA-Parser-JS Documentation](https://github.com/faisalman/ua-parser-js)

## 🤝 Contributing

When contributing to the technical info collector:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Test with multiple browsers and devices
5. Consider privacy implications

## 📄 License

This utility is part of the main project and follows the same license terms.
