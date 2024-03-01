# Alexa Cricket Score

![connect-test](https://github.com/sanwebinfo/alexa-score/workflows/connect-test/badge.svg)  

A Simple Static Site With WebSocket for Getting Real-time Live Cricket Score Updates.  

> Get live Cricket Score Update by reloading the web page using Websocket and Alexa.  

## Usage and Concept

- Cricket API: <https://github.com/sanwebinfo/cricket-api>
- Express JS for API and WebSocket Connection
- EJS Template Engine
- Use WebSocket to trigger the static page Refresh in real time
- Using Tasker and Alexa to trigger a WebSocket server to send a message to the client  
- Token-based API - JWT token and Custom Header Key-based Authorization
- Create JWT Token for Authorize to Pass messages to the Clients **(it will be expired in 5mins - Due to security reasons using short-lived JWT tokens)**

```sh
curl --request GET   --url http://localhost:6007/api/token   --header 'x-api-key: YOUR_TOKEN_HERE
```

```sh

## Use this at API Clients (it only accept the Request if the message contain 'reload')

curl --request POST   --url http://localhost:6007/api/message   --header 'authorization: YOUR_JWT_TOKEN_HERE'   --header 'content-type: application/json'   --data '{"message": "reload"}'

```

- Alexa Voice command API

```sh

## It supports and accepts any voice commmand message with 500 Text limit
## If you passing the voice command 'reload' then it will reload the score data
## Rest voice commanding words will display as alert on the client page

curl -X POST -H "Content-Type: application/json" -H 'authorization: YOUR_JWT_TOKEN_HERE' -d '{"alexamessage": "HI from Alexa"}' http://localhost:6007/api/alexa

```

- Cricket API URL

```sh
http://localhost:6007/api/score?id=123456
```

- Example `env`

```env
API=https://cricket.example.com/score?id=
XAPIKEY=YOUR_TOKEN_HERE
JWTKEY=your_secret_key
USERID=123456
USERNAME=exampleuser
```

- Home page: `/view/home.hbs` for displaying the Live Cricket Score
- Bash script to send message to the clients

```sh

#.env example
API_URL=https://example.com/api
API_KEY=YOUR_AUTH_KEY


chmod a+x send.sh
./send.sh

```

https://github.com/sanwebinfo/alexa-score/assets/10300271/edcc972e-ba89-49d2-8f12-f149f7edffc9

## Much Needed Apps

- Alexa Echo device or Alexa on Mobile App
- Tasker for send HTTP request and access alexa voice command
- Autovoice to listen the voice command from alexa `alexa ask autovoice to write reload`

## LICENSE

MIT
