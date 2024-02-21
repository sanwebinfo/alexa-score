# Alexa Cricket Score

A Simple Static Site With Websocket for Getting Real-time Live Cricket Score Updates.  

> Get live Cricket Score Update by reloading the web page using Websocket and Alexa.  

## Usage and Concept

- Cricket API: <https://github.com/sanwebinfo/cricket-api>
- Express JS for API and WebSocket Connection
- Use WebSocket to trigger the static page Refresh in real-time
- Using Tasker and Alexa to trigger a WebSocket server to send a message to the client  

```sh

## Use this at API Clients (it only accept the Request if the message contain 'reload')

curl -X POST -H "Content-Type: application/json" -d '{"message": "reload"}' http://localhost:6007/api/message

```

- Alexa Voice command API

```sh

## it support and accept any voice commmand message with 500 Text limit
## if you passing the voice command 'reload' then it will reload the score data
## Rest voice commanding words will dislay as alert in the client page

curl -X POST -H "Content-Type: application/json" -d '{"alexamessage": "HI from Alexa"}' http://localhost:6007/api/alexa

```

- Cricket API URL

```sh
http://localhost:6007/api/score?id=123456
```

- Example `env`

```env
API=https://cricket.example.com/score?id=
```

- Home page: `index.html` for displaying the Live Cricket Score

## Much Needed Apps

- Alexa Echo device or Alexa on Mobile App
- Tasker for send HTTP request and access alexa voice command
- Autovoice to listen the voice command from alexa `alexa ask autovoice to write reload`

## LICENSE

MIT
