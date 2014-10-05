<<<<<<< HEAD
# [![MEAN Logo](http://www.mean.io/img/logos/meanlogo.png)](http://mean.io/) MEAN Stack

[![Build Status](https://travis-ci.org/linnovate/mean.svg?branch=master)](https://travis-ci.org/linnovate/mean)
[![Dependencies Status](https://david-dm.org/linnovate/mean.svg)](https://david-dm.org/linnovate/mean)

MEAN is a boilerplate that provides a nice starting point for [MongoDB](http://www.mongodb.org/), [Node.js](http://www.nodejs.org/), [Express](http://expressjs.com/), and [AngularJS](http://angularjs.org/) based applications. It is designed to give you a quick and organized way to start developing MEAN based web apps with useful modules like Mongoose and Passport pre-bundled and configured. We mainly try to take care of the connection points between existing popular frameworks and solve common integration problems.

## Prerequisites
* Node.js - Download and Install [Node.js](http://www.nodejs.org/download/). You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm
* MongoDB - Download and Install [MongoDB](http://docs.mongodb.org/manual/installation/) - Make sure `mongod` is running on the default port (27017).

### Tools Prerequisites
* NPM - Node.js package manage; should be installed when you install node.js.
* Bower - Web package manager. Installing [Bower](http://bower.io/) is simple when you have `npm`:

```
$ npm install -g bower
```

### Optional [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
* Grunt - Download and Install [Grunt](http://gruntjs.com).
```
$ npm install -g grunt-cli
```

## Additional Packages
* Express - Defined as npm module in the [package.json](package.json) file.
* Mongoose - Defined as npm module in the [package.json](package.json) file.
* Passport - Defined as npm module in the [package.json](package.json) file.
* AngularJS - Defined as bower module in the [bower.json](bower.json) file.
* Twitter Bootstrap - Defined as bower module in the [bower.json](bower.json) file.
* UI Bootstrap - Defined as bower module in the [bower.json](bower.json) file.

## Quick Install
  The quickest way to get started with MEAN is to install the `meanio` package from NPM.

  Install MEAN CLI:

    $ [sudo] npm install -g meanio@latest
    $ mean init <myApp>
    $ cd <myApp> && npm install

  We recommend using [Grunt](https://github.com/gruntjs/grunt-cli) to start the server:

    $ grunt

  If grunt aborts because of JSHINT errors, these can be overridden with the `force` flag:

    $ grunt -f

  Alternatively, when not using `grunt` you can run:

    $ node server

  Then, open a browser and go to:

    http://localhost:3000


## Troubleshooting
During install some of you may encounter some issues.

Most issues can be solved by one of the following tips, but if are unable to find a solution feel free to contact us via the repository issue tracker or the links provided below.

#### Update NPM, Bower or Grunt
Sometimes you may find there is a weird error during install like npm's *Error: ENOENT*. Usually updating those tools to the latest version solves the issue.

* Updating NPM:
```
$ npm update -g npm
```

* Updating Grunt:
```
$ npm update -g grunt-cli
```

* Updating Bower:
```
$ npm update -g bower
```

#### Cleaning NPM and Bower cache
NPM and Bower has a caching system for holding packages that you already installed.
We found that often cleaning the cache solves some troubles this system creates.

* NPM Clean Cache:
```
$ npm cache clean
```

* Bower Clean Cache:
```
$ bower cache clean
```

#### Installation problems on Windows 8 / 8.1
Some of Mean.io dependencies uses [node-gyp](https://github.com/TooTallNate/node-gyp) with supported Python version 2.7.x. So if you see an error related to node-gyp rebuild follow next steps:

1. install [Python 2.7.x](https://www.python.org/downloads/)
2. install [Microsoft Visual Studio C++ 2012 Express](http://www.microsoft.com/ru-ru/download/details.aspx?id=34673)
3. fire NPM update
````
$ npm update -g
````

## Configuration
All configuration is specified in the [config](/config/) folder, through the [env](config/env/) files, and is orchestrated through the [meanio](https://github.com/linnovate/mean-cli) NPM module. Here you will need to specify your application name, database name, and hook up any social app keys if you want integration with Twitter, Facebook, GitHub, or Google.

### Environmental Settings

There is a shared environment config: __all__.
* __root__ - This the default root path for the application.
* __port__ - DEPRECATED to __http.port__ or __https.port__.
* __http.port__ - This sets the default application port.
* __https__ - These settings are for running HTTPS / SSL for a secure application.
  * __port__ - This sets the default application port for HTTPS / SSL. If HTTPS is not used then is value is to be set to __false__ which is the default setting. If HTTPS is to be used the standard HTTPS port is __443__. 
  * __ssl.key__ - The path to public key.
  * __ssl.cert__ - The path to certificate.

There are three environments provided by default: __development__, __test__, and __production__.

Each of these environments has the following configuration options:

* __db__ - This is where you specify the MongoDB / Mongoose settings
  * __url__ - This is the url/name of the MongoDB database to use, and is set by default to __mean-dev__ for the development environment.
  * __debug__ - Setting this option to __true__ will log the output all Mongoose executed collection methods to your
console.  The default is set to __true__ for the development environment.
  * __options__ - These are the database options that will be passed directly to mongoose.connect in the __production__ environment: [server, replset, user, pass, auth, mongos] (http://mongoosejs.com/docs/connections.html#options) or read [this] (http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options) for more information.
* __app.name__ - This is the name of your app or website, and can be different for each environment. You can tell which environment you are running by looking at the TITLE attribute that your app generates.
* __Social OAuth Keys__ - Facebook, GitHub, Google, Twitter. You can specify your own social application keys here for each platform:
  * __clientID__
  * __clientSecret__
  * __callbackURL__
* __emailFrom__ - This is the from email address displayed when sending an email.
* __mailer__ - This is where you enter your email service provider, username and password.

To run with a different environment, just specify NODE_ENV as you call grunt:

    $ NODE_ENV=test grunt

If you are using node instead of grunt, it is very similar:

    $ NODE_ENV=test node server

To simply run tests

    $ npm test

> NOTE: Running Node.js applications in the __production__ environment enables caching, which is disabled by default in all other environments.

## Maintaining your own repository
After initializing a project, you'll see that the root directory of your project is already a git repository. MEAN uses git to download and update its own code. To handle its own operations, MEAN creates a remote called `upstream`. This way you can use git as you would in any other project.

To maintain your own public or private repository, add your repository as remote. See here for information on [adding an existing project to GitHub](https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line).

```
git remote add origin <remote repository URL>
git push -u origin master
```


## Getting Started
We pre-included an article example. Check out:

  * [The Model](packages/articles/server/models/article.js) - Where we define our object schema.
  * [The Controller](packages/articles/server/controllers/articles.js) - Where we take care of our backend logic.
  * [NodeJS Routes](packages/articles/server/routes/articles.js) - Where we define our REST service routes.
  * [AngularJs Routes](packages/articles/public/routes/articles.js) - Where we define our CRUD routes.
  * [The AngularJs Service](packages/articles/public/services/articles.js) - Where we connect to our REST service.
  * [The AngularJs Controller](packages/articles/public/controllers/articles.js) - Where we take care of  our frontend logic.
  * [The AngularJs Views Folder](packages/articles/public/views) - Where we keep our CRUD views.

## Heroku Quick Deployment
Before you start make sure you have the [Heroku toolbelt](https://toolbelt.heroku.com/)
installed and an accessible MongoDB instance - you can try [MongoHQ](http://www.mongohq.com/)
which has an easy setup).

Add the db string to the production env in server/config/env/production.js.

```
git init
git add .
git commit -m "initial version"
heroku apps:create
heroku config:add NODE_ENV=production
heroku config:add BUILDPACK_URL=https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git
git push heroku master
heroku config:set NODE_ENV=production
```

## More Information
  * Visit us at [Linnovate.net](http://www.linnovate.net/).
  * Visit our [Ninja's Zone](http://www.meanleanstartupmachine.com/) for extended support.

## License
[The MIT License](http://opensource.org/licenses/MIT)
=======
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

## Start the app
After these steps the basic requirements for this application are installed and you can clone this repository and execute
```
grunt
```
in the repository directory. You should see the project at ```http://localhost:3000```




>>>>>>> 114f743705820abc249d482f54f74fa222b9f3de
