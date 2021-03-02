/*  Request Handlers
 *
 * Event handlers can be used to handle, and verify, user input, user actions, and browser actions: Things that should be done every time a page loads. Things that should be done when the page is closed. Action that should be performed when a user clicks a button.
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define handlers
const handlers = {};

// Users
handlers.users = function (data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405); // Http status code - Method Not Allowed
  }
};

// container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none

handlers._users.post = function (data, callback) {
  // check that all required fields are filled out
  const firstName =
    typeof data.payload.firstName == 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName == 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const phone =
    typeof data.payload.phone == 'string' &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;

  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  const tosAgreement =
    typeof data.payload.tosAgreement == 'boolean' &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && tosAgreement) {
    // Make sure that the user does not already exist - if err the user doesnt exist
    _data.read('users', phone, function (err, data) {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // create the user object
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true,
          };

          // store the user
          _data.create('users', phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the user's password." });
        }
      } else {
        // user already exists
        callback(400, {
          Error: 'A user with that phone number already exists.',
        });
      }
    });
  } else {
    callback(404, { Error: 'Missing required fields' });
  }
};

// Users - get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone elses

handlers._users.get = function (data, callback) {
  // Check that the phone number provided is valid
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    // Lookup the user
    _data.read('users', phone, function (err, data) {
      if (!err && data) {
        // Remove the hashed password from the user object before returning it to the requestor
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404); // Not found
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user UPDATE their object. Don't let them update anyone elses
handlers._users.put = function (data, callback) {
  // Check for the required field
  const phone =
    typeof data.payload.phone == 'string' &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;

  // Check for the optional  fields
  const firstName =
    typeof data.payload.firstName == 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName == 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if the phone is invalid
  if (phone) {
    // Error if nothing is set to updatae
    if (firstName || lastName || password) {
      // Lookup the user
      _data.read('users', phone, function (err, userData) {
        if (!err && userData) {
          // Update the fields necessary
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }
          // Store the new updates
          _data.update('users', phone, userData, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not update the user' });
            }
          });
        } else {
          callback(400, { Error: 'The specified user does not exist' });
        }
      });
    } else {
      callback(400, { Error: 'Missing  fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Users - delete
// Required field: phone
// @TODO Only let an authenticated user delete their object. Don't let them access anyone elses
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = function (data, callback) {
  // Check that the phone number provided is valid
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    // Lookup the user
    _data.read('users', phone, function (err, data) {
      if (!err && data) {
        _data.delete('users', phone, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete the specified user' });
          }
        });
      } else {
        callback(400, { Error: 'Could not find the specified user' }); // Not found
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Tokens - authentication management
// handlers.tokens = function (data, callback) {
//   let acceptableMethods = ['post', 'get', 'put', 'delete'];
//   if (acceptableMethods.indexOf(data.method) > -1) {
//     handlers._tokens[data.method](data, callback);
//   } else {
//     callback(405); // Http status code - Method Not Allowed
//   }
// };

// // container for all the token methods
// handlers._tokens = {};

// // Tokens - post
// // Required data: phone, password
// // Optional data: none
// handlers._tokens.post = function (data, callback) {
//   const phone =
//     typeof data.payload.phone == 'string' &&
//     data.payload.phone.trim().length == 10
//       ? data.payload.phone.trim()
//       : false;

//   const password =
//     typeof data.payload.password == 'string' &&
//     data.payload.password.trim().length > 0
//       ? data.payload.password.trim()
//       : false;

//   if (phone && password) {
//     // Lookup the user who matches that phone number
//     _data.read('users', phone, function (err, userData) {
//       if (!err && userData) {
//         // Hash the sent password and compare it to the pw stored in the user object
//         const hashedPassword = helpers.hash(password);

//         if (hashedPassword == userData.hashedPassword) {
//           // If valid, create a new token with a random name. Set expiration 1 hour in the future
//           const tokenId = helpers.createRandomString(20);
//           let expires = Date.now() + 1000 * 60 * 60;
//           const tokenObject = {
//             phone: phone,
//             id: tokenId,
//             expires: expires,
//           };

//           // store the token
//           _data.create('tokens', tokenId, tokenObject, function (err) {
//             if (!err) {
//               callback(tokenObject);
//             } else {
//               callback(500, { Error: 'Could not create the new token' });
//             }
//           });
//         } else {
//           callback(400, {
//             Error:
//               "Password did not match the specified user's stored password.",
//           });
//         }
//       } else {
//         callback(400, { Error: 'Could not find the specified user' });
//       }
//     });
//   } else {
//     callback(400, { Error: 'Missing required field(s)' });
//   }
// };

// // Tokens - get
// handlers._tokens.get = function (data, callback) {};

// // Tokens - put
// handlers._tokens.put = function (data, callback) {};

// // Tokens - delete
// handlers._tokens.delete = function (data, callback) {};

//  Ping handler
handlers.ping = function (data, callback) {
  callback(200);
};

// Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};

// export the handlers
module.exports = handlers;
