const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const response = req.body['g-recaptcha-response'];
    const secret = 'RECAPTCHA_SECRET_KEY=';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`;

    try {
      const response = await fetch(verifyUrl, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        res.status(200).send({ message: 'Captcha verification passed' });
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
