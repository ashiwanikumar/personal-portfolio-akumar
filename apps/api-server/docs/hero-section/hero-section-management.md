# Hero Section Management API Documentation

## Overview

The Hero Section Management system supports both image and video uploads for hero sections with CloudFront CDN integration, providing scalable media delivery with 20-year expiration URLs.

## Features

- **Dual Media Support**: Images and Videos
- **CloudFront Integration**: Fast global delivery
- **S3 Storage**: Reliable cloud storage
- **Security**: File validation, rate limiting, audit logging
- **Long-term Access**: 20-year URL expiration
- **File Size Support**: Up to 1GB for videos
- **Category Management**: Organized hero sections by categories

## File Structure

### Models

- **Path**: `/server/src/models/heroSection/heroSection.js`
- **Schema**: Enhanced with video support and metadata fields
- **New Fields**:
  - `video`: Video URL
  - `mediaType`: Enum ['image', 'video']
  - `fileSize`, `fileName`, `mimeType`: File metadata
  - `s3Key`, `cloudFrontUrl`: Storage URLs
  - `videoDuration`, `videoThumbnail`: Video-specific fields
  - `category`: Reference to HeroSectionCategory

- **Path**: `/server/src/models/heroSection/heroSectionCategory.js`
- **Schema**: Hero section categories
- **Fields**:
  - `name`: Category name
  - `heroes`: Array of hero section references

### Controllers

- **Path**: `/server/src/controllers/heroSection/heroSectionController.js`
- **Functions**:
  - `createHero`: Creates new hero section
  - `getAllHeroes`: Retrieves all hero sections
  - `getAllHeroesApproved`: Retrieves approved hero sections
  - `getHeroById`: Gets single hero section by ID
  - `updateHeroById`: Updates hero section
  - `updateHeroApprovalById`: Updates approval status
  - `deleteHeroById`: Deletes hero section with S3 cleanup
  - `uploadHeroMedia`: Handles media uploads
  - `getHeroesPaginated`: Paginated hero sections
  - `getApprovedHeroesPaginated`: Paginated approved hero sections

- **Path**: `/server/src/controllers/heroSection/heroSectionCategoryController.js`
- **Functions**:
  - `createHeroCategory`: Creates new category
  - `getAllHeroCategories`: Retrieves all categories
  - `getHeroCategoryById`: Gets category by ID
  - `updateHeroCategoryById`: Updates category
  - `deleteHeroCategoryById`: Deletes category

### Routes

- **Path**: `/server/src/routes/heroSection/heroSection.js`
- **Endpoints**:
  - `POST /hero-section`: Create hero section
  - `GET /heroes-section`: Get all hero sections
  - `GET /heroes-section/paginated`: Get paginated hero sections
  - `GET /heroes-section/approved`: Get approved hero sections
  - `GET /heroes-section/approved/paginated`: Get paginated approved hero sections
  - `GET /hero-section/:id`: Get hero section by ID
  - `PUT /hero-section/:id`: Update hero section
  - `PUT /hero-section/:id/approval`: Update approval status
  - `DELETE /hero-section/:id`: Delete hero section
  - `POST /hero-section/upload`: Upload hero media

- **Path**: `/server/src/routes/heroSection/heroSectionCategory.js`
- **Endpoints**:
  - `POST /hero-section/category`: Create category
  - `GET /hero-section/category`: Get all categories
  - `GET /hero-section/category/:id`: Get category by ID
  - `PUT /hero-section/category/:id`: Update category
  - `DELETE /hero-section/category/:id`: Delete category

### Services

- **Path**: `/server/src/services/heroSection/heroSectionService.js`
- **Status**: Full CRUD operations with category management
- **Functions**:
  - `createHero`: Creates hero and updates category
  - `findOneHero`: Find single hero
  - `findHeroById`: Find hero by ID
  - `findAllHeroes`: Get all heroes with population
  - `findAllHeroesApproved`: Get approved heroes
  - `findHeroByIdAndUpdate`: Update hero and manage categories
  - `findHeroByIdAndUpdateApprovalStatus`: Update approval
  - `findHeroByIdAndDelete`: Delete hero and update category
  - `findAllHeroesPaginated`: Paginated heroes with search
  - `countAllHeroes`: Count heroes with search
  - `findAllApprovedHeroesPaginated`: Paginated approved heroes
  - `countAllApprovedHeroes`: Count approved heroes

- **Path**: `/server/src/services/heroSection/heroSectionCategoryService.js`
- **Status**: Category CRUD operations
- **Functions**:
  - `createHeroCategory`: Create category
  - `findOneHeroCategory`: Find single category
  - `findHeroCategoryById`: Find category by ID
  - `findAllHeroCategories`: Get all categories
  - `findHeroCategoryByIdAndUpdate`: Update category
  - `findHeroCategoryByIdAndDelete`: Delete category

### Upload Middleware

- **Path**: `/server/src/middlewares/heroSectionMulter.js`
- **Enhancements**:
  - File size limit: 1GB
  - Supported formats: Images (JPEG, PNG, GIF, WebP, SVG) and Videos (MP4, WebM, OGG, AVI, MOV)
  - Security validations
  - Rate limiting: 20 uploads/hour
  - S3 integration with CloudFront

## API Endpoints

### Upload Hero Media

```http
POST /hero-section/upload
Content-Type: multipart/form-data

Body:
- image: File (JPEG, PNG, GIF, WebP, SVG, MP4, WebM, OGG, AVI, MOV)
- Max size: 1GB
```

**Response:**

```json
{
  "message": "Hero image uploaded successfully",
  "url": "https://media.cdn.shivrajsinghchouhan.co.in/hero-section/filename.jpg?Expires=...",
  "cloudFrontUrl": "https://media.cdn.shivrajsinghchouhan.co.in/hero-section/filename.jpg",
  "s3Key": "hero-section/filename.jpg",
  "fileSize": 556086,
  "fileName": "original-name.jpg",
  "mimeType": "image/jpeg",
  "mediaType": "image"
}
```

### Create Hero Section

```http
POST /hero-section
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "image": "https://...", // For images
  "video": "https://...", // For videos
  "mediaType": "image|video",
  "titleCaption": "Hero Title",
  "description": "Hero Description",
  "category": "categoryId",
  "fileSize": 556086,
  "fileName": "original-name.jpg",
  "mimeType": "image/jpeg",
  "s3Key": "hero-section/filename.jpg",
  "cloudFrontUrl": "https://media.cdn.shivrajsinghchouhan.co.in/hero-section/filename.jpg"
}
```

### Get All Hero Sections

```http
GET /heroes-section
```

### Get Paginated Hero Sections

```http
GET /heroes-section/paginated?page=1&perPage=10&searchText=search
```

### Get Approved Hero Sections

```http
GET /heroes-section/approved
```

### Get Hero Section by ID

```http
GET /hero-section/:id
```

### Update Hero Section

```http
PUT /hero-section/:id
Authorization: Bearer <token>
Content-Type: application/json

Body: Same as create
```

### Update Approval Status

```http
PUT /hero-section/:id/approval
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "isApproved": true
}
```

### Delete Hero Section

```http
DELETE /hero-section/:id
Authorization: Bearer <token>
```

### Category Management

#### Create Category

```http
POST /hero-section/category
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Category Name"
}
```

#### Get All Categories

```http
GET /hero-section/category
```

#### Get Category by ID

```http
GET /hero-section/category/:id
```

#### Update Category

```http
PUT /hero-section/category/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Updated Category Name"
}
```

#### Delete Category

```http
DELETE /hero-section/category/:id
Authorization: Bearer <token>
```

## Supported File Formats

### Images

- **JPEG/JPG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)
- **SVG** (.svg)

### Videos

- **MP4** (.mp4)
- **WebM** (.webm)
- **OGG** (.ogg)
- **AVI** (.avi)
- **MOV** (.mov)

## Security Features

### File Validation

- MIME type verification
- File extension checking
- File signature validation
- Size limit enforcement (1GB)

### Rate Limiting

- 20 uploads per hour per IP address
- Automatic reset every hour
- Security event logging

### Audit Logging

All upload activities are logged with:

- Timestamp
- User IP and User-Agent
- File metadata
- Upload success/failure status

## CloudFront Configuration

### URL Expiration

- **Duration**: 20 years from upload
- **Effective**: Permanent access for practical purposes
- **Format**: Signed URLs with query parameters

### CDN Benefits

- Global content delivery
- Reduced latency
- Bandwidth optimization
- Cache invalidation support

## Error Handling

### Common Errors

- **400**: Invalid file type or missing required fields
- **413**: File size exceeds 1GB limit
- **429**: Rate limit exceeded (20 uploads/hour)
- **500**: Server or S3 upload errors

### Error Response Format

```json
{
  "message": "Error description",
  "status": "error",
  "timestamp": "2025-07-04T17:18:27.390Z"
}
```

## Usage Examples

### Frontend Implementation

```javascript
// Upload Hero Media
const uploadHeroMedia = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/hero-section/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};

// Create Hero Section
const createHeroSection = async (heroData) => {
  const response = await fetch('/hero-section', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(heroData)
  });
  
  return response.json();
};

// Get Paginated Hero Sections
const getHeroSections = async (page = 1, perPage = 10, searchText = '') => {
  const response = await fetch(`/heroes-section/paginated?page=${page}&perPage=${perPage}&searchText=${searchText}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## Migration Notes

### Backward Compatibility

- All existing hero sections continue to work
- No database migration required
- Existing API endpoints unchanged
- Client applications work without modification

### Database Schema Changes

The hero section model now supports additional fields but maintains backward compatibility:

- Old records work with new schema
- New fields are optional
- Existing queries remain functional

## Monitoring and Logs

### Security Logs

```
🔒 SECURITY_LOG :: FILE_UPLOAD_VALIDATED :: {...}
🔒 SECURITY_LOG :: UPLOAD_SUCCESS :: {...}
🔒 SECURITY_LOG :: UPLOAD_ERROR :: {...}
```

### Upload Success Logs

```
🚀 HERO_IMAGE_UPLOAD_SUCCESS :: {...}
🚀 HERO_VIDEO_UPLOAD_SUCCESS :: {...}
```

### Deletion Logs

```
🗑️ HERO_DELETED_FROM_DB :: {...}
🗑️ HERO_DELETED_FROM_S3_AND_CLOUDFRONT :: {...}
```

## Best Practices

### File Optimization

- Compress images before upload
- Use appropriate video codecs (H.264 for MP4)
- Consider file size vs quality trade-offs

### Security

- Validate files on client-side before upload
- Monitor upload patterns for abuse
- Implement additional rate limiting if needed

### Performance

- Use CloudFront URLs for delivery
- Cache video thumbnails separately
- Consider progressive video loading

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file size and format
2. **Rate Limited**: Wait for hourly reset
3. **CloudFront Issues**: Check AWS credentials and configuration
4. **CORS Errors**: Ensure proper frontend configuration
5. **Model Conflicts**: Ensure unique model names (HeroSectionCategory vs HeroImageCategory)

### Debug Information

Upload responses include comprehensive metadata for debugging:

- File paths and keys
- CloudFront URLs
- File metadata
- Upload timestamps
