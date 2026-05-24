/**
 * Email templates for blog scheduling notifications
 */

/**
 * Email template for blog scheduling notification
 * @param {Object} blog - The blog object
 * @param {Object} scheduleData - Scheduling information
 * @returns {Object} Email template with subject and body
 */
const blogScheduleNotificationEmailTemplate = (blog, scheduleData) => {
  // Determine blog URL based on slug
  const blogUrl = blog.slug
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blogs/${blog.slug}`
    : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${blog._id}`;

  // Format publish date
  const publishDate = new Date(scheduleData.publishAt);
  const formattedDate = publishDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = publishDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // Get schedule type display text
  const scheduleTypeText = {
    once: 'One-time Publication',
    recurring: 'Recurring Publication',
    conditional: 'Conditional Publication'
  }[scheduleData.scheduleType] || 'Scheduled Publication';

  // Format current date and time for subject
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const subject = `📅 Blog Scheduled: "${blog.title}" - ${dateTime}`;

  const body = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Blog Scheduled</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* Remove default styling */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .mobile-hide { display: none !important; }
      .mobile-center { text-align: center !important; }
      .container { padding: 0 !important; width: 100% !important; }
      .content { padding: 20px !important; }
      .title { font-size: 25px !important; }
      .blog-preview { padding: 15px !important; }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body, .container { background-color: #1a1a1a !important; }
      .content { background-color: #2a2a2a !important; }
      .text { color: #ffffff !important; }
    }
  </style>
</head>
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td bgcolor="#f4f4f4" align="center" style="padding: 20px 10px;">
        <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 20px 0;">
              <h1 style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Ashiwani Kumar
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content" bgcolor="#ffffff" style="padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Status Badge -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 600;">
                      📅 SCHEDULED
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h2 class="title" style="margin: 0 0 20px 0; font-family: 'Inter', Arial, sans-serif; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center;">
                Blog Scheduled Successfully
              </h2>

              <!-- Schedule Details -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-family: 'Inter', Arial, sans-serif; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                  📆 Schedule Details
                </h3>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="font-family: 'Inter', Arial, sans-serif; color: #6b7280;">Type:</strong>
                      <span style="font-family: 'Inter', Arial, sans-serif; color: #1a1a1a;">${scheduleTypeText}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="font-family: 'Inter', Arial, sans-serif; color: #6b7280;">Publish Date:</strong>
                      <span style="font-family: 'Inter', Arial, sans-serif; color: #1a1a1a;">${formattedDate}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <strong style="font-family: 'Inter', Arial, sans-serif; color: #6b7280;">Publish Time:</strong>
                      <span style="font-family: 'Inter', Arial, sans-serif; color: #1a1a1a;">${formattedTime}</span>
                    </td>
                  </tr>
                  ${scheduleData.comments ? `
                  <tr>
                    <td style="padding: 10px 0 0 0;">
                      <strong style="font-family: 'Inter', Arial, sans-serif; color: #6b7280;">Comments:</strong><br>
                      <span style="font-family: 'Inter', Arial, sans-serif; color: #1a1a1a; font-style: italic;">"${scheduleData.comments}"</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Blog Preview -->
              <div class="blog-preview" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                ${blog.coverImage ? `
                <img src="${blog.coverImage}" alt="${blog.title}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">
                ` : ''}
                
                <h3 style="margin: 0 0 10px 0; font-family: 'Inter', Arial, sans-serif; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                  ${blog.title}
                </h3>
                
                ${blog.description ? `
                <p style="margin: 0 0 15px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #6b7280; line-height: 1.6;">
                  ${blog.description.substring(0, 200)}${blog.description.length > 200 ? '...' : ''}
                </p>
                ` : ''}
                
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right: 20px;">
                      <span style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6b7280;">
                        <strong>Author:</strong> ${blog.author?.name || blog.author?.firstName + ' ' + blog.author?.lastName || 'Unknown'}
                      </span>
                    </td>
                    ${blog.category ? `
                    <td>
                      <span style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6b7280;">
                        <strong>Category:</strong> ${blog.category.name || blog.category}
                      </span>
                    </td>
                    ` : ''}
                  </tr>
                </table>
              </div>

              <!-- Action Buttons -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 10px;">
                          <a href="${blogUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 6px;">
                            View Blog
                          </a>
                        </td>
                        <td>
                          <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/blogs/${blog._id}/schedule" target="_blank" style="display: inline-block; background: #ffffff; color: #3B82F6; border: 2px solid #3B82F6; font-family: 'Inter', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 10px 30px; border-radius: 6px;">
                            Manage Schedule
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <div style="background-color: #EBF5FF; border-left: 4px solid #3B82F6; padding: 15px; margin-top: 30px; border-radius: 4px;">
                <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1a1a1a;">
                  <strong>Note:</strong> This blog will be automatically published at the scheduled time. You'll receive a confirmation email once it's live.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.6;">
                      This is an automated notification from the Blog Management System.<br>
                      © ${new Date().getFullYear()} Ashiwani Kumar. All rights reserved.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}" target="_blank" style="color: #3B82F6; font-family: 'Inter', Arial, sans-serif; font-size: 12px; text-decoration: none;">
                      Visit Website
                    </a>
                    <span style="color: #6b7280; padding: 0 10px;">|</span>
                    <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/contact" target="_blank" style="color: #3B82F6; font-family: 'Inter', Arial, sans-serif; font-size: 12px; text-decoration: none;">
                      Contact Support
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, body };
};

/**
 * Email template for blog publication confirmation
 * @param {Object} blog - The blog object
 * @param {Object} publicationData - Publication information
 * @returns {Object} Email template with subject and body
 */
const blogPublicationConfirmationEmailTemplate = (blog, publicationData = {}) => {
  // Determine blog URL based on slug
  const blogUrl = blog.slug
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blogs/${blog.slug}`
    : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${blog._id}`;

  // Format current date and time for subject
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const subject = `🎉 Blog Published: "${blog.title}" - ${dateTime}`;

  const body = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Blog Published</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* Remove default styling */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .mobile-hide { display: none !important; }
      .mobile-center { text-align: center !important; }
      .container { padding: 0 !important; width: 100% !important; }
      .content { padding: 20px !important; }
      .title { font-size: 25px !important; }
      .blog-preview { padding: 15px !important; }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body, .container { background-color: #1a1a1a !important; }
      .content { background-color: #2a2a2a !important; }
      .text { color: #ffffff !important; }
    }
  </style>
</head>
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td bgcolor="#f4f4f4" align="center" style="padding: 20px 10px;">
        <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 20px 0;">
              <h1 style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #10B981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Ashiwani Kumar
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content" bgcolor="#ffffff" style="padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Success Badge -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 600;">
                      🎉 PUBLISHED
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h2 class="title" style="margin: 0 0 20px 0; font-family: 'Inter', Arial, sans-serif; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center;">
                Your Blog is Now Live!
              </h2>

              <!-- Success Message -->
              <p style="margin: 0 0 30px 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #6b7280; text-align: center; line-height: 1.6;">
                Congratulations! Your blog has been successfully published and is now available to readers.
              </p>

              <!-- Blog Preview -->
              <div class="blog-preview" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                ${blog.coverImage ? `
                <img src="${blog.coverImage}" alt="${blog.title}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">
                ` : ''}
                
                <h3 style="margin: 0 0 10px 0; font-family: 'Inter', Arial, sans-serif; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                  ${blog.title}
                </h3>
                
                ${blog.description ? `
                <p style="margin: 0 0 15px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #6b7280; line-height: 1.6;">
                  ${blog.description.substring(0, 200)}${blog.description.length > 200 ? '...' : ''}
                </p>
                ` : ''}
                
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right: 20px;">
                      <span style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6b7280;">
                        <strong>Author:</strong> ${blog.author?.name || blog.author?.firstName + ' ' + blog.author?.lastName || 'Unknown'}
                      </span>
                    </td>
                    ${blog.category ? `
                    <td>
                      <span style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6b7280;">
                        <strong>Category:</strong> ${blog.category.name || blog.category}
                      </span>
                    </td>
                    ` : ''}
                  </tr>
                </table>
              </div>

              <!-- Blog URL -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #6b7280;">
                  Your blog is live at:
                </p>
                <a href="${blogUrl}" target="_blank" style="color: #3B82F6; font-family: 'Inter', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; word-break: break-all;">
                  ${blogUrl}
                </a>
              </div>

              <!-- Action Buttons -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 10px;">
                          <a href="${blogUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 6px;">
                            View Live Blog
                          </a>
                        </td>
                        <td>
                          <a href="${blogUrl}" target="_blank" style="display: inline-block; background: #ffffff; color: #3B82F6; border: 2px solid #3B82F6; font-family: 'Inter', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 10px 30px; border-radius: 6px;">
                            Share Blog
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Stats (if available) -->
              ${publicationData.wasScheduled ? `
              <div style="background-color: #F3F4F6; border-radius: 8px; padding: 15px; margin-top: 30px;">
                <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #6b7280; text-align: center;">
                  <strong>Published on schedule</strong><br>
                  ${new Date(blog.publishedDate || blog.publishAt).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </p>
              </div>
              ` : ''}

              <!-- Next Steps -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 15px 0; font-family: 'Inter', Arial, sans-serif; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                  What's Next?
                </h3>
                <ul style="margin: 0; padding-left: 20px; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #6b7280; line-height: 1.8;">
                  <li>Share your blog on social media to reach more readers</li>
                  <li>Monitor engagement and comments from your readers</li>
                  <li>Consider writing a follow-up post on related topics</li>
                  <li>Check analytics to understand your audience better</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.6;">
                      This is an automated notification from the Blog Management System.<br>
                      © ${new Date().getFullYear()} Ashiwani Kumar. All rights reserved.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}" target="_blank" style="color: #3B82F6; font-family: 'Inter', Arial, sans-serif; font-size: 12px; text-decoration: none;">
                      Visit Website
                    </a>
                    <span style="color: #6b7280; padding: 0 10px;">|</span>
                    <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/blogs" target="_blank" style="color: #3B82F6; font-family: 'Inter', Arial, sans-serif; font-size: 12px; text-decoration: none;">
                      Manage Blogs
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, body };
};

module.exports = {
  blogScheduleNotificationEmailTemplate,
  blogPublicationConfirmationEmailTemplate
};