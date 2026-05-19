/**
 * MFA Setup Notification Email Template
 * Professional HTML email template for notifying admins when MFA is enabled
 */

/**
 * Generate HTML template for MFA setup notification
 * @param {Object} userData - User data
 * @param {string} adminName - Admin's name
 * @returns {string} HTML template
 */
const generateMFASetupNotificationTemplate = (userData, adminName) => {
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
    <title>MFA Setup Notification - SSC Dashboard</title>
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
        .success-badge {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">✅</div>
            <h1>MFA Successfully Enabled</h1>
            <p>SSC Dashboard Security</p>
        </div>
        
        <div class="content">
            <div class="success-badge">
                <strong>🎉 Success!</strong> Multi-Factor Authentication has been enabled for the user.
            </div>
            
            <div class="user-info">
                <h3>👤 User Information</h3>
                <p><strong>Name:</strong> ${userData.name}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Setup Date:</strong> ${currentDate} (IST)</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>SSC Dashboard Security Team</strong></p>
            <p>Notification sent to: ${adminName}</p>
            <p class="timestamp">Generated: ${currentDate} (IST)</p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  generateMFASetupNotificationTemplate,
};