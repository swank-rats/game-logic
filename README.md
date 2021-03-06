#The game logic and the user interface
This repository contains the game logic (node server) and also the client-side stuff needed for the swank-rats game!
You can find more information about the project in the [project documentation](https://github.com/swank-rats/docs).

## Installation
[See here ...](https://github.com/swank-rats/game-logic/blob/master/INSTALL.md)

## SSL-Certificate
For HTTPS and WSS features (mandatory) you need to create a SSL-Certificate.

```bash
openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
```

## Test WS-Server
To test the WS feature use following command.

```bash
wscat --connect wss://localhost:3001 -p 8 -n
> {"to":"test","cmd":"echo","params":{"toUpper": true},"data":"testdata"}
  < TESTDATA
```

## Start app
To start the app either type
```bash
grunt
```
in your CLI or start it with forever to keep it up an running
```bash
forever server.js
```
