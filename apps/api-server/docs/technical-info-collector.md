# Technical Information Collector - Enhanced Documentation

## Overview

The Technical Information Collector is a comprehensive utility that collects detailed technical information from HTTP requests. It provides advanced browser detection, device fingerprinting, security threat detection, and analytics capabilities.

## Features

### 🚀 Core Features
- **Advanced Browser Detection** - Supports 10+ browsers with engine detection
- **Device Fingerprinting** - Unique device identification
- **Security Threat Detection** - Bot, proxy, VPN, and suspicious activity detection
- **Network Analysis** - ISP, ASN, and geographic information
- **Performance Metrics** - Device capabilities and connection quality
- **Analytics Support** - Statistical analysis and reporting

### 🔒 Security Features
- **Threat Detection**: Bots, proxies, VPNs, Tor, automated tools
- **Risk Scoring**: 0-100 risk assessment
- **Device Fingerprinting**: SHA-256 hash for unique identification
- **Security Headers**: Automatic risk-based header injection

### 📊 Analytics Features
- **Browser Statistics**: Usage patterns across browsers
- **Device Statistics**: Mobile vs desktop vs tablet usage
- **Geographic Analysis**: Country and region-based analytics
- **Security Analytics**: Threat patterns and risk distribution

## Installation & Usage

### Basic Usage

```javascript
const { collectTechnicalInfo } = require("@utils/technicalInfoCollector");

// In your controller
exports.createContact = async (req, res) => {
  const technicalInfo = collectTechnicalInfo(req, clientDeviceInfo);
  const contact = await ContactService.createContact(data, technicalInfo);
};
```

### Middleware Usage

```javascript
const { technicalInfoMiddleware } = require("@utils/technicalInfoCollector");

// Apply to all routes
app.use('/api', technicalInfoMiddleware);

// Or apply to specific routes
app.use('/api/contact', technicalInfoMiddleware);
```

### Client-Side Integration

```html
<!-- Include the script -->
<script src="/js/technical-info-collector.js"></script>

<!-- Add to your form -->
<form data-collect-tech-info action="/api/contact" method="POST">
  <!-- Your form fields -->
</form>
```

## API Reference

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

### `detectSecurityThreats(req)`

Detects security threats and suspicious patterns in requests.

**Returns:**
```javascript
{
  isProxy: false,
  isVPN: false,
  isTor: false,
  isBot: false,
  isSuspicious: false,
  riskScore: 25,
  flags: ["automated_tool"]
}
```

### `generateDeviceFingerprint(req, clientDeviceInfo)`

Generates a unique device fingerprint hash.

**Returns:** SHA-256 hash string

### `getTechnicalInfoStats(technicalInfoArray)`

Generates statistics from an array of technical info objects.

**Returns:**
```javascript
{
  browsers: { "Chrome": 150, "Firefox": 45, "Safari": 30 },
  devices: { "mobile": 120, "desktop": 80, "tablet": 25 },
  operatingSystems: { "Windows": 60, "iOS": 50, "Android": 40 },
  countries: { "India": 80, "USA": 45, "UK": 25 },
  security: {
    totalThreats: 15,
    highRisk: 5,
    mediumRisk: 8,
    lowRisk: 2
  }
}
```

### `validateTechnicalInfo(technicalInfo)`

Validates technical info data quality.

**Returns:**
```javascript
{
  isValid: true,
  errors: [],
  warnings: ["Device type could not be determined"]
}
```

## Browser Support

### Supported Browsers
- **Chrome** (Blink engine)
- **Firefox** (Gecko engine)
- **Safari** (WebKit engine)
- **Edge** (Blink engine)
- **Opera** (Blink engine)
- **Brave** (Blink engine)
- **Samsung Browser** (WebKit engine)
- **UC Browser** (WebKit engine)
- **Maxthon** (WebKit engine)
- **Vivaldi** (Blink engine)

### Device Detection
- **Mobile**: iPhone, Android, BlackBerry, Windows Phone
- **Tablet**: iPad, Kindle
- **Desktop**: Windows, macOS, Linux
- **Gaming**: PlayStation, Xbox, Nintendo

## Security Features

### Threat Detection
1. **Bot Detection**: Identifies crawlers, spiders, and automated tools
2. **Proxy Detection**: Detects proxy servers and VPNs
3. **Tor Detection**: Identifies Tor network usage
4. **Suspicious Patterns**: Empty user agents, automated tools

### Risk Scoring
- **0-20**: Low risk
- **21-50**: Medium risk
- **51-100**: High risk

### Security Headers
Automatically adds security headers based on risk level:
- `X-Security-Risk: low|medium|high`

## Analytics & Reporting

### Usage Statistics
```javascript
const { getTechnicalInfoStats } = require("@utils/technicalInfoCollector");

// Get statistics from your data
const stats = getTechnicalInfoStats(technicalInfoArray);
console.log(stats.browsers); // Browser usage
console.log(stats.devices); // Device distribution
console.log(stats.security); // Security threats
```

### Data Validation
```javascript
const { validateTechnicalInfo } = require("@utils/technicalInfoCollector");

const validation = validateTechnicalInfo(technicalInfo);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
console.log('Warnings:', validation.warnings);
```

## Configuration

### Environment Variables
```bash
# Optional: Enable debug mode
DEBUG_TECHNICAL_INFO=true

# Optional: Set custom risk thresholds
SECURITY_RISK_HIGH=80
SECURITY_RISK_MEDIUM=50
```

### Custom Headers
The utility automatically detects these headers:
- **Cloudflare**: `cf-ipcountry`, `cf-isp`, `cf-org`, `cf-asn`
- **Standard**: `x-forwarded-for`, `x-real-ip`, `via`
- **Custom**: `x-tor`, `x-submission-method`

## Best Practices

### 1. Performance
- Use middleware for automatic collection
- Cache results when possible
- Validate data before storage

### 2. Privacy
- Inform users about data collection
- Implement data retention policies
- Respect user privacy preferences

### 3. Security
- Monitor high-risk requests
- Implement rate limiting
- Log security threats

### 4. Analytics
- Regular statistical analysis
- Monitor usage patterns
- Track security trends

## Examples

### Contact Form Integration
```javascript
// Controller
exports.createContact = async (req, res) => {
  const technicalInfo = collectTechnicalInfo(req, req.body.deviceInfo);
  
  // Log security threats
  if (technicalInfo.security.riskScore > 50) {
    console.warn('High risk contact submission:', technicalInfo);
  }
  
  const contact = await ContactService.createContact(req.body, technicalInfo);
  res.json({ success: true, contactId: contact._id });
};
```

### Analytics Dashboard
```javascript
// Analytics controller
exports.getAnalytics = async (req, res) => {
  const contacts = await Contact.find({}).select('technicalInfo');
  const technicalInfoArray = contacts.map(c => c.technicalInfo);
  
  const stats = getTechnicalInfoStats(technicalInfoArray);
  res.json(stats);
};
```

### Security Monitoring
```javascript
// Security middleware
app.use('/api', (req, res, next) => {
  const technicalInfo = collectTechnicalInfo(req);
  
  if (technicalInfo.security.riskScore > 80) {
    // Block high-risk requests
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
});
```

## Troubleshooting

### Common Issues

1. **No IP detected**: Check proxy configuration
2. **Browser not detected**: Update browser patterns
3. **High false positives**: Adjust risk thresholds
4. **Performance issues**: Implement caching

### Debug Mode
```javascript
// Enable debug logging
if (process.env.DEBUG_TECHNICAL_INFO) {
  console.log('Technical Info:', technicalInfo);
}
```

## Migration Guide

### From Basic Version
The enhanced version maintains backward compatibility:

```javascript
// Old way (still works)
const browserName = extractBrowserName(userAgent);

// New way (recommended)
const browserInfo = extractBrowserInfo(userAgent);
console.log(browserInfo.name, browserInfo.version, browserInfo.engine);
```

## Contributing

To add new browser or device detection:

1. Add patterns to `BROWSER_PATTERNS` or `DEVICE_PATTERNS`
2. Update detection functions
3. Add tests
4. Update documentation

## License

This utility is part of the citizen services platform and follows the same licensing terms. 