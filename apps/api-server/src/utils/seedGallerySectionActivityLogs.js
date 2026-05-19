const mongoose = require('mongoose');
const ActivityLog = require('../models/gallerySection/gallerySectionActivityLog');

/**
 * Seed initial activity logs for testing
 */
const seedActivityLogs = async () => {
  try {
    console.log('🌱 Seeding activity logs...');

    // Sample activities
    const sampleActivities = [
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Super Admin',
        userRole: 'superadmin',
        activityType: 'view_analytics',
        action: 'Viewed analytics dashboard',
        targetType: 'analytics',
        details: { section: 'overview' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'GET',
        url: '/gallery/analytics',
        status: 'success',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Gallery Admin',
        userRole: 'admin',
        activityType: 'upload_media',
        action: 'Uploaded new image',
        targetType: 'media',
        targetName: 'Sample Image.jpg',
        mediaType: 'image',
        details: { size: '2.5MB', format: 'JPEG' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        method: 'POST',
        url: '/gallery/media',
        status: 'success',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Content Moderator',
        userRole: 'moderator',
        activityType: 'approve_media',
        action: 'Approved media item',
        targetType: 'media',
        targetName: 'Event Photo.jpg',
        mediaType: 'image',
        details: { reason: 'Content approved for publication' },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        method: 'PUT',
        url: '/gallery/media/approval',
        status: 'success',
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Gallery Editor',
        userRole: 'user',
        activityType: 'edit_media',
        action: 'Updated media metadata',
        targetType: 'media',
        targetName: 'Conference Video.mp4',
        mediaType: 'video',
        details: { changes: ['title', 'description', 'tags'] },
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'PUT',
        url: '/gallery/media/metadata',
        status: 'success',
        timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Super Admin',
        userRole: 'superadmin',
        activityType: 'download_logs',
        action: 'Downloaded activity logs',
        targetType: 'analytics',
        details: { format: 'csv', dateRange: '7 days' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'GET',
        url: '/gallery/activity-logs/download',
        status: 'success',
        timestamp: new Date(Date.now() - 18000000), // 5 hours ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Content Manager',
        userRole: 'admin',
        activityType: 'create_category',
        action: 'Created new category',
        targetType: 'category',
        targetName: 'Events 2024',
        details: { description: 'Photos and videos from 2024 events' },
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        method: 'POST',
        url: '/gallery/categories',
        status: 'success',
        timestamp: new Date(Date.now() - 21600000), // 6 hours ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Gallery Admin',
        userRole: 'admin',
        activityType: 'feature_media',
        action: 'Featured media item',
        targetType: 'media',
        targetName: 'Hero Banner.jpg',
        mediaType: 'image',
        details: { featured: true },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        method: 'PUT',
        url: '/gallery/media/featured',
        status: 'success',
        timestamp: new Date(Date.now() - 25200000), // 7 hours ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Archive Manager',
        userRole: 'moderator',
        activityType: 'archive_media',
        action: 'Archived old media',
        targetType: 'archive',
        targetName: 'Old Event Photos',
        mediaType: 'image',
        details: { reason: 'Outdated content', count: 25 },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        method: 'PUT',
        url: '/gallery/archive',
        status: 'success',
        timestamp: new Date(Date.now() - 28800000), // 8 hours ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Super Admin',
        userRole: 'superadmin',
        activityType: 'view_activity_logs',
        action: 'Viewed activity logs',
        targetType: 'analytics',
        details: { filters: { dateRange: '24h' } },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'GET',
        url: '/gallery/activity-logs',
        status: 'success',
        timestamp: new Date(Date.now() - 32400000), // 9 hours ago
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: 'Tag Manager',
        userRole: 'user',
        activityType: 'create_tag',
        action: 'Created new tag',
        targetType: 'tag',
        targetName: 'Politics',
        details: { description: 'Political events and announcements' },
        ipAddress: '192.168.1.106',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'POST',
        url: '/gallery/tags',
        status: 'success',
        timestamp: new Date(Date.now() - 36000000), // 10 hours ago
      }
    ];

    // Insert sample activities
    const result = await ActivityLog.insertMany(sampleActivities);
    console.log(`✅ Successfully seeded ${result.length} activity logs`);

    return result;
  } catch (error) {
    console.error('❌ Error seeding activity logs:', error);
    throw error;
  }
};

module.exports = { seedActivityLogs };

// If run directly, execute seeding
if (require.main === module) {
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ssc-website', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('📊 Connected to MongoDB');
      
      await seedActivityLogs();
      
      console.log('🎉 Activity logs seeding completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    }
  };

  connectDB();
}