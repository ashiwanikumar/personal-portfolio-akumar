const axios = require('axios');

/**
 * Verify Cloudflare Turnstile token
 * @param {string} token - The Turnstile token from the client
 * @param {string} remoteip - The IP address of the client (optional)
 * @returns {Promise<Object>} - Verification result
 */
const verifyTurnstileToken = async (token, remoteip = null) => {
  try {
    const secretKey = process.env.CLOUDFLARE_RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('Cloudflare Turnstile secret key not configured');
    }

    // Prepare the form data
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    // Make the verification request to Cloudflare
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = response.data;

    return {
      success: result.success,
      errorCodes: result['error-codes'] || [],
      challengeTimestamp: result.challenge_ts,
      hostname: result.hostname,
      action: result.action,
      cdata: result.cdata,
    };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  verifyTurnstileToken,
};