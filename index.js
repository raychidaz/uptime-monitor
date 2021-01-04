/*
 * Primary file for API
 *
 */

// Dependencies
const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

// The server should respond to all requests with a string
const server = http.createServer(function (request, response) {
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

    // Send the response
    response.end('Hello World\n');

    // Log the request path
    console.log('Request is received with this payload: ', buffer);
  });
});

// Log the request  path
// console.log(
//   `Request received on path: ${trimmedPath} with  method, ${method} and with these query string parameters`,
//   queryStringObject,
// );
//  console.log('The request is received with these headers', headers);
//});

// Start the server, and have it listen on port 3000
server.listen(3000, function () {
  console.log('The server is listening on port 3000 now');
});
