'use strict';

var path = require('path'),
  rootPath = path.normalize(__dirname + '/../..');

module.exports = {
  debug: true,
  root: rootPath,
  http: {
    port: process.env.PORT || 3000
  },

  https: {
    port: process.env.HTTPS_PORT || 3001,

    // Paths to key and cert as string
    ssl: {
      key: 'key.pem',
      cert: 'server.crt'
    }
  },

  hostname: process.env.HOST || process.env.HOSTNAME,
  db: process.env.MONGOHQ_URL,
  templateEngine: 'swig',

  // The secret should be set to a non-guessable string that
  // is used to compute a session hash
  sessionSecret: 'MEAN',

  // The name of the MongoDB collection to store sessions in
  sessionCollection: 'sessions',

  // The session cookie settings
  sessionCookie: {
    path: '/',
    httpOnly: true,
    // If secure is set to true then it will cause the cookie to be set
    // only when SSL-enabled (HTTPS) is used, and otherwise it won't
    // set a cookie. 'true' is recommended yet it requires the above
    // mentioned pre-requisite.
    secure: true,
    // Only set the maxAge to null if the cookie shouldn't be expired
    // at all. The cookie will expunge when the browser is closed.
    maxAge: null
  },

  // The session cookie name
  sessionName: 'connect.sid',

  swankRats : {
    socketServer: 'wss://192.168.1.50:3001',
    streamServer: 'http://192.168.1.100:4711/videostream',
    hitValue: 50,
    players: {
        lifePoints: 100,
        max: 2,
        forms: {
            pentagon: 'pentagon',
            square: 'square'
        }
    }
  }
};
