/**********************************
  Verify Account Email Template
***********************************/
exports.verifyAccountEmailTemplate = (newUser, verificationToken) => {
  // Extract user data safely
  const firstName = newUser?.name ? newUser.name.split(" ")[0] : "there";

  const template = `<!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="color-scheme" content="light dark">
              <meta name="supported-color-schemes" content="light dark">
              <title>Ashiwani Kumar</title>
              <style type="text/css" rel="stylesheet" media="all">
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  
                  body {
                      width: 100% !important;
                      height: 100%;
                      margin: 0;
                      -webkit-text-size-adjust: none;
                      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                      background-color: #f4f4fe;
                      color: #424761;
                  }
                  
                  a {
                      color: #6366F1;
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
                  
                  .gradient-text {
                      background: linear-gradient(90deg, #0010F7, #1F69FF, #6366F1);
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
                      background: linear-gradient(90deg, #0010F7, #1F69FF);
                      border-radius: 8px;
                      color: #ffffff !important;
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      line-height: 100%;
                      padding: 16px 32px;
                      text-decoration: none;
                      text-align: center;
                      box-shadow: 0 4px 12px rgba(0, 16, 247, 0.25);
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
                      border: 1px solid rgba(99, 102, 241, 0.1);
                  }
                  
                  .header-background {
                      background: linear-gradient(135deg, #0010F7, #1F69FF, #6366F1);
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
                      background: linear-gradient(90deg, #0010F7, #1F69FF, #6366F1);
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
                      background-color: #F8FAFF;
                      border-radius: 12px;
                      padding: 24px;
                      margin: 24px 0;
                      border-left: 4px solid #0010F7;
                  }
                  
                  .feature-grid {
                      display: flex;
                      flex-wrap: wrap;
                      justify-content: space-between;
                      margin: 32px 0;
                  }
                  
                  .feature-item {
                      width: 48%;
                      background: #F8FAFF;
                      border-radius: 12px;
                      padding: 16px;
                      margin-bottom: 16px;
                      position: relative;
                      overflow: hidden;
                  }
                  
                  .feature-item::before {
                      content: "";
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 4px;
                      height: 100%;
                      background: linear-gradient(180deg, #0010F7, #1F69FF);
                  }
                  
                  .feature-title {
                      font-weight: 600;
                      font-size: 16px;
                      color: #1C2033;
                      margin: 0 0 8px 0;
                  }
                  
                  .feature-text {
                      font-size: 14px;
                      line-height: 20px;
                      color: #5F6378;
                      margin: 0;
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
                  
                  @keyframes gradientFlow {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                  }
                  
                  @keyframes float {
                      0% { transform: translateY(0px); }
                      50% { transform: translateY(-8px); }
                      100% { transform: translateY(0px); }
                  }
                  
                  @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                  }
                  
                  /* Animation classes */
                  .animate-fade-in {
                      animation: fadeIn 0.8s ease-out forwards;
                  }
                  
                  .animate-pulse {
                      animation: pulse 2s ease-in-out infinite;
                  }
                  
                  .animate-float {
                      animation: float 6s ease-in-out infinite;
                  }
                  
                  .animate-spin {
                      animation: spin 10s linear infinite;
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
                  
                  .animation-delay-400 {
                      animation-delay: 0.4s;
                  }
                  
                  .gradient-animated {
                      background: linear-gradient(90deg, #0010F7, #1F69FF, #6366F1, #0010F7);
                      background-size: 300% 100%;
                      animation: gradientFlow 6s ease infinite;
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
                      
                      .feature-item {
                          width: 100%;
                      }
                  }
              </style>
          </head>
  
          <body width="100%" style="margin: 0; padding: 0 !important; background-color: #f4f4fe;">
              <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #f4f4fe;">
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
                                              <div class="header-background gradient-animated"></div>
                                              <div class="content-inner">
                                                  <!-- Animated SVG for AI Agents and Workflow Automation -->
                                                  <div style="text-align: center; margin-bottom: 32px;">
                                                      <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-fade-in animation-delay-100">
                                                          <style>
                                                              @keyframes flowPath {
                                                                  0% { stroke-dashoffset: 200; }
                                                                  100% { stroke-dashoffset: 0; }
                                                              }
                                                              @keyframes fadeInSVG {
                                                                  0% { opacity: 0; }
                                                                  100% { opacity: 1; }
                                                              }
                                                              @keyframes pulseSVG {
                                                                  0% { transform: scale(1); opacity: 1; }
                                                                  50% { transform: scale(1.1); opacity: 0.8; }
                                                                  100% { transform: scale(1); opacity: 1; }
                                                              }
                                                              @keyframes moveDot {
                                                                  0% { transform: translateX(0); }
                                                                  100% { transform: translateX(120px); }
                                                              }
                                                              @keyframes rotate {
                                                                  0% { transform: rotate(0deg); }
                                                                  100% { transform: rotate(360deg); }
                                                              }
                                                              .flow-path {
                                                                  stroke-dasharray: 200;
                                                                  stroke-dashoffset: 200;
                                                                  animation: flowPath 2s ease-in-out forwards;
                                                              }
                                                              .agent-node {
                                                                  animation: fadeInSVG 0.5s ease-in-out forwards, pulseSVG 3s ease-in-out infinite;
                                                              }
                                                              .data-dot {
                                                                  animation: moveDot 3s ease-in-out infinite;
                                                              }
                                                              .workflow-gear {
                                                                  transform-origin: center;
                                                                  animation: rotate 10s linear infinite;
                                                              }
                                                              .delay-1 { animation-delay: 0.2s; }
                                                              .delay-2 { animation-delay: 0.4s; }
                                                              .delay-3 { animation-delay: 0.6s; }
                                                              .delay-4 { animation-delay: 0.8s; }
                                                          </style>
                                                          
                                                          <!-- Background Grid -->
                                                          <rect width="200" height="140" rx="8" fill="#F8FAFF"/>
                                                          <path d="M0 20 H200 M0 40 H200 M0 60 H200 M0 80 H200 M0 100 H200 M0 120 H200" stroke="#E5EFFF" stroke-width="0.5"/>
                                                          <path d="M20 0 V140 M40 0 V140 M60 0 V140 M80 0 V140 M100 0 V140 M120 0 V140 M140 0 V140 M160 0 V140 M180 0 V140" stroke="#E5EFFF" stroke-width="0.5"/>
                                                          
                                                          <!-- AI Agent Nodes -->
                                                          <circle cx="40" cy="40" r="12" fill="#0010F7" class="agent-node delay-1"/>
                                                          <circle cx="160" cy="40" r="12" fill="#1F69FF" class="agent-node delay-3"/>
                                                          <circle cx="40" cy="100" r="12" fill="#6366F1" class="agent-node delay-2"/>
                                                          <circle cx="160" cy="100" r="12" fill="#0010F7" class="agent-node delay-4"/>
                                                          
                                                          <!-- Workflow Center -->
                                                          <circle cx="100" cy="70" r="20" fill="#EEF2FF" stroke="#0010F7" stroke-width="2"/>
                                                          <path d="M100 60 L100 80 M90 70 L110 70" stroke="#0010F7" stroke-width="2" class="workflow-gear"/>
                                                          <circle cx="100" cy="70" r="10" fill="#1F69FF" class="workflow-gear"/>
                                                          
                                                          <!-- Connection Paths -->
                                                          <path d="M50 40 H90 C95 40 100 45 100 50 V60" stroke="#0010F7" stroke-width="2" stroke-linecap="round" class="flow-path delay-1"/>
                                                          <path d="M150 40 H110 C105 40 100 45 100 50 V60" stroke="#1F69FF" stroke-width="2" stroke-linecap="round" class="flow-path delay-3"/>
                                                          <path d="M50 100 H90 C95 100 100 95 100 90 V80" stroke="#6366F1" stroke-width="2" stroke-linecap="round" class="flow-path delay-2"/>
                                                          <path d="M150 100 H110 C105 100 100 95 100 90 V80" stroke="#0010F7" stroke-width="2" stroke-linecap="round" class="flow-path delay-4"/>
                                                          
                                                          <!-- Data Flow Dots -->
                                                          <circle cx="40" cy="40" r="3" fill="white" class="data-dot delay-1"/>
                                                          <circle cx="40" cy="100" r="3" fill="white" class="data-dot delay-2"/>
                                                          <circle cx="160" cy="40" r="3" fill="white" class="data-dot delay-3"/>
                                                          <circle cx="160" cy="100" r="3" fill="white" class="data-dot delay-4"/>
                                                      </svg>
                                                  </div>
                                                  
                                                  <h1 class="content-header animate-fade-in animation-delay-200">Welcome to the Future of AI Automation</h1>
                                                  
                                                  <p class="content-text primary-text animate-fade-in animation-delay-300" style="font-size: 18px;">Hi ${firstName},</p>
                                                  
                                                  <p class="content-text secondary-text animate-fade-in animation-delay-300">You're just one click away from unleashing the power of <span class="gradient-text">intelligent AI workflows</span> to transform how you work. Verify your email to start building your custom AI workforce that works 24/7.</p>
                                                  
                                                  <div style="text-align: center; margin: 32px 0;" class="animate-fade-in animate-pulse animation-delay-400">
                                                      <a href="${
                                                        process.env.APP_URL
                                                      }/account/activate?token=${verificationToken}" class="primary-button gradient-animated">Activate My Account</a>
                                                  </div>
                                                  
                                                  <div class="feature-grid">
                                                      <div class="feature-item animate-fade-in animation-delay-300">
                                                          <h3 class="feature-title">Custom AI Agents</h3>
                                                          <p class="feature-text">Build intelligent agents that adapt to your specific business needs and workflows</p>
                                                      </div>
                                                      <div class="feature-item animate-fade-in animation-delay-400">
                                                          <h3 class="feature-title">No-Code Automation</h3>
                                                          <p class="feature-text">Create complex workflows in minutes without any coding knowledge</p>
                                                      </div>
                                                      <div class="feature-item animate-fade-in animation-delay-500">
                                                          <h3 class="feature-title">24/7 Operation</h3>
                                                          <p class="feature-text">Your AI workforce never sleeps, ensuring tasks get done around the clock</p>
                                                      </div>
                                                      <div class="feature-item animate-fade-in animation-delay-600">
                                                          <h3 class="feature-title">Seamless Integration</h3>
                                                          <p class="feature-text">Connect with your existing tools and platforms effortlessly</p>
                                                      </div>
                                                  </div>
                                                  
                                                  <div class="highlight-box animate-fade-in animation-delay-300">
                                                      <p class="content-text primary-text" style="margin: 0 0 8px 0;"><strong>What to expect after verification:</strong></p>
                                                      <ul style="margin: 0; padding-left: 24px;">
                                                          <li style="margin-bottom: 8px;">Immediate access to the dashboard</li>
                                                          <li style="margin-bottom: 8px;">Ability to create your first AI agent in minutes</li>
                                                          <li style="margin-bottom: 8px;">Pre-built templates to get you started quickly</li>
                                                          <li>Free tier with essential features to explore the platform</li>
                                                      </ul>
                                                  </div>
                                                  
                                                  <p class="content-text secondary-text animate-fade-in animation-delay-400">If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
                                                  <p style="word-break: break-all; font-size: 14px; line-height: 20px; color: #0010F7; margin-top: 8px; background-color: #F8FAFF; padding: 12px; border-radius: 6px;" class="animate-fade-in animation-delay-400">
                                                      ${
                                                        process.env.APP_URL
                                                      }/account/activate?token=${verificationToken}
                                                  </p>
                                                  
                                                  <p class="content-text primary-text animate-fade-in animation-delay-500" style="margin: 32px 0 8px 0;">Ready to revolutionize your workflows,</p>
                                                  <p class="content-text primary-text animate-fade-in animation-delay-500" style="margin: 0; font-weight: 600;">Ashiwani Kumar</p>
                                              </div>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          
                          <tr>
                              <td class="footer animate-fade-in animation-delay-600">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                          <td style="text-align: center; padding: 0 0 16px 0;">
                                              <div class="social-links">
                                                  <a href="https://twitter.com/ashiwanikumar" class="social-link"><img src="https://cdn-icons-png.flaticon.com/128/5969/5969020.png" width="32" height="32" alt="Twitter"></a>
                                                  <a href="https://linkedin.com/in/ashiwanikumar" class="social-link"><img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" width="32" height="32" alt="LinkedIn"></a>
                                                  <a href="https://facebook.com/ashiwanikumar" class="social-link"><img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" width="32" height="32" alt="Facebook"></a>
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="text-align: center; padding: 0;">
                                              <p class="footer-text" style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} Ashiwani Kumar. All rights reserved.</p>
                                              <p class="footer-text" style="margin: 0 0 8px 0;">Building the future of AI automation for businesses everywhere.</p>
                                              <p class="footer-text" style="margin: 0;">
                                                  <a href="https://ashiwanikumar.in/privacy-policy" style="color: #0010F7; text-decoration: none;">Privacy Policy</a> • 
                                                  <a href="https://ashiwanikumar.in/terms" style="color: #0010F7; text-decoration: none;">Terms of Service</a> • 
                                                  <a href="https://ashiwanikumar.in/contact" style="color: #0010F7; text-decoration: none;">Contact Us</a>
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
    Reset Password Email Template
  ***********************************/
exports.resetPasswordEmailTemplate = (user, resetPasswordToken) => {
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  // SVG icons for reset details  
  const icons = {
    security: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#FEF3C7'/><path d='M10 5L6 7v3c0 2.5 1.79 4.87 4 5.46C12.21 14.87 14 12.5 14 10V7l-4-2z' fill='#CA8A04'/><path d='M8 10l1.5 1.5L12 9' stroke='#CA8A04' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
    clock: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#FEF9C3'/><path d='M10 5a5 5 0 100 10A5 5 0 0010 5zm0 9a4 4 0 110-8 4 4 0 010 8zm.5-4.25V7a.5.5 0 00-1 0v3a.5.5 0 00.22.41l2 1.33a.5.5 0 10.56-.83L10.5 9.75z' fill='#CA8A04'/></svg>`,
    key: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#DCFCE7'/><path d='M10 4a3 3 0 00-3 3 3 3 0 003 3c.39 0 .77-.075 1.11-.21l2.15 2.15a.5.5 0 00.35.15.5.5 0 00.35-.15l.71-.71a.5.5 0 000-.71L13.21 8.11A3 3 0 0010 4zm0 1a2 2 0 110 4 2 2 0 010-4z' fill='#16A34A'/></svg>`,
    link: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#F0FDF4'/><path d='M8 12l-2-2 1.41-1.41L9 10.17l4.59-4.59L15 7l-6 6z' fill='#22C55E'/><path d='M7 13h6a1 1 0 010 2H7a1 1 0 010-2z' fill='#22C55E'/></svg>`
  };

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Ashiwani Kumar</title>
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
                    <img src="https://ashiwanikumar.in/logo.png" alt="Ashiwani Kumar" style="width: 150px; height: auto; display: block; margin: 0 auto; border: 0;">
                  </td>
                </tr>
                <!-- Main Content -->
                <tr>
                  <td class="content" style="padding: 40px 36px 36px 36px;">
                    <!-- Alert Header -->
                    <div style="text-align: center; margin-bottom: 36px;">
                      <h1 style="font-size: 28px; font-weight: 700; color: #1a202c; margin: 0 0 12px 0; letter-spacing: -1px;">Password Reset Request</h1>
                      <p style="font-size: 18px; font-weight: 500; color: #4b5563; margin: 0;">Reset your password to regain access to your account</p>
                    </div>
                    <!-- Reset Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0; margin-bottom: 36px;">
                      <tr><td style="padding: 28px 24px 24px 24px;">
                        <p style="font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 20px 0;">Reset Request Details</p>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 16px;">
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.security}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Security Status</td>
                            <td class="detail-value" style="color: #ca8a04; padding: 8px 0; font-weight: 600;">Password Reset Requested</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.clock}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Expiry Time</td>
                            <td class="detail-value" style="color: #a16207; padding: 8px 0; font-weight: 600;">60 minutes from now</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.key}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Account</td>
                            <td class="detail-value" style="color: #16a34a; padding: 8px 0; font-weight: 600;">${user.email}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.link}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Reset Token</td>
                            <td class="detail-value" style="color: #22c55e; padding: 8px 0; font-weight: 600;">Secure & Single-Use</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                    <!-- Action Message -->
                    <div style="text-align: center; margin-bottom: 36px;">
                      <p style="font-size: 17px; color: #374151; margin: 0 0 20px 0;">
                        Hi ${firstName},<br>
                        Click the button below to securely reset your password and regain access to your account.
                      </p>
                    </div>
                    <!-- Action Button -->
                    <div style="text-align: center; margin-bottom: 40px;">
                      <a href="${process.env.APP_URL}/reset-password?token=${resetPasswordToken}" class="action-btn" style="display: inline-block; background: linear-gradient(90deg, #002E6D 0%, #FF9933 100%); color: #fff; padding: 18px 44px; border-radius: 10px; text-decoration: none; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,46,109,0.10); transition: background 0.2s;">Reset My Password</a>
                    </div>
                    <!-- Security Tips -->
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; padding: 20px 20px 16px 20px; margin-bottom: 36px; display: flex; align-items: flex-start;">
                      <span style="margin-right: 14px; display: inline-block; vertical-align: top;"> <svg width='28' height='28' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='28' height='28' rx='8' fill='#FEF08A'/><path d='M14 8v6l4 2' stroke='#CA8A04' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg></span>
                      <div>
                        <p style="font-size: 16px; font-weight: 600; color: #92400e; margin: 0 0 8px 0;">Security Notice:</p>
                        <ul style="font-size: 16px; color: #92400e; margin: 0; padding-left: 22px;">
                          <li style="margin-bottom: 4px;">This link expires in 60 minutes for your security</li>
                          <li style="margin-bottom: 4px;">If you didn't request this reset, ignore this email</li>
                          <li style="margin-bottom: 0;">Choose a strong, unique password when resetting</li>
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
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/facebok.png" alt="Facebook" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://x.com/ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/twitter.png" alt="Twitter/X" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.instagram.com/chouhanshivrajsingh" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/instagram.png" alt="Instagram" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.youtube.com/@ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/Yt.png" alt="YouTube" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.linkedin.com/in/chouhanshivrajsingh/" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/linkedin.png" alt="LinkedIn" style="width: 28px; height: 28px; border: 0;">
                      </a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.4; margin: 0 0 8px 0;">
                      © 2024 Ashiwani Kumar. All rights reserved.
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

/**********************************
    Password Reset Success Email Template
  ***********************************/
exports.passwordResetSuccessEmailTemplate = (user, resetInfo) => {
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const {
    ip = "Not Available",
    browser = "Not Available", 
    location = "Not Available",
    device = "Not Available",
    time = new Date().toLocaleString(),
    technicalDetails = {},
  } = resetInfo || {};

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

  // SVG icons for success details
  const icons = {
    success: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#DCFCE7'/><path d='M10 5a5 5 0 100 10A5 5 0 0010 5zm0 9a4 4 0 110-8 4 4 0 010 8z' fill='#16A34A'/><path d='M7 10l1.5 1.5L12 8.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
    ip: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#E0E7FF'/><path d='M10 6a4 4 0 100 8 4 4 0 000-8zm0 7a3 3 0 110-6 3 3 0 010 6z' fill='#3730A3'/></svg>`,
    time: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#FEF9C3'/><path d='M10 5a5 5 0 100 10A5 5 0 0010 5zm0 9a4 4 0 110-8 4 4 0 010 8zm.5-4.25V7a.5.5 0 00-1 0v3a.5.5 0 00.22.41l2 1.33a.5.5 0 10.56-.83L10.5 9.75z' fill='#CA8A04'/></svg>`,
    location: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#DCFCE7'/><path d='M10 4a5 5 0 00-5 5c0 3.25 4.25 6.58 4.43 6.72a.5.5 0 00.57 0C10.75 15.58 15 12.25 15 9a5 5 0 00-5-5zm0 11.13C8.5 13.5 6 11.13 6 9a4 4 0 118 0c0 2.13-2.5 4.5-4 6.13z' fill='#16A34A'/><circle cx='10' cy='9' r='2' fill='#16A34A'/></svg>`,
    browser: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#F0FDF4'/><path d='M10 4a6 6 0 100 12A6 6 0 0010 4zm0 11a5 5 0 110-10 5 5 0 010 10zm2.5-5.5a.5.5 0 00-.5.5 2 2 0 01-2 2 .5.5 0 000 1 3 3 0 003-3 .5.5 0 00-.5-.5z' fill='#22C55E'/></svg>`,
    device: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#F1F5F9'/><path d='M7 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H7zm0 1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1zm2 8h2a.5.5 0 010 1h-2a.5.5 0 010-1z' fill='#64748B'/></svg>`,
  };

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Ashiwani Kumar</title>
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
                    <img src="https://ashiwanikumar.in/logo.png" alt="Ashiwani Kumar" style="width: 150px; height: auto; display: block; margin: 0 auto; border: 0;">
                  </td>
                </tr>
                <!-- Main Content -->
                <tr>
                  <td class="content" style="padding: 40px 36px 36px 36px;">
                    <!-- Success Header -->
                    <div style="text-align: center; margin-bottom: 36px;">
                      <h1 style="font-size: 28px; font-weight: 700; color: #1a202c; margin: 0 0 12px 0; letter-spacing: -1px;">Password Reset Successful</h1>
                      <p style="font-size: 18px; font-weight: 500; color: #4b5563; margin: 0;">Your password has been successfully changed</p>
                    </div>
                    <!-- Reset Success Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f0fdf4; border: 1px solid #16a34a; border-radius: 12px; padding: 0; margin-bottom: 36px;">
                      <tr><td style="padding: 28px 24px 24px 24px;">
                        <p style="font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 20px 0;">Password Reset Details</p>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 16px;">
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.success}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Status</td>
                            <td class="detail-value" style="color: #16a34a; padding: 8px 0; font-weight: 600;">Successfully Reset</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.ip}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">IP Address</td>
                            <td class="detail-value" style="color: #6366f1; padding: 8px 0; font-weight: 600;">${ip}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.time}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Time</td>
                            <td class="detail-value" style="color: #a16207; padding: 8px 0; font-weight: 600;">${timeDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.location}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Location</td>
                            <td class="detail-value" style="color: #16a34a; padding: 8px 0; font-weight: 600;">${locationDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.browser}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Browser</td>
                            <td class="detail-value" style="color: #22c55e; padding: 8px 0; font-weight: 600;">${browserDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.device}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Device</td>
                            <td class="detail-value" style="color: #64748b; padding: 8px 0; font-weight: 600;">${deviceDisplay}</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                    <!-- Action Message -->
                    <div style="text-align: center; margin-bottom: 36px;">
                      <p style="font-size: 17px; color: #374151; margin: 0 0 20px 0;">
                        Hi ${firstName},<br>
                        Your password has been successfully reset. You can now log in with your new password.
                      </p>
                    </div>
                    <!-- Action Button -->
                    <div style="text-align: center; margin-bottom: 40px;">
                      <a href="https://portal.ashiwanikumar.in" class="action-btn" style="display: inline-block; background: linear-gradient(90deg, #002E6D 0%, #FF9933 100%); color: #fff; padding: 18px 44px; border-radius: 10px; text-decoration: none; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,46,109,0.10); transition: background 0.2s;">Go to Dashboard</a>
                    </div>
                    <!-- Security Tips -->
                    <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 10px; padding: 20px 20px 16px 20px; margin-bottom: 36px; display: flex; align-items: flex-start;">
                      <span style="margin-right: 14px; display: inline-block; vertical-align: top;"> <svg width='28' height='28' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='28' height='28' rx='8' fill='#BBF7D0'/><path d='M14 8L8 12v4c0 3.31 2.69 6 6 6s6-2.69 6-6v-4l-6-4z' stroke='#16A34A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/><path d='M11 14l2 2 4-4' stroke='#16A34A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg></span>
                      <div>
                        <p style="font-size: 16px; font-weight: 600; color: #166534; margin: 0 0 8px 0;">Security Recommendations:</p>
                        <ul style="font-size: 16px; color: #166534; margin: 0; padding-left: 22px;">
                          <li style="margin-bottom: 4px;">Keep your password private and secure</li>
                          <li style="margin-bottom: 4px;">Log out from all devices if you suspect unauthorized access</li>
                          <li style="margin-bottom: 0;">Contact support if this wasn't you</li>
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
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/facebok.png" alt="Facebook" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://x.com/ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/twitter.png" alt="Twitter/X" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.instagram.com/chouhanshivrajsingh" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/instagram.png" alt="Instagram" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.youtube.com/@ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/Yt.png" alt="YouTube" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.linkedin.com/in/chouhanshivrajsingh/" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/linkedin.png" alt="LinkedIn" style="width: 28px; height: 28px; border: 0;">
                      </a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.4; margin: 0 0 8px 0;">
                      © 2024 Ashiwani Kumar. All rights reserved.
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

/**********************************
    Password Change Success Email Template
  ***********************************/
exports.passwordChangeSuccessEmailTemplate = (user, changeInfo) => {
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const {
    ip = "Not Available",
    browser = "Not Available", 
    location = "Not Available",
    device = "Not Available",
    time = new Date().toLocaleString(),
    technicalDetails = {},
  } = changeInfo || {};

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

  // SVG icons for success details
  const icons = {
    success: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#DCFCE7'/><path d='M10 5a5 5 0 100 10A5 5 0 0010 5zm0 9a4 4 0 110-8 4 4 0 010 8z' fill='#16A34A'/><path d='M7 10l1.5 1.5L12 8.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
    ip: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#E0E7FF'/><path d='M10 6a4 4 0 100 8 4 4 0 000-8zm0 7a3 3 0 110-6 3 3 0 010 6z' fill='#3730A3'/></svg>`,
    time: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#FEF9C3'/><path d='M10 5a5 5 0 100 10A5 5 0 0010 5zm0 9a4 4 0 110-8 4 4 0 010 8zm.5-4.25V7a.5.5 0 00-1 0v3a.5.5 0 00.22.41l2 1.33a.5.5 0 10.56-.83L10.5 9.75z' fill='#CA8A04'/></svg>`,
    location: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#DCFCE7'/><path d='M10 4a5 5 0 00-5 5c0 3.25 4.25 6.58 4.43 6.72a.5.5 0 00.57 0C10.75 15.58 15 12.25 15 9a5 5 0 00-5-5zm0 11.13C8.5 13.5 6 11.13 6 9a4 4 0 118 0c0 2.13-2.5 4.5-4 6.13z' fill='#16A34A'/><circle cx='10' cy='9' r='2' fill='#16A34A'/></svg>`,
    browser: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#F0FDF4'/><path d='M10 4a6 6 0 100 12A6 6 0 0010 4zm0 11a5 5 0 110-10 5 5 0 010 10zm2.5-5.5a.5.5 0 00-.5.5 2 2 0 01-2 2 .5.5 0 000 1 3 3 0 003-3 .5.5 0 00-.5-.5z' fill='#22C55E'/></svg>`,
    device: `<svg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' rx='6' fill='#F1F5F9'/><path d='M7 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H7zm0 1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1zm2 8h2a.5.5 0 010 1h-2a.5.5 0 010-1z' fill='#64748B'/></svg>`,
  };

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Ashiwani Kumar</title>
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
                    <img src="https://ashiwanikumar.in/logo.png" alt="Ashiwani Kumar" style="width: 150px; height: auto; display: block; margin: 0 auto; border: 0;">
                  </td>
                </tr>
                <!-- Main Content -->
                <tr>
                  <td class="content" style="padding: 40px 36px 36px 36px;">
                    <!-- Success Header -->
                    <div style="text-align: center; margin-bottom: 36px;">
                      <h1 style="font-size: 28px; font-weight: 700; color: #1a202c; margin: 0 0 12px 0; letter-spacing: -1px;">Password Successfully Changed</h1>
                      <p style="font-size: 18px; font-weight: 500; color: #4b5563; margin: 0;">Your account password has been updated</p>
                    </div>
                    <!-- Change Success Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f0fdf4; border: 1px solid #16a34a; border-radius: 12px; padding: 0; margin-bottom: 36px;">
                      <tr><td style="padding: 28px 24px 24px 24px;">
                        <p style="font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 20px 0;">Password Change Details</p>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 16px;">
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.success}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Status</td>
                            <td class="detail-value" style="color: #16a34a; padding: 8px 0; font-weight: 600;">Successfully Changed</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.ip}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">IP Address</td>
                            <td class="detail-value" style="color: #6366f1; padding: 8px 0; font-weight: 600;">${ip}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.time}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Time</td>
                            <td class="detail-value" style="color: #a16207; padding: 8px 0; font-weight: 600;">${timeDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.location}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Location</td>
                            <td class="detail-value" style="color: #16a34a; padding: 8px 0; font-weight: 600;">${locationDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.browser}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Browser</td>
                            <td class="detail-value" style="color: #22c55e; padding: 8px 0; font-weight: 600;">${browserDisplay}</td>
                          </tr>
                          <tr class="detail-row">
                            <td class="detail-label detail-icon" style="vertical-align: top; width: 36px; padding: 8px 0 8px 0;">${icons.device}</td>
                            <td class="detail-label-text" style="color: #1a202c; padding: 8px 0; font-weight: 500;">Device</td>
                            <td class="detail-value" style="color: #64748b; padding: 8px 0; font-weight: 600;">${deviceDisplay}</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                    <!-- Action Message -->
                    <div style="text-align: center; margin-bottom: 36px;">
                      <p style="font-size: 17px; color: #374151; margin: 0 0 20px 0;">
                        Hi ${firstName},<br>
                        This is a security notification to confirm that your password has been successfully changed.
                      </p>
                    </div>
                    <!-- Action Button -->
                    <div style="text-align: center; margin-bottom: 40px;">
                      <a href="https://portal.ashiwanikumar.in" class="action-btn" style="display: inline-block; background: linear-gradient(90deg, #002E6D 0%, #FF9933 100%); color: #fff; padding: 18px 44px; border-radius: 10px; text-decoration: none; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,46,109,0.10); transition: background 0.2s;">Go to Dashboard</a>
                    </div>
                    <!-- Security Tips -->
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; padding: 20px 20px 16px 20px; margin-bottom: 36px; display: flex; align-items: flex-start;">
                      <span style="margin-right: 14px; display: inline-block; vertical-align: top;"> <svg width='28' height='28' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='28' height='28' rx='8' fill='#FEF08A'/><path d='M14 8L8 12v4c0 3.31 2.69 6 6 6s6-2.69 6-6v-4l-6-4z' stroke='#CA8A04' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/><path d='M11 14l2 2 4-4' stroke='#CA8A04' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg></span>
                      <div>
                        <p style="font-size: 16px; font-weight: 600; color: #92400e; margin: 0 0 8px 0;">Security Notice:</p>
                        <ul style="font-size: 16px; color: #92400e; margin: 0; padding-left: 22px;">
                          <li style="margin-bottom: 4px;">If you didn't make this change, contact support immediately</li>
                          <li style="margin-bottom: 4px;">Keep your password private and secure</li>
                          <li style="margin-bottom: 0;">Consider enabling two-factor authentication for added security</li>
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
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/facebok.png" alt="Facebook" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://x.com/ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/twitter.png" alt="Twitter/X" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.instagram.com/chouhanshivrajsingh" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/instagram.png" alt="Instagram" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.youtube.com/@ChouhanShivraj" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/Yt.png" alt="YouTube" style="width: 28px; height: 28px; border: 0;">
                      </a>
                      <a href="https://www.linkedin.com/in/chouhanshivrajsingh/" style="display: inline-block; margin: 0 10px;">
                        <img class="social-icon" src="https://media.cdn.ashiwanikumar.in/social-media-logo/linkedin.png" alt="LinkedIn" style="width: 28px; height: 28px; border: 0;">
                      </a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.4; margin: 0 0 8px 0;">
                      © 2024 Ashiwani Kumar. All rights reserved.
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

/**********************************
    Team Invite Email Template
  ***********************************/
exports.teamInviteEmailTemplate = (invitedBy, teamName, inviteToken) => {
  const template = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
          <head>
              <meta http-equiv="Content-type" content="text/html; charset=utf-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
              <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
              <meta name="format-detection" content="date=no"/>
              <meta name="format-detection" content="address=no"/>
              <meta name="format-detection" content="telephone=no"/>
              <meta name="x-apple-disable-message-reformatting"/>
              <title>Ashiwani Kumar</title>
              <style type="text/css">
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  
                  body {
                      margin: 0;
                      padding: 0;
                      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                      -webkit-font-smoothing: antialiased;
                      mso-line-height-rule: exactly;
                      background-color: #F4F4FE;
                  }
                  
                  table {
                      border-spacing: 0;
                      border-collapse: collapse;
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                  }
                  
                  img {
                      border: 0;
                      height: auto;
                      line-height: 100%;
                      outline: none;
                      text-decoration: none;
                      -ms-interpolation-mode: bicubic;
                  }
                  
                  .primary-button {
                      background: linear-gradient(90deg, #0010F7 0%, #1F69FF 100%);
                      color: #ffffff !important;
                      border-radius: 8px;
                      font-weight: 600;
                      padding: 14px 32px;
                      text-decoration: none;
                      display: inline-block;
                      text-align: center;
                      mso-padding-alt: 0;
                      mso-border-alt: 10px solid #0010F7;
                  }
                  
                  .primary-text {
                      color: #1C2033;
                  }
                  
                  .secondary-text {
                      color: #5F6378;
                  }
                  
                  .footer-text {
                      color: #9EA3B9;
                      font-size: 12px;
                  }
                  
                  .email-container {
                      max-width: 600px;
                      margin: 0 auto;
                  }
                  
                  .header-logo {
                      padding: 32px 0;
                      text-align: center;
                  }
                  
                  .content-container {
                      background-color: #FFFFFF;
                      border-radius: 16px;
                      box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
                      overflow: hidden;
                  }
                  
                  .content-header {
                      background: linear-gradient(90deg, #0010F7, #1F69FF);
                      padding: 24px;
                      text-align: center;
                  }
                  
                  .content-inner {
                      padding: 40px;
                  }
                  
                  .content-title {
                      font-weight: 700;
                      font-size: 24px;
                      line-height: 32px;
                      color: #FFFFFF;
                      margin: 0;
                  }
                  
                  .hero-image {
                      width: 100%;
                      height: auto;
                      margin-bottom: 32px;
                  }
                  
                  .content-text {
                      font-size: 16px;
                      line-height: 24px;
                      margin: 0 0 24px 0;
                  }
                  
                  .feature-list {
                      background-color: #F8FAFF;
                      border-radius: 12px;
                      padding: 24px;
                      margin: 24px 0;
                  }
                  
                  .feature-item {
                      display: flex;
                      align-items: flex-start;
                      margin-bottom: 16px;
                  }
                  
                  .feature-item:last-child {
                      margin-bottom: 0;
                  }
                  
                  .feature-icon {
                      width: 24px;
                      height: 24px;
                      margin-right: 12px;
                      flex-shrink: 0;
                  }
                  
                  .feature-text {
                      font-size: 15px;
                      line-height: 22px;
                      color: #424761;
                      margin: 0;
                  }
                  
                  .team-card {
                      background-color: #F8FAFF;
                      border-radius: 12px;
                      padding: 24px;
                      margin-bottom: 32px;
                      border: 1px solid rgba(0, 16, 247, 0.1);
                  }
                  
                  .team-avatar {
                      width: 64px;
                      height: 64px;
                      border-radius: 12px;
                      background: linear-gradient(135deg, #0010F7, #1F69FF);
                      color: #FFFFFF;
                      font-size: 28px;
                      font-weight: 700;
                      text-align: center;
                      line-height: 64px;
                      margin-right: 16px;
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
                  
                  /* Animation classes */
                  .animate-fade-in {
                      animation: fadeIn 0.8s ease-out forwards;
                  }
                  
                  .animate-pulse {
                      animation: pulse 2s ease-in-out infinite;
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
                      
                      .primary-button {
                          display: block !important;
                          width: 100% !important;
                          box-sizing: border-box !important;
                      }
                      
                      .team-avatar {
                          margin-bottom: 16px;
                      }
                  }
              </style>
          </head>
  
          <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #F4F4FE;">
              <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #F4F4FE;">
                  <div style="max-width: 600px; margin: 0 auto;" class="email-container">
                      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
                          <tr>
                              <td class="header-logo">
                                  <img src="https://ashiwanikumar.in/logo.png" width="180" alt="Ashiwani Kumar" border="0" style="height: auto; display: block; margin: auto;">
                              </td>
                          </tr>
                          
                          <tr>
                              <td>
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                          <td class="content-container">
                                              <div class="content-header">
                                                  <h1 class="content-title">You're Invited to Join a Team</h1>
                                              </div>
                                              <div class="content-inner">
                                                  <!-- SVG Illustration -->
                                                  <div style="text-align: center; margin-bottom: 32px;">
                                                      <svg width="240" height="160" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-fade-in animation-delay-100">
                                                          <style>
                                                              @keyframes floatAnimation {
                                                                  0% { transform: translateY(0); }
                                                                  50% { transform: translateY(-8px); }
                                                                  100% { transform: translateY(0); }
                                                              }
                                                              @keyframes pulseAnimation {
                                                                  0% { opacity: 0.8; transform: scale(1); }
                                                                  50% { opacity: 1; transform: scale(1.05); }
                                                                  100% { opacity: 0.8; transform: scale(1); }
                                                              }
                                                              @keyframes rotateAnimation {
                                                                  from { transform: rotate(0deg); }
                                                                  to { transform: rotate(360deg); }
                                                              }
                                                              .float-anim { animation: floatAnimation 6s ease-in-out infinite; }
                                                              .pulse-anim { animation: pulseAnimation 4s ease-in-out infinite; }
                                                              .rotate-anim { animation: rotateAnimation 20s linear infinite; }
                                                          </style>
  
                                                          <!-- Background Pattern -->
                                                          <rect width="240" height="160" fill="#F8FAFF" rx="12" />
                                                          <circle cx="40" cy="40" r="80" fill="url(#teamGradient)" opacity="0.1" class="pulse-anim" />
                                                          <circle cx="200" cy="120" r="60" fill="url(#teamGradient)" opacity="0.1" class="pulse-anim" style="animation-delay: 1s;" />
                                                          
                                                          <!-- People Illustrations -->
                                                          <!-- Center Person -->
                                                          <g class="float-anim">
                                                              <circle cx="120" cy="70" r="28" fill="#0010F7" />
                                                              <circle cx="120" cy="58" r="12" fill="#FFFFFF" />
                                                              <path d="M96 100C96 86.7452 106.745 76 120 76V76C133.255 76 144 86.7452 144 100V100H96V100Z" fill="#0010F7" />
                                                          </g>
                                                          
                                                          <!-- Left Person -->
                                                          <g class="float-anim" style="animation-delay: 1s;">
                                                              <circle cx="70" cy="85" r="22" fill="#1F69FF" />
                                                              <circle cx="70" cy="76" r="9" fill="#FFFFFF" />
                                                              <path d="M52 108C52 97.5066 60.5066 89 71 89V89C81.4934 89 90 97.5066 90 108V108H52V108Z" fill="#1F69FF" />
                                                          </g>
                                                          
                                                          <!-- Right Person -->
                                                          <g class="float-anim" style="animation-delay: 2s;">
                                                              <circle cx="170" cy="85" r="22" fill="#6366F1" />
                                                              <circle cx="170" cy="76" r="9" fill="#FFFFFF" />
                                                              <path d="M152 108C152 97.5066 160.507 89 171 89V89C181.493 89 190 97.5066 190 108V108H152V108Z" fill="#6366F1" />
                                                          </g>
                                                          
                                                          <!-- Connection Lines -->
                                                          <path d="M97 85L93 85" stroke="#0010F7" stroke-width="2" stroke-dasharray="4 4" />
                                                          <path d="M148 85L143 85" stroke="#0010F7" stroke-width="2" stroke-dasharray="4 4" />
                                                          
                                                          <!-- Circular Border -->
                                                          <circle cx="120" cy="80" r="60" stroke="#0010F7" stroke-width="2" stroke-dasharray="8 8" class="rotate-anim" fill="none" />
                                                          
                                                          <!-- Gradient Definition -->
                                                          <defs>
                                                              <linearGradient id="teamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                  <stop offset="0%" stop-color="#0010F7" />
                                                                  <stop offset="100%" stop-color="#1F69FF" />
                                                              </linearGradient>
                                                          </defs>
                                                      </svg>
                                                  </div>
                                                  
                                                  <div class="team-card animate-fade-in animation-delay-200">
                                                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                          <tr>
                                                              <td style="vertical-align: top; width: 64px;">
                                                                  <div class="team-avatar">${teamName.charAt(
                                                                    0
                                                                  )}</div>
                                                              </td>
                                                              <td style="vertical-align: middle; padding-left: 16px;">
                                                                  <h2 style="margin: 0; font-size: 20px; color: #1C2033; margin-bottom: 4px;">${teamName}</h2>
                                                                  <p style="margin: 0; font-size: 15px; color: #5F6378; margin-bottom: 12px;">Invited by <strong>${invitedBy}</strong></p>
                                                                  <p style="margin: 0; font-size: 14px; color: #5F6378;">Join this team to collaborate on AI agents and automation workflows.</p>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </div>
                                                  
                                                  <p class="content-text primary-text animate-fade-in animation-delay-300" style="font-size: 18px; font-weight: 600;">You've been invited to join an AI revolution</p>
                                                  
                                                  <p class="content-text secondary-text animate-fade-in animation-delay-300">You're invited to join <strong>${teamName}</strong> on Ashiwani Kumar Dashboard, the platform where teams build custom AI agents that automate workflows 24/7, without coding skills required.</p>
                                                  
                                                  <div class="feature-list animate-fade-in animation-delay-400">
                                                      <div class="feature-item">
                                                          <div class="feature-icon">
                                                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#0010F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                              </svg>
                                                          </div>
                                                          <p class="feature-text">Collaborate on building custom AI agents that work 24/7</p>
                                                      </div>
                                                      <div class="feature-item">
                                                          <div class="feature-icon">
                                                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#0010F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                              </svg>
                                                          </div>
                                                          <p class="feature-text">Create automated workflows without any coding knowledge</p>
                                                      </div>
                                                      <div class="feature-item">
                                                          <div class="feature-icon">
                                                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#0010F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                              </svg>
                                                          </div>
                                                          <p class="feature-text">Access shared team templates and workflows</p>
                                                      </div>
                                                      <div class="feature-item">
                                                          <div class="feature-icon">
                                                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#0010F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                              </svg>
                                                          </div>
                                                          <p class="feature-text">View team analytics and performance metrics</p>
                                                      </div>
                                                  </div>
                                                  
                                                  <div style="text-align: center; margin: 32px 0;" class="animate-fade-in animate-pulse animation-delay-500">
                                                      <a href="${
                                                        process.env.APP_URL
                                                      }/account/team-invite?token=${inviteToken}" class="primary-button gradient-animated">Accept Invitation</a>
                                                  </div>
                                                  
                                                  <p class="content-text secondary-text animate-fade-in animation-delay-600" style="margin-bottom: 0;">If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
                                                  <p style="word-break: break-all; font-size: 14px; line-height: 20px; color: #0010F7; margin-top: 8px; background-color: #F8FAFF; padding: 12px; border-radius: 6px;" class="animate-fade-in animation-delay-600">
                                                      ${
                                                        process.env.APP_URL
                                                      }/account/team-invite?token=${inviteToken}
                                                  </p>
                                                  
                                                  <p class="content-text secondary-text animate-fade-in animation-delay-600">If you have any questions or didn't expect this invitation, please contact <a href="mailto:hello@ashiwanikumar.in" style="color: #0010F7; text-decoration: none;">hello@ashiwanikumar.in</a>.</p>
                                                  
                                                  <p class="content-text primary-text animate-fade-in animation-delay-700" style="margin-bottom: 8px;">Looking forward to your collaboration,</p>
                                                  <p class="content-text primary-text animate-fade-in animation-delay-700" style="margin-top: 0; font-weight: 600;">Ashiwani Kumar</p>
                                              </div>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          
                          <tr>
                              <td class="footer animate-fade-in animation-delay-800">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                          <td style="text-align: center; padding: 0 0 16px 0;">
                                              <div class="social-links">
                                                  <a href="https://twitter.com/ashiwanikumar" class="social-link"><img src="https://cdn-icons-png.flaticon.com/128/5969/5969020.png" width="32" height="32" alt="Twitter"></a>
                                                  <a href="https://linkedin.com/in/ashiwanikumar" class="social-link"><img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" width="32" height="32" alt="LinkedIn"></a>
                                                  <a href="https://facebook.com/ashiwanikumar" class="social-link"><img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" width="32" height="32" alt="Facebook"></a>
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="text-align: center; padding: 0;">
                                              <p class="footer-text" style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} Ashiwani Kumar. All rights reserved.</p>
                                              <p class="footer-text" style="margin: 0 0 8px 0;">Building the future of AI automation for businesses everywhere.</p>
                                              <p class="footer-text" style="margin: 0;">
                                                  <a href="https://ashiwanikumar.in/privacy-policy" style="color: #0010F7; text-decoration: none;">Privacy Policy</a> • 
                                                  <a href="https://ashiwanikumar.in/terms" style="color: #0010F7; text-decoration: none;">Terms of Service</a> • 
                                                  <a href="https://ashiwanikumar.in/contact" style="color: #0010F7; text-decoration: none;">Contact Us</a>
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
