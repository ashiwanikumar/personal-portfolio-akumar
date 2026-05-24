/**********************************
  Newsletter Confirmation Email Template
***********************************/
exports.newsletterConfirmationEmailTemplate = (subscriberData) => {
  // Extract subscriber data safely
  const firstName =
    subscriberData?.name?.firstName || subscriberData?.name || "Subscriber";
  const email = subscriberData?.email || "";
  const interests = subscriberData?.interests || [];
  const location = subscriberData?.location || {};

  // Map interests to readable names
  const interestNames = interests.map((interest) => {
    switch (interest) {
      case "agricultural-policies":
        return "Agricultural Policies";
      case "farmer-welfare":
        return "Welfare & Updates";
      case "rural-development":
        return "Rural Development";
      case "government-initiatives":
        return "Government Initiatives";
      case "technology-innovation":
        return "Agricultural Technology & Innovation";
      case "market-updates":
        return "Market Updates & Pricing";
      case "sustainability":
        return "Sustainable Agriculture";
      case "events-announcements":
        return "Events & Announcements";
      default:
        return interest;
    }
  });

  const template = `<!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="color-scheme" content="light dark">
              <meta name="supported-color-schemes" content="light dark">
              <title>Newsletter Subscription Confirmed - Ashiwani Kumar</title>
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
                      background: linear-gradient(90deg, #ea580c, #f97316, #fb923c);
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
                      background-color: #fef3c7;
                      border-radius: 12px;
                      padding: 24px;
                      margin: 24px 0;
                      border-left: 4px solid #ea580c;
                  }
                  
                  .feature-grid {
                      display: flex;
                      flex-wrap: wrap;
                      justify-content: space-between;
                      margin: 32px 0;
                  }
                  
                  .feature-item {
                      width: 48%;
                      background: #fff7ed;
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
                      background: linear-gradient(180deg, #ea580c, #f97316);
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
                  
                  .interests-grid {
                      display: grid;
                      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                      gap: 12px;
                      margin: 16px 0;
                  }
                  
                  .interest-badge {
                      background: #fff7ed;
                      border: 1px solid #fed7aa;
                      border-radius: 8px;
                      padding: 8px 12px;
                      font-size: 14px;
                      color: #ea580c;
                      font-weight: 500;
                      display: flex;
                      align-items: center;
                  }
                  
                  .interest-badge::before {
                      content: "";
                      margin-right: 8px;
                      color: #16a34a;
                      font-weight: bold;
                  }
                  
                  .government-seal {
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
                      background: linear-gradient(90deg, #ea580c, #f97316, #fb923c, #ea580c);
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
                      
                      .interests-grid {
                          grid-template-columns: 1fr;
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
                                              <div class="header-background gradient-animated"></div>
                                              <div class="content-inner">
                                                  <!-- Agricultural & Government SVG Illustration -->
                                                  <div style="text-align: center; margin-bottom: 32px;">
                                                      <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-fade-in animation-delay-100">
                                                          <style>
                                                              @keyframes cropGrow {
                                                                  0% { transform: scaleY(0); transform-origin: bottom; }
                                                                  100% { transform: scaleY(1); transform-origin: bottom; }
                                                              }
                                                              @keyframes leafSway {
                                                                  0%, 100% { transform: rotate(0deg); }
                                                                  50% { transform: rotate(3deg); }
                                                              }
                                                              @keyframes sunRays {
                                                                  0% { opacity: 0.6; }
                                                                  50% { opacity: 1; }
                                                                  100% { opacity: 0.6; }
                                                              }
                                                              @keyframes tractorMove {
                                                                  0% { transform: translateX(-20px); }
                                                                  100% { transform: translateX(0px); }
                                                              }
                                                              .crop-grow { animation: cropGrow 1.5s ease-out forwards; }
                                                              .leaf-sway { animation: leafSway 4s ease-in-out infinite; }
                                                              .sun-rays { animation: sunRays 3s ease-in-out infinite; }
                                                              .tractor-move { animation: tractorMove 2s ease-out forwards; }
                                                              .delay-1 { animation-delay: 0.2s; }
                                                              .delay-2 { animation-delay: 0.4s; }
                                                              .delay-3 { animation-delay: 0.6s; }
                                                              .delay-4 { animation-delay: 0.8s; }
                                                          </style>
                                                          
                                                          <!-- Background Sky -->
                                                          <rect width="200" height="80" fill="url(#skyGradient)"/>
                                                          <rect y="80" width="200" height="60" fill="#22c55e"/>
                                                          
                                                          <!-- Sun with Rays -->
                                                          <circle cx="170" cy="25" r="15" fill="#fbbf24"/>
                                                          <g class="sun-rays">
                                                              <line x1="170" y1="5" x2="170" y2="10" stroke="#fbbf24" stroke-width="2"/>
                                                              <line x1="185" y1="25" x2="190" y2="25" stroke="#fbbf24" stroke-width="2"/>
                                                              <line x1="170" y1="40" x2="170" y2="45" stroke="#fbbf24" stroke-width="2"/>
                                                              <line x1="155" y1="25" x2="150" y2="25" stroke="#fbbf24" stroke-width="2"/>
                                                              <line x1="181" y1="14" x2="184" y2="11" stroke="#fbbf24" stroke-width="2"/>
                                                              <line x1="181" y1="36" x2="184" y2="39" stroke="#fbbf24" stroke-width="2"/>
                                                              <line x1="159" y1="36" x2="156" y2="39" stroke="#fbbf24" stroke-width="2"/>
                                                              <line x1="159" y1="14" x2="156" y2="11" stroke="#fbbf24" stroke-width="2"/>
                                                          </g>
                                                          
                                                          <!-- Clouds -->
                                                          <ellipse cx="40" cy="20" rx="15" ry="8" fill="#ffffff" opacity="0.8"/>
                                                          <ellipse cx="35" cy="18" rx="10" ry="6" fill="#ffffff" opacity="0.8"/>
                                                          <ellipse cx="45" cy="18" rx="8" ry="5" fill="#ffffff" opacity="0.8"/>
                                                          
                                                          <ellipse cx="120" cy="35" rx="12" ry="6" fill="#ffffff" opacity="0.6"/>
                                                          <ellipse cx="115" cy="33" rx="8" ry="4" fill="#ffffff" opacity="0.6"/>
                                                          <ellipse cx="125" cy="33" rx="6" ry="3" fill="#ffffff" opacity="0.6"/>
                                                          
                                                          <!-- Crops/Wheat Fields -->
                                                          <g class="crop-grow delay-1">
                                                              <rect x="20" y="90" width="3" height="20" fill="#16a34a"/>
                                                              <ellipse cx="21.5" cy="88" rx="4" ry="8" fill="#eab308" class="leaf-sway"/>
                                                          </g>
                                                          <g class="crop-grow delay-2">
                                                              <rect x="30" y="85" width="3" height="25" fill="#16a34a"/>
                                                              <ellipse cx="31.5" cy="83" rx="4" ry="8" fill="#eab308" class="leaf-sway"/>
                                                          </g>
                                                          <g class="crop-grow delay-3">
                                                              <rect x="40" y="88" width="3" height="22" fill="#16a34a"/>
                                                              <ellipse cx="41.5" cy="86" rx="4" ry="8" fill="#eab308" class="leaf-sway"/>
                                                          </g>
                                                          <g class="crop-grow delay-4">
                                                              <rect x="50" y="92" width="3" height="18" fill="#16a34a"/>
                                                              <ellipse cx="51.5" cy="90" rx="4" ry="8" fill="#eab308" class="leaf-sway"/>
                                                          </g>
                                                          
                                                          <!-- More crops -->
                                                          <g class="crop-grow delay-1">
                                                              <rect x="120" y="87" width="3" height="23" fill="#16a34a"/>
                                                              <ellipse cx="121.5" cy="85" rx="4" ry="8" fill="#eab308" class="leaf-sway"/>
                                                          </g>
                                                          <g class="crop-grow delay-2">
                                                              <rect x="130" y="90" width="3" height="20" fill="#16a34a"/>
                                                              <ellipse cx="131.5" cy="88" rx="4" ry="8" fill="#eab308" class="leaf-sway"/>
                                                          </g>
                                                          <g class="crop-grow delay-3">
                                                              <rect x="140" y="85" width="3" height="25" fill="#16a34a"/>
                                                              <ellipse cx="141.5" cy="83" rx="4" ry="8" fill="#eab308" class="leaf-sway"/>
                                                          </g>
                                                          
                                                          <!-- Simple Tractor -->
                                                          <g class="tractor-move">
                                                              <rect x="70" y="95" width="25" height="10" rx="2" fill="#ea580c"/>
                                                              <circle cx="75" cy="110" r="6" fill="#374151"/>
                                                              <circle cx="90" cy="110" r="8" fill="#374151"/>
                                                              <circle cx="75" cy="110" r="3" fill="#6b7280"/>
                                                              <circle cx="90" cy="110" r="4" fill="#6b7280"/>
                                                              <rect x="85" y="88" width="8" height="7" rx="1" fill="#3b82f6"/>
                                                          </g>
                                                          
                                                          <!-- Building Illustration -->
                                                          <g>
                                                              <rect x="150" y="60" width="30" height="20" fill="#dc2626"/>
                                                              <polygon points="150,60 165,45 180,60" fill="#991b1b"/>
                                                              <rect x="157" y="65" width="4" height="8" fill="#fbbf24"/>
                                                              <rect x="169" y="65" width="4" height="8" fill="#fbbf24"/>
                                                              <rect x="163" y="70" width="4" height="5" fill="#7c2d12"/>
                                                              <circle cx="165" cy="52" r="2" fill="#fbbf24"/>
                                                          </g>
                                                          
                                                          <!-- Newsletter/Communication Symbol -->
                                                          <g>
                                                              <rect x="10" y="100" width="20" height="15" rx="2" fill="#ffffff" stroke="#ea580c" stroke-width="2"/>
                                                              <polyline points="10,105 20,112 30,105" stroke="#ea580c" stroke-width="2" fill="none"/>
                                                              <line x1="13" y1="108" x2="27" y2="108" stroke="#ea580c" stroke-width="1"/>
                                                              <line x1="13" y1="111" x2="23" y2="111" stroke="#ea580c" stroke-width="1"/>
                                                          </g>
                                                          
                                                          <!-- Gradient Definitions -->
                                                          <defs>
                                                              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                  <stop offset="0%" stop-color="#dbeafe"/>
                                                                  <stop offset="100%" stop-color="#93c5fd"/>
                                                              </linearGradient>
                                                          </defs>
                                                      </svg>
                                                  </div>
                                                  
                                                  <h1 class="content-header animate-fade-in animation-delay-200">Welcome to Agriculture Newsletter</h1>
                                                  
                                                  <p class="content-text primary-text animate-fade-in animation-delay-300" style="font-size: 18px;">नमस्ते ${firstName} जी,</p>
                                                  
                                                  <p class="content-text secondary-text animate-fade-in animation-delay-300">
                                                    Thank you for subscribing to our newsletter! You will now receive the latest updates, insights, innovations, and other relevant information directly to your email.
                                                  </p>

                                                  <div class="government-seal animate-fade-in animation-delay-400">
                                                      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                                          <img src="https://ashiwanikumar.in/logo.png" width="50" height="50" alt="Ashiwani Kumar" style="margin-right: 12px;">
                                                          <div style="text-align: left;">
                                                              <p style="margin: 0; font-weight: 700; color: #ea580c; font-size: 16px;">Ashiwani Kumar</p>
                                                              <p style="margin: 0; font-size: 14px; color: #374151;">Personal Website</p>
                                                          </div>
                                                      </div>
                                                      <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">
                                                          "सत्यमेव जयते" - Truth Alone Triumphs
                                                      </p>
                                                  </div>
                                                  
                                                  ${
                                                    interestNames.length > 0
                                                      ? `
                                                  <div class="highlight-box animate-fade-in animation-delay-500">
                                                      <h3 style="margin: 0 0 16px 0; color: #ea580c; font-size: 18px;">आपकी चुनी गई रुचियाँ | Your Selected Interests</h3>
                                                      <div class="interests-grid">
                                                          ${interestNames
                                                            .map(
                                                              (interest) => `
                                                              <div class="interest-badge">${interest}</div>
                                                          `
                                                            )
                                                            .join("")}
                                                      </div>
                                                  </div>
                                                  `
                                                      : ""
                                                  }
                                                  
                                                  <div class="feature-grid animate-fade-in animation-delay-600">
                                                      <div class="feature-item">
                                                          <h3 class="feature-title">ताज़ा सरकारी योजनाएँ</h3>
                                                          <p class="feature-text">नई सरकारी योजनाओं और लाभों की जानकारी सीधे आपके इनबॉक्स में।</p>
                                                      </div>
                                                      <div class="feature-item">
                                                          <h3 class="feature-title">Updates & Resources</h3>
                                                          <p class="feature-text">Stay up to date with the latest news, insights, and resources.</p>
                                                      </div>
                                                      <div class="feature-item">
                                                          <h3 class="feature-title">बाज़ार भाव और तकनीकी अपडेट</h3>
                                                          <p class="feature-text">फसल के बाज़ार भाव, तकनीकी नवाचार और कृषि से जुड़ी ताज़ा खबरें।</p>
                                                      </div>
                                                      <div class="feature-item">
                                                          <h3 class="feature-title">सतत कृषि और नवाचार</h3>
                                                          <p class="feature-text">सतत कृषि, पर्यावरण और नवाचार से जुड़ी महत्वपूर्ण जानकारियाँ।</p>
                                                      </div>
                                                  </div>
                                                  
                                                  <div style="text-align: center; margin: 32px 0;" class="animate-fade-in animate-pulse animation-delay-700">
                                                      <a href="https://ashiwanikumar.in" class="primary-button gradient-animated">और जानें & वेबसाइट देखें</a>
                                                  </div>
                                                  
                                                  <div class="highlight-box animate-fade-in animation-delay-800">
                                                      <h3 style="margin: 0 0 12px 0; color: #ea580c;">महत्वपूर्ण जानकारी | Important Information</h3>
                                                      <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                                          <li style="margin-bottom: 8px;">आप कभी भी सदस्यता रद्द कर सकते हैं।</li>
                                                          <li style="margin-bottom: 8px;">आपकी जानकारी सुरक्षित रखी जाएगी।</li>
                                                          <li style="margin-bottom: 8px;">किसी भी सहायता के लिए हमसे संपर्क करें।</li>
                                                          <li>यह न्यूज़लेटर केवल सूचना हेतु है।</li>
                                                      </ul>
                                                  </div>
                                                  
                                                  <p class="content-text secondary-text animate-fade-in animation-delay-900">यदि आपको कोई प्रश्न या सहायता चाहिए, तो कृपया हमसे संपर्क करें।</p>
                                                  
                                                  <div style="text-align: center; margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #fff7ed, #ffedd5); border-radius: 12px;" class="animate-fade-in animation-delay-900">
                                                      <p style="margin: 0 0 8px 0; font-weight: 600; color: #ea580c;">संपर्क जानकारी | Contact Information</p>
                                                      <p style="margin: 0; font-size: 14px; color: #374151;">Ashiwani Kumar - ashiwanikumar.in</p>
                                                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #374151;">Email: hello@ashiwanikumar.in</p>
                                                  </div>
                                                  
                                                  <p class="content-text primary-text animate-fade-in animation-delay-1000" style="margin: 32px 0 8px 0;">शुभकामनाएँ,</p>
                                                  <p class="content-text primary-text animate-fade-in animation-delay-1000" style="margin: 0; font-weight: 600;">Ashiwani Kumar</p>
                                                  <p class="content-text secondary-text animate-fade-in animation-delay-1000" style="margin: 0; font-size: 14px;">Founder & Developer</p>
                                              </div>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          
                          <tr>
                              <td class="footer animate-fade-in animation-delay-1100">
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
                                                  <a href="https://ashiwanikumar.in/privacy-policy" style="color: #ea580c; text-decoration: none;">प्राइवेसी पॉलिसी</a> " 
                                                  <a href="https://ashiwanikumar.in/terms-service" style="color: #ea580c; text-decoration: none;">नियम एवं शर्तें</a> " 
                                                  <a href="https://ashiwanikumar.in/contact" style="color: #ea580c; text-decoration: none;">संपर्क करें</a>
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
  Newsletter Welcome Series Email Template
***********************************/
exports.newsletterWelcomeSeriesEmailTemplate = (
  subscriberData,
  emailNumber = 1
) => {
  const firstName =
    subscriberData?.name?.firstName || subscriberData?.name || "Subscriber";

  // Example content for each email in the welcome series
  const seriesContent = {
    1: {
      subject: "कृषि न्यूज़लेटर में आपका स्वागत है!",
      greeting: `नमस्ते ${firstName} जी,`,
      body: `Welcome! You will now receive the latest updates, news, and insights directly to your email.`,
    },
    2: {
      subject: "Latest Updates & Resources",
      greeting: `Hello ${firstName},`,
      body: `Through our newsletter, you will receive the latest updates, resources, and insights regularly.`,
    },
    3: {
      subject: "तकनीकी नवाचार और सतत कृषि",
      greeting: `नमस्ते ${firstName} जी,`,
      body: `सतत कृषि, पर्यावरण और तकनीकी नवाचार से जुड़ी महत्वपूर्ण जानकारियाँ आपके साथ साझा की जाएंगी।`,
    },
  };
  const content = seriesContent[emailNumber] || seriesContent[1];

  const template = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.subject}</title>
        <style type="text/css">
          body { font-family: Arial, sans-serif; background-color: #fff7ed; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { line-height: 1.6; color: #374151; }
          .signature { margin-top: 30px; color: #ea580c; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://ashiwanikumar.in/logo.png" width="180" alt="Ashiwani Kumar">
          </div>
          <div class="content">
            <h2 style="color: #ea580c;">${content.subject}</h2>
            <p>${content.greeting}</p>
            <p>${content.body}</p>
            <p>यदि आपको कोई प्रश्न या सहायता चाहिए, तो कृपया हमसे संपर्क करें।</p>
            <div class="signature">
              <p>शुभकामनाएँ,<br>Ashiwani Kumar<br>Founder & Developer</p>
            </div>
          </div>
        </div>
      </body>
    </html>`;
  return template;
};

/**********************************
  Newsletter Unsubscribe Confirmation Template
***********************************/
exports.newsletterUnsubscribeEmailTemplate = (subscriberData) => {
  const firstName =
    subscriberData?.name?.firstName || subscriberData?.name || "Subscriber";

  const template = `<!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Newsletter Unsubscribed - Ashiwani Kumar</title>
              <style type="text/css">
                  body { font-family: Arial, sans-serif; background-color: #fff7ed; }
                  .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .content { line-height: 1.6; color: #374151; }
                  .signature { margin-top: 30px; color: #ea580c; font-weight: 600; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <img src="https://ashiwanikumar.in/logo.png" width="180" alt="Ashiwani Kumar">
                  </div>
                  <div class="content">
                      <h2 style="color: #ea580c;">न्यूज़लेटर सदस्यता समाप्त</h2>
                      <p>नमस्ते ${firstName} जी,</p>
                      <p>आपकी न्यूज़लेटर सदस्यता सफलतापूर्वक रद्द कर दी गई है। यदि यह गलती से हुआ है, तो आप कभी भी पुनः सदस्यता ले सकते हैं।</p>
                      <p>हमारी सेवाओं का उपयोग करने के लिए धन्यवाद। यदि आपको भविष्य में कोई जानकारी या सहायता चाहिए, तो कृपया हमसे संपर्क करें।</p>
                      <div class="signature">
                          <p>शुभकामनाएँ,<br>Ashiwani Kumar<br>Founder & Developer</p>
                      </div>
                  </div>
              </div>
          </body>
      </html>`;

  return template;
};
