/**********************************
  Abuse Complaint Email Templates
***********************************/

/**********************************
  Complaint Confirmation Email Template
***********************************/
exports.abuseComplaintConfirmationEmailTemplate = (complaintData) => {
  // Extract complaint data safely
  const reporterName = complaintData?.reporter?.firstName
    ? `${complaintData.reporter.firstName} ${
        complaintData.reporter.lastName || ""
      }`.trim()
    : "User";
  const referenceNumber = complaintData?.referenceNumber || "N/A";
  const abuseType = complaintData?.abuseType || "General";
  const abuseMedium = complaintData?.abuseMedium || "Not specified";
  const submittedAt = complaintData?.submittedAt
    ? new Date(complaintData.submittedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // Map abuse types to readable names
  const abuseTypeNames = {
    phishing: "Phishing Attack",
    spam: "Spam/Unwanted Content",
    malware: "Malware/Virus",
    "data-breach": "Data Breach",
    "identity-theft": "Identity Theft",
    "financial-fraud": "Financial Fraud",
    cyberbullying: "Cyberbullying/Harassment",
    "hate-speech": "Hate Speech",
    copyright: "Copyright Infringement",
    other: "Other Security Issue",
  };

  // Map abuse mediums to readable names
  const abuseMediumNames = {
    email: "Email",
    sms: "SMS/Text Message",
    "phone-call": "Phone Call",
    website: "Website",
    "social-media": "Social Media",
    "mobile-app": "Mobile Application",
    "physical-mail": "Physical Mail",
    "in-person": "In-Person Interaction",
    other: "Other Medium",
  };

  const readableAbuseType = abuseTypeNames[abuseType] || abuseType;
  const readableAbuseMedium = abuseMediumNames[abuseMedium] || abuseMedium;

  const template = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>Abuse Complaint Confirmation - Ashiwani Kumar</title>
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
                
                .primary-text {
                    color: #1C2033;
                }
                
                .secondary-text {
                    color: #424761;
                }
                
                .success-text {
                    color: #16a34a;
                }
                
                .warning-text {
                    color: #ea580c;
                }
                
                .gradient-text {
                    background: linear-gradient(90deg, #ea580c, #f97316, #fb923c);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .footer-text {
                    font-size: 14px;
                    line-height: 24px;
                    color: #5F6378;
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
                
                .success-button {
                    background: linear-gradient(90deg, #16a34a, #22c55e);
                    border-radius: 8px;
                    color: #ffffff !important;
                    display: inline-block;
                    font-weight: 600;
                    font-size: 16px;
                    line-height: 100%;
                    padding: 16px 32px;
                    text-decoration: none;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
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
                    border: 1px solid rgba(22, 163, 74, 0.2);
                }
                
                .header-background {
                    background: linear-gradient(135deg, #16a34a, #22c55e, #4ade80);
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
                    background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .content-text {
                    font-size: 16px;
                    line-height: 26px;
                    margin: 0 0 24px 0;
                }
                
                .highlight-box {
                    background-color: #f0fdf4;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    border-left: 4px solid #16a34a;
                }
                
                .complaint-details-box {
                    background-color: #fef3c7;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    border-left: 4px solid #ea580c;
                }
                
                .reference-box {
                    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                    border-radius: 16px;
                    padding: 32px;
                    margin: 32px 0;
                    border: 2px solid #bbf7d0;
                    text-align: center;
                }
                
                .reference-number {
                    font-size: 32px;
                    font-weight: 700;
                    color: #16a34a;
                    margin: 16px 0;
                    letter-spacing: 2px;
                    text-shadow: 0 2px 4px rgba(22, 163, 74, 0.1);
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin: 24px 0;
                }
                
                .info-item {
                    background: #fff7ed;
                    border-radius: 12px;
                    padding: 16px;
                    border-left: 4px solid #16a34a;
                }
                
                .info-label {
                    font-weight: 600;
                    font-size: 14px;
                    color: #16a34a;
                    margin: 0 0 8px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .info-value {
                    font-size: 16px;
                    color: #1C2033;
                    margin: 0;
                    font-weight: 500;
                }
                
                .government-seal {
                    text-align: center;
                    margin: 32px 0;
                    padding: 24px;
                    background: linear-gradient(135deg, #fff7ed, #ffedd5);
                    border-radius: 12px;
                    border: 2px solid #fed7aa;
                }
                
                .timeline-box {
                    background: linear-gradient(135deg, #eff6ff, #dbeafe);
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    border-left: 4px solid #3b82f6;
                }
                
                .timeline-steps {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 16px 0;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                
                .timeline-step {
                    text-align: center;
                    flex: 1;
                    min-width: 120px;
                }
                
                .step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #16a34a;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 8px auto;
                    font-weight: 600;
                    font-size: 18px;
                }
                
                .step-circle.pending {
                    background: #d1d5db;
                    color: #6b7280;
                }
                
                .step-text {
                    font-size: 12px;
                    color: #374151;
                    font-weight: 500;
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
                
                /* Animation keyframes */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                @keyframes checkmark {
                    0% { transform: scale(0) rotate(45deg); }
                    50% { transform: scale(1.2) rotate(45deg); }
                    100% { transform: scale(1) rotate(45deg); }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                
                .animate-checkmark {
                    animation: checkmark 0.6s ease-out forwards;
                }
                
                .animation-delay-100 {
                    animation-delay: 0.1s;
                }
                
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                
                .animation-delay-300 {
                    animation-delay: 0.3s;
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
                    
                    .reference-number {
                        font-size: 24px !important;
                    }
                    
                    .primary-button, .success-button {
                        display: block !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .timeline-steps {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .timeline-step {
                        display: flex;
                        align-items: center;
                        text-align: left;
                        width: 100%;
                    }
                    
                    .step-circle {
                        margin: 0 12px 0 0;
                    }
                }
            </style>
        </head>

        <body width="100%" style="margin: 0; padding: 0 !important; background-color: #fff7ed;">
            <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #fff7ed;">
                <div style="max-width: 600px; margin: 0 auto;" class="email-container">
                    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
                        <tr>
                            <td class="header-logo animate-fade-in">
                                <img src="https://ashiwanikumar.in/logo.png" width="180" alt="Ashiwani Kumar" border="0" style="height: auto; display: block; margin: auto;">
                            </td>
                        </tr>
                        
                        <tr>
                            <td>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td class="content-container">
                                            <div class="header-background"></div>
                                            <div class="content-inner">
                                                <!-- Success Icon -->
                                                <div style="text-align: center; margin-bottom: 32px;">
                                                    <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #16a34a, #22c55e); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;" class="animate-fade-in animation-delay-100">
                                                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                <h1 class="content-header animate-fade-in animation-delay-200">Complaint Submitted Successfully</h1>
                                                
                                                <p class="content-text primary-text animate-fade-in animation-delay-300" style="font-size: 18px; text-align: center;">Dear ${reporterName},</p>
                                                
                                                <p class="content-text secondary-text animate-fade-in animation-delay-300">
                                                    Thank you for reporting this security concern. Your complaint has been successfully submitted. We take all security reports seriously and will investigate this matter promptly.
                                                </p>
                                                
                                                <div class="reference-box animate-fade-in animation-delay-400">
                                                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #16a34a;">Your Reference Number</p>
                                                    <div class="reference-number animate-pulse">${referenceNumber}</div>
                                                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Please save this reference number for tracking your complaint</p>
                                                </div>
                                                
                                                <div class="complaint-details-box animate-fade-in animation-delay-500">
                                                    <h3 style="margin: 0 0 16px 0; color: #ea580c; font-size: 18px;">Complaint Details</h3>
                                                    <div class="info-grid">
                                                        <div class="info-item">
                                                            <p class="info-label">Abuse Type</p>
                                                            <p class="info-value">${readableAbuseType}</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Medium</p>
                                                            <p class="info-value">${readableAbuseMedium}</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Submitted On</p>
                                                            <p class="info-value">${submittedAt}</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Status</p>
                                                            <p class="info-value" style="color: #ea580c; font-weight: 600;">Under Review</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="timeline-box animate-fade-in animation-delay-600">
                                                    <h3 style="margin: 0 0 16px 0; color: #3b82f6; font-size: 18px; text-align: center;">What Happens Next?</h3>
                                                    <div class="timeline-steps">
                                                        <div class="timeline-step">
                                                            <div class="step-circle">1</div>
                                                            <div class="step-text">Report Received</div>
                                                        </div>
                                                        <div class="timeline-step">
                                                            <div class="step-circle pending">2</div>
                                                            <div class="step-text">Initial Review<br><small>(24-48 hours)</small></div>
                                                        </div>
                                                        <div class="timeline-step">
                                                            <div class="step-circle pending">3</div>
                                                            <div class="step-text">Investigation</div>
                                                        </div>
                                                        <div class="timeline-step">
                                                            <div class="step-circle pending">4</div>
                                                            <div class="step-text">Resolution</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="highlight-box animate-fade-in animation-delay-700">
                                                    <h3 style="margin: 0 0 12px 0; color: #16a34a;">Important Information</h3>
                                                    <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                                        <li style="margin-bottom: 8px;">We will review your complaint within 24-48 hours</li>
                                                        <li style="margin-bottom: 8px;">You will receive email updates on status changes</li>
                                                        <li style="margin-bottom: 8px;">For urgent security issues, call hello@ashiwanikumar.in</li>
                                                        <li>Your personal information will be kept confidential</li>
                                                    </ul>
                                                </div>
                                                
                                                <div style="text-align: center; margin: 32px 0;" class="animate-fade-in animation-delay-800">
                                                    <a href="https://ashiwanikumar.in/abuse-complaints" class="success-button">View Complaint Status</a>
                                                </div>
                                                
                                                <div class="government-seal animate-fade-in animation-delay-900">
                                                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                                        <img src="https://ashiwanikumar.in/logo.png" width="50" height="50" alt="Ashiwani Kumar" style="margin-right: 12px;">
                                                        <div style="text-align: left;">
                                                            <p style="margin: 0; font-weight: 700; color: #ea580c; font-size: 16px;">Ashiwani Kumar</p>
                                                            <p style="margin: 0; font-size: 14px; color: #374151;">Security Team</p>
                                                        </div>
                                                    </div>
                                                    <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">
                                                        "Satyameva Jayate" - Truth Alone Triumphs
                                                    </p>
                                                </div>
                                                
                                                <p class="content-text secondary-text animate-fade-in animation-delay-1000">If you have any questions about your complaint or need assistance, please don't hesitate to contact our security team.</p>
                                                
                                                <div style="text-align: center; margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #fff7ed, #ffedd5); border-radius: 12px;" class="animate-fade-in animation-delay-1000">
                                                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #ea580c;">Contact Information</p>
                                                    <p style="margin: 0; font-size: 14px; color: #374151;">Email: hello@ashiwanikumar.in</p>
                                                </div>
                                                
                                                <p class="content-text primary-text animate-fade-in animation-delay-1100" style="margin: 32px 0 8px 0;">Best regards,</p>
                                                <p class="content-text primary-text animate-fade-in animation-delay-1100" style="margin: 0; font-weight: 600;">Security Team</p>
                                                <p class="content-text secondary-text animate-fade-in animation-delay-1100" style="margin: 0; font-size: 14px;">Ashiwani Kumar</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <tr>
                            <td class="footer animate-fade-in animation-delay-1200">
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
                                                If you believe you received this email in error, please report it to 
                                                <a href="mailto:hello@ashiwanikumar.in" style="color: #ea580c;">hello@ashiwanikumar.in</a>
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
  Complaint Status Update Email Template
***********************************/
exports.abuseComplaintStatusUpdateEmailTemplate = (
  complaintData,
  statusUpdate
) => {
  const reporterName = complaintData?.reporter?.firstName
    ? `${complaintData.reporter.firstName} ${
        complaintData.reporter.lastName || ""
      }`.trim()
    : "User";
  const referenceNumber = complaintData?.referenceNumber || "N/A";
  const newStatus = statusUpdate?.status || complaintData?.status || "unknown";
  const notes = statusUpdate?.notes || "No additional notes provided.";
  const updatedAt = statusUpdate?.updatedAt
    ? new Date(statusUpdate.updatedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // Status display information
  const statusInfo = {
    pending: { label: "Under Review", color: "#ea580c", icon: "⏳" },
    investigating: {
      label: "Under Investigation",
      color: "#3b82f6",
      icon: "🔍",
    },
    resolved: { label: "Resolved", color: "#16a34a", icon: "✅" },
    closed: { label: "Closed", color: "#6b7280", icon: "📋" },
    escalated: { label: "Escalated", color: "#dc2626", icon: "⚠️" },
  };

  const currentStatusInfo = statusInfo[newStatus] || statusInfo["pending"];

  const template = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Complaint Status Update - ${referenceNumber}</title>
            <style type="text/css">
                body { 
                    font-family: 'Inter', Arial, sans-serif; 
                    background-color: #fff7ed; 
                    margin: 0; 
                    padding: 0; 
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, ${currentStatusInfo.color}, ${currentStatusInfo.color}dd);
                    color: white;
                    padding: 32px 40px;
                    text-align: center; 
                }
                .content { 
                    padding: 40px; 
                    line-height: 1.6; 
                    color: #374151; 
                }
                .status-badge {
                    display: inline-block;
                    background: ${currentStatusInfo.color};
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 14px;
                    margin: 16px 0;
                }
                .reference-number {
                    font-size: 24px;
                    font-weight: 700;
                    color: ${currentStatusInfo.color};
                    text-align: center;
                    margin: 16px 0;
                    letter-spacing: 1px;
                }
                .notes-box {
                    background: #f9fafb;
                    border-left: 4px solid ${currentStatusInfo.color};
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                .footer {
                    background: #f9fafb;
                    padding: 24px 40px;
                    text-align: center;
                    font-size: 14px;
                    color: #6b7280;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">${currentStatusInfo.icon} Complaint Status Update</h1>
                    <div class="reference-number">${referenceNumber}</div>
                </div>
                <div class="content">
                    <p style="font-size: 18px;"><strong>Dear ${reporterName},</strong></p>
                    <p>We have an update regarding your security complaint. The status has been changed to:</p>
                    <div style="text-align: center;">
                        <span class="status-badge">${currentStatusInfo.label}</span>
                    </div>
                    <div class="notes-box">
                        <h3 style="margin: 0 0 12px 0; color: ${currentStatusInfo.color};">Update Details:</h3>
                        <p style="margin: 0;">${notes}</p>
                    </div>
                    <p><strong>Updated On:</strong> ${updatedAt}</p>
                    <p>Thank you for helping us maintain a secure environment. If you have any questions, please contact our security team.</p>
                </div>
                <div class="footer">
                    <p style="margin: 0;">Ashiwani Kumar | Security Team</p>
                    <p style="margin: 8px 0 0 0;">hello@ashiwanikumar.in</p>
                </div>
            </div>
        </body>
    </html>`;

  return template;
};
