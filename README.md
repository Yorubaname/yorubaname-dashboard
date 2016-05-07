# dashboardapp

## Yorubaname Dashboard App

The Yorubaname Dashboard application is a stand alone AngularJs that interacts with the backend services.

To function, it needs to be able to send requests to a running backend. The backend source and
the instructions on how to run it can be found here https://github.com/Yorubaname/yorubaname-website

### Prerequisites

1. Clone the project
2. Install Nodejs
3. Install npm
4. Install bower
6. cd into the directory where `Gruntfile.js` is located
5. run `npm install`
6. run `bower install`

The Yorubaname Dashboard can be ran in two ways:

1. Running directly from source (dev mode)
2. Running from bundled source (prod mode)

### Running directly from source (dev mode)
This mode is probably what you would use when developing. In this mode, the application is started and served using grunt. When
changes are made to the code, they are picked up automatically with the browser reloading. 

To start the application in this mode follow the following steps:
1. cd into the directory where Gruntfile.js is located
2. run `grunt serve` the application starts and would be available at http://localhost:9000


### Running from bundled source (prod mode)
This mode involves running the application from the result of building the source: minifying, uglifying etc 

Run the application in this mode to confirm that changes made does not break the build and the application still works as expected after the build process.

Follow the following steps to run the application from its built source

1. run `grunt devbuild` this would build the application and make it available in `./dist` folder
2. access the files in the `./dist` folder via an http server. An example of http server that can
be used is https://www.npmjs.com/package/http-server
