/**********************************
  Team Invite Email Template
***********************************/
exports.teamInviteEmailTemplate = (admin, joiningToken) => {
  // Get role information from the invitation
  const roleInfo =
    admin.invitations && admin.invitations.length > 0
      ? admin.invitations[admin.invitations.length - 1]
      : null;

  const roleName = roleInfo?.role || "Team Member";
  const invitedBy = admin.name || "Administrator";

  const template = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>Team Invitation - Ashiwani Kumar</title>
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
                
                .invitation-details-box {
                    background-color: #fef3c7;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    border-left: 4px solid #ea580c;
                }
                
                .invitation-box {
                    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                    border-radius: 16px;
                    padding: 32px;
                    margin: 32px 0;
                    border: 2px solid #bbf7d0;
                    text-align: center;
                }
                
                .invitation-title {
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
                
                .role-permissions-box {
                    background: linear-gradient(135deg, #eff6ff, #dbeafe);
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    border-left: 4px solid #3b82f6;
                }
                
                .organization-seal {
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
                    
                    .invitation-title {
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
                                                <!-- Invitation Icon -->
                                                <div style="text-align: center; margin-bottom: 32px;">
                                                    <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #16a34a, #22c55e); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;" class="animate-fade-in animation-delay-100">
                                                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                <h1 class="content-header animate-fade-in animation-delay-200">Team Invitation</h1>
                                                
                                                <p class="content-text primary-text animate-fade-in animation-delay-300" style="font-size: 18px; text-align: center;">You've been invited to join our team! 🎯</p>
                                                
                                                <p class="content-text secondary-text animate-fade-in animation-delay-300">
                                                    You've been invited by <strong style="color: #1C2033;">${invitedBy}</strong> to join the administrative team for Ashiwani Kumar's dashboard. As a team member, you'll have access to the admin portal and its powerful features.
                                                </p>
                                                
                                                <div class="invitation-box animate-fade-in animation-delay-400">
                                                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #16a34a;">Join Official Website Admin Portal</p>
                                                    <div class="invitation-title animate-pulse">${roleName}</div>
                                                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Click the button below to accept your invitation</p>
                                                </div>
                                                
                                                <div class="invitation-details-box animate-fade-in animation-delay-500">
                                                    <h3 style="margin: 0 0 16px 0; color: #ea580c; font-size: 18px;">Invitation Details</h3>
                                                    <div class="info-grid">
                                                        <div class="info-item">
                                                            <p class="info-label">Invited By</p>
                                                            <p class="info-value">${invitedBy}</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Organization</p>
                                                            <p class="info-value">Ashiwani Kumar</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Role</p>
                                                            <p class="info-value">${roleName}</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Status</p>
                                                            <p class="info-value" style="color: #ea580c; font-weight: 600;">Pending Acceptance</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <!-- Role Permissions Section -->
                                                <div class="role-permissions-box animate-fade-in animation-delay-600">
                                                    <h3 style="margin: 0 0 16px 0; color: #3b82f6; font-size: 18px;">Your Role: ${roleName}</h3>
                                                    <p style="margin: 0 0 16px 0; color: #374151; font-size: 14px;">
                                                        ${getRoleDescription(
                                                          roleName
                                                        )}
                                                    </p>
                                                    <div style="background: rgba(59, 130, 246, 0.1); border-radius: 8px; padding: 16px;">
                                                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #3b82f6; font-size: 14px;">This role includes:</p>
                                                        <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
                                                            ${getRolePermissions(
                                                              roleName
                                                            )
                                                              .map(
                                                                (permission) =>
                                                                  `<li style="margin-bottom: 4px;">${permission}</li>`
                                                              )
                                                              .join("")}
                                                        </ul>
                                                    </div>
                                                </div>
                                                
                                                <div class="timeline-box animate-fade-in animation-delay-700">
                                                    <h3 style="margin: 0 0 16px 0; color: #3b82f6; font-size: 18px; text-align: center;">What Happens Next?</h3>
                                                    <div class="timeline-steps">
                                                        <div class="timeline-step">
                                                            <div class="step-circle">1</div>
                                                            <div class="step-text">Accept Invitation</div>
                                                        </div>
                                                        <div class="timeline-step">
                                                            <div class="step-circle pending">2</div>
                                                            <div class="step-text">Create Account</div>
                                                        </div>
                                                        <div class="timeline-step">
                                                            <div class="step-circle pending">3</div>
                                                            <div class="step-text">Access Portal</div>
                                                        </div>
                                                        <div class="timeline-step">
                                                            <div class="step-circle pending">4</div>
                                                            <div class="step-text">Start Contributing</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="highlight-box animate-fade-in animation-delay-800">
                                                    <h3 style="margin: 0 0 12px 0; color: #16a34a;">What You'll Get Access To</h3>
                                                    <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                                        <li style="margin-bottom: 8px;">Admin dashboard with real-time analytics</li>
                                                        <li style="margin-bottom: 8px;">Content management and publishing tools</li>
                                                        <li style="margin-bottom: 8px;">Communication and outreach features</li>
                                                        <li>Event planning and coordination tools</li>
                                                    </ul>
                                                </div>
                                                
                                                <div style="text-align: center; margin: 32px 0;" class="animate-fade-in animation-delay-900">
                                                    <a href="${
                                                      process.env.APP_URL
                                                    }/team/join?token=${joiningToken}" class="success-button">Accept Invitation</a>
                                                </div>
                                                
                                                <div class="organization-seal animate-fade-in animation-delay-1000">
                                                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                                        <img src="https://ashiwanikumar.in/logo.png" width="50" height="50" alt="Ashiwani Kumar" style="margin-right: 12px;">
                                                        <div style="text-align: left;">
                                                            <p style="margin: 0; font-weight: 700; color: #ea580c; font-size: 16px;">Ashiwani Kumar</p>
                                                            <p style="margin: 0; font-size: 14px; color: #374151;">Founder & Developer</p>
                                                            <p style="margin: 0; font-size: 12px; color: #6b7280;">Ashiwani Kumar</p>
                                                        </div>
                                                    </div>
                                                    <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">
                                                        "Satyameva Jayate" - Truth Alone Triumphs
                                                    </p>
                                                </div>
                                                
                                                <p class="content-text secondary-text animate-fade-in animation-delay-1100">If you have any questions about this invitation or need assistance, please don't hesitate to contact our team.</p>
                                                
                                                <div style="text-align: center; margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #fff7ed, #ffedd5); border-radius: 12px;" class="animate-fade-in animation-delay-1100">
                                                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #ea580c;">Contact Information</p>
                                                    <p style="margin: 0; font-size: 14px; color: #374151;">Team Support: hello@ashiwanikumar.in</p>
                                                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #374151;">Website: www.ashiwanikumar.in</p>
                                                </div>
                                                
                                                <p class="content-text primary-text animate-fade-in animation-delay-1200" style="margin: 32px 0 8px 0;">Best regards,</p>
                                                <p class="content-text primary-text animate-fade-in animation-delay-1200" style="margin: 0; font-weight: 600;">Ashiwani Kumar</p>
                                                <p class="content-text secondary-text animate-fade-in animation-delay-1200" style="margin: 0; font-size: 14px;">Founder & Developer</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <tr>
                            <td class="footer animate-fade-in animation-delay-1300">
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
                                            <p class="footer-text" style="margin: 0 0 8px 0;">Founder & Developer</p>
                                            <p class="footer-text" style="margin: 0;">
                                                <a href="https://www.ashiwanikumar.in/privacy-policy" style="color: #ea580c; text-decoration: none;">Privacy Policy</a> | 
                                                <a href="https://www.ashiwanikumar.in/terms-service" style="color: #ea580c; text-decoration: none;">Terms of Service</a> | 
                                                <a href="https://www.ashiwanikumar.in/contact" style="color: #ea580c; text-decoration: none;">Contact Us</a>
                                            </p>
                                            <p class="footer-text" style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                                                If you didn't expect this invitation, please ignore this email or contact us at 
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

// Helper functions for role descriptions and permissions
function getRoleDescription(roleName) {
  const descriptions = {
    "Super Admin":
      "Full system access with all permissions and administrative capabilities.",
    Admin:
      "Administrative access with most permissions for team and content management.",
    "Content Manager":
      "Manages content, blog posts, and media files with limited administrative access.",
    "social-media":
      "Social media management and content creation with read-only access to most other features.",
    "Team Member": "Basic team member access with role-specific permissions.",
  };

  return (
    descriptions[roleName] ||
    "Custom role with specific permissions based on your responsibilities."
  );
}

function getRolePermissions(roleName) {
  const permissions = {
    "Super Admin": [
      "Full access to all resources and features",
      "Can invite, manage, and remove team members",
      "Can assign and modify user roles",
      "Can approve/reject content and changes",
      "Can access analytics and system settings",
      "Cannot be disabled or have permissions modified",
    ],
    Admin: [
      "Access to most administrative features",
      "Can manage team members and content",
      "Can approve/reject content",
      "Limited access to system settings",
    ],
    "Content Manager": [
      "Can create, edit, and manage content",
      "Can manage blog posts and announcements",
      "Can upload and manage media files",
      "Limited administrative access",
    ],
    "social-media": [
      "Can manage social media content",
      "Can create and edit posts",
      "Can access analytics and reports",
      "Read-only access to most other features",
    ],
    "Team Member": [
      "Basic content viewing and editing",
      "Limited administrative access",
      "Role-specific feature access",
    ],
  };

  return (
    permissions[roleName] || ["Custom permissions based on role configuration"]
  );
}

/**********************************
  Team Invitation Cancellation Email Template
***********************************/
exports.teamInviteCancellationEmailTemplate = (inviteeEmail, cancelledBy) => {
  const template = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>Team Invitation Cancelled - Ashiwani Kumar</title>
            <style type="text/css" rel="stylesheet" media="all">
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                body {
                    width: 100% !important;
                    height: 100%;
                    margin: 0;
                    -webkit-text-size-adjust: none;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #fef2f2;
                    color: #424761;
                }
                
                a {
                    color: #dc2626;
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
                
                .warning-text {
                    color: #dc2626;
                }
                
                .muted-text {
                    color: #6b7280;
                }
                
                .footer-text {
                    font-size: 14px;
                    line-height: 24px;
                    color: #5F6378;
                }
                
                .primary-button {
                    background: linear-gradient(90deg, #dc2626, #ef4444);
                    border-radius: 8px;
                    color: #ffffff !important;
                    display: inline-block;
                    font-weight: 600;
                    font-size: 16px;
                    line-height: 100%;
                    padding: 16px 32px;
                    text-decoration: none;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
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
                    border: 1px solid rgba(220, 38, 38, 0.2);
                }
                
                .header-background {
                    background: linear-gradient(135deg, #dc2626, #ef4444, #f87171);
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
                    background: linear-gradient(90deg, #dc2626, #ef4444, #f87171);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .content-text {
                    font-size: 16px;
                    line-height: 26px;
                    margin: 0 0 24px 0;
                }
                
                .cancellation-box {
                    background: linear-gradient(135deg, #fef2f2, #fee2e2);
                    border-radius: 16px;
                    padding: 32px;
                    margin: 32px 0;
                    border: 2px solid #fecaca;
                    text-align: center;
                }
                
                .cancellation-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #dc2626;
                    margin: 16px 0;
                    letter-spacing: 2px;
                    text-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
                }
                
                .info-box {
                    background-color: #fef3c7;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    border-left: 4px solid #f59e0b;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin: 24px 0;
                }
                
                .info-item {
                    background: #fef2f2;
                    border-radius: 12px;
                    padding: 16px;
                    border-left: 4px solid #dc2626;
                }
                
                .info-label {
                    font-weight: 600;
                    font-size: 14px;
                    color: #dc2626;
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
                
                .organization-seal {
                    text-align: center;
                    margin: 32px 0;
                    padding: 24px;
                    background: linear-gradient(135deg, #fff7ed, #ffedd5);
                    border-radius: 12px;
                    border: 2px solid #fed7aa;
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
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
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
                    
                    .cancellation-title {
                        font-size: 24px !important;
                    }
                    
                    .primary-button {
                        display: block !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>

        <body width="100%" style="margin: 0; padding: 0 !important; background-color: #fef2f2;">
            <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #fef2f2;">
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
                                                <!-- Cancellation Icon -->
                                                <div style="text-align: center; margin-bottom: 32px;">
                                                    <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #dc2626, #ef4444); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;" class="animate-fade-in animation-delay-100 animate-shake">
                                                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" fill="white"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                <h1 class="content-header animate-fade-in animation-delay-200">Team Invitation Cancelled</h1>
                                                
                                                <p class="content-text primary-text animate-fade-in animation-delay-300" style="font-size: 18px; text-align: center;">Your team invitation has been cancelled 🚫</p>
                                                
                                                <p class="content-text secondary-text animate-fade-in animation-delay-300">
                                                    We're writing to inform you that your invitation to join the administrative team for Ashiwani Kumar's dashboard has been cancelled by <strong style="color: #1C2033;">${
                                                      cancelledBy?.name ||
                                                      "Administrator"
                                                    }</strong>.
                                                </p>
                                                
                                                <div class="cancellation-box animate-fade-in animation-delay-400">
                                                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #dc2626;">Invitation Status</p>
                                                    <div class="cancellation-title">CANCELLED</div>
                                                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">This invitation is no longer valid</p>
                                                </div>
                                                
                                                <div class="info-box animate-fade-in animation-delay-500">
                                                    <h3 style="margin: 0 0 16px 0; color: #f59e0b; font-size: 18px;">Cancellation Details</h3>
                                                    <div class="info-grid">
                                                        <div class="info-item">
                                                            <p class="info-label">Cancelled By</p>
                                                            <p class="info-value">${
                                                              cancelledBy?.name ||
                                                              "Administrator"
                                                            }</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Invited Email</p>
                                                            <p class="info-value">${inviteeEmail}</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Organization</p>
                                                            <p class="info-value">Ashiwani Kumar</p>
                                                        </div>
                                                        <div class="info-item">
                                                            <p class="info-label">Date</p>
                                                            <p class="info-value">${new Date().toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6;" class="animate-fade-in animation-delay-600">
                                                    <h3 style="margin: 0 0 16px 0; color: #3b82f6; font-size: 18px;">What This Means</h3>
                                                    <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                                        <li style="margin-bottom: 8px;">Your previous invitation link is no longer valid</li>
                                                        <li style="margin-bottom: 8px;">You will not receive any further invitation-related emails</li>
                                                        <li style="margin-bottom: 8px;">You cannot access the admin portal with this invitation</li>
                                                        <li>You may be re-invited in the future if needed</li>
                                                    </ul>
                                                </div>
                                                
                                                <div class="organization-seal animate-fade-in animation-delay-700">
                                                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                                        <img src="https://ashiwanikumar.in/logo.png" width="50" height="50" alt="Ashiwani Kumar" style="margin-right: 12px;">
                                                        <div style="text-align: left;">
                                                            <p style="margin: 0; font-weight: 700; color: #ea580c; font-size: 16px;">Ashiwani Kumar</p>
                                                            <p style="margin: 0; font-size: 14px; color: #374151;">Founder & Developer</p>
                                                            <p style="margin: 0; font-size: 12px; color: #6b7280;">Ashiwani Kumar</p>
                                                        </div>
                                                    </div>
                                                    <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">
                                                        "Satyameva Jayate" - Truth Alone Triumphs
                                                    </p>
                                                </div>
                                                
                                                <p class="content-text secondary-text animate-fade-in animation-delay-800">If you have any questions about this cancellation or believe this was done in error, please contact our team.</p>
                                                
                                                <div style="text-align: center; margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #fff7ed, #ffedd5); border-radius: 12px;" class="animate-fade-in animation-delay-800">
                                                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #ea580c;">Contact Information</p>
                                                    <p style="margin: 0; font-size: 14px; color: #374151;">Team Support: hello@ashiwanikumar.in</p>
                                                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #374151;">Website: www.ashiwanikumar.in</p>
                                                </div>
                                                
                                                <p class="content-text primary-text animate-fade-in animation-delay-900" style="margin: 32px 0 8px 0;">Best regards,</p>
                                                <p class="content-text primary-text animate-fade-in animation-delay-900" style="margin: 0; font-weight: 600;">Ashiwani Kumar</p>
                                                <p class="content-text secondary-text animate-fade-in animation-delay-900" style="margin: 0; font-size: 14px;">Founder & Developer</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <tr>
                            <td class="footer animate-fade-in animation-delay-1000">
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
                                            <p class="footer-text" style="margin: 0 0 8px 0;">Founder & Developer</p>
                                            <p class="footer-text" style="margin: 0;">
                                                <a href="https://www.ashiwanikumar.in/privacy-policy" style="color: #ea580c; text-decoration: none;">Privacy Policy</a> | 
                                                <a href="https://www.ashiwanikumar.in/terms-service" style="color: #ea580c; text-decoration: none;">Terms of Service</a> | 
                                                <a href="https://www.ashiwanikumar.in/contact" style="color: #ea580c; text-decoration: none;">Contact Us</a>
                                            </p>
                                            <p class="footer-text" style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                                                This email was sent to inform you about the cancellation of your team invitation. 
                                                For questions, contact us at <a href="mailto:hello@ashiwanikumar.in" style="color: #ea580c;">hello@ashiwanikumar.in</a>
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
