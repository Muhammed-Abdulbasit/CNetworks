const fetch = require('node-fetch');
const crypto = require('crypto');

function generateCsrfToken() {
  return crypto.randomBytes(64).toString('hex');
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // Generate CSRF token and set it as a cookie
    const csrfToken = generateCsrfToken();
    res.setHeader('Set-Cookie', `csrfToken=${csrfToken}; HttpOnly; Secure; Path=/;`);
    res.status(200).send({ csrfToken });
  } else if (req.method === 'POST') {
    // Verify CSRF token
    const csrfToken = req.cookies.csrfToken;
    if (req.body.csrfToken !== csrfToken) {
      return res.status(403).send({ message: 'CSRF token mismatch.' });
    }

    const response = req.body['g-recaptcha-response'];
    const secret = 'RECAPTCHA_SECRET_KEY';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`;

    try {
      const response = await fetch(verifyUrl, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        res.status(200).send({ message: 'Captcha and CSRF verification passed' });
      } else {
        res.status(400).send({ message: 'Captcha verification failed' });
      }
    } catch (error) {
      res.status(500).send({ message: 'Error in captcha verification' });
    }
  } else {
    res.status(405).send({ message: 'Method not allowed' });
  }
};
