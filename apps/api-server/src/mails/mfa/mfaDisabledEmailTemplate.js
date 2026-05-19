/**
 * MFA Disabled Notification Email Template
 * Professional HTML email template for notifying users when MFA is disabled
 */

/**
 * Generate HTML template for MFA disabled notification
 * @param {Object} userData - User data
 * @param {string} disabledBy - Who disabled MFA ('user' or 'admin')
 * @param {Object} adminData - Admin data if disabled by admin
 * @returns {string} HTML template
 */
const generateMFADisabledNotificationTemplate = (userData, disabledBy, adminData) => {
  const currentDate = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  const disabledByText = disabledBy === 'admin' 
    ? `by administrator ${adminData?.name || 'System Admin'}`
    : 'by you';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFA Disabled Notification - SSC Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header .icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
        }
        .alert {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            font-weight: 500;
        }
        .alert-icon {
            display: inline-block;
            margin-right: 8px;
            font-size: 16px;
        }
        .info-box {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .info-box h3 {
            margin-top: 0;
            color: #495057;
            font-size: 18px;
        }
        .info-box p {
            margin: 5px 0;
            color: #6c757d;
        }
        .warning-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .warning-box h3 {
            margin-top: 0;
            color: #856404;
            font-size: 16px;
        }
        .warning-box ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .warning-box li {
            margin: 8px 0;
        }
        .action-box {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin: 25px 0;
        }
        .action-box h3 {
            margin-top: 0;
            color: #0056b3;
            font-size: 16px;
        }
        .action-box ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .action-box li {
            margin: 8px 0;
            color: #495057;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .timestamp {
            font-style: italic;
            color: #6c757d;
            font-size: 13px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
        .button:hover {
            background-color: #0056b3;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">⚠️</div>
            <h1>Two-Factor Authentication Disabled</h1>
            <p>SSC Dashboard Security Alert</p>
        </div>
        
        <div class="content">
            <div class="alert">
                <span class="alert-icon">🚨</span>
                <strong>Important Security Notice:</strong> Two-Factor Authentication has been disabled for your account ${disabledByText}.
            </div>
            
            <div class="info-box">
                <h3>📋 Account Information</h3>
                <p><strong>Account:</strong> ${userData.email}</p>
                <p><strong>Name:</strong> ${userData.name}</p>
                <p><strong>Action:</strong> MFA Disabled</p>
                <p><strong>Disabled by:</strong> ${disabledBy === 'admin' ? `Administrator (${adminData?.name})` : 'You'}</p>
                <p><strong>Date & Time:</strong> ${currentDate} (IST)</p>
            </div>
            
            <div class="warning-box">
                <h3>⚠️ Security Impact</h3>
                <p>With MFA disabled, your account security is reduced. This means:</p>
                <ul>
                    <li>Your account is now protected only by your password</li>
                    <li>You are more vulnerable to unauthorized access</li>
                    <li>Backup codes (if any) are no longer valid</li>
                    <li>You won't receive login verification codes</li>
                </ul>
            </div>
            
            <div class="action-box">
                <h3>🔒 Recommended Actions</h3>
                <ul>
                    <li><strong>If you didn't disable MFA:</strong> Contact support immediately at <a href="mailto:security@shivrajsinghchouhan.co.in">security@shivrajsinghchouhan.co.in</a></li>
                    <li><strong>Re-enable MFA:</strong> We strongly recommend re-enabling MFA as soon as possible</li>
                    <li><strong>Change your password:</strong> If you suspect unauthorized access</li>
                    <li><strong>Review account activity:</strong> Check for any suspicious login attempts</li>
                </ul>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.APP_URL || 'https://dashboard.shivrajsinghchouhan.co.in'}/user/settings" class="button">
                        Re-enable MFA Now
                    </a>
                </div>
            </div>
            
            ${disabledBy === 'admin' ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #6c757d;">
                    <strong>Note:</strong> This action was performed by an administrator. If you have questions about why MFA was disabled, please contact your system administrator.
                </p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p><strong>SSC Dashboard Security Team</strong></p>
            <p>This is an automated security notification sent to: ${userData.email}</p>
            <p>If you didn't request this change, please contact <a href="mailto:security@shivrajsinghchouhan.co.in">security@shivrajsinghchouhan.co.in</a> immediately.</p>
            <p class="timestamp">Notification sent: ${currentDate} (IST)</p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  generateMFADisabledNotificationTemplate,
};