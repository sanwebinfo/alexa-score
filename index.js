const axios = require('axios');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { body, query, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 6007;

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Strict-Transport-Security', 'max-age=63072000');
  res.sendFile(__dirname + '/index.html');
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
