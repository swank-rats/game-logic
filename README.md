#The game logic and the user interface

This repository contains the game logic (node server) and also the client-side stuff needed for the swank-rat game! You can find more information about the project in the [project documentation](https://github.com/swank-rats/docs).
The following steps will provide a step by step walk-through to get this part of the game up and running.

## Prerequisites
To get started with the [mean stack](http://mean.io/) we need to install Node.js and MongoDB.

### Node.js
Get the appropriate installer for [Node.js](http://nodejs.org/) for your OS on their website or just use your favourite package manager. After the installation you should get something like this when you type ```node --version``` and ```npm --version``` on your commandline:

![commandline node and npm](https://github.com/swank-rats/game-logic/documentation/images/node_npm.png "npm and node version on the cli")

### MongoDB
To install [MongoDB](http://docs.mongodb.org) follow this [link](http://www.mongodb.org/downloads) and get a installer or use your package manager again. After the installation create the following directory structure ```data\db``` in the MongoDB installation directory.

To start MongoDB on __Windows__ just execute the following exe-file (from the commandline to see possible error messages):
```
~MongoDBDirectory\bin\mongod.exe
```
add the dbpath-parameter to the command when you did not install MongoDB in the default location
```
~MongoDBDirectory\bin\mongod.exe --dbpath "d:\path\to\data\db"

```
When this mongod.exe launch was successfull you should be able execute the mongo.exe to start working with MongoDB.

To start MongoDB on __Ubuntu__ type following on your cli
```
sudo service mongod start
```
To start MongoDB on __Mac__ type following on your cli
```
mongod
```
  
  This guide is just a short summery of the installation process - when you need more details just follow this [link](http://docs.mongodb.org/manual/installation/) and you will find a lot of information for Windows, Mac and Linux.

__Warning concerning MongoDB:__

MongoDB is designed to be run in trusted environments, and the database does not enable “Secure Mode” by default.


## Installation





