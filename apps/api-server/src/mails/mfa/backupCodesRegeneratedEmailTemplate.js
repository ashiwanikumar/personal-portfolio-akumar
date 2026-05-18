/**
 * MFA Backup Codes Regenerated Email Template
 * Email template for notifying users when they regenerate their backup codes
 */

/**
 * Generate HTML template for backup codes regeneration notification
 * @param {Object} userData - User data
 * @param {Array<string>} backupCodes - Array of new backup codes (optional - for display)
 * @param {boolean} includeCodes - Whether to include the actual codes in email
 * @returns {string} HTML template
 */
const generateBackupCodesRegeneratedEmailTemplate = (userData, backupCodes = [], includeCodes = false) => {
  const currentDate = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFA Backup Codes Regenerated - SSC Dashboard</title>
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
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
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
        .info-badge {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 500;
        }
        .user-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .user-info h3 {
            margin-top: 0;
            color: #495057;
            font-size: 18px;
        }
        .user-info p {
            margin: 5px 0;
            color: #6c757d;
        }
        .backup-codes {
            background-color: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
        }
        .backup-codes h3 {
            margin-top: 0;
            color: #495057;
            font-size: 18px;
            display: flex;
            align-items: center;
        }
        .backup-codes h3::before {
            content: "🔑";
            margin-right: 8px;
            font-size: 20px;
        }
        .codes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .backup-code {
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            color: #495057;
            letter-spacing: 1px;
        }
        .security-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .security-notice h3 {
            margin-top: 0;
            color: #856404;
            font-size: 16px;
        }
        .security-notice ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .security-notice li {
            margin: 8px 0;
        }
        .important-note {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .important-note strong {
            display: block;
            margin-bottom: 8px;
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
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .codes-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">🔄</div>
            <h1>Backup Codes Regenerated</h1>
            <p>SSC Dashboard Security</p>
        </div>
        
        <div class="content">
            <div class="info-badge">
                <strong>🔄 New Backup Codes Generated:</strong> Your MFA backup codes have been successfully regenerated.
            </div>
            
            <div class="user-info">
                <h3>📋 Account Information</h3>
                <p><strong>Name:</strong> ${userData.name}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Action:</strong> Backup Codes Regenerated</p>
                <p><strong>Date & Time:</strong> ${currentDate} (IST)</p>
                <p><strong>New Codes Generated:</strong> ${backupCodes.length} codes</p>
            </div>
            
            ${includeCodes && backupCodes.length > 0 ? `
            <div class="backup-codes">
                <h3>New Backup Codes</h3>
                <p style="margin-bottom: 15px; color: #6c757d;">
                    Your previous backup codes have been invalidated. Use these new codes for emergency access.
                </p>
                <div class="codes-grid">
                    ${backupCodes.map(code => `<div class="backup-code">${code}</div>`).join('')}
                </div>
            </div>
            ` : `
            <div class="security-notice">
                <h3>📋 What This Means</h3>
                <ul>
                    <li><strong>Previous codes invalidated:</strong> Your old backup codes no longer work</li>
                    <li><strong>New codes generated:</strong> ${backupCodes.length} new backup codes have been created</li>
                    <li><strong>Available in dashboard:</strong> You can view and download your new codes from your account settings</li>
                    <li><strong>Single use only:</strong> Each backup code can only be used once</li>
                </ul>
            </div>
            `}
            
            <div class="security-notice">
                <h3>🔒 Security Recommendations</h3>
                <ul>
                    <li><strong>Store Securely:</strong> Keep backup codes in a secure location (password manager, encrypted file)</li>
                    <li><strong>Don't Share:</strong> Never share backup codes with anyone</li>
                    <li><strong>Emergency Only:</strong> Use backup codes only when your authenticator app is unavailable</li>
                    <li><strong>Regular Updates:</strong> Consider regenerating codes periodically for enhanced security</li>
                </ul>
            </div>
            
            <div class="important-note">
                <strong>🚨 Important Security Notice</strong>
                If you didn't request this backup code regeneration, please contact support immediately and consider changing your account password.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>SSC Dashboard Security Team</strong></p>
            <p>This notification was sent to: ${userData.email}</p>
            <p>If you didn't perform this action, please contact <a href="mailto:security@shivrajsinghchouhan.co.in">security@shivrajsinghchouhan.co.in</a> immediately.</p>
            <p class="timestamp">Generated: ${currentDate} (IST)</p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  generateBackupCodesRegeneratedEmailTemplate,
};