# Login Activity & Audit System Documentation

## Overview
The Login Activity & Audit System provides comprehensive tracking, monitoring, and analysis of user authentication events with advanced security features, suspicious activity detection, and detailed reporting capabilities.

## Architecture

### Components
- **Login Activity Tracking**: Real-time authentication event logging
- **Suspicious Activity Detection**: Pattern analysis and risk scoring
- **Technical Information Collection**: Device, browser, and location data
- **Geolocation Services**: IP-based location detection
- **Risk Assessment Engine**: Automated security scoring
- **Audit Trail**: Comprehensive event logging for compliance

### Data Flow
1. User authentication attempt → Technical info collection → Risk assessment
2. Event logging → Pattern analysis → Suspicious activity detection
3. Real-time monitoring → Alert generation → Administrative notifications

## Server-Side Implementation

### 1. Database Schema (`/src/models/user/loginActivity.js`)

#### Login Activity Model
```javascript
const loginActivitySchema = new mongoose.Schema({
  // User Information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  email: { type: String, required: true },
  name: { type: String },
  
  // Authentication Details
  loginAttemptedAt: { type: Date, default: Date.now, index: true },
  loginStatus: { 
    type: String, 
    enum: ['success', 'failed', 'suspicious'], 
    required: true,
    index: true 
  },
  failureReason: { type: String },
  
  // Technical Information
  ipAddress: { type: String, required: true, index: true },
  userAgent: { type: String },
  deviceInfo: {
    browser: { type: String },
    browserVersion: { type: String },
    os: { type: String },
    osVersion: { type: String },
    device: { type: String },
    deviceType: { type: String },
    isMobile: { type: Boolean },
    isTablet: { type: Boolean },
    isDesktop: { type: Boolean }
  },
  
  // Location Information
  location: {
    country: { type: String },
    countryCode: { type: String },
    region: { type: String },
    regionCode: { type: String },
    city: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    timezone: { type: String },
    isp: { type: String },
    org: { type: String }
  },
  
  // Security Assessment
  riskScore: { type: Number, min: 0, max: 100, default: 0 },
  riskFactors: [{ type: String }],
  isSuspicious: { type: Boolean, default: false, index: true },
  
  // Session Information
  sessionId: { type: String },
  sessionDuration: { type: Number },
  
  // Additional Metadata
  requestHeaders: { type: Map, of: String },
  fingerprint: { type: String },
  
  // Administrative
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

#### Indexes for Performance
```javascript
// Compound indexes for common queries
loginActivitySchema.index({ userId: 1, loginAttemptedAt: -1 });
loginActivitySchema.index({ ipAddress: 1, loginAttemptedAt: -1 });
loginActivitySchema.index({ loginStatus: 1, isSuspicious: 1 });
loginActivitySchema.index({ 'location.country': 1, loginAttemptedAt: -1 });
```

### 2. Technical Information Collection (`/src/utils/technical-info-collector/`)

#### Main Collector (`technicalInfoCollector.js`)
```javascript
const collectAdvancedTechnicalInfo = async (req) => {
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  // Parse User Agent
  const deviceInfo = parseUserAgent(userAgent);
  
  // Get Geolocation
  const location = await geoLocationService.getLocationFromIP(ipAddress);
  
  // Calculate Risk Score
  const { riskScore, riskFactors } = calculateRiskScore({
    ipAddress,
    location,
    deviceInfo,
    userAgent
  });
  
  return {
    ipAddress,
    userAgent,
    deviceInfo,
    location,
    riskScore,
    riskFactors,
    requestHeaders: extractSafeHeaders(req.headers),
    fingerprint: generateDeviceFingerprint(req)
  };
};
```

#### Geolocation Service (`geoLocationService.js`)
```javascript
const getLocationFromIP = async (ipAddress) => {
  try {
    // Skip local/private IPs
    if (isPrivateIP(ipAddress)) {
      return { country: 'Local', city: 'Local Network' };
    }
    
    // Use multiple geolocation providers with fallback
    const providers = [
      () => getFromIPAPI(ipAddress),
      () => getFromIPInfo(ipAddress),
      () => getFromIPStack(ipAddress)
    ];
    
    for (const provider of providers) {
      try {
        const result = await provider();
        if (result && result.country) {
          return result;
        }
      } catch (error) {
        console.warn('Geolocation provider failed:', error.message);
      }
    }
    
    return { country: 'Unknown', city: 'Unknown' };
  } catch (error) {
    console.error('Geolocation service error:', error);
    return { country: 'Unknown', city: 'Unknown' };
  }
};
```

### 3. Authentication Controller (`/src/controllers/auth/authController.js`)

#### Login Process with Activity Tracking
```javascript
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Collect technical information
    const technicalInfo = await collectAdvancedTechnicalInfo(req);
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      // Log failed attempt
      await logLoginActivity({
        email,
        loginStatus: 'failed',
        failureReason: 'User not found',
        ...technicalInfo
      });
      
      return res.status(401).json({
        error: true,
        type: [{ code: "LOGIN_FAILED", message: "Invalid credentials" }]
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Log failed attempt
      await logLoginActivity({
        userId: user._id,
        email: user.email,
        name: user.name,
        loginStatus: 'failed',
        failureReason: 'Invalid password',
        ...technicalInfo
      });
      
      return res.status(401).json({
        error: true,
        type: [{ code: "LOGIN_FAILED", message: "Invalid credentials" }]
      });
    }
    
    // Check for suspicious activity
    const isSuspicious = await detectSuspiciousActivity(user._id, technicalInfo);
    
    // Log successful login
    await logLoginActivity({
      userId: user._id,
      email: user.email,
      name: user.name,
      loginStatus: isSuspicious ? 'suspicious' : 'success',
      isSuspicious,
      ...technicalInfo
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Set secure cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Send notification for suspicious login
    if (isSuspicious) {
      await sendSuspiciousLoginNotification(user, technicalInfo);
    }
    
    res.status(200).json({
      accessToken,
      user: User.toClientObject(user)
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: true,
      type: [{ code: "SERVER_ERROR", message: "Internal server error" }]
    });
  }
};
```

### 4. Login Activity API (`/src/controllers/user/loginActivityController.js`)

#### Get User Login History
```javascript
exports.getMyLoginHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'loginAttemptedAt', sortOrder = 'desc' } = req.query;
    const userId = req.user._id;
    
    const activities = await LoginActivity.find({ userId })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await LoginActivity.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: activities.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login history'
    });
  }
};
```

#### Get Login Statistics
```javascript
exports.getMyLoginStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user._id;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const stats = await LoginActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          loginAttemptedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalLogins: { $sum: 1 },
          successfulLogins: {
            $sum: { $cond: [{ $eq: ['$loginStatus', 'success'] }, 1, 0] }
          },
          failedLogins: {
            $sum: { $cond: [{ $eq: ['$loginStatus', 'failed'] }, 1, 0] }
          },
          suspiciousLogins: {
            $sum: { $cond: ['$isSuspicious', 1, 0] }
          },
          uniqueIPCount: { $addToSet: '$ipAddress' },
          uniqueLocationCount: { $addToSet: '$location.city' },
          uniqueDeviceCount: { $addToSet: '$deviceInfo.device' },
          avgRiskScore: { $avg: '$riskScore' },
          lastLogin: { $max: '$loginAttemptedAt' }
        }
      },
      {
        $project: {
          _id: 0,
          totalLogins: 1,
          successfulLogins: 1,
          failedLogins: 1,
          suspiciousLogins: 1,
          uniqueIPCount: { $size: '$uniqueIPCount' },
          uniqueLocationCount: { $size: '$uniqueLocationCount' },
          uniqueDeviceCount: { $size: '$uniqueDeviceCount' },
          avgRiskScore: { $round: ['$avgRiskScore', 2] },
          lastLogin: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: { statistics: stats[0] || {} }
    });
  } catch (error) {
    console.error('Error fetching login stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login statistics'
    });
  }
};
```

#### Suspicious Activity Detection
```javascript
exports.getSuspiciousActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, days = 7 } = req.query;
    const userId = req.user._id;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const activities = await LoginActivity.find({
      userId,
      isSuspicious: true,
      loginAttemptedAt: { $gte: startDate }
    })
    .sort({ loginAttemptedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();
    
    const total = await LoginActivity.countDocuments({
      userId,
      isSuspicious: true,
      loginAttemptedAt: { $gte: startDate }
    });
    
    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: activities.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching suspicious activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suspicious activities'
    });
  }
};
```

### 5. Risk Assessment Engine

#### Risk Calculation Algorithm
```javascript
const calculateRiskScore = (technicalInfo) => {
  let riskScore = 0;
  const riskFactors = [];
  
  // IP-based risk factors
  if (isVPN(technicalInfo.ipAddress)) {
    riskScore += 30;
    riskFactors.push('VPN_DETECTED');
  }
  
  if (isTor(technicalInfo.ipAddress)) {
    riskScore += 50;
    riskFactors.push('TOR_NETWORK');
  }
  
  // Location-based risk factors
  if (isHighRiskCountry(technicalInfo.location.country)) {
    riskScore += 20;
    riskFactors.push('HIGH_RISK_LOCATION');
  }
  
  // Device-based risk factors
  if (isUnusualUserAgent(technicalInfo.userAgent)) {
    riskScore += 15;
    riskFactors.push('UNUSUAL_USER_AGENT');
  }
  
  // Time-based risk factors
  if (isUnusualLoginTime()) {
    riskScore += 10;
    riskFactors.push('UNUSUAL_TIME');
  }
  
  return {
    riskScore: Math.min(riskScore, 100), // Cap at 100
    riskFactors
  };
};
```

#### Suspicious Activity Detection
```javascript
const detectSuspiciousActivity = async (userId, technicalInfo) => {
  // Check for multiple failed attempts
  const recentFailures = await LoginActivity.countDocuments({
    userId,
    loginStatus: 'failed',
    loginAttemptedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
  });
  
  if (recentFailures >= 3) {
    return true;
  }
  
  // Check for unusual location
  const recentLogins = await LoginActivity.find({
    userId,
    loginStatus: 'success',
    loginAttemptedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  }).limit(5);
  
  const hasUnusualLocation = recentLogins.some(login => 
    login.location.country !== technicalInfo.location.country
  );
  
  if (hasUnusualLocation && technicalInfo.riskScore > 50) {
    return true;
  }
  
  // High risk score threshold
  if (technicalInfo.riskScore >= 70) {
    return true;
  }
  
  return false;
};
```

### 6. API Routes (`/src/routes/user/loginActivity.js`)

#### Route Definitions
```javascript
// User Routes (Own Data)
router.get('/user/login-activity/my-history', authCheck, getMyLoginHistory);
router.get('/user/login-activity/my-stats', authCheck, getMyLoginStats);
router.get('/user/login-activity/suspicious', authCheck, getSuspiciousActivities);

// Admin Routes (All Users)
router.get('/admin/login-activity/all', authCheck, adminCheck, getAllLoginActivities);
router.get('/admin/login-activity/stats', authCheck, adminCheck, getLoginActivityStats);
router.get('/admin/login-activity/suspicious/all', authCheck, adminCheck, getAllSuspiciousActivities);
router.get('/admin/login-activity/export', authCheck, adminCheck, exportLoginActivities);

// Super Admin Routes
router.delete('/admin/login-activity/cleanup', authCheck, superAdminCheck, cleanupOldActivities);
router.get('/admin/login-activity/analytics', authCheck, superAdminCheck, getAdvancedAnalytics);
```

## Security Features

### 1. Data Privacy
- **User Isolation**: Users can only access their own data
- **Admin Oversight**: Administrators can view all activities
- **Sensitive Data Masking**: IP addresses partially masked in responses
- **Header Sanitization**: Unsafe headers filtered out

### 2. Rate Limiting
- **Login Attempt Limits**: Maximum attempts per IP/user
- **API Rate Limiting**: Request frequency controls
- **Suspicious Activity Throttling**: Enhanced limits for risky IPs

### 3. Data Retention
- **Automatic Cleanup**: Old records purged based on policy
- **Compliance**: Configurable retention periods
- **Archive Options**: Long-term storage for audit purposes

### 4. Real-time Monitoring
- **Live Activity Tracking**: Real-time login monitoring
- **Alert System**: Immediate notifications for suspicious activities
- **Dashboard Integration**: Visual monitoring interfaces

## Configuration

### Environment Variables
```env
# Geolocation API Keys
IPAPI_KEY=your_ipapi_key
IPINFO_TOKEN=your_ipinfo_token
IPSTACK_KEY=your_ipstack_key

# Security Thresholds
RISK_SCORE_THRESHOLD=70
FAILED_ATTEMPT_LIMIT=3
SUSPICIOUS_LOGIN_COOLDOWN=3600

# Data Retention
LOGIN_ACTIVITY_RETENTION_DAYS=90
CLEANUP_INTERVAL_HOURS=24

# Notification Settings
ENABLE_SUSPICIOUS_LOGIN_ALERTS=true
ADMIN_NOTIFICATION_EMAIL=admin@example.com
```

### Database Indexes
```javascript
// Ensure these indexes exist for optimal performance
db.loginactivities.createIndex({ userId: 1, loginAttemptedAt: -1 });
db.loginactivities.createIndex({ ipAddress: 1, loginAttemptedAt: -1 });
db.loginactivities.createIndex({ loginStatus: 1, isSuspicious: 1 });
db.loginactivities.createIndex({ 'location.country': 1 });
db.loginactivities.createIndex({ loginAttemptedAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
```

## Performance Optimization

### 1. Database Efficiency
- **Strategic Indexing**: Optimized for common query patterns
- **Aggregation Pipelines**: Efficient statistical calculations
- **Connection Pooling**: Managed database connections

### 2. Caching Strategy
- **Geolocation Cache**: Cache IP lookups to reduce API calls
- **Risk Score Cache**: Cache calculations for repeated IPs
- **Statistics Cache**: Cache dashboard data with TTL

### 3. Async Processing
- **Background Jobs**: Non-critical operations queued
- **Batch Processing**: Bulk operations for efficiency
- **Queue Management**: Prioritized task processing

## Monitoring and Alerts

### 1. Key Metrics
- **Login Success Rate**: Percentage of successful authentications
- **Suspicious Activity Rate**: Percentage of flagged activities
- **Geographic Distribution**: Login location patterns
- **Device Diversity**: Range of devices and browsers
- **Risk Score Trends**: Average risk scores over time

### 2. Alert Conditions
- **High Failure Rate**: Unusual number of failed attempts
- **Geographic Anomalies**: Logins from unexpected locations
- **Risk Score Spikes**: Sudden increase in risk factors
- **System Errors**: Technical failures in tracking

### 3. Dashboard Features
- **Real-time Activity Feed**: Live login events
- **Geographic Map**: Visual location distribution
- **Risk Score Distribution**: Security risk analysis
- **Trend Analysis**: Historical pattern visualization

## API Documentation

### Response Formats

#### Login Activity Record
```json
{
  "_id": "login_activity_id",
  "userId": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "loginAttemptedAt": "2025-07-18T23:21:29.268Z",
  "loginStatus": "success",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "deviceInfo": {
    "browser": "Chrome",
    "browserVersion": "91.0",
    "os": "Windows",
    "osVersion": "10",
    "device": "Desktop",
    "deviceType": "desktop",
    "isMobile": false,
    "isTablet": false,
    "isDesktop": true
  },
  "location": {
    "country": "United States",
    "countryCode": "US",
    "region": "California",
    "city": "San Francisco",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "timezone": "America/Los_Angeles",
    "isp": "Example ISP"
  },
  "riskScore": 25,
  "riskFactors": ["UNUSUAL_TIME"],
  "isSuspicious": false
}
```

#### Statistics Response
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalLogins": 150,
      "successfulLogins": 145,
      "failedLogins": 5,
      "suspiciousLogins": 2,
      "uniqueIPCount": 8,
      "uniqueLocationCount": 3,
      "uniqueDeviceCount": 4,
      "avgRiskScore": 23.5,
      "lastLogin": "2025-07-18T23:21:29.268Z"
    }
  }
}
```

## Testing

### Unit Tests
```javascript
describe('Login Activity Tracking', () => {
  test('should log successful login', async () => {
    const mockReq = createMockRequest();
    const result = await logLoginActivity({
      userId: 'test_user',
      email: 'test@example.com',
      loginStatus: 'success',
      ...mockTechnicalInfo
    });
    
    expect(result).toBeDefined();
    expect(result.loginStatus).toBe('success');
  });
  
  test('should detect suspicious activity', async () => {
    const userId = 'test_user';
    const technicalInfo = { riskScore: 80, ...mockTechnicalInfo };
    
    const isSuspicious = await detectSuspiciousActivity(userId, technicalInfo);
    expect(isSuspicious).toBe(true);
  });
});
```

### Integration Tests
```javascript
describe('Login Activity API', () => {
  test('GET /user/login-activity/my-history', async () => {
    const response = await request(app)
      .get('/api/v1/user/login-activity/my-history')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.activities).toBeInstanceOf(Array);
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Geolocation Service Failures
- **Symptoms**: Location data missing or inaccurate
- **Solutions**: Check API keys, implement fallback providers
- **Monitoring**: Track geolocation API response rates

#### 2. High Risk Score False Positives
- **Symptoms**: Legitimate users flagged as suspicious
- **Solutions**: Adjust risk thresholds, refine detection algorithms
- **Tuning**: Regular review of risk factors and weights

#### 3. Performance Issues
- **Symptoms**: Slow login responses, high database load
- **Solutions**: Optimize queries, add caching, review indexes
- **Monitoring**: Track response times and database metrics

#### 4. Data Inconsistencies
- **Symptoms**: Missing or incomplete activity records
- **Solutions**: Implement retry logic, add data validation
- **Recovery**: Regular data integrity checks and repairs