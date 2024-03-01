const axios = require('axios');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { body, query, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 6007;
const secretKey = process.env.JWTKEY;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './view');

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const checkNonJWTAuthorization = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.XAPIKEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token');
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

app.get('/api/token', checkNonJWTAuthorization, (req, res) => {

  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Strict-Transport-Security', 'max-age=63072000');

  try {
    const payload = {
      userId: process.env.USERID,
      username: process.env.USERNAME
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: '5m' });
    res.json({ token });
  } catch (error) {
    console.error('Error generating token');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Strict-Transport-Security', 'max-age=63072000');

  const current_page = 'https://' + req.headers.host + req.url;
  const homepage = 'https://' + req.headers.host + '/';
  const title = 'Live Cricket Score 🏏';
  const description = 'Free online - Live Cricket Score 🏏.'

  res.render('home', {
    seourl: current_page || '/',
    homepage: homepage,
    title : title,
    description : description
  });

});

wss.on('connection', (ws) => {
  //console.log('Client connected');
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });
});

app.get('/api/score', [
  query('id')
    .notEmpty().withMessage('ID parameter is required')
    .isNumeric().withMessage('ID parameter must be a number')
    .isLength({ min: 5, max: 10 }).withMessage('ID parameter must be exactly 6 characters long')
], async (req, res) => {

  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Strict-Transport-Security', 'max-age=63072000');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.query;
    const apiURL = process.env.API + id;
    const response = await axios.get(apiURL, {
      family: 4
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching external data');
    res.status(500).json({ error: 'Error fetching external data' });
  }
});

app.post('/api/message',
  verifyToken,
  body('message')
    .trim()
    .custom((value) => value === 'reload')
    .withMessage('Message must be "reload"'),
  (req, res) => {

    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Strict-Transport-Security', 'max-age=63072000');
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    let responseMessage;
    if (message === 'reload') {
      responseMessage = 'Message sent to all clients';
    } else {
      responseMessage = 'Warning: Message is not "reload"';
    }

    res.status(200).json({ success: true, message: responseMessage });
  }
);

app.post('/api/alexa',
  verifyToken,
  body('alexamessage')
    .trim()
    .notEmpty().withMessage('Alexa message cannot be empty')
    .isLength({ min: 2, max: 500 }).withMessage('Alexa message must be between 2 and 500 characters')
    .escape(),
  (req, res) => {

    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Strict-Transport-Security', 'max-age=63072000');
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { alexamessage } = req.body;

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(alexamessage);
      }
    });

    let responseMessage;
    if (alexamessage) {
      responseMessage = 'Message sent to all clients';
    } else {
      responseMessage = 'Warning: Message is not Sent to Clients';
    }

    res.status(200).json({ success: true, alexamessage: responseMessage });
  }
);

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

server.listen(port, () => {
  console.log('listening on port ' + port);
});

module.exports = app;