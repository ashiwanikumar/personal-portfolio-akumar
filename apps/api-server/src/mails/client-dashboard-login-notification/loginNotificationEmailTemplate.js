/**********************************
    Login Notification Email Template
  ***********************************/
exports.loginNotificationEmailTemplate = (user, loginInfo) => {
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const {
    ip = "Not Available",
    realIP = "Not Available",
    browser = "Not Available",
    location = "Not Available",
    device = "Not Available",
    time = new Date().toLocaleString(),
    technicalDetails = {},
  } = loginInfo || {};

  // Extract network and location details from technicalDetails
  const networkDetails = technicalDetails?.network || {};
  const locationDetails = technicalDetails?.location || {};

  // Helper function to check if IP is IPv4
  const isIPv4 = (ip) => {
    if (!ip || ip === "Not Available") return false;
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Regex.test(ip);
  };

  // Helper function to check if IP is IPv6
  const isIPv6 = (ip) => {
    if (!ip || ip === "Not Available") return false;
    return ip.includes(":");
  };

  // Prioritize real IPv4 over IPv6, but show real IP over proxy
  const getDisplayIP = () => {
    // Check if we have real IPv4 from frontend technical info
    const frontendIPv4 =
      technicalDetails?.frontendData?.webrtc?.localIP ||
      technicalDetails?.frontendData?.webrtc?.publicIPv4 ||
      technicalDetails?.frontendData?.webrtc?.ipv4;

    // If we have real IPv4 from frontend, use it
    if (frontendIPv4 && isIPv4(frontendIPv4)) {
      return frontendIPv4;
    }

    // First check if we have a realIP (from WebRTC)
    if (realIP && realIP !== "Not Available") {
      // If realIP is IPv4, use it
      if (isIPv4(realIP)) {
        return realIP;
      }
      // If realIP is IPv6, check if we have a non-proxy IPv4 from server
      if (isIPv6(realIP) && isIPv4(ip)) {
        // Check if server IP is likely a proxy (common proxy ranges)
        const isProxyIP = (ip) => {
          const proxyRanges = [
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0 - 172.31.255.255
            /^10\./, // 10.0.0.0 - 10.255.255.255
            /^192\.168\./, // 192.168.0.0 - 192.168.255.255
            /^127\./, // 127.0.0.0 - 127.255.255.255
            /^169\.254\./, // 169.254.0.0 - 169.254.255.255
            /^162\.158\./, // Cloudflare proxy range
            /^104\./, // Cloudflare proxy range
            /^108\.162\./, // Cloudflare proxy range
          ];
          return proxyRanges.some((range) => range.test(ip));
        };

        // If server IP is not a proxy, use it (IPv4)
        if (!isProxyIP(ip)) {
          return ip;
        }
        // If server IP is a proxy, use the real IPv6
        return realIP;
      }
      // Otherwise use the realIP (IPv6)
      return realIP;
    }

    // Fallback to server IP
    if (ip && ip !== "Not Available") {
      return ip;
    }

    return "Not Available";
  };

  const displayIP = getDisplayIP();

  // Format browser info for display
  const browserDisplay =
    browser !== "Not Available"
      ? browser
      : technicalDetails.browser || "Not Available";

  // Format device info for display
  const deviceDisplay =
    device !== "Not Available"
      ? device
      : technicalDetails.device || "Not Available";

  // Format location info for display
  const locationDisplay =
    location !== "Not Available"
      ? location
      : technicalDetails.location || "Not Available";

  // Format time for display
  const timeDisplay =
    time !== new Date().toLocaleString()
      ? time
      : new Date().toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        });

  // SVG icons for details
  const icons = {
    ip: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#E0E7FF'/><path d='M10 6a4 4 0 100 8 4 4 0 000-8zm0 7a3 3 0 110-6 3 3 0 010 6z' fill='#3730A3'/></svg>`,
    time: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#FEF9C3'/><path d='M10 5a5 5 0 100 10A5 5 0 0010 5zm0 9a4 4 0 110-8 4 4 0 010 8zm.5-4.25V7a.5.5 0 00-1 0v3a.5.5 0 00.22.41l2 1.33a.5.5 0 10.56-.83L10.5 9.75z' fill='#CA8A04'/></svg>`,
    location: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#DCFCE7'/><path d='M10 4a5 5 0 00-5 5c0 3.25 4.25 6.58 4.43 6.72a.5.5 0 00.57 0C10.75 15.58 15 12.25 15 9a5 5 0 00-5-5zm0 11.13C8.5 13.5 6 11.13 6 9a4 4 0 118 0c0 2.13-2.5 4.5-4 6.13z' fill='#16A34A'/><circle cx='10' cy='9' r='2' fill='#16A34A'/></svg>`,
    browser: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#F0FDF4'/><path d='M10 4a6 6 0 100 12A6 6 0 0010 4zm0 11a5 5 0 110-10 5 5 0 010 10zm2.5-5.5a.5.5 0 00-.5.5 2 2 0 01-2 2 .5.5 0 000 1 3 3 0 003-3 .5.5 0 00-.5-.5z' fill='#22C55E'/></svg>`,
    device: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#F1F5F9'/><path d='M7 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H7zm0 1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1zm2 8h2a.5.5 0 010 1h-2a.5.5 0 010-1z' fill='#64748B'/></svg>`,
    network: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#FEF3C7'/><path d='M10 4a6 6 0 100 12A6 6 0 0010 4zm0 11a5 5 0 110-10 5 5 0 010 10zm2.5-5.5a.5.5 0 00-.5.5 2 2 0 01-2 2 .5.5 0 000 1 3 3 0 003-3 .5.5 0 00-.5-.5z' fill='#D97706'/></svg>`,
    timezone: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#FCE7F3'/><path d='M10 4a6 6 0 100 12A6 6 0 0010 4zm0 11a5 5 0 110-10 5 5 0 010 10zm2.5-5.5a.5.5 0 00-.5.5 2 2 0 01-2 2 .5.5 0 000 1 3 3 0 003-3 .5.5 0 00-.5-.5z' fill='#EC4899'/></svg>`,
  };

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Security Alert: Account Login - Netraga</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; }
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 !important; }
      .card { border-radius: 0 !important; box-shadow: none !important; }
      .content { padding: 20px 8px !important; }
      .detail-row { display: block !important; margin-bottom: 18px !important; }
      .detail-label { width: 100% !important; display: block !important; margin-bottom: 2px; }
      .detail-icon { display: block !important; margin-bottom: 4px !important; }
      .detail-label-text, .detail-value { display: block !important; width: 100% !important; padding-left: 0 !important; }
      .detail-value { margin-bottom: 10px !important; }
      .action-btn { width: 100% !important; font-size: 16px !important; padding: 16px 0 !important; }
      .social-icon { width: 32px !important; height: 32px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); color: #1a202c; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; width: 100% !important; min-width: 100%;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: none; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="background: none; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding: 0;">
              <!-- Card -->
              <table role="presentation" class="card" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(55,48,163,0.10); margin-top: 36px; margin-bottom: 36px;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #002E6D 0%, #004080 50%, #FF9933 100%); padding: 38px 0 26px 0; text-align: center;">
                    <img src="https://www.netraga.com/logo.png" alt="Netraga" style="width: 150px; height: auto; display: block; margin: 0 auto; border: 0;">
                  </td>
                </tr>
                <!-- Main Content -->
                <tr>
                  <td class="content" style="padding: 40px 36px 36px 36px;">
                    <!-- Alert Header -->
                    <div style="text-align: center; margin-bottom: 36px;">
                      <h1 style="font-size: 28px; font-weight: 700; color: #1a202c; margin: 0 0 12px 0; letter-spacing: -1px;">Security Alert</h1>
                      <p style="font-size: 18px; font-weight: 500; color: #4b5563; margin: 0;">A new login to your account was detected</p>
                    </div>
                    <!-- Login Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0; margin-bottom: 36px;">
                      <tr><td style="padding: 28px 24px 24px 24px;">
                        <p style="font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 20px 0;">Login Details</p>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 16px;">
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${
                              icons.ip
                            }</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">IP Address</td>
                            <td class="detail-value" style="color: #6366f1; padding: 8px 0; font-weight: 600;">${displayIP}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${
                              icons.time
                            }</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Time</td>
                            <td class="detail-value" style="color: #a16207; padding: 8px 0; font-weight: 600;">${timeDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${
                              icons.location
                            }</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Location</td>
                            <td class="detail-value" style="color: #16a34a; padding: 8px 0; font-weight: 600;">${locationDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${
                              icons.browser
                            }</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Browser</td>
                            <td class="detail-value" style="color: #22c55e; padding: 8px 0; font-weight: 600;">${browserDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${
                              icons.device
                            }</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Device</td>
                            <td class="detail-value" style="color: #64748b; padding: 8px 0; font-weight: 600;">${deviceDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${
                              icons.network
                            }</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Network</td>
                            <td class="detail-value" style="color: #d97706; padding: 8px 0; font-weight: 600;">${
                              networkDetails.isp ||
                              networkDetails.organization ||
                              "Not Available"
                            }</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${
                              icons.timezone
                            }</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Timezone</td>
                            <td class="detail-value" style="color: #ec4899; padding: 8px 0; font-weight: 600;">${
                              locationDetails.timezone ||
                              technicalDetails.timezone ||
                              "Not Available"
                            }</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                    <!-- Action Message -->
                    <div style="text-align: center; margin-bottom: 36px;">
                      <p style="font-size: 17px; color: #374151; margin: 0 0 20px 0;">
                        If this was you, no action is needed.<br>
                        If you don't recognize this login, please secure your account immediately.
                      </p>
                    </div>
                    <!-- Action Button -->
                    <div style="text-align: center; margin-bottom: 40px;">
                      <a href="https://portal.shivrajsinghchouhan.co.in" class="action-btn" style="display: inline-block; background: linear-gradient(90deg, #002E6D 0%, #FF9933 100%); color: #fff; padding: 18px 44px; border-radius: 10px; text-decoration: none; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,46,109,0.10); transition: background 0.2s;">Go to Dashboard</a>
                    </div>
                    <!-- Security Tips -->
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; padding: 20px 20px 16px 20px; margin-bottom: 36px; display: flex; align-items: flex-start;">
                      <span style="margin-right: 14px; display: inline-block; vertical-align: top;"> <svg width='28' height='28' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='28' height='28' rx='8' fill='#FEF08A'/><path d='M14 8v6l4 2' stroke='#CA8A04' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg></span>
                      <div>
                        <p style="font-size: 16px; font-weight: 600; color: #92400e; margin: 0 0 8px 0;">Security Tips:</p>
                        <ul style="font-size: 16px; color: #92400e; margin: 0; padding-left: 22px;">
                          <li style="margin-bottom: 4px;">Use strong, unique passwords</li>
                          <li style="margin-bottom: 4px;">Enable two-factor authentication</li>
                          <li style="margin-bottom: 0;">Keep your account information up to date</li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background: #f9fafb; padding: 30px 0 20px 0; text-align: center; border-top: 1px solid #e5e7eb;">
                    <!-- Social Icons -->
                    <div style="margin-bottom: 20px;">
                      <a href="https://www.facebook.com/ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.shivrajsinghchouhan.co.in/social-media-logo/facebok.png" alt="Facebook" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://x.com/ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.shivrajsinghchouhan.co.in/social-media-logo/twitter.png" alt="Twitter/X" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.instagram.com/chouhanshivrajsingh" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.shivrajsinghchouhan.co.in/social-media-logo/instagram.png" alt="Instagram" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.youtube.com/@ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.shivrajsinghchouhan.co.in/social-media-logo/Yt.png" alt="YouTube" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.linkedin.com/in/chouhanshivrajsingh/" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.shivrajsinghchouhan.co.in/social-media-logo/linkedin.png" alt="LinkedIn" style="width: 28px; height: 28px; border: 0;">
                      </a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.4; margin: 0 0 8px 0;">
                      © 2024 Netraga. All rights reserved.
                    </p>
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.4; margin: 0;">
                      This is an automated security notification.
                    </p>
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
</html>`;

  return template;
};
