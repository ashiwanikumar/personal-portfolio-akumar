# Blog Management API Documentation

## Table of Contents

- [Blog Management API Documentation](#blog-management-api-documentation)
  - [Table of Contents](#table-of-contents)
  - [1. Overview](#1-overview)
  - [2. Data Models (Schemas)](#2-data-models-schemas)
    - [Blog (`server/src/models/blog/blog.js`)](#blog-serversrcmodelsblogblogjs)
    - [BlogCategory (`server/src/models/blog/blogCategory.js`)](#blogcategory-serversrcmodelsblogblogcategoryjs)
    - [BlogTag (`server/src/models/blog/blogTag.js`)](#blogtag-serversrcmodelsblogblogtagjs)
  - [3. API Endpoints](#3-api-endpoints)
    - [Blog CRUD \& Media (`server/src/routes/blog/blog.js`)](#blog-crud--media-serversrcroutesblogblogjs)
      - [Public Blog Endpoints](#public-blog-endpoints)
      - [Media Uploads](#media-uploads)
      - [Scheduler Subroutes](#scheduler-subroutes)
    - [Blog Analytics (`server/src/routes/blog/blogAnalytics.js`)](#blog-analytics-serversrcroutesblogbloganalyticsjs)
    - [Email Activity (`server/src/routes/blog/emailActivity.js`)](#email-activity-serversrcroutesblogemailactivityjs)
    - [Blog Category (`server/src/routes/blog/blogCategory.js`)](#blog-category-serversrcroutesblogblogcategoryjs)
    - [Blog Tag (`server/src/routes/blog/blogTag.js`)](#blog-tag-serversrcroutesblogblogtagjs)
    - [Blog Scheduler (Scheduling, Cron, Bulk, System) (`server/src/routes/blog/blogScheduler.js`)](#blog-scheduler-scheduling-cron-bulk-system-serversrcroutesblogblogschedulerjs)
  - [4. Controllers](#4-controllers)
  - [5. Services](#5-services)
  - [6. Media Uploads (Multer)](#6-media-uploads-multer)
  - [7. Email Notifications](#7-email-notifications)
    - [Email Templates (`server/src/mails/blog/`)](#email-templates-serversrcmailsblog)
      - [7.1 Blog Approval Templates (`blogApprovalEmailTemplate.js`)](#71-blog-approval-templates-blogapprovalemailtemplatejs)
      - [7.2 Blog Scheduling Templates (`blogScheduleEmailTemplate.js`)](#72-blog-scheduling-templates-blogscheduleemailtemplatejs)
    - [Email Notification Logic](#email-notification-logic)
      - [7.3 Email Workflow by Action](#73-email-workflow-by-action)
      - [7.4 Email Routing \& Validation](#74-email-routing--validation)
    - [Email Sending Service (`server/src/utils/blog/sendBlogApprovalEmail.js`)](#email-sending-service-serversrcutilsblogsendblogapprovalemailjs)
      - [7.5 Core Functions](#75-core-functions)
      - [7.6 Email Configuration](#76-email-configuration)
      - [7.7 Email Activity Logging](#77-email-activity-logging)
    - [Email Template Features](#email-template-features)
      - [7.8 Template Components](#78-template-components)
      - [7.9 Blog URL Generation](#79-blog-url-generation)
    - [Email Flow States](#email-flow-states)
      - [7.10 Complete Email Flow Diagram](#710-complete-email-flow-diagram)
      - [7.11 Email Types Summary](#711-email-types-summary)
    - [Error Handling \& Reliability](#error-handling--reliability)
      - [7.12 Email Validation \& Error Handling](#712-email-validation--error-handling)
  - [8. Scheduling \& Cron Jobs](#8-scheduling--cron-jobs)
  - [9. Appendix: Error Handling \& Security](#9-appendix-error-handling--security)
  - [10. Recent Authentication Fixes \& Improvements](#10-recent-authentication-fixes--improvements)
    - [Authentication Middleware Updates](#authentication-middleware-updates)
    - [Route Loading Optimization](#route-loading-optimization)
    - [Security Improvements](#security-improvements)
  - [Example: Blog Scheduling Flow](#example-blog-scheduling-flow)
  - [Example: Blog Analytics Flow](#example-blog-analytics-flow)
  - [Example: Email Activity Tracking](#example-email-activity-tracking)
  - [Example: Media Upload](#example-media-upload)
  - [Example: Email Notification](#example-email-notification)
  - [References](#references)
    - [Core Components](#core-components)
    - [Media \& Upload Components](#media--upload-components)
    - [Email System Components](#email-system-components)
    - [Client-Side Components](#client-side-components)
    - [Configuration Files](#configuration-files)
    - [Email Flow Integration Points](#email-flow-integration-points)
  - [Recent Updates (July 2024)](#recent-updates-july-2024)
    - [Authentication Fixes](#authentication-fixes)
    - [New Features Added](#new-features-added)
    - [API Improvements](#api-improvements)
    - [Documentation Updates](#documentation-updates)

---

## 1. Overview

This API provides a robust system for managing blogs, including categories, tags, media uploads, scheduling (one-time, recurring, conditional), approval workflows, and notification emails. It is designed for use by admins, content managers, and super admins, with fine-grained access control and audit logging.

---

## 2. Data Models (Schemas)

### Blog (`server/src/models/blog/blog.js`)

| Field               | Type       | Description                                                  |
| ------------------- | ---------- | ------------------------------------------------------------ |
| `title`             | String     | Blog title (required)                                        |
| `coverImage`        | String     | URL to cover image                                           |
| `media`             | Array      | List of media objects (image/video, S3 info, etc.)           |
| `description`       | String     | Short description (required)                                 |
| `content`           | Object     | Blog content (DraftJS structure, required)                   |
| `isMarkdown`        | Boolean    | If content is markdown                                       |
| `author`            | ObjectId   | Reference to User                                            |
| `publishedDate`     | Date       | Date published                                               |
| `category`          | ObjectId   | Reference to BlogCategory                                    |
| `tags`              | [ObjectId] | References to BlogTag                                        |
| `approved`          | Boolean    | Approval status                                              |
| `status`            | String     | `draft`, `published`, `scheduled`, `archived`                |
| `scheduledAt`       | Date       | When scheduled                                               |
| `publishAt`         | Date       | When to publish                                              |
| `unpublishAt`       | Date       | When to unpublish/expire                                     |
| `isScheduled`       | Boolean    | Is scheduled                                                 |
| `scheduleType`      | String     | `once`, `recurring`, `conditional`                           |
| `recurringPattern`  | Object     | Recurrence details (frequency, interval, etc.)               |
| `schedulerMetadata` | Object     | Metadata for scheduling (createdBy, execution history, etc.) |
| `conditionalRules`  | Object     | Conditional publishing rules                                 |
| `featured`          | Boolean    | Is featured                                                  |
| `timestamps`        | Object     | `createdAt`, `updatedAt`                                     |

### BlogCategory (`server/src/models/blog/blogCategory.js`)

| Field        | Type       | Description              |
| ------------ | ---------- | ------------------------ |
| `name`       | String     | Category name (required) |
| `blogs`      | [ObjectId] | Blogs in this category   |
| `timestamps` | Object     | `createdAt`, `updatedAt` |

### BlogTag (`server/src/models/blog/blogTag.js`)

| Field        | Type       | Description              |
| ------------ | ---------- | ------------------------ |
| `name`       | String     | Tag name (required)      |
| `blogs`      | [ObjectId] | Blogs with this tag      |
| `timestamps` | Object     | `createdAt`, `updatedAt` |

---

## 3. API Endpoints

### Blog CRUD & Media (`server/src/routes/blog/blog.js`)

| Method | Endpoint                      | Description                     | Auth  |
| ------ | ----------------------------- | ------------------------------- | ----- |
| POST   | `/api/blog`                   | Create a blog                   | Admin |
| GET    | `/api/blogs`                  | Get all blogs                   | Auth  |
| GET    | `/api/blogs/paginated`        | Get blogs paginated             | Auth  |
| GET    | `/api/blogs/paginated/search` | Get blogs paginated with search | Auth  |
| GET    | `/api/blog/:id`               | Get blog by ID                  | Auth  |
| PUT    | `/api/blog/:id`               | Update blog by ID               | Admin |
| DELETE | `/api/blog/:id`               | Delete blog by ID               | Admin |
| PUT    | `/api/blog/approve/:id`       | Approve/Reject blog             | Admin |

#### Public Blog Endpoints

| Method | Endpoint                             | Description                              | Auth   |
| ------ | ------------------------------------ | ---------------------------------------- | ------ |
| GET    | `/api/public/blogs`                  | Get all approved and published blogs     | Public |
| GET    | `/api/public/blogs/paginated`        | Get approved blogs paginated             | Public |
| GET    | `/api/public/blogs/paginated/search` | Get approved blogs paginated with search | Public |
| GET    | `/api/public/blog/:id`               | Get approved blog by ID                  | Public |

**Note:** Public endpoints only return blogs where `approved: true` and `status: 'published'`. These endpoints do not require authentication and are safe for public consumption.

#### Media Uploads

| Method | Endpoint                           | Description                       | Auth  |
| ------ | ---------------------------------- | --------------------------------- | ----- |
| POST   | `/api/blog/cover-image`            | Upload cover image                | Admin |
| POST   | `/api/blog/content-image`          | Upload content image              | Admin |
| POST   | `/api/blog/media`                  | Upload video                      | Admin |
| POST   | `/api/blog/content-images`         | Upload multiple content images    | Admin |
| POST   | `/api/blog/:blogId/media`          | Add media to blog                 | Admin |
| POST   | `/api/blog/multiple-media`         | Upload multiple media (img/video) | Admin |
| DELETE | `/api/blog/:blogId/media/:mediaId` | Remove media from blog            | Admin |
| GET    | `/api/blog/:blogId/media`          | Get blog media                    | Auth  |

#### Scheduler Subroutes

All scheduler routes are under `/api/blog/scheduler` (see below).

### Blog Analytics (`server/src/routes/blog/blogAnalytics.js`)

| Method | Endpoint                                    | Description                               | Auth  |
| ------ | ------------------------------------------- | ----------------------------------------- | ----- |
| GET    | `/api/blog/analytics/summary`               | Get activity summary for dashboard        | Admin |
| GET    | `/api/blog/analytics/dashboard`             | Get comprehensive blog activity analytics | Admin |
| GET    | `/api/blog/analytics/activities/recent`     | Get recent blog activities                | Admin |
| GET    | `/api/blog/analytics/activities/export`     | Export blog activities to CSV/Excel       | Admin |
| GET    | `/api/blog/analytics/activity-types`        | Get available activity types              | Admin |
| GET    | `/api/blog/analytics/blog/:blogId/timeline` | Get activity timeline for specific blog   | Admin |
| GET    | `/api/blog/analytics/user/:userId/stats`    | Get user activity statistics              | Admin |

### Email Activity (`server/src/routes/blog/emailActivity.js`)

| Method | Endpoint                                     | Description                                 | Auth  |
| ------ | -------------------------------------------- | ------------------------------------------- | ----- |
| GET    | `/api/email-activity/my-stats`               | Get current user's email statistics         | Auth  |
| GET    | `/api/email-activity/dashboard`              | Get email activity dashboard data           | Auth  |
| GET    | `/api/email-activity/recent`                 | Get recent email activities                 | Auth  |
| GET    | `/api/email-activity/overall-stats`          | Get overall email statistics (admin only)   | Admin |
| GET    | `/api/email-activity/daily-trends`           | Get daily email trends (admin only)         | Admin |
| GET    | `/api/email-activity/activities`             | Get paginated email activities (admin only) | Admin |
| GET    | `/api/email-activity/user-stats/:userId`     | Get email stats for specific user (admin)   | Admin |
| GET    | `/api/email-activity/top-recipients`         | Get top email recipients (admin only)       | Admin |
| GET    | `/api/email-activity/export`                 | Export email activities data (admin only)   | Admin |
| DELETE | `/api/email-activity/cleanup`                | Clean up old email activities (admin only)  | Admin |
| POST   | `/api/email-activity/update-delivery-status` | Update email delivery status (webhook)      | None  |

### Blog Category (`server/src/routes/blog/blogCategory.js`)

| Method | Endpoint                                | Description                        | Auth   |
| ------ | --------------------------------------- | ---------------------------------- | ------ |
| POST   | `/api/blog-category`                    | Create category                    | Admin  |
| GET    | `/api/blog-categories`                  | Get all categories                 | Public |
| GET    | `/api/blog-categories/paginated/search` | Get categories paginated w/ search | Public |
| GET    | `/api/blog-category/:id`                | Get category by ID                 | Public |
| PUT    | `/api/blog-category/:id`                | Update category                    | Admin  |
| DELETE | `/api/blog-category/:id`                | Delete category                    | Admin  |

### Blog Tag (`server/src/routes/blog/blogTag.js`)

| Method | Endpoint                          | Description                  | Auth   |
| ------ | --------------------------------- | ---------------------------- | ------ |
| POST   | `/api/blog-tag`                   | Create tag                   | Admin  |
| GET    | `/api/blog-tags`                  | Get all tags                 | Public |
| GET    | `/api/blog-tags/paginated/search` | Get tags paginated w/ search | Public |
| GET    | `/api/blog-tag/:id`               | Get tag by ID                | Public |
| PUT    | `/api/blog-tag/:id`               | Update tag                   | Admin  |
| DELETE | `/api/blog-tag/:id`               | Delete tag                   | Admin  |

### Blog Scheduler (Scheduling, Cron, Bulk, System) (`server/src/routes/blog/blogScheduler.js`)

| Method | Endpoint                                            | Description                    | Auth  |
| ------ | --------------------------------------------------- | ------------------------------ | ----- |
| POST   | `/api/blog/scheduler/:id/schedule`                  | Schedule blog                  | Admin |
| PUT    | `/api/blog/scheduler/:id/schedule`                  | Update blog schedule           | Admin |
| DELETE | `/api/blog/scheduler/:id/schedule`                  | Unschedule blog                | Admin |
| GET    | `/api/blog/scheduler/scheduled/dashboard`           | Get scheduled blogs dashboard  | Admin |
| POST   | `/api/blog/scheduler/bulk-schedule`                 | Bulk schedule blogs            | Admin |
| GET    | `/api/blog/scheduler/system/cron-status`            | Get cron jobs status           | Admin |
| POST   | `/api/blog/scheduler/system/cron/:jobName/control`  | Control cron job               | Admin |
| POST   | `/api/blog/scheduler/system/process-scheduled`      | Manual process scheduled blogs | Admin |
| POST   | `/api/blog/scheduler/system/process-unpublications` | Manual process unpublications  | Admin |
| POST   | `/api/blog/scheduler/system/cleanup`                | Cleanup expired schedules      | Admin |

---

## 4. Controllers

- **BlogController:** Handles all blog CRUD, approval, media, and paginated queries.
- **BlogCategoryController:** Handles category CRUD and paginated search.
- **BlogTagController:** Handles tag CRUD and paginated search.
- **BlogSchedulerController:** Handles scheduling, unscheduling, updating schedules, dashboard, cron job control, and bulk operations.
- **BlogAnalyticsController:** Handles blog activity analytics, user statistics, activity timeline, and data export.
- **EmailActivityController:** Handles email activity tracking, statistics, delivery status, and reporting.

---

## 5. Services

- **blogService.js:** All business logic for blog CRUD, approval, media, and search.
- **blogCategoryService.js:** Category CRUD and search.
- **blogTagService.js:** Tag CRUD and search.
- **blogSchedulerService.js:** Handles scheduling logic, recurring/conditional rules, and processing scheduled publications/unpublications.
- **blogCronJobs.js:** Manages cron jobs for publication, unpublication, cleanup, and health checks.
- **blogNotificationService.js:** Finds users for notifications (superadmin, admin, content-manager), validates permissions, and selects recipients for emails.
- **blogActivityService.js:** Handles blog activity logging, analytics, user statistics, and activity timeline generation.
- **emailActivityService.js:** Manages email activity tracking, delivery status, statistics, and reporting functionality.

---

## 6. Media Uploads (Multer)

- **blogMulter.js:** Handles all S3 uploads for blog cover images, content images, videos, and multiple media. Enforces file type/size restrictions, organizes uploads by type and date, and logs security events.
  - Single and multiple upload handlers for cover images, content images, videos, and mixed media.
  - S3/CloudFront integration, cache invalidation, and utility functions for extracting S3 keys.

**Example:**

```http
POST /api/blog/cover-image
Content-Type: multipart/form-data
Field: coverImage
```

---

## 7. Email Notifications

The blog management system implements a comprehensive email notification system with multiple templates and intelligent routing based on blog status and scheduling.

### Email Templates (`server/src/mails/blog/`)

#### 7.1 Blog Approval Templates (`blogApprovalEmailTemplate.js`)

| Template Function                         | Purpose                                            | Trigger                          | Recipients            |
| ----------------------------------------- | -------------------------------------------------- | -------------------------------- | --------------------- |
| `blogApprovalNotificationEmailTemplate()` | Notify super admins about blog submissions/actions | Blog creation, approval actions  | Super Admins          |
| `blogStatusUpdateEmailTemplate()`         | Notify authors about status changes                | Approval, rejection, publication | Blog Author           |
| `blogApprovedWithScheduleEmailTemplate()` | Notify when blog is approved with scheduling       | Approval + scheduling            | Author + Super Admins |

#### 7.2 Blog Scheduling Templates (`blogScheduleEmailTemplate.js`)

| Template Function                            | Purpose                  | Trigger                                 | Recipients            |
| -------------------------------------------- | ------------------------ | --------------------------------------- | --------------------- |
| `blogScheduleNotificationEmailTemplate()`    | Confirm blog scheduling  | Blog scheduled for future publication   | Author + Super Admins |
| `blogPublicationConfirmationEmailTemplate()` | Confirm blog publication | Blog goes live (scheduled or immediate) | Author + Super Admins |

### Email Notification Logic

#### 7.3 Email Workflow by Action

**Blog Creation:**

```javascript
// Location: server/src/controllers/blog/blogController.js:24-129
// Triggers: POST /api/blog
if (shouldNotify || req.body.requestApproval) {
  // Send to super admins (excluding author if they're also super admin)
  sendBlogApprovalNotification(blog, approvalData, superAdminEmails)
}
```

**Blog Approval:**

```javascript
// Location: server/src/controllers/blog/blogController.js:369-602
// Triggers: PUT /api/blog/approve/:id

// 1. Status update to author
sendBlogStatusUpdateNotification(blog, statusData, authorEmail)

// 2. Approval notification to super admins
sendBlogApprovalNotification(blog, approvalData, superAdminEmails)

// 3. Conditional publication/scheduling emails
if (approved && blog.isScheduled && future_publish_date) {
  // Send "Approved & Scheduled" email
  sendBlogApprovalEmail(approvedScheduleTemplate, recipients)
} else if (approved && blog.status === "published") {
  // Send "Blog Published" email
  sendBlogApprovalEmail(publicationTemplate, recipients)
}
```

**Blog Scheduling:**

```javascript
// Location: server/src/controllers/blog/blogSchedulerController.js:13-128
// Triggers: POST /api/blog/scheduler/:id/schedule

// Send scheduling confirmation
sendBlogApprovalEmail(scheduleTemplate, [author, ...superAdmins])
```

**Blog Publication (Scheduled):**

```javascript
// Location: server/src/services/blog/blogSchedulerService.js:197-363
// Triggers: Cron job execution

// Send publication confirmation
sendBlogApprovalEmail(publicationTemplate, [author, ...superAdmins])
```

#### 7.4 Email Routing & Validation

**Recipient Logic:**

```javascript
// Location: server/src/services/blog/blogNotificationService.js
// Super admin emails (excludes disabled, includes inactive)
const superAdminEmails = await blogNotificationService.getSuperAdminUsers({
  emailsOnly: true,
  includeDisabled: false,
  includeInactive: true,
});

// Email validation and deduplication
const validEmails = emails.filter(email => 
  email && typeof email === 'string' && email.includes('@')
);
const filteredEmails = authorEmail 
  ? validEmails.filter(email => email.toLowerCase() !== authorEmail.toLowerCase())
  : validEmails;
```

### Email Sending Service (`server/src/utils/blog/sendBlogApprovalEmail.js`)

#### 7.5 Core Functions

| Function                              | Purpose                                     | Parameters                          | Returns |
| ------------------------------------- | ------------------------------------------- | ----------------------------------- | ------- |
| `sendBlogApprovalEmail()`             | Core email sending function                 | subject, body, recipients, metadata | Promise |
| `sendBlogApprovalNotification()`      | Send approval notifications to super admins | blog, template, emails, data        | Promise |
| `sendBlogStatusUpdateNotification()`  | Send status updates to authors              | blog, template, email, data         | Promise |
| `sendBulkBlogApprovalNotifications()` | Send bulk notifications                     | blogs, template, emails, data       | Promise |

#### 7.6 Email Configuration

**SMTP Setup (Zoho):**

```javascript
const transporter = nodemailer.createTransporter({
  host: process.env.ZOHO_SMTP_HOST,
  port: process.env.ZOHO_SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL_USER,
    pass: process.env.ZOHO_EMAIL_PASS
  }
});
```

**Custom Headers:**

```javascript
headers: {
  'X-Blog-ID': blogId,
  'X-Blog-Title': blogTitle,
  'X-Blog-Author': blogAuthor,
  'X-Blog-Slug': blogSlug,
  'X-Activity-Type': activityType,
  'X-Notification-Type': notificationType,
  'X-Scheduled-Publish': scheduledPublishAt,
  'X-Is-Scheduled': isScheduled,
  'X-Schedule-Type': scheduleType,
  'X-Priority': 'high'
}
```

#### 7.7 Email Activity Logging

**Database Logging:**

```javascript
// Location: server/src/models/blog/emailActivity.js
const emailActivity = new EmailActivity({
  blog: blogId,
  activityType: 'approval|schedule|publication',
  recipients: emailAddresses,
  emailSubject: subject,
  emailType: 'BlogApproval|BlogStatusUpdate|BlogSchedule|BlogPublication',
  notificationType: 'blog_approval|blog_status_update|blog_schedule|blog_published',
  messageId: info.messageId,
  triggeredBy: userId,
  metadata: { /* additional context */ }
});
```

### Email Template Features

#### 7.8 Template Components

**All templates include:**

- Responsive HTML design with mobile optimization
- Brand gradient styling (Shivraj Singh Chouhan branding)
- Blog preview with cover image, title, description
- Status-specific color coding and icons
- Action buttons with proper links
- Professional footer with company information
- Dark mode support via CSS media queries

**Template-Specific Features:**

**Approval Templates:**

- Status badges (pending, approved, rejected, published)
- Approval comments section
- Review URL links
- Author information

**Scheduling Templates:**

- Publication schedule details (date, time, type)
- Schedule management buttons
- "What happens next?" explanations
- Blog URL for live access

**Publication Templates:**

- "Your blog is live!" messaging
- Live blog URL prominence
- Social sharing encouragement
- Next steps guidance
- Publication statistics (if scheduled)

#### 7.9 Blog URL Generation

**URL Format:**

```javascript
const blogUrl = blog.slug
  ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blogs/${blog.slug}`
  : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${blog._id}`;

// Example: http://localhost:3002/blogs/stj-log-analyzer
```

**Environment Configuration:**

- `NEXT_PUBLIC_FRONTEND_URL`: Landing page base URL
- Used for generating live blog links in emails
- Supports both slug-based and ID-based URLs

### Email Flow States

#### 7.10 Complete Email Flow Diagram

```
Blog Creation → Super Admin Notification (Pending Review)
       ↓
   Approval Decision
       ↓
   ┌─── Approved + Scheduled ────→ "Approved & Scheduled" Email
   │           ↓
   │       Wait for Schedule
   │           ↓
   │    Auto-Publication ────→ "Blog Published" Email
   │
   └─── Approved + Immediate ────→ "Blog Published" Email
```

#### 7.11 Email Types Summary

| Email Type                   | Trigger                                | Subject Format                           | Recipients            |
| ---------------------------- | -------------------------------------- | ---------------------------------------- | --------------------- |
| **Blog Submission**          | Blog created with approval request     | `[PENDING] New Blog Submission: "Title"` | Super Admins          |
| **Approval Update**          | Blog approved/rejected                 | `[APPROVED/REJECTED] Blog: "Title"`      | Author + Super Admins |
| **Approved + Scheduled**     | Blog approved with future publish date | `✅ Blog Approved & Scheduled: "Title"`   | Author + Super Admins |
| **Scheduling Confirmation**  | Blog scheduled independently           | `📅 Blog Scheduled: "Title"`              | Author + Super Admins |
| **Publication Confirmation** | Blog goes live                         | `🎉 Blog Published: "Title"`              | Author + Super Admins |

### Error Handling & Reliability

#### 7.12 Email Validation & Error Handling

**Pre-send Validation:**

```javascript
// Email address validation
const isValidEmail = email && typeof email === 'string' && email.includes('@');

// Recipient deduplication
const uniqueRecipients = [...new Set(validEmails)];

// Author exclusion from admin notifications
const adminRecipients = superAdminEmails.filter(
  email => email.toLowerCase() !== authorEmail?.toLowerCase()
);
```

**Error Handling:**

```javascript
// Location: All email sending functions
try {
  await sendBlogApprovalEmail(/*...*/);
  logger.info(`Email sent successfully to: ${recipients}`);
} catch (emailError) {
  logger.error('Error sending email:', emailError);
  // Emails fail gracefully - don't break main operations
}
```

**Asynchronous Processing:**

```javascript
// Non-blocking email sending
setImmediate(async () => {
  try {
    // Email sending logic
  } catch (error) {
    // Error logging only - doesn't affect main flow
  }
});
```

---

## 8. Scheduling & Cron Jobs

- **blogSchedulerService.js:** Implements scheduling logic for:
  - One-time, recurring, and conditional blog publication
  - Unpublishing/archiving after a set date
  - Execution history and metadata tracking
  - Dashboard stats (scheduled, published, failed, upcoming)
  - Cleanup of expired schedules and old execution history

- **blogCronJobs.js:** Uses `node-cron` to run:
  - Publication job (every minute)
  - Unpublication job (every 5 minutes)
  - Daily cleanup (midnight)
  - Health check (every 30 minutes)
  - Manual trigger, start/stop/restart for each job
  - Graceful shutdown on process termination

---

## 9. Appendix: Error Handling & Security

- **Validation:** All endpoints validate input (e.g., using `express-validator` for scheduler routes).
- **Authentication & Authorization:** Most routes require authentication; admin/superadmin checks for sensitive actions.
- **File Upload Security:** Only allows specific file types/extensions, enforces size limits, logs all upload events.
- **Email Security:** Uses secure SMTP, disables auto-replies, tracks all outgoing emails with custom headers.
- **Audit Logging:** All major actions (CRUD, scheduling, uploads, emails) are logged for traceability.

## 10. Recent Authentication Fixes & Improvements

### Authentication Middleware Updates

**Blog Analytics Routes:**

- Added `superOrMarketingAdminCheck` middleware to all blog analytics endpoints
- Fixed 401 Unauthorized errors by ensuring proper authentication
- All analytics endpoints now require admin-level access

**Blog Tag Routes:**

- Updated authentication from `authCheck` to `superOrMarketingAdminCheck` for create, update, and delete operations
- Ensures consistent admin-level access control across all blog management features

### Route Loading Optimization

**Issue Resolved:**

- Fixed route conflicts caused by `loadRoutes` function loading individual route files
- Blog analytics routes were being loaded twice, causing authentication conflicts
- Solution: Modified route loading to prevent duplicate route registration

**Authentication Flow:**

```
Client Request → authCheck → superOrMarketingAdminCheck → Controller → Service
```

### Security Improvements

- **Consistent Authorization:** All blog management endpoints now use consistent authentication levels
- **Role-based Access:** Clear distinction between public, authenticated, and admin-only endpoints
- **Audit Trail:** All analytics and email activity operations are logged for security monitoring

---

## Example: Blog Scheduling Flow

1. **Admin schedules a blog** via `/api/blog/scheduler/:id/schedule` with `publishAt`, `unpublishAt`, and schedule type.
2. **Cron job** checks every minute for blogs ready to publish, and every 5 minutes for blogs to unpublish.
3. **On publication/unpublication**, status is updated, execution history is recorded, and notifications are sent.
4. **Admins can view dashboard stats** and manually trigger or control jobs as needed.

## Example: Blog Analytics Flow

1. **Client requests analytics** via `/api/blog/analytics/summary` with period parameter (24h, 7d, 30d, 90d).
2. **Authentication middleware** validates user has admin access (`superOrMarketingAdminCheck`).
3. **Analytics controller** processes request and calls analytics service.
4. **Activity service** queries blog activity data and returns formatted statistics.
5. **Response includes** activity summaries, user statistics, and timeline data.

## Example: Email Activity Tracking

1. **Email notification sent** via blog approval/scheduling/publication process.
2. **Email activity logged** in `emailActivity` collection with delivery status.
3. **Client requests email stats** via `/api/email-activity/my-stats` or admin endpoints.
4. **Email activity service** processes request and returns statistics.
5. **Dashboard displays** email delivery rates, recipient analytics, and trends.

---

## Example: Media Upload

```http
POST /api/blog/cover-image
Content-Type: multipart/form-data
Field: coverImage
```

```http
POST /api/blog/content-images
Content-Type: multipart/form-data
Field: contentImages[]
```

---

## Example: Email Notification

- **On new blog submission:** Super admins receive a "pending approval" email with a review link.
- **On approval/rejection:** Author receives a status update email; super admins are notified of the action.

---

## References

### Core Components

- **Models:** `server/src/models/blog/`
  - `blog.js` - Blog schema with scheduling fields
  - `blogCategory.js` - Category schema
  - `blogTag.js` - Tag schema
  - `blogActivity.js` - Blog activity logging schema
  - `emailActivity.js` - Email activity logging schema

- **Routes:** `server/src/routes/blog/`
  - `blog.js` - Main blog CRUD & media routes
  - `blogCategory.js` - Category management routes
  - `blogTag.js` - Tag management routes  
  - `blogScheduler.js` - Scheduling & cron management routes
  - `blogAnalytics.js` - Blog analytics & activity tracking routes
  - `emailActivity.js` - Email activity tracking routes

- **Controllers:** `server/src/controllers/blog/`
  - `blogController.js` - Blog CRUD, approval, immediate publication emails
  - `blogCategoryController.js` - Category management
  - `blogTagController.js` - Tag management
  - `blogSchedulerController.js` - Scheduling, bulk operations, scheduling emails
  - `blogAnalyticsController.js` - Blog analytics, user statistics, activity timeline
  - `emailActivityController.js` - Email activity tracking, statistics, reporting

- **Services:** `server/src/services/blog/`
  - `blogService.js` - Core blog business logic
  - `blogCategoryService.js` - Category management
  - `blogTagService.js` - Tag management
  - `blogSchedulerService.js` - Scheduling logic, publication emails
  - `blogCronJobs.js` - Cron job management
  - `blogNotificationService.js` - Recipient management & email routing
  - `blogActivityService.js` - Blog activity logging, analytics, statistics
  - `emailActivityService.js` - Email activity tracking, delivery status, reporting

### Media & Upload Components

- **Multer Middleware:** `server/src/middlewares/blogMulter.js`
  - S3 upload handlers for cover images, content images, videos
  - File validation, size limits, security logging
  - CloudFront integration and cache invalidation

### Email System Components

- **Email Templates:** `server/src/mails/blog/`
  - `blogApprovalEmailTemplate.js` - Approval notifications, status updates, approved+scheduled
  - `blogScheduleEmailTemplate.js` - Scheduling confirmations, publication confirmations

- **Email Sending Service:** `server/src/utils/blog/sendBlogApprovalEmail.js`
  - Core email sending functions
  - SMTP configuration (Zoho)
  - Email activity logging
  - Custom headers and metadata handling

### Client-Side Components

- **Blog Editor:** `client-dashboard/src/components/blog/BlogEditor.jsx`
  - Visual editor with Jodit WYSIWYG
  - Image upload integration
  - Markdown and preview modes
  - Custom image uploader with server integration

- **Blog Management:** `client-dashboard/src/views/superAdmin/blog/BlogManagement.jsx`
  - Blog approval workflows
  - Scheduling interface
  - Publication management

- **Blog View:** `client-dashboard/src/views/superAdmin/blog/BlogView.jsx`
  - Blog preview and sharing
  - Fixed share functionality

- **API Client:** `client-dashboard/src/api/blog/blog.ts`
  - Blog CRUD operations
  - Scheduling API calls (fixed endpoints)
  - Media upload functions

### Configuration Files

- **Environment:** `client-dashboard/.env`
  - `REACT_APP_BACKEND_API` - Backend API URL
  - `NEXT_PUBLIC_FRONTEND_URL` - Landing page URL for email links

### Email Flow Integration Points

**Email Trigger Locations:**

1. **Blog Creation** → `blogController.js:40-114` → Super admin notifications
2. **Blog Approval** → `blogController.js:399-602` → Author status updates + conditional emails
3. **Blog Scheduling** → `blogSchedulerController.js:34-117` → Scheduling confirmations  
4. **Blog Publication** → `blogSchedulerService.js:252-340` → Publication confirmations
5. **Immediate Publication** → `blogController.js:527-640` → Immediate publication emails

**Email Template Usage:**

- `blogApprovalNotificationEmailTemplate()` - Super admin notifications
- `blogStatusUpdateEmailTemplate()` - Author status updates
- `blogApprovedWithScheduleEmailTemplate()` - Approved + scheduled notifications
- `blogScheduleNotificationEmailTemplate()` - Scheduling confirmations
- `blogPublicationConfirmationEmailTemplate()` - Publication confirmations

**URL Generation:**

- Blog URLs use `NEXT_PUBLIC_FRONTEND_URL` + `/blogs/` + `slug`
- Email links point to live blog pages on landing site
- Admin links point to dashboard management pages

---

**This documentation is auto-generated based on the current codebase and covers all implemented features as of now. For further details, refer to the respective files and inline comments.**

---

## Recent Updates (July 2024)

### Authentication Fixes

- **Fixed 401 Unauthorized errors** in blog analytics endpoints by adding proper `superOrMarketingAdminCheck` middleware
- **Updated blog tag routes** to use consistent admin-level authentication
- **Resolved route loading conflicts** that were causing duplicate route registration

### New Features Added

- **Blog Analytics System** - Comprehensive activity tracking and reporting
- **Email Activity Tracking** - Email delivery monitoring and statistics
- **Enhanced Security** - Consistent authentication across all blog management endpoints

### API Improvements

- **Added 7 new blog analytics endpoints** for activity tracking and reporting
- **Added 10 new email activity endpoints** for email monitoring and statistics
- **Enhanced error handling** and validation across all endpoints

### Documentation Updates

- **Updated authentication requirements** for all endpoints
- **Added new API endpoint documentation** for analytics and email tracking
- **Enhanced security documentation** with recent fixes and improvements
