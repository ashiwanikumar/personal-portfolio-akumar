# Announcement Media URL Encryption

## Overview
This document describes the URL encryption system implemented for announcement media files to secure access and prevent unauthorized direct downloads.

## Security Features

### 1. AES-256-GCM Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with 100,000 iterations and SHA-256
- **Components**: 64-byte salt + 16-byte IV + 16-byte auth tag + encrypted data
- **Encoding**: Base64URL for safe URL transmission

### 2. JWT Token Authentication
- **Purpose**: Wraps encrypted URLs with metadata and expiration
- **Expiration**: 1 hour (3600 seconds) by default
- **Payload**: Encrypted URL, file type, MIME type, announcement ID, timestamp
- **Issuer**: `sschouhan-media-service`

### 3. Secure Media Proxy
- **Endpoint**: `/api/v1/announcement/media/secure/{jwt-token}`
- **Functionality**: Decrypts URLs and proxies content from CloudFront
- **Validation**: Verifies announcement is active and approved
- **Headers**: Forwards relevant headers and adds security headers

## Implementation Details

### Environment Variables
```env
MEDIA_ENCRYPTION_KEY=your-256-bit-encryption-key-in-hex
MEDIA_JWT_SECRET=your-jwt-secret-for-media-tokens
```

### API Response Format
**Before (Insecure)**:
```json
{
  "mediaFiles": [{
    "cloudFrontUrl": "https://media.cdn.shivrajsinghchouhan.co.in/path/to/file.jpg",
    "fileType": "image",
    "mimeType": "image/jpeg"
  }]
}
```

**After (Secure)**:
```json
{
  "mediaFiles": [{
    "secureUrl": "/api/v1/announcement/media/secure/eyJhbGciOiJIUzI1NiIs...",
    "fileType": "image",
    "mimeType": "image/jpeg"
  }]
}
```

### Files Modified

#### Server-Side
1. **`src/services/announcement/announcementMediaEncryption.js`**
   - Core encryption/decryption functions
   - JWT token management
   - Secure URL generation

2. **`src/controllers/announcement/announcementController.js`**
   - Updated `getAllAnnouncementsApproved()` to encrypt media URLs
   - Added `serveSecureMedia()` endpoint for proxying content
   - Enhanced error handling and logging

3. **`src/routes/announcement/announcement.js`**
   - Added secure media proxy route
   - Maintained public access (no authentication required)

4. **`.env`**
   - Added `MEDIA_ENCRYPTION_KEY` and `MEDIA_JWT_SECRET`

#### Client-Side (Landing Page)
1. **`src/components/announcements/PublicAnnouncement.js`**
   - Updated to use `secureUrl` instead of `cloudFrontUrl`
   - Added error handling for media loading
   - Fallback message for encryption failures

2. **Environment Variables**
   - Uses existing `NEXT_PUBLIC_BACKEND_API` for API calls

## Security Benefits

### ✅ Copy-Paste Protection
- Original CloudFront URLs are never exposed
- Secure URLs only work through the proxy endpoint
- Direct access to media files is impossible

### ✅ Time-Based Expiration
- JWT tokens expire after 1 hour
- Automatic token refresh on each API call
- Prevents long-term URL sharing

### ✅ Real-Time Validation
- Each media request validates announcement status
- Inactive or unapproved announcements block media access
- Dynamic access control

### ✅ Domain Restriction
- Media only accessible through authorized server
- Cannot be embedded or hotlinked from external sites
- Server-side access control

## Usage

### For Developers
1. **API Integration**: Use the `/api/v1/announcements-approved` endpoint
2. **Media Display**: Use `secureUrl` from the API response
3. **Error Handling**: Handle cases where `secureUrl` is null

### For Users
- **Viewing**: Media displays normally in the landing page interface
- **Copying URLs**: Copied URLs won't work outside the landing page
- **Direct Access**: Attempting direct access returns 401/403 errors

## Performance Considerations

### ✅ Efficient Encryption
- AES-GCM hardware acceleration on modern systems
- Minimal CPU overhead for encryption/decryption
- Single-pass authenticated encryption

### ✅ Streaming Support
- Proxy maintains streaming capabilities
- Range request support for large media files
- No memory buffering of entire files

### ✅ Caching Headers
- Forwards CloudFront caching headers
- Maintains CDN performance benefits
- Reduces server load

## Monitoring and Troubleshooting

### Logging
- Encryption failures logged with sanitized error messages
- Media access attempts logged for security monitoring
- Performance metrics available through standard logging

### Common Issues
1. **Token Expiration**: Users see 401 errors after 1 hour
2. **Encryption Key Changes**: Existing tokens become invalid
3. **Server Restart**: Auto-generated keys cause decryption failures

### Debugging
1. Check environment variables are properly set
2. Verify announcement is active and approved
3. Validate JWT token structure and expiration
4. Test encryption/decryption with sample URLs

## Future Enhancements

### Possible Improvements
1. **Token Refresh**: Automatic client-side token renewal
2. **Rate Limiting**: Per-IP rate limiting for media requests
3. **Analytics**: Track media access patterns and usage
4. **Watermarking**: Dynamic watermarking for protected content
5. **Geofencing**: Location-based access restrictions

---

**Last Updated**: July 22, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅