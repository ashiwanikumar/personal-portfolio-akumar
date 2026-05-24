/**********************************
  Blog Approval Notification Email Template
***********************************/
exports.blogApprovalNotificationEmailTemplate = (blogData, approvalData = {}) => {
  // Extract blog data safely
  const title = blogData?.title || "Untitled Blog";
  const excerpt = blogData?.excerpt || blogData?.description || "";
  const authorName = blogData?.author?.name || blogData?.author?.email || "Unknown Author";
  const authorEmail = blogData?.author?.email || "";
  const category = blogData?.category || "General";
  const status = blogData?.status || "draft";
  const coverImage = blogData?.coverImage?.url || blogData?.coverImage?.cloudFrontUrl || "";
  const createdAt = blogData?.createdAt ? new Date(blogData.createdAt) : new Date();
  const updatedAt = blogData?.updatedAt ? new Date(blogData.updatedAt) : new Date();
  
  // Extract approval data
  const approvalStatus = approvalData?.status || "pending";
  const approverName = approvalData?.approverName || "System";
  const comments = approvalData?.comments || "";
  const reviewUrl = approvalData?.reviewUrl || `${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/blogs/${blogData._id}/review`;

  // Map status to readable format
  const statusMessages = {
    pending: { title: "Pending Approval", color: "#f59e0b", bgColor: "#fef3c7", icon: "⏳" },
    approved: { title: "Approved", color: "#10b981", bgColor: "#d1fae5", icon: "✅" },
    rejected: { title: "Rejected", color: "#ef4444", bgColor: "#fee2e2", icon: "❌" },
    published: { title: "Published", color: "#3b82f6", bgColor: "#dbeafe", icon: "🚀" },
    draft: { title: "Draft", color: "#6b7280", bgColor: "#f3f4f6", icon: "📝" },
  };

  const statusInfo = statusMessages[approvalStatus] || statusMessages.pending;

  const template = `<!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="color-scheme" content="light dark">
              <meta name="supported-color-schemes" content="light dark">
              <title>Blog ${statusInfo.title} - Ashiwani Kumar</title>
              <style type="text/css" rel="stylesheet" media="all">
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  
                  body {
                      width: 100% !important;
                      height: 100%;
                      margin: 0;
                      -webkit-text-size-adjust: none;
                      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                      background-color: #fff7ed;
                      color: #424761;
                  }
                  
                  a {
                      color: #ea580c;
                      text-decoration: none;
                      font-weight: 500;
                  }
                  
                  a:hover {
                      text-decoration: underline;
                  }
                  
                  .primary-button {
                      background: linear-gradient(90deg, #ea580c, #f97316);
                      border-radius: 8px;
                      color: #ffffff !important;
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      line-height: 100%;
                      padding: 16px 32px;
                      text-decoration: none;
                      text-align: center;
                      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
                      margin: 8px 4px;
                  }
                  
                  .secondary-button {
                      background: #ffffff;
                      border: 2px solid #ea580c;
                      border-radius: 8px;
                      color: #ea580c !important;
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      line-height: 100%;
                      padding: 14px 30px;
                      text-decoration: none;
                      text-align: center;
                      margin: 8px 4px;
                  }
                  
                  .header-logo {
                      padding: 32px 0;
                      text-align: center;
                  }
                  
                  .content-container {
                      background-color: #FFFFFF;
                      border-radius: 16px;
                      box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.06);
                      overflow: hidden;
                      margin: 0 16px;
                      border: 1px solid rgba(234, 88, 12, 0.1);
                  }
                  
                  .header-background {
                      background: linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd);
                      height: 8px;
                      width: 100%;
                  }
                  
                  .content-inner {
                      padding: 40px;
                  }
                  
                  .content-header {
                      font-weight: 700;
                      font-size: 28px;
                      line-height: 36px;
                      color: #1C2033;
                      margin: 0 0 24px 0;
                      text-align: center;
                      background: linear-gradient(90deg, ${statusInfo.color}, ${statusInfo.color}dd);
                      -webkit-background-clip: text;
                      -webkit-text-fill-color: transparent;
                      background-clip: text;
                  }
                  
                  .content-text {
                      font-size: 16px;
                      line-height: 26px;
                      margin: 0 0 24px 0;
                  }
                  
                  .status-box {
                      background-color: ${statusInfo.bgColor};
                      border-radius: 12px;
                      padding: 24px;
                      margin: 24px 0;
                      border-left: 4px solid ${statusInfo.color};
                  }
                  
                  .blog-preview {
                      background-color: #f8fafc;
                      border-radius: 12px;
                      padding: 24px;
                      margin: 24px 0;
                      border: 1px solid #e2e8f0;
                  }
                  
                  .blog-cover {
                      width: 100%;
                      max-width: 600px;
                      height: 200px;
                      object-fit: cover;
                      border-radius: 8px;
                      margin-bottom: 16px;
                  }
                  
                  .blog-title {
                      font-weight: 700;
                      font-size: 24px;
                      line-height: 32px;
                      color: #1f2937;
                      margin: 0 0 12px 0;
                  }
                  
                  .blog-excerpt {
                      color: #6b7280;
                      font-size: 16px;
                      line-height: 24px;
                      margin: 0 0 16px 0;
                  }
                  
                  .blog-meta {
                      display: flex;
                      flex-wrap: wrap;
                      gap: 16px;
                      font-size: 14px;
                      color: #6b7280;
                  }
                  
                  .meta-item {
                      display: flex;
                      align-items: center;
                      gap: 4px;
                  }
                  
                  .blog-details {
                      background-color: #f8fafc;
                      border-radius: 12px;
                      padding: 24px;
                      margin: 24px 0;
                      border: 1px solid #e2e8f0;
                  }
                  
                  .detail-row {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 12px 0;
                      border-bottom: 1px solid #e2e8f0;
                  }
                  
                  .detail-row:last-child {
                      border-bottom: none;
                  }
                  
                  .detail-label {
                      font-weight: 600;
                      color: #374151;
                      font-size: 14px;
                  }
                  
                  .detail-value {
                      color: #1f2937;
                      font-size: 14px;
                      text-align: right;
                  }
                  
                  .status-badge {
                      display: inline-block;
                      padding: 4px 12px;
                      border-radius: 20px;
                      font-size: 12px;
                      font-weight: 600;
                      background-color: ${statusInfo.color};
                      color: white;
                  }
                  
                  .action-buttons {
                      text-align: center;
                      margin: 32px 0;
                  }
                  
                  .footer-section {
                      background-color: #f8fafc;
                      padding: 24px;
                      text-align: center;
                      border-top: 1px solid #e2e8f0;
                  }
                  
                  .footer-title {
                      font-weight: 600;
                      color: #374151;
                      font-size: 16px;
                      margin: 0 0 12px 0;
                  }
                  
                  .footer-text {
                      color: #6b7280;
                      font-size: 14px;
                      line-height: 20px;
                      margin: 0;
                  }
                  
                  @media only screen and (max-width: 600px) {
                      .content-inner {
                          padding: 24px;
                      }
                      
                      .content-header {
                          font-size: 24px;
                          line-height: 32px;
                      }
                      
                      .blog-title {
                          font-size: 20px;
                          line-height: 28px;
                      }
                      
                      .detail-row {
                          flex-direction: column;
                          align-items: flex-start;
                      }
                      
                      .detail-value {
                          text-align: left;
                          margin-top: 4px;
                      }
                      
                      .action-buttons {
                          flex-direction: column;
                      }
                      
                      .primary-button,
                      .secondary-button {
                          display: block;
                          margin: 8px 0;
                      }
                  }
              </style>
          </head>
          <body>
              <div class="header-logo">
                  <img src="https://ashiwanikumar.in/logo.png" alt="Ashiwani Kumar" style="height: 60px;">
              </div>
              
              <div class="content-container">
                  <div class="header-background"></div>
                  
                  <div class="content-inner">
                      <h1 class="content-header">Blog ${statusInfo.title}</h1>
                      
                      <p class="content-text">
                          Dear Super Admin,<br><br>
                          ${approvalStatus === 'pending' 
                            ? `A new blog post "${title}" by ${authorName} requires your approval.`
                            : `The blog post "${title}" by ${authorName} has been ${statusInfo.title.toLowerCase()}.`
                          }
                      </p>
                      
                      <div class="status-box">
                          <h3 style="margin: 0 0 12px 0; color: ${statusInfo.color}; font-size: 18px;">
                              ${statusInfo.icon} Status: <span class="status-badge">${statusInfo.title}</span>
                          </h3>
                          <p style="margin: 0; color: ${statusInfo.color}; font-size: 14px;">
                              ${approvalStatus === 'pending' 
                                ? 'This blog post is waiting for your review and approval.'
                                : `This blog post has been ${statusInfo.title.toLowerCase()} by ${approverName}.`
                              }
                          </p>
                      </div>
                      
                      <div class="blog-preview">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">
                              📝 Blog Preview
                          </h3>
                          
                          ${coverImage ? `<img src="${coverImage}" alt="Blog Cover" class="blog-cover">` : ''}
                          
                          <h2 class="blog-title">${title}</h2>
                          
                          ${excerpt ? `<p class="blog-excerpt">${excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt}</p>` : ''}
                          
                          <div class="blog-meta">
                              <div class="meta-item">
                                  <span>👤</span>
                                  <span>By ${authorName}</span>
                              </div>
                              <div class="meta-item">
                                  <span>📂</span>
                                  <span>${category}</span>
                              </div>
                              <div class="meta-item">
                                  <span>📅</span>
                                  <span>Created ${createdAt.toLocaleDateString('en-IN')}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div class="blog-details">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">
                              📋 Blog Details
                          </h3>
                          
                          <div class="detail-row">
                              <span class="detail-label">Blog ID:</span>
                              <span class="detail-value">#${blogData._id.toString().slice(-8).toUpperCase()}</span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Title:</span>
                              <span class="detail-value">${title}</span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Author:</span>
                              <span class="detail-value">${authorName} (${authorEmail})</span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Category:</span>
                              <span class="detail-value">${category}</span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Current Status:</span>
                              <span class="detail-value">
                                  <span class="status-badge">${statusInfo.title}</span>
                              </span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Created:</span>
                              <span class="detail-value">${createdAt.toLocaleDateString('en-IN')} at ${createdAt.toLocaleTimeString('en-IN')}</span>
                          </div>
                          
                          ${updatedAt > createdAt ? `
                          <div class="detail-row">
                              <span class="detail-label">Last Updated:</span>
                              <span class="detail-value">${updatedAt.toLocaleDateString('en-IN')} at ${updatedAt.toLocaleTimeString('en-IN')}</span>
                          </div>
                          ` : ''}
                          
                          ${approverName !== 'System' ? `
                          <div class="detail-row">
                              <span class="detail-label">${approvalStatus === 'pending' ? 'Reviewer' : 'Approved By'}:</span>
                              <span class="detail-value">${approverName}</span>
                          </div>
                          ` : ''}
                      </div>
                      
                      ${comments ? `
                      <div class="blog-details">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">
                              💬 ${approvalStatus === 'pending' ? 'Additional Notes' : 'Approval Comments'}
                          </h3>
                          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 20px;">
                              ${comments}
                          </p>
                      </div>
                      ` : ''}
                      
                      <div class="action-buttons">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">
                              🎯 Quick Actions
                          </h3>
                          
                          <a href="${reviewUrl}" class="primary-button">
                              ${approvalStatus === 'pending' ? '👀 Review & Approve' : '📖 View Blog'}
                          </a>
                          
                          <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/blogs" class="secondary-button">
                              📋 All Blogs
                          </a>
                      </div>
                      
                      <p class="content-text" style="text-align: center; color: #6b7280; font-size: 14px;">
                          ${approvalStatus === 'pending' 
                            ? 'Please review this blog post and take appropriate action.'
                            : 'Thank you for managing the blog approval process.'
                          }
                      </p>
                  </div>
                  
                  <div class="footer-section">
                      <h4 class="footer-title">Blog Management System</h4>
                      <p class="footer-text">
                          Ashiwani Kumar<br>
                          Content Management & Approval System
                      </p>
                  </div>
              </div>
              
              <div style="text-align: center; padding: 24px; color: #6b7280; font-size: 12px;">
                  <p style="margin: 0;">
                      This is an automated blog approval notification.<br>
                      For technical support, contact: hello@ashiwanikumar.in
                  </p>
              </div>
          </body>
      </html>`;

  return template;
};

/**********************************
  Blog Status Update Email Template (for Authors)
***********************************/
exports.blogStatusUpdateEmailTemplate = (blogData, statusData = {}) => {
  // Extract blog data safely
  const title = blogData?.title || "Untitled Blog";
  const excerpt = blogData?.excerpt || blogData?.description || "";
  const authorName = blogData?.author?.name || blogData?.author?.email || "Author";
  const category = blogData?.category || "General";
  const coverImage = blogData?.coverImage?.url || blogData?.coverImage?.cloudFrontUrl || "";
  const createdAt = blogData?.createdAt ? new Date(blogData.createdAt) : new Date();
  
  // Extract status data
  const status = statusData?.status || blogData?.status || "draft";
  const approverName = statusData?.approverName || "Admin";
  const comments = statusData?.comments || "";
  const blogUrl = statusData?.blogUrl || `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blogs/${blogData._id}`;

  // Map status to readable format
  const statusMessages = {
    approved: { title: "Approved", color: "#10b981", bgColor: "#d1fae5", icon: "✅", message: "Your blog post has been approved and is ready for publication!" },
    rejected: { title: "Rejected", color: "#ef4444", bgColor: "#fee2e2", icon: "❌", message: "Your blog post needs some revisions before it can be published." },
    published: { title: "Published", color: "#3b82f6", bgColor: "#dbeafe", icon: "🚀", message: "Congratulations! Your blog post is now live on the website." },
    draft: { title: "Saved as Draft", color: "#6b7280", bgColor: "#f3f4f6", icon: "📝", message: "Your blog post has been saved as a draft." },
    "under-review": { title: "Under Review", color: "#f59e0b", bgColor: "#fef3c7", icon: "⏳", message: "Your blog post is currently being reviewed by our team." },
  };

  const statusInfo = statusMessages[status] || {
    title: status,
    color: "#6b7280",
    bgColor: "#f3f4f6",
    icon: "📝",
    message: "Your blog post status has been updated."
  };

  const template = `<!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Blog Status Update - ${statusInfo.title}</title>
              <style type="text/css" rel="stylesheet" media="all">
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  
                  body {
                      width: 100% !important;
                      height: 100%;
                      margin: 0;
                      -webkit-text-size-adjust: none;
                      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                      background-color: #fff7ed;
                      color: #424761;
                  }
                  
                  a {
                      color: #ea580c;
                      text-decoration: none;
                      font-weight: 500;
                  }
                  
                  a:hover {
                      text-decoration: underline;
                  }
                  
                  .primary-button {
                      background: linear-gradient(90deg, #ea580c, #f97316);
                      border-radius: 8px;
                      color: #ffffff !important;
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      line-height: 100%;
                      padding: 16px 32px;
                      text-decoration: none;
                      text-align: center;
                      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
                  }
                  
                  .header-logo {
                      padding: 32px 0;
                      text-align: center;
                  }
                  
                  .content-container {
                      background-color: #FFFFFF;
                      border-radius: 16px;
                      box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.06);
                      overflow: hidden;
                      margin: 0 16px;
                      border: 1px solid rgba(234, 88, 12, 0.1);
                  }
                  
                  .header-background {
                      background: linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd);
                      height: 8px;
                      width: 100%;
                  }
                  
                  .content-inner {
                      padding: 40px;
                  }
                  
                  .content-header {
                      font-weight: 700;
                      font-size: 28px;
                      line-height: 36px;
                      color: #1C2033;
                      margin: 0 0 24px 0;
                      text-align: center;
                  }
                  
                  .content-text {
                      font-size: 16px;
                      line-height: 26px;
                      margin: 0 0 24px 0;
                  }
                  
                  .status-box {
                      background-color: ${statusInfo.bgColor};
                      border-radius: 12px;
                      padding: 24px;
                      margin: 24px 0;
                      border-left: 4px solid ${statusInfo.color};
                  }
                  
                  .blog-details {
                      background-color: #f8fafc;
                      border-radius: 12px;
                      padding: 24px;
                      margin: 24px 0;
                      border: 1px solid #e2e8f0;
                  }
                  
                  .detail-row {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 12px 0;
                      border-bottom: 1px solid #e2e8f0;
                  }
                  
                  .detail-row:last-child {
                      border-bottom: none;
                  }
                  
                  .detail-label {
                      font-weight: 600;
                      color: #374151;
                      font-size: 14px;
                  }
                  
                  .detail-value {
                      color: #1f2937;
                      font-size: 14px;
                      text-align: right;
                  }
                  
                  .status-badge {
                      display: inline-block;
                      padding: 4px 12px;
                      border-radius: 20px;
                      font-size: 12px;
                      font-weight: 600;
                      background-color: ${statusInfo.color};
                      color: white;
                  }
                  
                  @media only screen and (max-width: 600px) {
                      .content-inner {
                          padding: 24px;
                      }
                      
                      .content-header {
                          font-size: 24px;
                          line-height: 32px;
                      }
                      
                      .detail-row {
                          flex-direction: column;
                          align-items: flex-start;
                      }
                      
                      .detail-value {
                          text-align: left;
                          margin-top: 4px;
                      }
                  }
              </style>
          </head>
          <body>
              <div class="header-logo">
                  <img src="https://ashiwanikumar.in/logo.png" alt="Ashiwani Kumar" style="height: 60px;">
              </div>
              
              <div class="content-container">
                  <div class="header-background"></div>
                  
                  <div class="content-inner">
                      <h1 class="content-header">Blog Status Update</h1>
                      
                      <p class="content-text">
                          Dear <strong>${authorName}</strong>,<br><br>
                          We have an update regarding your blog post "${title}".
                      </p>
                      
                      <div class="status-box">
                          <h3 style="margin: 0 0 12px 0; color: ${statusInfo.color}; font-size: 18px;">
                              ${statusInfo.icon} Status: <span class="status-badge">${statusInfo.title}</span>
                          </h3>
                          <p style="margin: 0; color: ${statusInfo.color}; font-size: 14px;">
                              ${statusInfo.message}
                          </p>
                      </div>
                      
                      <div class="blog-details">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">
                              📝 Blog Details
                          </h3>
                          
                          <div class="detail-row">
                              <span class="detail-label">Title:</span>
                              <span class="detail-value">${title}</span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Category:</span>
                              <span class="detail-value">${category}</span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Status:</span>
                              <span class="detail-value">
                                  <span class="status-badge">${statusInfo.title}</span>
                              </span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Reviewed By:</span>
                              <span class="detail-value">${approverName}</span>
                          </div>
                          
                          <div class="detail-row">
                              <span class="detail-label">Date:</span>
                              <span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span>
                          </div>
                      </div>
                      
                      ${comments ? `
                      <div class="blog-details">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">
                              💬 ${status === 'rejected' ? 'Feedback & Suggestions' : 'Comments'}
                          </h3>
                          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 20px;">
                              ${comments}
                          </p>
                      </div>
                      ` : ''}
                      
                      <div style="text-align: center; margin: 32px 0;">
                          ${status === 'published' ? `
                          <a href="${blogUrl}" class="primary-button">
                              🌐 View Published Blog
                          </a>
                          ` : status === 'rejected' ? `
                          <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/blogs/${blogData._id}/edit" class="primary-button">
                              ✏️ Edit & Resubmit
                          </a>
                          ` : `
                          <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/blogs" class="primary-button">
                              📋 View My Blogs
                          </a>
                          `}
                      </div>
                      
                      <p class="content-text" style="text-align: center; color: #6b7280; font-size: 14px;">
                          ${status === 'rejected' 
                            ? 'Please review the feedback and make the necessary changes to resubmit your blog.'
                            : status === 'published'
                            ? 'Your blog is now live and accessible to readers. Thank you for your contribution!'
                            : 'Thank you for your patience during the review process.'
                          }
                      </p>
                  </div>
                  
                  <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <h4 style="font-weight: 600; color: #374151; font-size: 16px; margin: 0 0 12px 0;">
                          Blog Management System
                      </h4>
                      <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0;">
                          Ashiwani Kumar<br>
                          Content Management System
                      </p>
                  </div>
              </div>
              
              <div style="text-align: center; padding: 24px; color: #6b7280; font-size: 12px;">
                  <p style="margin: 0;">
                      This is an automated blog status notification.<br>
                      For questions, contact: hello@ashiwanikumar.in
                  </p>
              </div>
          </body>
      </html>`;

  return template;
};

/**********************************
  Blog Approved with Schedule Email Template
***********************************/
exports.blogApprovedWithScheduleEmailTemplate = (blog, statusData = {}) => {
  // Determine blog URL based on slug
  const blogUrl = blog.slug
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blogs/${blog.slug}`
    : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${blog._id}`;

  // Format scheduled publish date
  const publishDate = new Date(blog.publishAt || blog.scheduledAt);
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

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Approved & Scheduled</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="background-color: #f4f4f4; margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td bgcolor="#f4f4f4" align="center" style="padding: 20px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 20px 0;">
              <h1 style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Ashiwani Kumar
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td bgcolor="#ffffff" style="padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Status Badge -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 600;">
                      ✅ APPROVED & SCHEDULED
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h2 style="margin: 0 0 20px 0; font-family: 'Inter', Arial, sans-serif; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center;">
                Your Blog is Approved & Scheduled!
              </h2>

              <!-- Approval Message -->
              <p style="margin: 0 0 30px 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #6b7280; text-align: center; line-height: 1.6;">
                Great news! Your blog has been approved${statusData.approverName ? ` by ${statusData.approverName}` : ''} and is scheduled for automatic publication.
              </p>

              <!-- Schedule Details -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-family: 'Inter', Arial, sans-serif; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                  📅 Publication Schedule
                </h3>
                <p style="margin: 5px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1a1a1a;">
                  <strong style="color: #6b7280;">Publish Date:</strong> ${formattedDate}
                </p>
                <p style="margin: 5px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1a1a1a;">
                  <strong style="color: #6b7280;">Publish Time:</strong> ${formattedTime}
                </p>
                <p style="margin: 5px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1a1a1a;">
                  <strong style="color: #6b7280;">Status:</strong> <span style="color: #10B981; font-weight: 600;">Approved & Scheduled</span>
                </p>
                ${statusData.comments ? `
                <p style="margin: 10px 0 0 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1a1a1a;">
                  <strong style="color: #6b7280;">Approval Comments:</strong><br>
                  <span style="font-style: italic;">"${statusData.comments}"</span>
                </p>
                ` : ''}
              </div>

              <!-- Blog Preview -->
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
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
              </div>

              <!-- Next Steps -->
              <div style="background-color: #EBF5FF; border-left: 4px solid #3B82F6; padding: 15px; margin-top: 30px; border-radius: 4px;">
                <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1a1a1a;">
                  <strong>What happens next?</strong><br>
                  Your blog will be automatically published at the scheduled time. You'll receive a confirmation email once it goes live at <strong>${blogUrl}</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.6;">
                This is an automated notification from the Blog Management System.<br>
                © ${new Date().getFullYear()} Ashiwani Kumar. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return template;
};