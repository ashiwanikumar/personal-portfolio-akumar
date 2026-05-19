/**
 * MFA Backup Codes Email Template
 * Professional HTML email template for sending backup codes to admin team email
 */

/**
 * Generate HTML template for backup codes email
 * @param {Object} userData - User data
 * @param {Array<string>} backupCodes - Array of backup codes
 * @param {string} adminName - Admin's name
 * @returns {string} HTML template
 */
const generateBackupCodesEmailTemplate = (userData, backupCodes, adminName) => {
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
    <title>MFA Backup Codes - SSC Dashboard</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
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
        .instructions {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin: 25px 0;
        }
        .instructions h3 {
            margin-top: 0;
            color: #0056b3;
            font-size: 16px;
        }
        .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 8px 0;
            color: #495057;
        }
        .security-notice {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .security-notice strong {
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
            <div class="icon">🔐</div>
            <h1>MFA Backup Codes</h1>
            <p>SSC Dashboard Security</p>
        </div>
        
        <div class="content">
            <div class="alert">
                <span class="alert-icon">⚠️</span>
                <strong>Security Alert:</strong> This email contains sensitive backup codes for Multi-Factor Authentication access.
            </div>
            
            <div class="user-info">
                <h3>👤 User Information</h3>
                <p><strong>Name:</strong> ${userData.name}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>User ID:</strong> ${userData._id}</p>
                <p><strong>Request Type:</strong> Admin-requested backup codes</p>
                <p><strong>Requested by:</strong> ${adminName}</p>
            </div>
            
            <div class="backup-codes">
                <h3>Backup Codes</h3>
                <p style="margin-bottom: 15px; color: #6c757d;">
                    These codes can be used to access the account if the primary MFA device is unavailable.
                </p>
                <div class="codes-grid">
                    ${backupCodes.map(code => `<div class="backup-code">${code}</div>`).join('')}
                </div>
            </div>
            
            <div class="instructions">
                <h3>📋 Important Instructions</h3>
                <ul>
                    <li><strong>Store Securely:</strong> Save these codes in a secure location (password manager, encrypted file, or secure physical storage)</li>
                    <li><strong>Single Use:</strong> Each backup code can only be used once</li>
                    <li><strong>Emergency Access:</strong> Use these codes only when the primary authenticator app is unavailable</li>
                    <li><strong>Generate New:</strong> Generate new backup codes if these are compromised</li>
                    <li><strong>Team Access:</strong> As a super admin, ensure team members know how to use these if needed</li>
                </ul>
            </div>
            
            <div class="security-notice">
                <strong>🚨 Security Notice</strong>
                Do not share these codes via insecure channels. Delete this email after securely storing the codes.
                If you suspect these codes have been compromised, generate new ones immediately.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>SSC Dashboard Security Team</strong></p>
            <p>Generated: <span class="timestamp">${currentDate} (IST)</span></p>
            <p>If you did not request these codes, please contact <a href="mailto:security@shivrajsinghchouhan.co.in">security@shivrajsinghchouhan.co.in</a> immediately.</p>
            <p>This is an automated security email from the SSC Dashboard system.</p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  generateBackupCodesEmailTemplate,
};