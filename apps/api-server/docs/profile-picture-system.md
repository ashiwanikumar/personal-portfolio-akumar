# Profile Picture System Documentation

## Overview
The profile picture system provides secure file upload, storage, and retrieval capabilities for user profile images with AWS S3 integration, CloudFront CDN delivery, and comprehensive security features.

## Architecture

### Components
- **Multer Middleware**: Handles file upload and validation
- **AWS S3**: Secure cloud storage for profile pictures
- **CloudFront CDN**: Fast global content delivery with signed URLs
- **Authentication**: JWT-based access control
- **Database**: MongoDB storage for metadata

### File Flow
1. Client uploads image → Multer middleware → S3 storage
2. Metadata saved to user document in MongoDB
3. CloudFront signed URLs generated for secure access
4. Client retrieves images via CDN

## Server-Side Implementation

### 1. Multer Configuration (`/src/middlewares/profilePictureMulter.js`)

#### Key Features
- **File Size Limit**: 300KB maximum
- **File Type Validation**: JPEG, JPG, PNG, WebP only
- **Organized Storage**: Files stored in `profile-pictures/user-{userId}/` structure
- **Security Logging**: All upload events logged for security monitoring

#### Configuration Details
```javascript
const profilePictureUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    
    key: function (req, file, cb) {
      const userId = req.user._id || req.user.id;
      const timestamp = Date.now();
      const uniqueId = uuidv4().substr(0, 8);
      const fileName = `profile-pictures/user-${userId}/profile-${timestamp}-${uniqueId}.${extension}`;
      cb(null, fileName);
    }
  }),
  limits: { fileSize: 300 * 1024 }, // 300KB
  fileFilter: (req, file, cb) => {
    // Validates MIME type and file extension
  }
});
```

#### Security Features
- **MIME Type Validation**: Prevents malicious file uploads
- **File Extension Checking**: Double validation for security
- **Rate Limiting**: Upload frequency monitoring
- **Security Event Logging**: All operations logged with metadata

### 2. API Routes (`/src/routes/user/profilePicture.js`)

#### Endpoints

##### Upload Profile Picture
- **Route**: `POST /api/v1/user/profile-picture/upload`
- **Authentication**: Required (JWT)
- **Middleware**: `authCheck`, `uploadProfilePictureToS3`
- **File Limits**: 300KB max, single file
- **Response**: Upload confirmation with URLs

##### Get Profile Picture
- **Route**: `GET /api/v1/user/profile-picture`
- **Authentication**: Required (JWT)
- **Response**: Profile picture metadata and URLs

##### Delete Profile Picture
- **Route**: `DELETE /api/v1/user/profile-picture`
- **Authentication**: Required (JWT)
- **Actions**: Removes from S3, invalidates CDN cache, updates database

##### Admin Endpoints
- **Get User Profile Picture**: `GET /api/v1/user/profile-picture/user/:userId` (Admin)
- **Get Statistics**: `GET /api/v1/user/profile-picture/stats` (Admin)
- **Bulk Delete**: `DELETE /api/v1/user/profile-picture/bulk-delete` (Super Admin)

### 3. Controller Functions (`/src/controllers/user/profilePictureController.js`)

#### Upload Process
1. **Middleware Processing**: File uploaded to S3 via multer
2. **Old File Cleanup**: Previous profile picture deleted if exists
3. **Database Update**: User document updated with new metadata
4. **URL Generation**: Signed URLs created for client access

```javascript
const uploadResult = {
  signedUrl: generateCloudFrontSignedUrl(s3Key),
  cloudFrontUrl: generateCloudFrontUrl(s3Key),
  s3Url: generateS3Url(s3Key),
  s3Key: uploadedFile.key,
  originalName: uploadedFile.originalname,
  originalSize: uploadedFile.size,
  processedSize: uploadedFile.size,
  mimetype: uploadedFile.mimetype,
  uploadedAt: new Date().toISOString()
};
```

#### Retrieval Process
1. **Authentication Check**: Verify user permissions
2. **Database Query**: Fetch user's profile picture metadata
3. **Response Formation**: Return structured data with URLs

#### Deletion Process
1. **S3 Deletion**: Remove file from cloud storage
2. **Cache Invalidation**: Clear CloudFront cache
3. **Database Update**: Remove metadata from user document

### 4. Authentication Middleware (`/src/middlewares/auth.js`)

#### JWT Verification
- **Token Extraction**: From `Authorization: Bearer <token>` header
- **Validation**: JWT signature and expiration checking
- **User Context**: Adds user information to request object

#### Enhanced Debugging
- **Request Logging**: URL, method, token presence
- **Error Tracking**: Detailed JWT verification errors
- **Security Events**: Failed authentication attempts logged

### 5. Database Schema

#### User Model Extensions
```javascript
profilePicture: {
  url: String,           // CloudFront signed URL
  cloudFrontUrl: String, // CloudFront public URL
  s3Url: String,         // Direct S3 URL
  s3Key: String,         // S3 object key
  originalName: String,  // Original filename
  originalSize: Number,  // File size in bytes
  processedSize: Number, // Same as original (no processing)
  mimetype: String,      // MIME type
  dimensions: String,    // 'original' (no resizing)
  uploadedAt: Date       // Upload timestamp
}
```

## Security Features

### 1. File Validation
- **MIME Type Checking**: Only image types allowed
- **File Extension Validation**: Double verification
- **File Size Limits**: 300KB maximum to prevent abuse

### 2. Access Control
- **JWT Authentication**: All endpoints require valid tokens
- **User Isolation**: Users can only access their own profile pictures
- **Admin Overrides**: Administrators can access any user's profile pictures

### 3. Security Logging
- **Upload Events**: All file uploads logged with metadata
- **Authentication Failures**: Failed token validations tracked
- **Rate Limiting**: Upload frequency monitoring
- **Suspicious Activity Detection**: Pattern analysis for abuse

### 4. CloudFront Security
- **Signed URLs**: Time-limited access to files
- **Origin Access Control**: Direct S3 access blocked
- **Cache Invalidation**: Immediate removal of deleted files

## Configuration Requirements

### Environment Variables
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# CloudFront Configuration
CLOUDFRONT_DOMAIN=your_cloudfront_domain
CLOUDFRONT_KEY_PAIR_ID=your_key_pair_id
CLOUDFRONT_PRIVATE_KEY=your_private_key
CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_secret
JWT_ACCESS_TOKEN_TTL=15m
```

### AWS Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket/profile-pictures/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

## Error Handling

### Common Error Scenarios
1. **File Too Large**: Returns 400 with size limit message
2. **Invalid File Type**: Returns 400 with accepted types
3. **Authentication Failed**: Returns 401 with token error
4. **S3 Upload Failed**: Returns 500 with upload error
5. **User Not Found**: Returns 404 with user error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2025-07-18T23:21:29.268Z"
}
```

## Performance Considerations

### File Size Optimization
- 300KB limit balances quality and performance
- Original files stored without processing for simplicity
- CloudFront CDN ensures fast global delivery

### Database Efficiency
- Metadata stored in user document for quick access
- No separate collections needed
- Efficient queries with user ID indexing

### Caching Strategy
- CloudFront caches files globally
- Signed URLs have 20-year expiration for permanent access
- Cache invalidation on file deletion

## Monitoring and Maintenance

### Logging
- All operations logged with security events
- Upload success/failure tracking
- Authentication attempt monitoring
- Rate limiting breach detection

### Metrics to Monitor
- Upload success rate
- File size distribution
- Authentication failure rate
- S3 storage usage
- CloudFront bandwidth usage

### Maintenance Tasks
- Regular cleanup of orphaned S3 files
- Monitor and rotate CloudFront key pairs
- Review security logs for anomalies
- Update file size limits based on usage patterns

## Troubleshooting

### Common Issues

#### 1. Upload Failures
- Check AWS credentials and permissions
- Verify S3 bucket configuration
- Validate file size and type
- Review rate limiting settings

#### 2. Authentication Errors
- Verify JWT token validity
- Check token expiration
- Ensure proper Authorization header format
- Review middleware configuration

#### 3. File Access Issues
- Validate CloudFront configuration
- Check signed URL generation
- Verify S3 object permissions
- Review CORS settings

#### 4. Performance Issues
- Monitor CloudFront cache hit rates
- Check S3 request patterns
- Review file size distributions
- Analyze upload frequency patterns

## API Testing

### cURL Examples

#### Upload Profile Picture
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@/path/to/image.jpg" \
  http://localhost:${API_PORT}/api/v1/user/profile-picture/upload
```

#### Get Profile Picture
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:${API_PORT}/api/v1/user/profile-picture
```

#### Delete Profile Picture
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:${API_PORT}/api/v1/user/profile-picture
```

## Future Enhancements

### Planned Features
1. **Image Processing**: Automatic resizing and optimization
2. **Multiple Formats**: Support for additional image formats
3. **Backup Strategy**: Automated backup to secondary storage
4. **Analytics Dashboard**: Detailed usage analytics
5. **Compression**: Automatic image compression
6. **Thumbnails**: Generate multiple sizes for different use cases
