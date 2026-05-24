/**********************************
  Contact Us Email Templates
***********************************/

/**********************************
  Contact Confirmation Email Template for User
***********************************/
exports.contactConfirmationEmailTemplate = (contactData) => {
  // Extract contact data safely
  const userName = contactData?.name || "Valued User";
  const userEmail = contactData?.email || "";
  const category = contactData?.category || {};
  const message = contactData?.message || "";
  const contactId = contactData?._id || "";
  const submittedAt = contactData?.createdAt
    ? new Date(contactData.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // Category display names
  const categoryDisplayNames = {
    services: "Services Inquiry",
    feedback: "General Feedback",
    analyst: "Analyst Relations",
  };

  const categoryName =
    categoryDisplayNames[category.id] || category.name || "General Inquiry";

  const template = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>Thank You for Contacting Us - Ashiwani Kumar</title>
            <style type="text/css" rel="stylesheet" media="all">
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                body {
                    width: 100% !important;
                    height: 100%;
                    margin: 0;
                    -webkit-text-size-adjust: none;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f3f4f6;
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
                
                .primary-text {
                    color: #1C2033;
                }
                
                .secondary-text {
                    color: #424761;
                }
                
                .success-text {
                    color: #16a34a;
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
                }
                
                .header-background {
                    background: linear-gradient(135deg, #ea580c, #f97316, #fb923c);
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
                
                .highlight-box {
                    background-color: #fff7ed;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    border-left: 4px solid #ea580c;
                }
                
                .details-box {
                    background-color: #f9fafb;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                }
                
                .detail-row {
                    display: flex;
                    margin: 12px 0;
                    padding: 12px 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .detail-row:last-child {
                    border-bottom: none;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #6b7280;
                    min-width: 120px;
                }
                
                .detail-value {
                    color: #1f2937;
                    flex: 1;
                }
                
                .message-box {
                    background-color: #f0fdf4;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    border-left: 4px solid #16a34a;
                }
                
                .footer {
                    padding: 32px 0;
                }
                
                .social-links {
                    padding: 24px 0;
                }
                
                .social-link {
                    display: inline-block;
                    margin: 0 8px;
                }
                
                .footer-text {
                    font-size: 14px;
                    line-height: 24px;
                    color: #5F6378;
                }
                
                @media screen and (max-width: 600px) {
                    .email-container {
                        width: 100% !important;
                    }
                    
                    .content-inner {
                        padding: 32px 24px !important;
                    }
                    
                    .content-header {
                        font-size: 24px !important;
                        line-height: 32px !important;
                    }
                    
                    .primary-button {
                        display: block !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    
                    .detail-row {
                        flex-direction: column;
                    }
                    
                    .detail-label {
                        margin-bottom: 4px;
                    }
                }
            </style>
        </head>

        <body width="100%" style="margin: 0; padding: 0 !important; background-color: #f3f4f6;">
            <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto;" class="email-container">
                    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
                        <tr>
                            <td>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td class="content-container">
                                            <div class="header-background"></div>
                                            <div class="content-inner">
                                                <!-- Success Icon -->
                                                <div style="text-align: center; margin-bottom: 32px;">
                                                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #ea580c, #f97316); display: inline-flex; align-items: center; justify-content: center;">
                                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" fill="white"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                <h1 class="content-header">Thank You for Contacting Us!</h1>
                                                
                                                <p class="content-text primary-text" style="font-size: 18px; text-align: center;">Dear ${userName},</p>
                                                
                                                <p class="content-text secondary-text">
                                                    We have successfully received your message and appreciate you taking the time to reach out. Your inquiry is important to us, and we will review it carefully.
                                                </p>
                                                
                                                
                                                <div class="details-box">
                                                    <h3 style="margin: 0 0 16px 0; color: #374151;">Your Submission Details</h3>
                                                    <div class="detail-row">
                                                        <span class="detail-label">Reference ID:</span>
                                                        <span class="detail-value">${contactId}</span>
                                                    </div>
                                                    <div class="detail-row">
                                                        <span class="detail-label">Category:</span>
                                                        <span class="detail-value">${categoryName}</span>
                                                    </div>
                                                    <div class="detail-row">
                                                        <span class="detail-label">Submitted On:</span>
                                                        <span class="detail-value">${submittedAt}</span>
                                                    </div>
                                                    <div class="detail-row">
                                                        <span class="detail-label">Email:</span>
                                                        <span class="detail-value">${userEmail}</span>
                                                    </div>
                                                </div>
                                                
                                                <div class="message-box">
                                                    <h3 style="margin: 0 0 12px 0; color: #16a34a;">Your Message:</h3>
                                                    <p style="margin: 0; color: #374151; white-space: pre-wrap;">${
                                                      typeof message ===
                                                      "object"
                                                        ? JSON.stringify(
                                                            message,
                                                            null,
                                                            2
                                                          )
                                                        : message
                                                    }</p>
                                                </div>
                                                
                                                <div style="text-align: center; margin: 32px 0;">
                                                    <a href="https://ashiwanikumar.in" class="primary-button">Visit Our Website</a>
                                                </div>
                                                
                                                <p class="content-text primary-text" style="margin: 32px 0 8px 0;">Warm regards,</p>
                                                <p class="content-text primary-text" style="margin: 0; font-weight: 600;">Ashiwani Kumar</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <tr>
                            <td class="footer">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="text-align: center; padding: 0 0 16px 0;">
                                            <div class="social-links">
                                                <a href="https://x.com/theashvanikumar" class="social-link">
                                                    <img src="https://cdn-icons-png.flaticon.com/128/5969/5969020.png" width="32" height="32" alt="Twitter">
                                                </a>
                                                <a href="https://www.facebook.com/ashiwani0" class="social-link">
                                                    <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" width="32" height="32" alt="Facebook">
                                                </a>
                                                <a href="https://www.linkedin.com/in/ashiwanikumar/" class="social-link">
                                                    <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" width="32" height="32" alt="LinkedIn">
                                                </a>
                                                <a href="https://www.instagram.com/ashiwani0" class="social-link">
                                                    <img src="https://cdn-icons-png.flaticon.com/128/2111/2111463.png" width="32" height="32" alt="Instagram">
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 0;">
                                            <p class="footer-text" style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} Ashiwani Kumar. All rights reserved.</p>
                                            <p class="footer-text" style="margin: 0 0 8px 0;">ashiwanikumar.in</p>
                                            <p class="footer-text" style="margin: 0;">
                                                <a href="https://ashiwanikumar.in/privacy-policy" style="color: #ea580c; text-decoration: none;">Privacy Policy</a> | 
                                                <a href="https://ashiwanikumar.in/terms-service" style="color: #ea580c; text-decoration: none;">Terms of Service</a> | 
                                                <a href="https://ashiwanikumar.in/contact" style="color: #ea580c; text-decoration: none;">Contact Us</a>
                                            </p>
                                            <p class="footer-text" style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                                                This is an automated confirmation email. Please do not reply to this email address.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </center>
        </body>
    </html>`;

  return template;
};

/**********************************
  Contact Notification Email Template for Admin
***********************************/
exports.contactAdminNotificationTemplate = (contactData) => {
  const userName = contactData?.name || "Unknown";
  const userEmail = contactData?.email || "";
  const category = contactData?.category || {};
  const message = contactData?.message || "";
  const contactId = contactData?._id || "";
  const submittedAt = contactData?.createdAt
    ? new Date(contactData.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const categoryDisplayNames = {
    services: "Services Inquiry",
    feedback: "General Feedback",
    analyst: "Analyst Relations",
  };

  const categoryName =
    categoryDisplayNames[category.id] || category.name || "General Inquiry";

  // Extract technical info
  const technicalInfo = contactData?.technicalInfo || {};
  const ipAddress = technicalInfo.ip?.ipv4 || technicalInfo.ip?.ipv6 || "N/A";
  const location = technicalInfo.location;
  const locationString =
    location?.city && location?.country
      ? `${location.city}, ${location.country}`
      : location?.country || "Unknown";

  // Device and browser info
  const device = technicalInfo.device || {};
  const browser = technicalInfo.browser || {};
  const deviceInfo = device.type
    ? `${device.type}${device.model ? ` (${device.model})` : ""}`
    : "Unknown";
  const browserInfo = browser.name
    ? `${browser.name}${browser.version ? ` ${browser.version}` : ""}`
    : "Unknown";
  const osInfo = device.os?.name
    ? `${device.os.name}${device.os.version ? ` ${device.os.version}` : ""}`
    : "Unknown";

  const template = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission - ${categoryName}</title>
            <style type="text/css">
                body { 
                    font-family: 'Inter', Arial, sans-serif; 
                    background-color: #f3f4f6; 
                    margin: 0; 
                    padding: 0; 
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header { 
                    background: #1f2937;
                    color: white;
                    padding: 24px;
                    text-align: center; 
                }
                .content { 
                    padding: 32px; 
                    line-height: 1.6; 
                    color: #374151; 
                }
                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .info-table td {
                    padding: 12px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .info-table td:first-child {
                    font-weight: 600;
                    color: #6b7280;
                    width: 140px;
                }
                .message-box {
                    background: #f9fafb;
                    border-left: 4px solid #3b82f6;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .action-button {
                    display: inline-block;
                    background: #3b82f6;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }
                .footer {
                    background: #f9fafb;
                    padding: 24px;
                    text-align: center;
                    font-size: 14px;
                    color: #6b7280;
                }
                .priority-high { color: #dc2626; font-weight: 600; }
                .priority-medium { color: #f59e0b; font-weight: 600; }
                .priority-low { color: #10b981; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Ashiwani Kumar</p>
                </div>
                <div class="content">
                    <p style="font-size: 18px; color: #1f2937;"><strong>New ${categoryName} received</strong></p>
                    
                    <table class="info-table">
                        <tr>
                            <td>Contact ID:</td>
                            <td><code>${contactId}</code></td>
                        </tr>
                        <tr>
                            <td>Name:</td>
                            <td>${userName}</td>
                        </tr>
                        <tr>
                            <td>Email:</td>
                            <td><a href="mailto:${userEmail}">${userEmail}</a></td>
                        </tr>
                        <tr>
                            <td>Category:</td>
                            <td><span class="${
                              category.id === "services"
                                ? "priority-high"
                                : category.id === "analyst"
                                ? "priority-medium"
                                : "priority-low"
                            }">${categoryName}</span></td>
                        </tr>
                        <tr>
                            <td>Submitted:</td>
                            <td>${submittedAt}</td>
                        </tr>
                        <tr>
                            <td>IP Address:</td>
                            <td>${ipAddress}</td>
                        </tr>
                        <tr>
                            <td>Location:</td>
                            <td>${locationString}</td>
                        </tr>
                        <tr>
                            <td>Device:</td>
                            <td>${deviceInfo}</td>
                        </tr>
                        <tr>
                            <td>Browser:</td>
                            <td>${browserInfo}</td>
                        </tr>
                        <tr>
                            <td>OS:</td>
                            <td>${osInfo}</td>
                        </tr>
                    </table>
                    
                    <div class="message-box">
                        <h3 style="margin: 0 0 12px 0; color: #1f2937;">Message Content:</h3>
                        <div style="white-space: pre-wrap; color: #374151;">${
                          typeof message === "object"
                            ? JSON.stringify(message, null, 2)
                            : message
                        }</div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="https://admin.ashiwanikumar.in/contacts/${contactId}" class="action-button">View Contact Details</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
                        <strong>Note:</strong> This is an automated notification. Please review and respond to this inquiry within 24-48 hours.
                    </p>
                </div>
                <div class="footer">
                    <p style="margin: 0;">This email was sent to administrators of the Contact Management System</p>
                    <p style="margin: 8px 0 0 0;">Ashiwani Kumar | ashiwanikumar.in</p>
                </div>
            </div>
        </body>
    </html>`;

  return template;
};
