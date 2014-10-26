#The game logic and the user interface

This repository contains the game logic (node server) and also the client-side stuff needed for the swank-rat game! You can find more information about the project in the [project documentation](https://github.com/swank-rats/docs).
The following steps will provide a step by step walk-through to get this part of the game up and running.

## Prerequisites
To get started with the [mean stack](http://mean.io/) we need to install Node.js and MongoDB.

### Node.js
Get the appropriate installer for [Node.js](http://nodejs.org/) for your OS on their website or just use your favourite package manager. After the installation you should get something like this when you type ```node --version``` and ```npm --version``` on your commandline:

![commandline node and npm](https://raw.githubusercontent.com/swank-rats/game-logic/master/documentation/images/node_npm.png)

### MongoDB
To install [MongoDB](http://docs.mongodb.org) follow this [link](http://www.mongodb.org/downloads) and get a installer or use your package manager again. After the installation create the following directory structure ```data\db``` in the MongoDB installation directory.

##### Windows
To start MongoDB on __Windows__ just execute the following exe-file (from the commandline to see possible error messages):
```
~MongoDBDirectory\bin\mongod.exe
```
add the dbpath-parameter to the command when you did not install MongoDB in the default location:
```
~MongoDBDirectory\bin\mongod.exe --dbpath "d:\path\to\data\db"

```
When the mongod.exe launch was successfull you should be able execute the mongo.exe to start working with MongoDB.

##### Ubuntu
To start MongoDB on __Ubuntu__ type following on your cli:
```
sudo service mongod start
```

##### Mac
To start MongoDB on __Mac__ type following on your cli:
```
mongod
```
  
#### More details on the installation process
This guide is just a short summery of the installation process - when you need more details just follow this [link](http://docs.mongodb.org/manual/installation/) and you will find a lot of information for Windows, Mac and Linux.

#### Security

To enforce security please follow the the steps described [here](http://docs.mongodb.org/manual/security/) because ...
> __Warning:__
> MongoDB is designed to be run in trusted environments, and the database does not enable “Secure Mode” by default.
 

## Installation
When Node.js and MongoDB are installed we install bower and grunt with following command:
```
npm install -g bower grunt-cli
```
[Bower](http://bower.io/) is a package manager for Javascript libraries like e.g. jQuery and will help us to get all dependencies with just one command and [Grunt](http://gruntjs.com/) is a taskrunner and will be used to build the files for the application (Javascript / CSS / etc.) and also to run the server. 

These are the basic requirements for this repository to work - if you need more information about the MeanStack take a look at [https://github.com/linnovate/mean](https://github.com/linnovate/mean).

## Create SSL Certificate

```
openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
```

## Start the app
After these steps the basic requirements for this application are installed and you can clone this repository and execute
```
npm install
grunt
```
in the repository directory. You should see the project at ```http://localhost:3000```


## IDE integration
For a very cool integration into Webstorm or Intellij IDEA from Jetbrains watch this [tutorial on youtube](https://www.youtube.com/watch?v=JnMvok0Yks8).

__In short:__
- add mongoose, angular and express Settings > Javascript > Libraries > Download from the "TypeScript community stubs"-list in the dropdown
- add mongo plugin to explore MongoDB in the IDE
- add a configuration for remote debugging of node.js and enter the host with the port - 5858 in our case

