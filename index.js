/*
 * Primary file for API
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instantiate the HTTP server
const httpServer = http.createServer(function (request, response) {
  unifiedServer(request, response);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
  console.log(`The server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPs server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(
  httpsServerOptions,
  function (request, response) {
    unifiedServer(request, response);
  },
);

// Start the server
httpsServer.listen(config.httpsPort, function () {
  console.log(`The server is listening on port ${config.httpsPort}`);
});

// All the server logic for both the http and https server
const unifiedServer = function (request, response) {
  // Get the URL and parse it
  const parsedUrl = url.parse(request.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method
  const method = request.method.toLowerCase();

  // Get the headers as an object
  const headers = request.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf8');
  var buffer = '';
  request.on('data', function (data) {
    buffer += decoder.write(data);
  });
  request.on('end', function () {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found use the notFound handler.

    const chosenHandler =
      typeof router[trimmedPath] !== 'undefined'
        ? router[trimmedPath]
        : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // Route the request to  the handler specified in  the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the status code called back by the  handler, or default to 200
      statusCode = typeof statusCode == 'number' ? statusCode : 200;

      // Use the payload called  back by the handler, or default  to an empty object
      payload = typeof payload == 'object' ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      response.setHeader('Content-Type', 'application/json');
      response.writeHead(statusCode);
      // Send the response
      response.end(payloadString);

      // Log the request path
      console.log('Returning this response: ', statusCode, payloadString);
    });
  });
};

// Define a request router
const router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
};
