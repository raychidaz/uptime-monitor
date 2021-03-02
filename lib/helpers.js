/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

// container for  all helpers
const helpers = {};

// Create a SHA256 hash

helpers.hash = function (str) {
  if (typeof str == 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = function (str) {
  try {
    let obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// create a string  of random alphanumeric characters, of a given length
// helpers.createRandomString = function (strLength) {
//   strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;
//   if (strLength) {
//     // Define all the possible characters that could go into a string
//     let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

//     // start the final string
//     let str = '';
//     for (let i = 1; i <= strLength; i++) {
//       // Get random character from from the possibleCharacters string
//       let randomCharacter = possibleCharacters.charAt(
//         Math.floor(Math.random() * possibleCharacters.length),
//       );
//       // Append this character to the final string
//       str += randomCharacter;
//     }
//     // return the final string
//     return str;
//   } else {
//     return false;
//   }
// };

// eport the module
module.exports = helpers;
